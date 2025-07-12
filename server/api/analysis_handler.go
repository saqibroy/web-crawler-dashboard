package api

import (
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/saqibroy/web-crawler-dashboard/server/db"
	"github.com/saqibroy/web-crawler-dashboard/server/models"
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
		query = query.Order("created_at desc") // Default if no specific sort
	}

	query.Count(&total) // Get total count before pagination

	query.Offset((page - 1) * limit).Limit(limit).Find(&analyses)

	c.JSON(200, gin.H{ // Changed to return map with data and total_count
		"data":        analyses,
		"total_count": total,
	})
}
