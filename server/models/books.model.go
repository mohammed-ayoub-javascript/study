package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Books struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey"`
	Title       string    `gorm:"not null"`
	Description string
	SubjectId   string
	UserId      string `json:"UserId" gorm:"index"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (b *Books) BeforeCreate(tx *gorm.DB) (err error) {
	b.ID = uuid.New()
	return
}
