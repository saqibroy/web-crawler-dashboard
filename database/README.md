# Web Crawler Dashboard - Database

[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1.svg?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-blue.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-2.x-0451A4.svg?logo=docker&logoColor=white)](https://docs.docker.com/compose/)

This directory contains the Docker Compose setup for the MySQL database used by the Web Crawler Dashboard application, along with its initial schema migrations.

## Features

- **MySQL Database**: Provides a dedicated MySQL 8.0 instance for the application.
- **Automatic Schema Migration**: Automatically applies the necessary database schema when the container starts.
- **Dockerized Setup**: Ensures a consistent and isolated database environment.

## Getting Started

### Prerequisites
- **Docker Desktop** (or Docker Engine and Docker Compose) installed on your system.

### Installation & Running the Database
The database setup is part of the main project's orchestration. You typically start the database along with the backend and frontend from the repository root.

To start *only* the database service from this directory:

```bash
# Navigate to the database directory
cd web-crawler-dashboard/database

# Start the MySQL database container
docker-compose up
```
The database will be accessible on `localhost:3306`.

## Project Structure

```
database/
├── migrations/        # SQL files for initial database schema setup
│   └── 001_initial_schema.up.sql
└── docker-compose.yml # Defines the MySQL service and its configuration
```

## Key Components
- **docker-compose.yml**: This file defines the `mysql` service, specifying the Docker image, environment variables for database credentials, port mappings, and volume mounts for data persistence and schema migrations.
- **migrations/001_initial_schema.up.sql**: This SQL script is executed automatically when the MySQL container starts for the first time, creating the `analyses` table and setting up the initial database schema.

## References
- [Golang-Migrate Documentation](https://github.com/golang-migrate/migrate)
- [DOCKER Compose Documentation](https://docs.docker.com/compose/)