package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Ask struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	SessionId string
	UserId    string
	Content   string
	RobotAsk  string
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (a *Ask) BeforeCreate(tx *gorm.DB) (err error) {
	a.ID = uuid.New()
	return
}
