package db

import (
	"fmt"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init() error {
	dsn := os.Getenv("MYSQL_DSN")
	if dsn == "" {
		// Fallback for development only. Use env variable in production!
		dsn = "user:password@tcp(localhost:3306)/crawler?charset=utf8mb4&parseTime=True&loc=Local"
	}
	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}
	return nil
}
