package auth

import (
	"errors"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/time/rate"
)

var (
	ErrMissingToken = errors.New("authorization header missing or invalid")
	ErrInvalidToken = errors.New("invalid or expired token")
)

type CustomClaims struct {
	jwt.RegisteredClaims
	ClientID string `json:"client_id"`
}

// Rate limiter singleton
var (
	once    sync.Once
	limiter *rate.Limiter
)

func initRateLimiter() {
	once.Do(func() {
		limiter = rate.NewLimiter(rate.Every(time.Minute/1000), 1000)
	})
}

func getSecretKey() []byte {
	if key := os.Getenv("JWT_SECRET"); key != "" {
		return []byte(key)
	}
	if gin.Mode() == gin.ReleaseMode {
		panic("JWT_SECRET environment variable not set")
	}
	return []byte("development-secret")
}

func extractToken(c *gin.Context) string {
	header := c.GetHeader("Authorization")
	if len(header) > 7 && strings.HasPrefix(header, "Bearer ") {
		return header[7:]
	}
	return ""
}

func errorResponse(c *gin.Context, status int, err error, details ...string) {
	response := gin.H{"error": err.Error()}
	if len(details) > 0 {
		response["details"] = details[0]
	}
	c.AbortWithStatusJSON(status, response)
}

func GenerateAccessToken() (string, error) {
	claims := &CustomClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "web-crawler-api",
		},
		ClientID: "web-client",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getSecretKey())
}

func AuthMiddleware() gin.HandlerFunc {
	initRateLimiter()

	return func(c *gin.Context) {
		// Rate limiting
		if !limiter.Allow() {
			errorResponse(c, 429, errors.New("too many requests"))
			return
		}

		// Extract token
		tokenString := extractToken(c)
		if tokenString == "" {
			errorResponse(c, 401, ErrMissingToken, "Format: 'Authorization: Bearer <token>'")
			return
		}

		// Parse and validate token
		token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("unexpected signing method")
			}
			return getSecretKey(), nil
		})

		if err != nil || !token.Valid {
			details := ""
			if err != nil {
				details = err.Error()
			}
			errorResponse(c, 401, ErrInvalidToken, details)
			return
		}

		c.Next()
	}
}
