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
	if ctx.Err() != nil {
		return nil, ctx.Err()
	}

	client := &http.Client{
		Timeout: 10 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 10 {
				return errors.New("too many redirects")
			}
			return nil
		},
	}

	resp, err := client.Get(targetURL)
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

	parsedURL, err := url.Parse(targetURL)
	if err != nil {
		return nil, err
	}

	analysis := &models.Analysis{
		URL:          targetURL,
		HTMLVersion:  detectHTMLVersion(doc),
		Title:        strings.TrimSpace(doc.Find("title").Text()),
		Headings:     countHeadings(doc),
		HasLoginForm: hasLoginForm(doc),
	}

	analysis.InternalLinks, analysis.ExternalLinks, analysis.BrokenLinks = processLinks(ctx, doc, parsedURL)

	return analysis, nil
}

func detectHTMLVersion(doc *goquery.Document) string {
	htmlContent, err := doc.Html()
	if err != nil {
		return "Unknown"
	}

	lower := strings.ToLower(htmlContent)

	if strings.Contains(lower, "<!doctype html>") {
		return "HTML5"
	}
	if strings.Contains(lower, "xhtml") {
		return "XHTML"
	}
	if strings.Contains(lower, "html 4.01") {
		return "HTML 4.01"
	}
	if doc.Find("html").Length() > 0 {
		return "HTML5"
	}

	return "Unknown"
}

func countHeadings(doc *goquery.Document) map[string]interface{} {
	headings := make(map[string]interface{})
	for i := 1; i <= 6; i++ {
		tag := "h" + string(rune('0'+i))
		headings[tag] = doc.Find(tag).Length()
	}
	return headings
}

func hasLoginForm(doc *goquery.Document) bool {
	// Simple check for password input
	if doc.Find("input[type='password']").Length() > 0 {
		return true
	}

	// Check for login form patterns
	hasLogin := false
	doc.Find("form").Each(func(i int, form *goquery.Selection) {
		action := strings.ToLower(form.AttrOr("action", ""))
		class := strings.ToLower(form.AttrOr("class", ""))

		loginWords := []string{"login", "signin", "sign-in", "auth"}
		for _, word := range loginWords {
			if strings.Contains(action, word) || strings.Contains(class, word) {
				hasLogin = true
				return
			}
		}
	})

	return hasLogin
}

func processLinks(ctx context.Context, doc *goquery.Document, baseURL *url.URL) (int, int, map[string]interface{}) {
	internalCount := 0
	externalCount := 0
	brokenLinks := make(map[string]interface{})
	checkedLinks := make(map[string]bool)

	doc.Find("a[href]").Each(func(_ int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists || href == "" || strings.HasPrefix(href, "#") || strings.HasPrefix(href, "javascript:") {
			return
		}

		// Skip non-HTTP protocols
		if strings.HasPrefix(href, "mailto:") || strings.HasPrefix(href, "tel:") || strings.HasPrefix(href, "ftp:") {
			return
		}

		linkURL, err := url.Parse(href)
		if err != nil {
			return
		}

		// Resolve relative URLs
		if linkURL.Host == "" {
			linkURL = baseURL.ResolveReference(linkURL)
		}

		// Only process HTTP/HTTPS links
		if linkURL.Scheme != "http" && linkURL.Scheme != "https" {
			return
		}

		// Count internal vs external
		if strings.EqualFold(linkURL.Host, baseURL.Host) {
			internalCount++
		} else {
			externalCount++
		}

		// Check if broken (avoid duplicates)
		fullURL := linkURL.String()
		if !checkedLinks[fullURL] {
			checkedLinks[fullURL] = true
			if isBrokenLink(fullURL) {
				brokenLinks[fullURL] = "Broken"
			}
		}
	})

	return internalCount, externalCount, brokenLinks
}

func isBrokenLink(linkURL string) bool {
	client := &http.Client{
		Timeout: 5 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 5 {
				return errors.New("too many redirects")
			}
			return nil
		},
	}

	resp, err := client.Head(linkURL)
	if err != nil {
		// Fallback to GET if HEAD fails
		resp, err = client.Get(linkURL)
		if err != nil {
			return true
		}
	}
	defer resp.Body.Close()

	// 4xx and 5xx are broken, but 999 is bot protection (not broken)
	return resp.StatusCode >= 400 && resp.StatusCode != 999
}
