# Web Crawler Dashboard

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Go](https://img.shields.io/badge/Go-1.23%2B-00ADD8.svg?logo=go&logoColor=white)](https://go.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1.svg?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-2.x-0451A4.svg?logo=docker&logoColor=white)](https://docs.docker.com/compose/)

A full-stack web application to crawl website URLs and display page health and structure insights.

## Features
- **URL Submission**: Submit website URLs for analysis.
- **Page Analysis**: Extracts HTML version, page title, heading counts (H1-H6), internal/external links, broken links (4xx/5xx), and login form presence.
- **Interactive Dashboard**: Paginated, sortable table with search and status filters (Completed, Processing, Failed).
- **Detailed View**: Bar/donut charts for link distribution and a list of broken links with status codes.
- **Bulk Actions**: Re-run, delete, or stop multiple analyses.
- **Real-time Updates**: Live crawl status (queued, processing, completed, failed, cancelled).

## Technical Stack
- **Frontend**: React, TypeScript, Tailwind CSS, TanStack Query, Recharts, Lucide React, React Router DOM, React Hot Toast, Vite, Vitest.
- **Backend**: Go, Gin Gonic, GORM, MySQL, goquery, golang-jwt, godotenv.
- **Database**: MySQL with Docker Compose for consistent setup.
- **Testing**: Automated frontend tests included.

## Project Structure
```
web-crawler-dashboard/
├── client/          # React/TypeScript frontend (see client/README.md)
├── server/          # Go backend API (see server/README.md)
├── database/        # MySQL Docker Compose setup
├── package.json     # Orchestrates client, server, database
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (`^20.19.0 || >=22.12.0`, check: `node -v`)
- npm (check: `npm -v`)
- Go (1.23+, check: `go version`)
- Docker Desktop (or Docker Engine with Compose)

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/saqibroy/web-crawler-dashboard.git
   cd web-crawler-dashboard
   ```
2. **Install dependencies:**
   ```bash
   npm run install-all
   ```
3. **Create `.env` files:**
   - Backend (`server/.env`):
     ```env
     JWT_SECRET=your_super_secret_jwt_key_here
     MYSQL_DSN=user:password@tcp(127.0.0.1:3306)/crawler?charset=utf8mb4&parseTime=True&loc=Local
     PORT=8080
     ```
   - Frontend (`client/.env`):
     ```env
     VITE_API_URL=http://localhost:8080/api
     ```
4. **Start services:**
   ```bash
   npm run dev
   ```
   Access the frontend at `http://localhost:5173` (check terminal for exact port).

## Running Tests
```bash
npm test
```

## Stopping and Cleaning Up
```bash
npm run clean:db
```

## Usage
- **Submit URL**: Enter a URL (e.g., https://www.example.com) in the dashboard’s input and click "Analyze URL."
- **View Results**: Browse analyses in the table, filter by status, or search by URL/title.
- **Detailed View**: Click an view details for charts and broken link details.
- **Bulk Actions**: Select analyses to delete, stop, or re-run using checkboxes and buttons.

## API Documentation
See `server/README.md` for backend API endpoints and JWT authentication details.

## License
MIT License (see LICENSE file).

## References
- [React Documentation](https://react.dev/)
- [Go Documentation](https://go.dev/)
- [Gin Gonic Documentation](https://gin-gonic.com/docs/)
- [GORM Documentation](https://gorm.io/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)