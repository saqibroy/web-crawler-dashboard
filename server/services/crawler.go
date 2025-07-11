package services

import (
	"errors"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/saqibroy/web-crawler-dashboard/server/models"

	"github.com/PuerkitoBio/goquery"
)

func Crawl(targetURL string) (*models.Analysis, error) {
	resp, err := http.Get(targetURL)
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
		URL: targetURL,
	}

	// Parse the target URL to get the base domain
	parsedURL, err := url.Parse(targetURL)
	if err != nil {
		return nil, err
	}
	baseDomain := parsedURL.Host

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

	// Count internal vs external links and check for broken links
	internalCount := 0
	externalCount := 0
	brokenLinks := make(map[string]interface{})

	doc.Find("a[href]").Each(func(_ int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists || href == "" || strings.HasPrefix(href, "#") {
			return
		}

		// Parse the link URL
		linkURL, err := url.Parse(href)
		if err != nil {
			return
		}

		// If it's a relative URL, make it absolute
		if linkURL.Host == "" {
			linkURL = parsedURL.ResolveReference(linkURL)
		}

		// Check if it's internal or external
		if linkURL.Host == baseDomain {
			internalCount++
		} else {
			externalCount++
		}

		// Check if link is broken (synchronously for simplicity)
		client := &http.Client{
			Timeout: 3 * time.Second,
		}
		resp, err := client.Head(linkURL.String())
		if err != nil || resp.StatusCode >= 400 {
			status := "Error"
			if resp != nil {
				status = resp.Status
			}
			brokenLinks[linkURL.String()] = status
		}
	})

	analysis.InternalLinks = internalCount
	analysis.ExternalLinks = externalCount
	analysis.BrokenLinks = brokenLinks

	return analysis, nil
}
