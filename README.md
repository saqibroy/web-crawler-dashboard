# Web Crawler Dashboard

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Go](https://img.shields.io/badge/Go-1.23%2B-00ADD8.svg?logo=go&logoColor=white)](https://go.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1.svg?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-2.x-0451A4.svg?logo=docker&logoColor=white)](https://docs.docker.com/compose/)

A full-stack web application designed to crawl a given website URL and display key information about its pages, offering a comprehensive overview of web page health and structure.

## Features

### Core Application Features
- **URL Submission & Management**: Easily add new website URLs for analysis.
- **Comprehensive Page Analysis**: For each submitted URL, the system extracts:
  * HTML version (e.g., HTML5, HTML 4.01)
  * Page title
  * Count of heading tags by level (H1, H2, H3, etc.)
  * Number of internal links found on the page.
  * Number of external links found on the page.
  * Detection of inaccessible (broken) links, reporting those with 4xx or 5xx HTTP status codes.
  * Identification of the presence of a login form.
- **Interactive Results Dashboard**:
  * Displays all analyses in a paginated and sortable table.
  * Columns include Title, HTML Version, Internal Links, External Links, and Status.
  * Features a global search box for fuzzy or prefix matching on URLs and titles.
  * Allows filtering analyses by their status (e.g., Completed, Processing, Failed).
- **Detailed Analysis View**: Clicking on any analysis entry opens a dedicated detail page, providing:
  * A clear bar or donut chart visualizing the distribution of internal vs. external links.
  * A comprehensive list of all detected broken links, along with their respective status codes.
- **Bulk Actions**: Streamline management with checkboxes to select multiple analyses for:
  * **Re-running** a new analysis.
  * **Deleting** selected entries.
  * **Stopping** currently queued or processing analyses.
- **Real-time Progress Updates**: Displays the live crawl status for each URL (queued → processing → completed / failed / cancelled), providing immediate feedback on analysis progress.

### Technical Features
- **React & TypeScript Frontend**: Built with a modern, component-based architecture for a robust and type-safe user interface.
- **Go Backend API**: A high-performance and concurrent API developed in Go, handling crawling, data processing, and serving analysis results.
- **MySQL Database**: Utilizes MySQL for persistent and structured storage of all analysis data.
- **Reproducible Development Environment**: Leverages Docker Compose for consistent database setup and `npm` scripts for streamlined cross-service orchestration.
- **Automated Frontend Tests**: Includes foundational happy-path tests to ensure core frontend functionality.

## Project Structure

```
web-crawler-dashboard/
├── client/          # React/TypeScript frontend application. See client/README.md for more details.
├── server/          # Go backend API. See server/README.md for more details.
├── database/        # Docker Compose setup for MySQL and database migrations.
├── package.json     # Root package.json for orchestrating client, server, and database operations.
└── README.md        # This file.
```

## Getting Started

### Prerequisites

To run this project locally, you need the following installed on your system:

- **Node.js**: Version `^20.19.0 || >=22.12.0` (check with `node -v`)
- **npm**: Included with Node.js (check with `npm -v`)
- **Go**: Version 1.23 or newer (check with `go version`)
- **Docker Desktop** (or Docker Engine and Docker Compose): Essential for setting up and running the MySQL database.

### Installation & Running the Application

Follow these simple steps from the **root of the repository** to get the entire application stack running:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/saqibroy/web-crawler-dashboard.git
   cd web-crawler-dashboard
   ```

2. **Install all dependencies:**
   ```bash
   npm run install-all
   ```
   This command will install root-level `npm` dependencies (like `concurrently`) and then automatically navigate into the `client` directory to install its specific Node.js dependencies.

3. **Create `.env` files:**

   * **For the Backend (in `client/` directory):**
     Navigate into the `server` directory (`cd server`) and create a file named `.env` and add the following content. This configures your Go backend's JWT secret and database connection.
     ```env
     JWT_SECRET=your_super_secret_jwt_key_here # IMPORTANT: Change this to a strong, random string!
     MYSQL_DSN=user:password@tcp(127.0.0.1:3306)/crawler?charset=utf8mb4&parseTime=True&loc=Local
     PORT=8080
     ```
     *Note: `127.0.0.1` is used for `MYSQL_DSN` to ensure the Go backend connects to the Dockerized MySQL instance running on your host's localhost network.*

   * **For the Frontend (in `client/` directory):**
     Navigate into the `client` directory (`cd client`) and create a file named `.env` (or `.env.local` for Vite) and add the following. This tells your React frontend where to find the backend API.
     ```env
     VITE_API_URL=http://localhost:8080/api
     ```
     Then navigate back to the root: `cd ..`

4. **Start all services (Database, Backend Server, Frontend Development Server):**
   ```bash
   npm run dev
   ```
   This single command will orchestrate the startup of:
   * The MySQL database container via Docker Compose.
   * The Go backend server.
   * The React frontend development server.

   Once all services are running, the frontend application will typically be accessible in your web browser at `http://localhost:5173` (please check your terminal output for the exact URL, as Vite might use a different port if 5173 is busy).

## Running Tests

To execute the automated frontend tests:

```bash
npm test
```
(Note: Backend tests are not within the scope of this exercise.)

## Stopping and Cleaning Up
To stop all running services and remove the Docker database containers and their associated volumes (useful for a clean restart or after development):

```bash
npm run clean:db
```

## Usage

### Submitting a URL for Analysis
1. On the dashboard, locate the input field at the top.
2. Enter a complete website URL (e.g., https://www.example.com).
3. Click the "Analyze URL" button. The analysis will be added to the queue and its status will be displayed in the table.

### Viewing Analysis Results
- The main dashboard table provides an overview of all submitted analyses.
- Use the search box to quickly find analyses by URL or page title.
- Click on the status cards at the top (e.g., "Completed", "Processing", "Failed") to filter the table by a specific analysis status.
- Click anywhere on an analysis row (or the "View Details" link on mobile cards) to navigate to a dedicated detail page for that analysis.

### Detailed Analysis View
The detail page provides in-depth insights into a specific website analysis:
- **Analysis Status & Info**: Current status, HTML version, and whether a login form was detected.
- **Key Metrics**: Counts for internal links, external links, and broken links.
- **Link Distribution Chart**: A visual representation (pie chart) of the ratio between internal and external links.
- **Heading Tags Distribution**: A bar chart showing the count of each heading tag (H1-H6) found on the page.
- **Broken Links List**: A clear list of all identified inaccessible links, along with their HTTP status codes.

### Performing Bulk Actions
- On the dashboard, use the checkboxes next to each analysis entry to select multiple items.
- Once items are selected, action buttons will appear at the top of the table.
- Click the desired button to perform a bulk action:
  - **Delete**: Permanently removes all selected analyses from the system.
  - **Stop**: Halts any selected analyses that are currently queued or processing.
  - **Re-run**: Re-queues selected analyses for a fresh crawl. New results will overwrite previous data upon completion.

## Technology Stack

### Frontend (Client)
- **React**: Modern JavaScript library for building user interfaces.
- **TypeScript**: Adds static type definitions to JavaScript for enhanced code quality and maintainability.
- **Tailwind CSS**: A utility-first CSS framework for rapid and responsive UI development.
- **@tanstack/react-query**: Powerful data fetching, caching, and synchronization library.
- **Recharts**: A composable charting library built with React for data visualization.
- **Lucide React**: A collection of beautiful and customizable open-source icons.
- **React Router DOM**: Standard library for declarative routing in React applications.
- **React Hot Toast**: Lightweight and customizable toast notifications.
- **Vite**: A fast and opinionated build tool for modern web projects.
- **Vitest**: A blazing fast unit test framework powered by Vite.

### Backend (Server)
- **Go**: A statically typed, compiled programming language known for its performance and concurrency.
- **Gin Gonic**: A high-performance HTTP web framework for Go.
- **GORM**: An excellent ORM (Object-Relational Mapping) library for Go, simplifying database interactions.
- **MySQL**: A widely used open-source relational database management system.
- **goquery**: A Go library that brings jQuery-like syntax to HTML parsing, used for web crawling.
- **golang-jwt**: A robust library for handling JSON Web Tokens (JWT) for API authentication.
- **godotenv**: A Go package to load environment variables from a .env file.
- **Docker Compose**: A tool for defining and running multi-container Docker applications, used here for the development database.

## API Documentation
For in-depth details about the backend API endpoints, data models, and the JWT authentication flow, please refer to the dedicated server README.


## License
This project is licensed under the MIT License - see the LICENSE file for full details.

## References

### Official Documentation
- [React Documentation](https://react.dev/)
- [Go Documentation](https://go.dev/)
- [Gin Gonic Documentation](https://gin-gonic.com/docs/)
- [GORM Documentation](https://gorm.io/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)