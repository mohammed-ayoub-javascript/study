package repositories

import (
	"github.com/google/uuid"
	"github.com/mohammed-ayoub-javascript/study-backend/models"
	"gorm.io/gorm"
)

type CustomMessagesRepository struct {
	db *gorm.DB
}

func NewCustomMessagesRepository(db *gorm.DB) *CustomMessagesRepository {
	return &CustomMessagesRepository{db: db}
}

func (r *CustomMessagesRepository) Create(message *models.CustomMessages) error {
	return r.db.Create(message).Error
}

func (r *CustomMessagesRepository) FindAll() ([]models.CustomMessages, error) {
	var messages []models.CustomMessages
	err := r.db.Find(&messages).Error
	return messages, err
}

func (r *CustomMessagesRepository) FindByID(id uuid.UUID) (*models.CustomMessages, error) {
	var message models.CustomMessages
	err := r.db.First(&message, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &message, nil
}

func (r *CustomMessagesRepository) FindByUserId(UserId string) ([]models.CustomMessages, error) {
	var messages []models.CustomMessages
	err := r.db.Where("UserId = ?", UserId).Find(&messages).Error
	return messages, err
}

func (r *CustomMessagesRepository) Update(message *models.CustomMessages) error {
	return r.db.Save(message).Error
}

func (r *CustomMessagesRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.CustomMessages{}, "id = ?", id).Error
}
