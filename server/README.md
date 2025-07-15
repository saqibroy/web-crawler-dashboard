# Web Crawler API

[![Go](https://img.shields.io/badge/Go-1.23%2B-00ADD8.svg?logo=go&logoColor=white)](https://go.dev/)
[![Gin Gonic](https://img.shields.io/badge/Gin_Gonic-1.10.x-008080.svg?logo=go&logoColor=white)](https://gin-gonic.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1.svg?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![GORM](https://img.shields.io/badge/ORM-GORM-E91E63.svg?logo=go&logoColor=white)](https://gorm.io/)
[![JWT](https://img.shields.io/badge/Authentication-JWT-yellow.svg)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

The robust Go-based backend API for the Web Crawler Dashboard, responsible for processing URL analysis requests, managing crawl data, and serving results.

## Features

### Core API Functionality
- **URL Submission**: Accepts new URLs for web page analysis.
- **Asynchronous Crawling**: Processes analysis requests in a background worker, ensuring a responsive API.
- **Data Extraction**: Gathers key information from crawled pages:
  * HTML version
  * Page title
  * Counts of heading tags (H1-H6)
  * Number of internal links
  * Number of external links
  * Identification of broken links (4xx/5xx status codes)
  * Detection of login forms
- **Analysis Management**: Provides API endpoints for:
  * Listing all analyses with pagination, searching, and sorting.
  * Retrieving a single analysis by ID.
  * Deleting analyses.
  * Stopping active (queued or processing) analyses.
  * Re-running completed or failed analyses.
- **Real-time Status Updates**: Backend worker updates analysis statuses in the database, enabling real-time feedback on the frontend.

## Getting Started

### Prerequisites
- **Go**: Version 1.23 or newer (check with `go version`)
- **Docker Desktop** (or Docker Engine and Docker Compose): Required for running the MySQL database.

### Installation & Running the Server
To set up and run only the backend API:

1. **Clone the repository:**
   ```bash
   cd web-crawler-dashboard/server
   ```

2. **Install Go dependencies:**
   ```bash
   go mod tidy
   ```

3. **Create `.env` file:**
   In the **server/** directory, create a file named `.env` and add the following content. This configures your backend's JWT secret and database connection.
   ```env
   JWT_SECRET=your_super_secret_jwt_key_here # IMPORTANT: Change this to a strong, random string!
   MYSQL_DSN=user:password@tcp(127.0.0.1:3306)/crawler?charset=utf8mb4&parseTime=True&loc=Local
   PORT=8080
   ```
   *Note: `127.0.0.1` is used for `MYSQL_DSN` to ensure the Go backend connects to the Dockerized MySQL instance running on your host's localhost network. You will need to start the database separately or use the root `npm run dev` command.*

4. **Start the server:**
   ```bash
   go run main.go
   ```
   The server will start on `http://localhost:8080` (or the port specified in your `.env` file). It will attempt to connect to the MySQL database and auto-migrate the schema on first run.

## API Documentation

The API adheres to RESTful principles. All endpoints are prefixed with `/api`.

### Base URL
`http://localhost:8080/api`

### Authentication
All API endpoints (except `/api/auth/token` and `/health`) require a JWT token in the `Authorization` header (`Bearer <token>`).

1. **Generate JWT Token:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/token
   ```
   Response will include `access_token`, `token_type`, and `expires_in`.

### Analysis Endpoints

1. **Submit a URL for Analysis (`POST /analyses`)**
   Submits a new URL to be crawled and analyzed.
   ```bash
   curl -X POST \
     -H "Authorization: Bearer <your_jwt_token>" \
     -H "Content-Type: application/json" \
     -d '{"url":"https://example.com"}' \
     http://localhost:8080/api/analyses
   ```
   Response: `{"id": "...", "status": "queued"}`

2. **List Analyses (`GET /analyses`)**
   Retrieves a paginated list of analyses. Supports search, sorting, and status filtering.
   ```bash
   curl -X GET \
     -H "Authorization: Bearer <your_jwt_token>" \
     "http://localhost:8080/api/analyses?page=1&limit=10&search=example&sort_by=created_at&sort_order=desc&status=completed"
   ```
   Query Parameters:
   * `page` (int, default: 1)
   * `limit` (int, default: 20)
   * `search` (string, optional): Search by URL or title.
   * `sort_by` (string, optional): Column to sort by (e.g., `url`, `status`, `created_at`).
   * `sort_order` (string, optional): `asc` or `desc`.
   * `status` (string, optional): Filter by analysis status (`queued`, `processing`, `completed`, `failed`, `cancelled`).
   Response: `{"data": [...], "total_count": 100, "status_counts": {"completed": 50, ...}}`

3. **Get Single Analysis (`GET /analyses/:id`)**
   Retrieves details for a specific analysis by its ID.
   ```bash
   curl -X GET \
     -H "Authorization: Bearer <your_jwt_token>" \
     http://localhost:8080/api/analyses/your-analysis-id-here
   ```
   Response: Full `Analysis` object.

4. **Delete Analyses (`DELETE /analyses`)**
   Deletes one or more analyses by their IDs.
   ```bash
   curl -X DELETE \
     -H "Authorization: Bearer <your_jwt_token>" \
     -H "Content-Type: application/json" \
     -d '{"ids":["id1", "id2"]}' \
     http://localhost:8080/api/analyses
   ```
   Response: `{"deleted": 2}`

5. **Stop Analyses (`POST /analyses/stop`)**
   Marks one or more `queued` or `processing` analyses as `cancelled`.
   ```bash
   curl -X POST \
     -H "Authorization: Bearer <your_jwt_token>" \
     -H "Content-Type: application/json" \
     -d '{"ids":["id1", "id2"]}' \
     http://localhost:8080/api/analyses/stop
   ```
   Response: `{"stopped": 1}`

6. **Re-run Analyses (`POST /analyses/rerun`)**
   Re-queues one or more analyses that are not `processing` or `queued`.
   ```bash
   curl -X POST \
     -H "Authorization: Bearer <your_jwt_token>" \
     -H "Content-Type: application/json" \
     -d '{"ids":["id1", "id2"]}' \
     http://localhost:8080/api/analyses/rerun
   ```
   Response: `{"rerun": 1}`

### Health Check
```bash
curl http://localhost:8080/health
```
Response: `{"status": "ok"}`

## Authentication Flow
The API uses JWT (JSON Web Token) for authentication:
- The frontend client requests an access token from `/api/auth/token`.
- The API generates a JWT token with a 1-hour expiry.
- The client includes this token in the `Authorization` header for all subsequent protected API requests:
  ```
  Authorization: Bearer <your-jwt-token>
  ```
- The `AuthMiddleware` verifies the token's validity and expiry.

## Development
To run the server in development mode:

```bash
# Navigate to the server directory
cd web-crawler-dashboard/server

# Run the main application
go run main.go
```
This will start the server with hot-reloading (if configured in Go, otherwise manual restart is needed for code changes).

You can also build the executable:

```bash
# Navigate to the server directory
cd web-crawler-dashboard/server

# Build the executable
go build -o web-crawler-server .

# Run the executable
./web-crawler-server
```

## Project Structure

```
server/
├── api/          # HTTP handlers for API endpoints (e.g., SubmitURL, GetAnalyses)
├── auth/         # JWT authentication logic and middleware
├── db/           # Database connection initialization and GORM setup
├── models/       # Go structs defining database models (e.g., Analysis)
├── services/     # Core business logic, including the web crawling function
├── worker/       # Background worker for asynchronous analysis processing
├── go.mod        # Go module definition and dependency management
└── main.go       # Main application entry point, server setup, and routing
```

## References

### Official Documentation
- [Go Documentation](https://go.dev/)
- [Gin Gonic Documentation](https://gin-gonic.com/docs/)
- [goquery GitHub](https://github.com/PuerkitoBio/goquery)
- [golang-jwt GitHub](https://github.com/golang-jwt/jwt)