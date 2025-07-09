package worker

import (
	"log"
	"time"

	"github.com/saqibroy/web-crawler-dashboard/server/db"
	"github.com/saqibroy/web-crawler-dashboard/server/models"
	"github.com/saqibroy/web-crawler-dashboard/server/services"
)

func StartWorker() {
	go func() {
		for {
			var analysis models.Analysis
			result := db.DB.Where("status = ?", "queued").First(&analysis)
			if result.Error != nil {
				if result.Error.Error() != "record not found" {
					log.Printf("DB error: %v", result.Error)
				}
				time.Sleep(5 * time.Second)
				continue
			}

			// Update status to processing
			db.DB.Model(&analysis).Update("status", models.Processing)

			// Process analysis
			analysisResult, err := services.Crawl(analysis.URL)
			if err != nil {
				log.Printf("Crawl failed for %s: %v", analysis.URL, err)
				db.DB.Model(&analysis).Update("status", models.Failed)
				continue
			}

			// Update analysis fields with results
			analysis.HTMLVersion = analysisResult.HTMLVersion
			analysis.Title = analysisResult.Title
			analysis.Headings = analysisResult.Headings
			analysis.InternalLinks = analysisResult.InternalLinks
			analysis.ExternalLinks = analysisResult.ExternalLinks
			analysis.BrokenLinks = analysisResult.BrokenLinks
			analysis.HasLoginForm = analysisResult.HasLoginForm
			analysis.Status = models.Completed
			now := time.Now()
			analysis.CompletedAt = &now
			if err := db.DB.Save(&analysis).Error; err != nil {
				log.Printf("Failed to save result for %s: %v", analysis.URL, err)
			}

			time.Sleep(1 * time.Second)
		}
	}()
}
