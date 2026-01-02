package repositories

import (
	"github.com/google/uuid"
	"github.com/mohammed-ayoub-js/backend/models"
	"gorm.io/gorm"
)

type SessionRepository struct {
	db *gorm.DB
}


func NewSessionRepository(db *gorm.DB) *SessionRepository {
	return &SessionRepository{db: db}
}

func (r *SessionRepository) Create(session *models.Session) error {
	return r.db.Create(session).Error
}

func (r *SessionRepository) FindAll() ([]models.Session, error) {
	var sessions []models.Session
	err := r.db.Find(&sessions).Error
	return sessions, err
}

func (r *SessionRepository) FindByID(id uuid.UUID) (*models.Session, error) {
	var session models.Session
	err := r.db.First(&session, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

func (r *SessionRepository) Update(session *models.Session) error {
	return r.db.Save(session).Error
}

func (r *SessionRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Session{}, "id = ?", id).Error
}

func (r *SessionRepository) GetWithTargets(id uuid.UUID) (*models.Session, error) {
	var session models.Session
	err := r.db.Preload("Targets").First(&session, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

func (r *SessionRepository) UpdateFields(id string, fields map[string]interface{}) error {
    return r.db.Model(&models.Session{}).Where("id = ?", id).Updates(fields).Error
}

func (r *SessionRepository) FindByUserID(userID string) ([]models.Session, error) {
    var sessions []models.Session
    err := r.db.Where("user_id = ?", userID).Find(&sessions).Error
    return sessions, err
}

func (r *SessionRepository) FindByIDAndUserID(id uuid.UUID, userID string) (models.Session, error) {
    var session models.Session
    err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&session).Error
    return session, err
}

func (r *SessionRepository) DeleteByIDAndUserID(id uuid.UUID, userID string) error {
    return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Session{}).Error
}