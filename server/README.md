# Web Crawler Dashboard (Server)

This is the backend server for the Web Crawler Dashboard project. It provides a REST API for submitting URLs for analysis, processes them in the background, and stores the results in a MySQL database.

## Features

- Submit URLs for analysis (crawling, HTML version, headings, login form detection, etc.)
- Background worker processes analyses asynchronously
- JWT-based authentication for API endpoints
- Pagination support for listing analyses
- Auto-migrates database schema for easy setup

## Requirements

- Go 1.18+
- MySQL 5.7+ (with JSON column support)
- (Optional) [godotenv](https://github.com/joho/godotenv) for local `.env` file support

## Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd web-crawler-dashboard/server
   ```

2. **Create a `.env` file:**
   ```
   JWT_SECRET=change_this_to_a_secure_random_secret
   MYSQL_DSN=user:password@tcp(localhost:3306)/crawler?charset=utf8mb4&parseTime=True&loc=Local
   ```

3. **Install dependencies:**
   ```bash
   go mod tidy
   ```

4. **Run the server:**
   ```bash
   go run main.go
   ```

   The server will auto-migrate the database schema.

## API Usage

### **Authentication**

- Generate a JWT token:
  ```bash
  curl -X POST http://localhost:8080/api/auth/token
  ```
  The response will include a valid JWT token.

### **Submit a URL for Analysis**

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}' \
  http://localhost:8080/api/analyses
```

### **List Analyses (with Pagination)**

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8080/api/analyses?page=1&page_size=10"
```

## Project Structure

- `main.go` - Entry point, server setup, and routes
- `models/` - GORM models
- `api/` - API handlers
- `auth/` - JWT authentication logic
- `db/` - Database connection logic
- `worker/` - Background worker for processing analyses
- `services/` - Crawling and analysis logic

## Notes

- The server uses GORM's `AutoMigrate` for easy local setup.
- For production, consider using manual migrations and more secure secret management.

## Production Considerations

- **JWT Secret:** Always use a strong, randomly generated value for `JWT_SECRET` in production. Never use the default or a weak secret. Consider using a secrets manager or environment variable management tool.
- **Database Migrations:** For production deployments, use a proper database migration tool (such as [golang-migrate/migrate](https://github.com/golang-migrate/migrate) or [pressly/goose](https://github.com/pressly/goose)) instead of relying solely on GORM's `AutoMigrate` or manual `ALTER TABLE` commands. This ensures safe, repeatable, and versioned schema changes.
