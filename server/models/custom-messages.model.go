package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CustomMessages struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	Title     string    `gorm:"not null"`
	UserId    string    `json:"UserId" gorm:"index"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (b *CustomMessages) BeforeCreate(tx *gorm.DB) (err error) {
	b.ID = uuid.New()
	return
}
