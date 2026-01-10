package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Tasks struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Title       string    `gorm:"not null" json:"title"`
	UserId    string    `json:"UUserIdgorm:"index"`
	Description string    `json:"description"`
	Completed   bool      `gorm:"default:false" json:"completed"`
	DueDate     time.Time `json:"due_date"`
	Priority    string    `gorm:"default:'medium'" json:"priority"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (s *Tasks) BeforeCreate(tx *gorm.DB) (err error) {
	s.ID = uuid.New()
	return
}
