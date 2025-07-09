package api

import (
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
	// Implement pagination and filtering
	var analyses []models.Analysis
	db.DB.Order("created_at desc").Find(&analyses)
	c.JSON(200, analyses)
}
