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
	CompletedAt   *time.Time     `json:"completed_at"`
}

// BeforeCreate GORM hook to set UUID
func (a *Analysis) BeforeCreate(tx *gorm.DB) error {
	if a.ID == "" {
		a.ID = uuid.New().String()
	}
	return nil
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
