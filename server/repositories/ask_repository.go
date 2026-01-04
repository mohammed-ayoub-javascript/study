package repositories

import (
	"github.com/google/uuid"
	"github.com/mohammed-ayoub-javascript/study-backend/models"
	"gorm.io/gorm"
)

type AskRepository struct {
	db *gorm.DB
}

func NewAskRepository(db *gorm.DB) *AskRepository {
	return &AskRepository{db: db}
}

func (r *AskRepository) Create(ask *models.Ask) error {
	return r.db.Create(ask).Error
}

func (r *AskRepository) FindBySessionID(sessionID string) ([]models.Ask, error) {
	var asks []models.Ask
	err := r.db.Where("session_id = ?", sessionID).Order("created_at asc").Find(&asks).Error
	return asks, err
}

func (r *AskRepository) FindByUserID(userID string) ([]models.Ask, error) {
	var asks []models.Ask
	err := r.db.Where("user_id = ?", userID).Find(&asks).Error
	return asks, err
}

func (r *AskRepository) FindByID(id uuid.UUID) (*models.Ask, error) {
	var ask models.Ask
	err := r.db.First(&ask, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &ask, nil
}

func (r *AskRepository) DeleteByIDAndUserID(id uuid.UUID, userID string) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Ask{}).Error
}

func (r *AskRepository) UpdateFields(id uuid.UUID, fields map[string]interface{}) error {
	return r.db.Model(&models.Ask{}).Where("id = ?", id).Updates(fields).Error
}