package api

import (
	"fmt"
	"net/url"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/saqibroy/web-crawler-dashboard/server/db"
	"github.com/saqibroy/web-crawler-dashboard/server/models"
	"github.com/saqibroy/web-crawler-dashboard/server/worker"
)

func isValidURL(u string) bool {
	parsed, err := url.ParseRequestURI(u)
	if err != nil {
		return false
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return false
	}
	if parsed.Host == "" || strings.Contains(parsed.Host, " ") {
		return false
	}
	return true
}

func SubmitURL(c *gin.Context) {
	var req struct {
		URL string `json:"url" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "invalid_request", "message": "We couldn't process your request. Please check your input and try again.", "details": err.Error()})
		return
	}

	if !isValidURL(req.URL) {
		c.JSON(400, gin.H{"error": "invalid_url", "message": "The website address you entered is not valid. Please check and try again."})
		return
	}

	analysis := models.Analysis{
		URL:    req.URL,
		Status: models.Queued,
	}

	result := db.DB.Create(&analysis)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "db_create_failed", "message": "Sorry, we couldn't save your analysis. Please try again later.", "details": result.Error.Error()})
		return
	}

	c.JSON(202, gin.H{
		"id":     analysis.ID,
		"status": analysis.Status,
	})
}

func GetAnalyses(c *gin.Context) {
	page, errPage := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, errLimit := strconv.Atoi(c.DefaultQuery("limit", "20"))
	search := c.DefaultQuery("search", "")        // New: search parameter
	sortBy := c.DefaultQuery("sort_by", "")       // New: sort_by parameter
	sortOrder := c.DefaultQuery("sort_order", "") // New: sort_order parameter

	if errPage != nil || page < 1 {
		c.JSON(400, gin.H{"error": "invalid_page", "message": "The page number is not valid. Please try again."})
		return
	}
	if errLimit != nil || limit < 1 {
		c.JSON(400, gin.H{"error": "invalid_limit", "message": "The number of results per page is not valid. Please try again."})
		return
	}

	var analyses []models.Analysis
	var total int64 // To store total count

	query := db.DB.Model(&models.Analysis{})

	// Apply search filter
	if search != "" {
		query = query.Where("url LIKE ? OR title LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Apply sorting
	if sortBy != "" {
		order := "desc" // Default sort order
		if sortOrder == "asc" {
			order = "asc"
		}
		query = query.Order(fmt.Sprintf("%s %s", sortBy, order))
	} else {
		// Default sorting: queued/processing first, then by updated_at desc (fallback to created_at desc if updated_at is null)
		query = query.Order("CASE WHEN status IN ('queued', 'processing') THEN 0 ELSE 1 END, COALESCE(updated_at, created_at) desc")
	}

	statusFilter := c.DefaultQuery("status", "")
	if statusFilter != "" {
		validStatuses := map[string]bool{"queued": true, "processing": true, "completed": true, "failed": true, "cancelled": true}
		if !validStatuses[statusFilter] {
			c.JSON(400, gin.H{"error": "invalid_status_filter", "message": "The status filter you selected is not valid."})
			return
		}
		query = query.Where("status = ?", statusFilter)
	}

	query.Count(&total) // Get total count before pagination

	// Get global status counts
	var statusCounts = map[string]int64{}
	statuses := []models.AnalysisStatus{models.Completed, models.Failed, models.Processing, models.Queued, models.Cancelled}
	for _, s := range statuses {
		var count int64
		db.DB.Model(&models.Analysis{}).Where("status = ?", s).Count(&count)
		statusCounts[string(s)] = count
	}

	query.Offset((page - 1) * limit).Limit(limit).Find(&analyses)

	c.JSON(200, gin.H{
		"data":          analyses,
		"total_count":   total,
		"status_counts": statusCounts,
	})
}

// Delete analyses by IDs
func DeleteAnalyses(c *gin.Context) {
	var req struct {
		IDs []string `json:"ids" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "invalid_request", "message": "We couldn't process your request. Please check your input and try again.", "details": err.Error()})
		return
	}
	if len(req.IDs) == 0 {
		c.JSON(400, gin.H{"error": "no_ids_provided", "message": "No analyses were selected. Please select at least one and try again."})
		return
	}
	for _, id := range req.IDs {
		if len(id) != 36 { // UUID length
			c.JSON(400, gin.H{"error": "invalid_id_format", "message": "We couldn't find one of the selected analyses. Please refresh and try again.", "id": id})
			return
		}
	}
	result := db.DB.Delete(&models.Analysis{}, req.IDs)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "db_delete_failed", "message": "Sorry, we couldn't delete the selected analyses. Please try again later.", "details": result.Error.Error()})
		return
	}
	c.JSON(200, gin.H{"deleted": result.RowsAffected})
}

