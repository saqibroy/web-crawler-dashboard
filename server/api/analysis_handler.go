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
	page, err1 := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, err2 := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if err1 != nil || page < 1 {
		page = 1
	}
	if err2 != nil || limit < 1 {
		limit = 20
	}
	var analyses []models.Analysis
	result := db.DB.Order("created_at desc").Offset((page - 1) * limit).Limit(limit).Find(&analyses)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch analyses", "details": result.Error.Error()})
		return
	}
	c.JSON(200, analyses)
}
