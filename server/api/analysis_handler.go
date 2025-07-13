package api

import (
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/saqibroy/web-crawler-dashboard/server/db"
	"github.com/saqibroy/web-crawler-dashboard/server/models"
	"github.com/saqibroy/web-crawler-dashboard/server/worker"
)

func SubmitURL(c *gin.Context) {
	var req struct {
		URL string `json:"url" binding:"required,url"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid URL", "details": err.Error()})
		return
	}

	analysis := models.Analysis{
		URL:    req.URL,
		Status: models.Queued,
	}

	result := db.DB.Create(&analysis)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "Failed to create analysis", "details": result.Error.Error()})
		return
	}

	c.JSON(202, gin.H{
		"id":     analysis.ID,
		"status": analysis.Status,
	})
}

func GetAnalyses(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	search := c.DefaultQuery("search", "")        // New: search parameter
	sortBy := c.DefaultQuery("sort_by", "")       // New: sort_by parameter
	sortOrder := c.DefaultQuery("sort_order", "") // New: sort_order parameter

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
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
		c.JSON(400, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}
	if len(req.IDs) == 0 {
		c.JSON(400, gin.H{"error": "No IDs provided"})
		return
	}
	result := db.DB.Delete(&models.Analysis{}, req.IDs)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "Failed to delete analyses", "details": result.Error.Error()})
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
		c.JSON(400, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}
	if len(req.IDs) == 0 {
		c.JSON(400, gin.H{"error": "No IDs provided"})
		return
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
		c.JSON(400, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}
	if len(req.IDs) == 0 {
		c.JSON(400, gin.H{"error": "No IDs provided"})
		return
	}
	result := db.DB.Model(&models.Analysis{}).
		Where("id IN ? AND status NOT IN (?, ?)", req.IDs, models.Processing, models.Queued).
		Updates(map[string]interface{}{"status": models.Queued})
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "Failed to rerun analyses", "details": result.Error.Error()})
		return
	}
	c.JSON(200, gin.H{"rerun": result.RowsAffected})
}

// Get a single analysis by ID
func GetSingleAnalysis(c *gin.Context) {
	id := c.Param("id")
	var analysis models.Analysis
	result := db.DB.First(&analysis, "id = ?", id)
	if result.Error != nil {
		c.JSON(404, gin.H{"error": "Analysis not found"})
		return
	}
	c.JSON(200, analysis)
}
