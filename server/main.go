package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/saqibroy/web-crawler-dashboard/server/api"
	"github.com/saqibroy/web-crawler-dashboard/server/auth"
	"github.com/saqibroy/web-crawler-dashboard/server/db"
	"github.com/saqibroy/web-crawler-dashboard/server/models"
	"github.com/saqibroy/web-crawler-dashboard/server/worker"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: No .env file found")
	}
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:4173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Security best practices
	r.Use(gin.Recovery())           // Handle panics gracefully
	err := r.SetTrustedProxies(nil) // Better security than limiting to localhost
	if err != nil {
		log.Fatalf("Failed to set trusted proxies: %v", err)
	}

	// Setup routes
	setupRoutes(r)

	if err := db.Init(); err != nil {
		log.Fatalf("Database init failed: %v", err)
	}

	// Auto-migrate schema for interview/demo
	if err := db.DB.AutoMigrate(&models.Analysis{}); err != nil {
		log.Fatalf("AutoMigrate failed: %v", err)
	}

	worker.StartWorker()

	// Public routes
	public := r.Group("/api")
	{
		public.POST("/auth/token", generateTokenHandler)
	}

	// Authenticated routes
	authGroup := r.Group("/api")
	authGroup.Use(auth.AuthMiddleware())
	{
		authGroup.POST("/analyses", api.SubmitURL)
		authGroup.GET("/analyses", api.GetAnalyses)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func setupRoutes(r *gin.Engine) {
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
}

func generateTokenHandler(c *gin.Context) {
	token, err := auth.GenerateAccessToken()
	if err != nil {
		c.JSON(500, gin.H{
			"error":   "token_generation_failed",
			"message": "Could not generate access token",
		})
		return
	}

	c.JSON(200, gin.H{
		"token_type":   "Bearer",
		"access_token": token,
		"expires_in":   3600, // 1 hour in seconds
	})
}
