package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DailyStat struct {
	ID              uuid.UUID `gorm:"type:uuid;primaryKey"`
	UserID          uuid.UUID `gorm:"type:uuid;index"`
	Date            time.Time `gorm:"type:date;uniqueIndex:idx_user_date"`
	TotalStudyTime  int       `gorm:"default:0"` 
	CompletedTasks  int       `gorm:"default:0"`
	FailedTasks     int       `gorm:"default:0"`
	PointsEarned    int       `gorm:"default:0"`
	HeartsLost      int       `gorm:"default:0"`
	FocusScore      float64   `gorm:"default:0"` 
}

type GlobalAnalytics struct {
	UserID         uuid.UUID `gorm:"type:uuid;primaryKey"`
	TotalSessions  int       `gorm:"default:0"`
	TotalHours     float64   `gorm:"default:0"`
	LongestStreak  int       `gorm:"default:0"`
	Rank           string    `gorm:"default:Beginner"` 
	UpdatedAt      time.Time
}

func (ds *DailyStat) BeforeCreate(tx *gorm.DB) (err error) {
	ds.ID = uuid.New()
	return
}