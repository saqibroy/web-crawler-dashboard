# Web Crawler Dashboard - Database

[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1.svg?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-blue.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-2.x-0451A4.svg?logo=docker&logoColor=white)](https://docs.docker.com/compose/)

Docker Compose setup for the MySQL database used by the Web Crawler Dashboard, including schema migrations.

## Features
- **MySQL 8.0**: Dedicated database instance.
- **Automatic Schema Migration**: Applies schema on container start.
- **Dockerized Setup**: Consistent and isolated environment.

## Getting Started

### Prerequisites
- Docker Desktop (or Docker Engine with Compose)

### Installation
To start only the database:
```bash
cd web-crawler-dashboard/database
docker-compose up
```
Accessible at `localhost:3306`.

## Project Structure
```
database/
├── migrations/        # SQL schema files
│   └── 001_initial_schema.up.sql
└── docker-compose.yml # MySQL service configuration
```

## Key Components
- **docker-compose.yml**: Defines MySQL service with image, credentials, ports, and volume mounts.
- **migrations/001_initial_schema.up.sql**: Auto-executed SQL to create the `analyses` table.

## References
- [Golang-Migrate Documentation](https://github.com/golang-migrate/migrate)
- [Docker Compose Documentation](https://docs.docker.com/compose/)