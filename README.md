# web-crawler-dashboard

## Quick Start
```bash
# Start database
cd database
docker-compose up -d

# Start backend
cd ../server
go run main.go

# Start frontend
cd ../client
npm install
npm run dev