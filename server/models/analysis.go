package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AnalysisStatus string

const (
	Queued     AnalysisStatus = "queued"
	Processing AnalysisStatus = "processing"
	Completed  AnalysisStatus = "completed"
	Failed     AnalysisStatus = "failed"
	Cancelled  AnalysisStatus = "cancelled"
)

type Analysis struct {
	ID            string         `gorm:"type:char(36);primaryKey" json:"id"`
	URL           string         `gorm:"not null" json:"url"`
	Status        AnalysisStatus `gorm:"default:queued" json:"status"`
	HTMLVersion   string         `json:"html_version"`
	Title         string         `json:"title"`
	Headings      JSONMap        `gorm:"type:json" json:"headings"` // {h1: 3, h2: 5}
	InternalLinks int            `json:"internal_links"`
	ExternalLinks int            `json:"external_links"`
	BrokenLinks   JSONMap        `gorm:"type:json" json:"broken_links"` // {"url": "status"}
	HasLoginForm  bool           `json:"has_login_form"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	CompletedAt   *time.Time     `json:"completed_at"`
}

// BeforeCreate GORM hook to set UUID
func (a *Analysis) BeforeCreate(tx *gorm.DB) error {
	if a.ID == "" {
		a.ID = uuid.New().String()
	}
	return nil
}

// MarkAsProcessing sets the analysis status to processing.
func (a *Analysis) MarkAsProcessing(db *gorm.DB) error {
	a.Status = Processing
	return db.Save(a).Error
}

// MarkAsCompleted sets the analysis status to completed and updates result fields.
func (a *Analysis) MarkAsCompleted(db *gorm.DB, result *Analysis) error {
	a.Status = Completed
	a.HTMLVersion = result.HTMLVersion
	a.Title = result.Title
	a.Headings = result.Headings
	a.InternalLinks = result.InternalLinks
	a.ExternalLinks = result.ExternalLinks
	a.BrokenLinks = result.BrokenLinks
	a.HasLoginForm = result.HasLoginForm
	now := time.Now()
	a.CompletedAt = &now
	return db.Save(a).Error
}

// MarkAsFailed sets the analysis status to failed.
func (a *Analysis) MarkAsFailed(db *gorm.DB) error {
	a.Status = Failed
	return db.Save(a).Error
}

// MarkAsCancelled sets the analysis status to cancelled and clears result fields.
func (a *Analysis) MarkAsCancelled(db *gorm.DB) error {
	a.Status = Cancelled
	a.Title = ""
	a.HTMLVersion = ""
	a.Headings = JSONMap{}
	a.InternalLinks = 0
	a.ExternalLinks = 0
	a.BrokenLinks = JSONMap{}
	a.HasLoginForm = false
	a.CompletedAt = nil
	return db.Save(a).Error
}

// JSONMap handles JSON data for GORM
// Implements sql.Scanner and driver.Valuer
// Use map[string]interface{} for flexible JSON storage
// {h1: 3, h2: 5} or {"url": "status"}
type JSONMap map[string]interface{}

func (j *JSONMap) Scan(value interface{}) error {
	if value == nil {
		*j = make(JSONMap)
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("failed to unmarshal JSONMap value: %v", value)
	}
	return json.Unmarshal(bytes, j)
}

func (j JSONMap) Value() (driver.Value, error) {
	if j == nil {
		return []byte("{}"), nil
	}
	return json.Marshal(j)
}
