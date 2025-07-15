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

func StopAnalysis(id string) {
	if cancel, ok := cancelFuncs[id]; ok {
		cancel()
		delete(cancelFuncs, id)
	}
}

func StartWorker() {
	go func() {
		for {
			analysis := getNextQueuedAnalysis()
			if analysis == nil {
				time.Sleep(5 * time.Second)
				continue
			}

			if analysis.Status == models.Cancelled {
				continue
			}

			processAnalysis(analysis)
			time.Sleep(1 * time.Second)
		}
	}()
}

func getNextQueuedAnalysis() *models.Analysis {
	var analysis models.Analysis
	result := db.DB.Where("status = ?", "queued").First(&analysis)
	if result.Error != nil {
		if result.Error.Error() != "record not found" {
			log.Printf("DB error: %v", result.Error)
		}
		return nil
	}
	return &analysis
}

func processAnalysis(analysis *models.Analysis) {
	analysis.MarkAsProcessing(db.DB)

	ctx, cancel := context.WithCancel(context.Background())
	cancelFuncs[analysis.ID] = cancel

	result, err := services.Crawl(ctx, analysis.URL)
	delete(cancelFuncs, analysis.ID)

	if err != nil {
		if err == context.Canceled {
			analysis.MarkAsCancelled(db.DB)
			log.Printf("Analysis %s cancelled", analysis.ID)
		} else {
			log.Printf("Crawl failed for %s: %v", analysis.URL, err)
			analysis.MarkAsFailed(db.DB)
		}
		return
	}

	analysis.MarkAsCompleted(db.DB, result)
}
