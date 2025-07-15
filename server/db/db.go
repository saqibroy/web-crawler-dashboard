package db

import (
	"fmt"
	"os"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init() error {
	dsn := os.Getenv("MYSQL_DSN")
	if dsn == "" {
		return fmt.Errorf("MYSQL_DSN environment variable not set")
	}

	const maxRetries = 10
	const retryDelay = 5 * time.Second

	var err error
	for i := 0; i < maxRetries; i++ {
		DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err == nil {
			fmt.Println("Successfully connected to the database!")
			return nil
		}

		fmt.Printf("Attempt %d/%d to connect to database failed: %v\n", i+1, maxRetries, err)
		time.Sleep(retryDelay)
	}

	return fmt.Errorf("failed to connect to database after %d attempts: %w", maxRetries, err)
}