// Stop analyses by IDs (cancel queued or in-progress)
func StopAnalyses(c *gin.Context) {
	var req struct {
		IDs []string `json:"ids" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "invalid_request", "message": "We couldn't process your request. Please check your input and try again.", "details": err.Error()})
		return
	}
	if len(req.IDs) == 0 {
		c.JSON(400, gin.H{"error": "no_ids_provided", "message": "No analyses were selected. Please select at least one and try again."})
		return
	}
	for _, id := range req.IDs {
		if len(id) != 36 {
			c.JSON(400, gin.H{"error": "invalid_id_format", "message": "We couldn't find one of the selected analyses. Please refresh and try again.", "id": id})
			return
		}
	}

	// Update status to cancelled and clear all analysis data for queued and processing analyses
	var stopped int64 = 0
	for _, id := range req.IDs {
		var analysis models.Analysis
		result := db.DB.Where("id = ? AND (status = ? OR status = ?)", id, models.Queued, models.Processing).First(&analysis)
		if result.Error == nil {
			if err := analysis.MarkAsCancelled(db.DB); err == nil {
				stopped++
			}
		}
		worker.StopAnalysis(id)
	}

	c.JSON(200, gin.H{"stopped": stopped})
}

// Rerun analyses by IDs (set status to queued, skip if already processing)
func RerunAnalyses(c *gin.Context) {
	var req struct {
		IDs []string `json:"ids" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "invalid_request", "message": "We couldn't process your request. Please check your input and try again.", "details": err.Error()})
		return
	}
	if len(req.IDs) == 0 {
		c.JSON(400, gin.H{"error": "no_ids_provided", "message": "No analyses were selected. Please select at least one and try again."})
		return
	}
	for _, id := range req.IDs {
		if len(id) != 36 {
			c.JSON(400, gin.H{"error": "invalid_id_format", "message": "We couldn't find one of the selected analyses. Please refresh and try again.", "id": id})
			return
		}
	}
	result := db.DB.Model(&models.Analysis{}).
		Where("id IN ? AND status NOT IN (?, ?)", req.IDs, models.Processing, models.Queued).
		Updates(map[string]interface{}{"status": models.Queued})
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "db_rerun_failed", "message": "Sorry, we couldn't re-queue the selected analyses. Please try again later.", "details": result.Error.Error()})
		return
	}
	c.JSON(200, gin.H{"rerun": result.RowsAffected})
}

// Get a single analysis by ID
func GetSingleAnalysis(c *gin.Context) {
	id := c.Param("id")
	if len(id) != 36 {
		c.JSON(400, gin.H{"error": "invalid_id_format", "message": "We couldn't find the analysis you requested. Please refresh and try again."})
		return
	}
	var analysis models.Analysis
	result := db.DB.First(&analysis, "id = ?", id)
	if result.Error != nil {
		c.JSON(404, gin.H{"error": "not_found", "message": "We couldn't find the analysis you requested."})
		return
	}
	c.JSON(200, analysis)
}
