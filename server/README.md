# Web Crawler API

[![Go](https://img.shields.io/badge/Go-1.23%2B-00ADD8.svg?logo=go&logoColor=white)](https://go.dev/)
[![Gin Gonic](https://img.shields.io/badge/Gin_Gonic-1.10.x-008080.svg?logo=go&logoColor=white)](https://gin-gonic.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1.svg?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![GORM](https://img.shields.io/badge/ORM-GORM-E91E63.svg?logo=go&logoColor=white)](https://gorm.io/)
[![JWT](https://img.shields.io/badge/Authentication-JWT-yellow.svg)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A Go-based backend API for the Web Crawler Dashboard, handling URL analysis, crawl data, and results.

## Features
- **URL Submission**: Accepts URLs for analysis.
- **Asynchronous Crawling**: Processes requests in a background worker.
- **Data Extraction**: Captures HTML version, title, heading counts (H1-H6), internal/external links, broken links (4xx/5xx), and login form detection.
- **Analysis Management**: Endpoints for listing, retrieving, deleting, stopping, and re-running analyses.
- **Real-time Updates**: Updates analysis statuses in the database for frontend feedback.

## Getting Started

### Prerequisites
- Go (1.23+, check: `go version`)
- Docker Desktop (or Docker Engine with Compose)

### Installation
1. **Navigate to server directory:**
   ```bash
   cd web-crawler-dashboard/server
   ```
2. **Install dependencies:**
   ```bash
   go mod tidy
   ```
3. **Create `.env` file:**
   In `server/`, add:
   ```env
   JWT_SECRET=your_super_secret_jwt_key_here
   MYSQL_DSN=user:password@tcp(127.0.0.1:3306)/crawler?charset=utf8mb4&parseTime=True&loc=Local
   PORT=8080
   ```
4. **Start server:**
   ```bash
   go run main.go
   ```
   Runs on `http://localhost:8080`.

## API Documentation

### Base URL
`http://localhost:8080/api`

### Authentication
All endpoints (except `/api/auth/token`, `/health`) require JWT in `Authorization: Bearer <token>`.

- **Generate Token:**
  ```bash
  curl -X POST http://localhost:8080/api/auth/token
  ```
  Response: `{ "access_token": "...", "token_type": "bearer", "expires_in": 3600 }`

### Analysis Endpoints
1. **Submit URL (`POST /analyses`)**:
   ```bash
   curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"url":"https://example.com"}' http://localhost:8080/api/analyses
   ```
   Response: `{ "id": "...", "status": "queued" }`

2. **List Analyses (`GET /analyses`)**:
   ```bash
   curl -X GET -H "Authorization: Bearer <token>" "http://localhost:8080/api/analyses?page=1&limit=10&search=example"
   ```
   Query: `page`, `limit`, `search`, `sort_by` (e.g., `url`), `sort_order` (`asc`/`desc`), `status` (e.g., `completed`).
   Response: `{ "data": [...], "total_count": 100, "status_counts": {...} }`

3. **Get Analysis (`GET /analyses/:id`)**:
   ```bash
   curl -X GET -H "Authorization: Bearer <token>" http://localhost:8080/api/analyses/<id>
   ```

4. **Delete Analyses (`DELETE /analyses`)**:
   ```bash
   curl -X DELETE -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"ids":["id1","id2"]}' http://localhost:8080/api/analyses
   ```

5. **Stop Analyses (`POST /analyses/stop`)**:
   ```bash
   curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"ids":["id1","id2"]}' http://localhost:8080/api/analyses/stop
   ```

6. **Re-run Analyses (`POST /analyses/rerun`)**:
   ```bash
   curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"ids":["id1","id2"]}' http://localhost:8080/api/analyses/rerun
   ```

### Health Check
```bash
curl http://localhost:8080/health
```
Response: `{ "status": "ok" }`

## Project Structure
```
server/
├── api/       # API endpoint handlers
├── auth/      # JWT authentication
├── db/        # Database and GORM setup
├── models/    # Database models
├── services/  # Web crawling logic
├── worker/    # Asynchronous processing
├── go.mod     # Go module dependencies
└── main.go    # Server entry point
```

## References
- [Go Documentation](https://go.dev/)
- [Gin Gonic Documentation](https://gin-gonic.com/docs/)
- [goquery GitHub](https://github.com/PuerkitoBio/goquery)
- [golang-jwt GitHub](https://github.com/golang-jwt/jwt)