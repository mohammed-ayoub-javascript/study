package models

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey"`
	Name         string
	Password     string
	Token        string
	RefreshToken string
}

type Claims struct {
	ID   string 
	Username string 
	Email    string 
	jwt.RegisteredClaims
}

type TokenPair struct {
	AccessToken  string
	RefreshToken string 
	ExpiresAt    int64  
}

type RefreshTokenStore struct {
	UserID       string   
	RefreshToken string   
	ExpiresAt    time.Time
	CreatedAt    time.Time
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	u.ID = uuid.New()
	return
}
