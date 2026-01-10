package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Session struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey"`
	Title       string    `gorm:"not null"`
	Description string
	VideoURL    string `gorm:"column:video_url"`
	Note        string `gorm:"type:text"`
	Points      int    `gorm:"default:0"`
	Status      string `gorm:"default:pending"`
	WatchedTime int    `json:"watched_time" gorm:"default:0"`
	SubjectId   string
	UserId      string `json:"UserId" gorm:"index"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (s *Session) BeforeCreate(tx *gorm.DB) (err error) {
	s.ID = uuid.New()
	return
}
