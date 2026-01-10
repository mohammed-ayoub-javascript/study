package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Subjects struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	Title     string    `gorm:"not null"`
    UserId    string    `json:"userId" gorm:"column:UserId;index"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (s *Subjects) BeforeCreate(tx *gorm.DB) (err error) {
	s.ID = uuid.New()
	return
}
