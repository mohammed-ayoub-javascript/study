package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Note struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey"`
	Content    string    `gorm:"not null"`
	BookID     string    `json:"BookId" gorm:"not null"`
	UserID     string    `json:"UserId" gorm:"not null;index"`
	PageNumber string    `json:"PageNumber" gorm:"not null"`
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

func (b *Note) BeforeCreate(tx *gorm.DB) (err error) {
	b.ID = uuid.New()
	return
}