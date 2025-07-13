package services

import (
	"context"
	"errors"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/saqibroy/web-crawler-dashboard/server/models"

	"github.com/PuerkitoBio/goquery"
)

func Crawl(ctx context.Context, targetURL string) (*models.Analysis, error) {
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
	}

	resp, err := http.Get(targetURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, errors.New("non-200 status code")
	}

	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, err
	}

	analysis := &models.Analysis{
		URL: targetURL,
	}

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
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		default:
		}
		tag := "h" + string(rune('0'+i))
		count := doc.Find(tag).Length()
		headings[tag] = count
	}
	headingsMap := make(map[string]interface{})
	for k, v := range headings {
		headingsMap[k] = v
	}
	analysis.Headings = headingsMap

	// Check for login form
	analysis.HasLoginForm = doc.Find("input[type='password']").Length() > 0

	internalCount := 0
	externalCount := 0
	brokenLinks := make(map[string]interface{})

	doc.Find("a[href]").EachWithBreak(func(_ int, s *goquery.Selection) bool {
		select {
		case <-ctx.Done():
			return false // break
		default:
		}
		href, exists := s.Attr("href")
		if !exists || href == "" || strings.HasPrefix(href, "#") {
			return true
		}
		linkURL, err := url.Parse(href)
		if err != nil {
			return true
		}
		if linkURL.Host == "" {
			linkURL = parsedURL.ResolveReference(linkURL)
		}
		if linkURL.Host == baseDomain {
			internalCount++
		} else {
			externalCount++
		}
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
		return true
	})

	analysis.InternalLinks = internalCount
	analysis.ExternalLinks = externalCount
	analysis.BrokenLinks = brokenLinks

	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
	}

	return analysis, nil
}
