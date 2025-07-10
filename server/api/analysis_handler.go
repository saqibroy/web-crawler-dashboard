package api

import (
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
		c.JSON(400, gin.H{"error": "Invalid URL"})
		return
	}

	analysis := models.Analysis{
		URL:    req.URL,
		Status: models.Queued,
	}

	result := db.DB.Create(&analysis)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "Failed to create analysis"})
		return
	}

	c.JSON(202, gin.H{
		"id":     analysis.ID,
		"status": analysis.Status,
	})
}

func GetAnalyses(c *gin.Context) {
	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	var analyses []models.Analysis
	db.DB.Order("created_at desc").Offset((page - 1) * limit).Limit(limit).Find(&analyses)
	c.JSON(200, analyses)
}
