package worker

import (
	"context"
	"log"
	"time"

	"github.com/saqibroy/web-crawler-dashboard/server/db"
	"github.com/saqibroy/web-crawler-dashboard/server/models"
	"github.com/saqibroy/web-crawler-dashboard/server/services"
)

var cancelFuncs = make(map[string]context.CancelFunc)

// StopAnalysis allows external callers to cancel an analysis by ID
func StopAnalysis(id string) {
	if cancel, ok := cancelFuncs[id]; ok {
		cancel()
	}
}

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

			// Check if analysis was cancelled before starting
			db.DB.First(&analysis, "id = ?", analysis.ID)
			if analysis.Status == models.Cancelled {
				continue
			}

			// Update status to processing
			db.DB.Model(&analysis).Update("status", models.Processing)

			ctx, cancel := context.WithCancel(context.Background())
			cancelFuncs[analysis.ID] = cancel

			analysisResult, err := services.Crawl(ctx, analysis.URL)
			delete(cancelFuncs, analysis.ID)

			if err != nil {
				if err == context.Canceled {
					db.DB.Model(&analysis).Updates(map[string]interface{}{
						"status":         models.Cancelled,
						"title":          "",
						"html_version":   "",
						"headings":       "{}",
						"internal_links": 0,
						"external_links": 0,
						"broken_links":   "{}",
						"has_login_form": false,
						"completed_at":   nil,
					})
					log.Printf("Analysis %s cancelled", analysis.ID)
					continue
				}
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
