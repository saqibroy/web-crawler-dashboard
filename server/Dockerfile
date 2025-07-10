FROM golang:1.24-alpine AS builder

WORKDIR /app
COPY server/go.mod server/go.sum ./
RUN go mod download
COPY server/ .

RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]