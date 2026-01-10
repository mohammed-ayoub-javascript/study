package auth

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/mohammed-ayoub-javascript/study-backend/models"
	"golang.org/x/crypto/bcrypt"
)

type Config struct {
	AccessTokenSecret  string
	RefreshTokenSecret string
	AccessTokenExpiry  time.Duration
	RefreshTokenExpiry time.Duration
}

type AuthService struct {
	config        Config
	refreshTokens map[string]models.RefreshTokenStore
	mu            sync.RWMutex
}

func NewAuthService() *AuthService {
	accessSecret := os.Getenv("ACCESS_TOKEN_SECRET")
	// if accessSecret == "" {
	// 	accessSecret = "your-access-token-secret-key-min-32-chars-here"
	// }

	refreshSecret := os.Getenv("REFRESH_TOKEN_SECRET")
	// if refreshSecret == "" {
	// 	refreshSecret = "your-refresh-token-secret-key-min-32-chars-here"
	// }

	return &AuthService{
		config: Config{
			AccessTokenSecret:  accessSecret,
			RefreshTokenSecret: refreshSecret,
			AccessTokenExpiry:  time.Hour * 24 * 5,
			RefreshTokenExpiry: time.Hour * 24 * 7,
		},
		refreshTokens: make(map[string]models.RefreshTokenStore),
	}
}

func (a *AuthService) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func (a *AuthService) CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		fmt.Println("Bcrypt Failure:", err)
	}
	return err == nil
}

func (a *AuthService) GenerateAccessToken(user *models.User) (string, error) {
	expirationTime := time.Now().Add(a.config.AccessTokenExpiry)

	claims := &models.Claims{
		ID: user.ID.String(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			ID:        uuid.NewString(),
			Issuer:    "auth-system",
			Subject:   user.ID.String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(a.config.AccessTokenSecret))
}

func (a *AuthService) GenerateRefreshToken(UserId string) (string, error) {
	randomBytes := make([]byte, 32)
	_, err := rand.Read(randomBytes)
	if err != nil {
		return "", err
	}

	refreshToken := base64.URLEncoding.EncodeToString(randomBytes)

	store := models.RefreshTokenStore{
		UserID:       UserId,
		RefreshToken: refreshToken,
		ExpiresAt:    time.Now().Add(a.config.RefreshTokenExpiry),
		CreatedAt:    time.Now(),
	}
	a.mu.Lock()
	a.refreshTokens[refreshToken] = store
	a.mu.Unlock()
	return refreshToken, nil
}

func (a *AuthService) ValidateRefreshToken(refreshToken string) (uuid.UUID, error) {
	store, exists := a.refreshTokens[refreshToken]
	if !exists {
		return uuid.Nil, errors.New("refresh token not found")
	}

	if time.Now().After(store.ExpiresAt) {
		delete(a.refreshTokens, refreshToken)
		return uuid.Nil, errors.New("refresh token expired")
	}

	parsedID, err := uuid.Parse(store.UserID)
	if err != nil {
		return uuid.Nil, errors.New("invalid user id format in store")
	}

	return parsedID, nil
}

func (a *AuthService) ValidateAccessToken(tokenString string) (*models.Claims, error) {
	claims := &models.Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {

		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(a.config.AccessTokenSecret), nil
	})

	if err != nil {
		fmt.Printf("JWT Error: %v\n", err)
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

func (a *AuthService) RevokeRefreshToken(refreshToken string) {
	delete(a.refreshTokens, refreshToken)
}

func (a *AuthService) GenerateTokenPair(user *models.User) (*models.TokenPair, error) {
	accessToken, err := a.GenerateAccessToken(user)
	if err != nil {
		return nil, err
	}

	refreshToken, err := a.GenerateRefreshToken(user.ID.String())
	if err != nil {
		return nil, err
	}

	expirationTime := time.Now().Add(time.Hour * 24)

	return &models.TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    expirationTime.Unix(),
	}, nil
}

func (a *AuthService) RefreshToken(refreshToken string) (*models.TokenPair, error) {
	UserId, err := a.ValidateRefreshToken(refreshToken)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		ID: UserId,
	}

	tokenPair, err := a.GenerateTokenPair(user)
	if err != nil {
		return nil, err
	}

	a.RevokeRefreshToken(refreshToken)

	return tokenPair, nil
}
