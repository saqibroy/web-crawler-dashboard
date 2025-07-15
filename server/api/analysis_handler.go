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

// Request/Response structs
type URLRequest struct {
	URL string `json:"url" binding:"required"`
}

type IDsRequest struct {
	IDs []string `json:"ids" binding:"required"`
}

// Helper functions
func isValidURL(u string) bool {
	parsed, err := url.ParseRequestURI(u)
	if err != nil {
		return false
	}
	return (parsed.Scheme == "http" || parsed.Scheme == "https") &&
		parsed.Host != "" &&
		!strings.Contains(parsed.Host, " ")
}

func parseIntParam(c *gin.Context, param string, defaultValue int) (int, error) {
	if value, err := strconv.Atoi(c.DefaultQuery(param, strconv.Itoa(defaultValue))); err != nil || value < 1 {
		return 0, fmt.Errorf("invalid %s parameter", param)
	} else {
		return value, nil
	}
}

func validateUUIDs(ids []string) error {
	if len(ids) == 0 {
		return fmt.Errorf("no IDs provided")
	}
	for _, id := range ids {
		if len(id) != 36 {
			return fmt.Errorf("invalid ID format: %s", id)
		}
	}
	return nil
}

func errorResponse(c *gin.Context, status int, code, message string, details ...interface{}) {
	response := gin.H{"error": code, "message": message}
	if len(details) > 0 {
		response["details"] = details[0]
	}
	c.JSON(status, response)
}

// API Handlers
func SubmitURL(c *gin.Context) {
	var req URLRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errorResponse(c, 400, "invalid_request", "Invalid request format", err.Error())
		return
	}

	if !isValidURL(req.URL) {
		errorResponse(c, 400, "invalid_url", "Invalid URL format")
		return
	}

	analysis := models.Analysis{URL: req.URL, Status: models.Queued}
	if err := db.DB.Create(&analysis).Error; err != nil {
		errorResponse(c, 500, "db_create_failed", "Failed to save analysis", err.Error())
		return
	}

	c.JSON(202, gin.H{"id": analysis.ID, "status": analysis.Status})
}

func GetAnalyses(c *gin.Context) {
	// Parse parameters
	page, err := parseIntParam(c, "page", 1)
	if err != nil {
		errorResponse(c, 400, "invalid_page", "Invalid page number")
		return
	}

	limit, err := parseIntParam(c, "limit", 20)
	if err != nil {
		errorResponse(c, 400, "invalid_limit", "Invalid limit value")
		return
	}

	search := c.DefaultQuery("search", "")
	sortBy := c.DefaultQuery("sort_by", "")
	sortOrder := c.DefaultQuery("sort_order", "desc")
	statusFilter := c.DefaultQuery("status", "")

	// Validate status filter
	if statusFilter != "" {
		validStatuses := map[string]bool{
			"queued": true, "processing": true, "completed": true,
			"failed": true, "cancelled": true,
		}
		if !validStatuses[statusFilter] {
			errorResponse(c, 400, "invalid_status_filter", "Invalid status filter")
			return
		}
	}

	// Build query
	query := db.DB.Model(&models.Analysis{})

	// Apply filters
	if search != "" {
		query = query.Where("url LIKE ? OR title LIKE ?", "%"+search+"%", "%"+search+"%")
	}
	if statusFilter != "" {
		query = query.Where("status = ?", statusFilter)
	}

	// Apply sorting
	if sortBy != "" {
		query = query.Order(fmt.Sprintf("%s %s", sortBy, sortOrder))
	} else {
		query = query.Order("CASE WHEN status IN ('queued', 'processing') THEN 0 ELSE 1 END, COALESCE(updated_at, created_at) desc")
	}

	// Get total count and data
	var total int64
	query.Count(&total)

	var analyses []models.Analysis
	query.Offset((page - 1) * limit).Limit(limit).Find(&analyses)

	// Get status counts
	statusCounts := make(map[string]int64)
	for _, status := range []models.AnalysisStatus{models.Completed, models.Failed, models.Processing, models.Queued, models.Cancelled} {
		var count int64
		db.DB.Model(&models.Analysis{}).Where("status = ?", status).Count(&count)
		statusCounts[string(status)] = count
	}

	c.JSON(200, gin.H{
		"data":          analyses,
		"total_count":   total,
		"status_counts": statusCounts,
	})
}

func DeleteAnalyses(c *gin.Context) {
	var req IDsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errorResponse(c, 400, "invalid_request", "Invalid request format", err.Error())
		return
	}

	if err := validateUUIDs(req.IDs); err != nil {
		errorResponse(c, 400, "invalid_ids", err.Error())
		return
	}

	result := db.DB.Delete(&models.Analysis{}, req.IDs)
	if result.Error != nil {
		errorResponse(c, 500, "db_delete_failed", "Failed to delete analyses", result.Error.Error())
		return
	}

	c.JSON(200, gin.H{"deleted": result.RowsAffected})
}

func StopAnalyses(c *gin.Context) {
	var req IDsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errorResponse(c, 400, "invalid_request", "Invalid request format", err.Error())
		return
	}

	if err := validateUUIDs(req.IDs); err != nil {
		errorResponse(c, 400, "invalid_ids", err.Error())
		return
	}

	var stopped int64
	for _, id := range req.IDs {
		var analysis models.Analysis
		if err := db.DB.Where("id = ? AND (status = ? OR status = ?)", id, models.Queued, models.Processing).First(&analysis).Error; err == nil {
			if analysis.MarkAsCancelled(db.DB) == nil {
				stopped++
			}
		}
		worker.StopAnalysis(id)
	}

	c.JSON(200, gin.H{"stopped": stopped})
}

func RerunAnalyses(c *gin.Context) {
	var req IDsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errorResponse(c, 400, "invalid_request", "Invalid request format", err.Error())
		return
	}

	if err := validateUUIDs(req.IDs); err != nil {
		errorResponse(c, 400, "invalid_ids", err.Error())
		return
	}

	result := db.DB.Model(&models.Analysis{}).
		Where("id IN ? AND status NOT IN (?, ?)", req.IDs, models.Processing, models.Queued).
		Updates(map[string]interface{}{"status": models.Queued})

	if result.Error != nil {
		errorResponse(c, 500, "db_rerun_failed", "Failed to rerun analyses", result.Error.Error())
		return
	}

	c.JSON(200, gin.H{"rerun": result.RowsAffected})
}

func GetSingleAnalysis(c *gin.Context) {
	id := c.Param("id")
	if len(id) != 36 {
		errorResponse(c, 400, "invalid_id_format", "Invalid ID format")
		return
	}

	var analysis models.Analysis
	if err := db.DB.First(&analysis, "id = ?", id).Error; err != nil {
		errorResponse(c, 404, "not_found", "Analysis not found")
		return
	}

	c.JSON(200, analysis)
}
