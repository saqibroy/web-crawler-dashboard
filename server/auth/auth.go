package auth

import (
	"errors"
	"os"
	"strings"
	"sync"
	"time"

	"golang.org/x/time/rate"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrMissingToken = errors.New("authorization header missing or invalid")
	ErrInvalidToken = errors.New("invalid or expired token")
)

type CustomClaims struct {
	jwt.RegisteredClaims
	ClientID string `json:"client_id"` // Additional custom claim
}

func getSecretKey() []byte {
	key := os.Getenv("JWT_SECRET")
	if key == "" {
		if gin.Mode() == gin.ReleaseMode {
			panic("JWT_SECRET environment variable not set")
		}
		// Default for development only
		return []byte("development-secret")
	}
	return []byte(key)
}

func GenerateAccessToken() (string, error) {
	claims := &CustomClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "web-crawler-api",
		},
		ClientID: "web-client", // Can be dynamic in real implementation
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getSecretKey())
}

func AuthMiddleware() gin.HandlerFunc {
	var once sync.Once
	var limiter *rate.Limiter
	once.Do(func() {
		// Increased from 10 to 1000 requests per minute (much more reasonable for dashboard)
		limiter = rate.NewLimiter(rate.Every(time.Minute/1000), 1000)
	})
	return func(c *gin.Context) {
		if !limiter.Allow() {
			c.AbortWithStatusJSON(429, gin.H{"error": "Too many requests"})
			return
		}
		tokenString := extractToken(c)
		if tokenString == "" {
			c.AbortWithStatusJSON(401, gin.H{
				"error":   ErrMissingToken.Error(),
				"details": "Format: 'Authorization: Bearer <token>'",
			})
			return
		}

		token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("unexpected signing method")
			}
			return getSecretKey(), nil
		})

		if err != nil {
			c.AbortWithStatusJSON(401, gin.H{
				"error":   ErrInvalidToken.Error(),
				"details": err.Error(),
			})
			return
		}

		if !token.Valid {
			c.AbortWithStatusJSON(401, gin.H{"error": ErrInvalidToken.Error()})
			return
		}

		c.Next()
	}
}

func extractToken(c *gin.Context) string {
	bearerToken := c.GetHeader("Authorization")
	if len(bearerToken) > 7 && strings.HasPrefix(bearerToken, "Bearer ") {
		return bearerToken[7:]
	}
	return ""
}
