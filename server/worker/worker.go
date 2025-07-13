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
			_ = analysis.MarkAsProcessing(db.DB)

			ctx, cancel := context.WithCancel(context.Background())
			cancelFuncs[analysis.ID] = cancel

			analysisResult, err := services.Crawl(ctx, analysis.URL)
			delete(cancelFuncs, analysis.ID)

			if err != nil {
				if err == context.Canceled {
					_ = analysis.MarkAsCancelled(db.DB)
					log.Printf("Analysis %s cancelled", analysis.ID)
					continue
				}
				log.Printf("Crawl failed for %s: %v", analysis.URL, err)
				_ = analysis.MarkAsFailed(db.DB)
				continue
			}

			// Update analysis fields with results
			_ = analysis.MarkAsCompleted(db.DB, analysisResult)

			time.Sleep(1 * time.Second)
		}
	}()
}
