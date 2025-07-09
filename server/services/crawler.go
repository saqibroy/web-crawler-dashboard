package services

import (
	"errors"
	"net/http"

	"github.com/saqibroy/web-crawler-dashboard/server/models"

	"github.com/PuerkitoBio/goquery"
)

func Crawl(url string) (*models.Analysis, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, errors.New("non-200 status code")
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, err
	}

	analysis := &models.Analysis{
		URL: url,
	}

	// Get HTML version
	docType := doc.Find("html").AttrOr("version", "")
	if docType == "" {
		docType = "HTML5" // Default assumption
	}
	analysis.HTMLVersion = docType

	// Get title
	analysis.Title = doc.Find("title").Text()

	// Count headings
	headings := make(map[string]int)
	for i := 1; i <= 6; i++ {
		tag := "h" + string(rune('0'+i))
		count := doc.Find(tag).Length()
		headings[tag] = count
	}
	// Convert map[string]int to map[string]interface{} for JSONMap
	headingsMap := make(map[string]interface{})
	for k, v := range headings {
		headingsMap[k] = v
	}
	analysis.Headings = headingsMap

	// Check for login form
	analysis.HasLoginForm = doc.Find("input[type='password']").Length() > 0

	return analysis, nil
}
