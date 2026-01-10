package repositories

import (
	"github.com/google/uuid"
	"github.com/mohammed-ayoub-javascript/study-backend/models"
	"gorm.io/gorm"
)

type SubjectsRepository struct {
	db *gorm.DB
}

func NewSubjectsRepository(db *gorm.DB) *SubjectsRepository {
	return &SubjectsRepository{db: db}
}

func (r *SubjectsRepository) Create(subject *models.Subjects) error {
	return r.db.Create(subject).Error
}

func (r *SubjectsRepository) FindAll() ([]models.Subjects, error) {
	var subjects []models.Subjects
	err := r.db.Find(&subjects).Error
	return subjects, err
}

func (r *SubjectsRepository) FindByID(id uuid.UUID) (*models.Subjects, error) {
	var subject models.Subjects
	err := r.db.First(&subject, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &subject, nil
}

func (r *SubjectsRepository) FindByUserId(UserId string) ([]models.Subjects, error) {
    var subjects []models.Subjects

    err := r.db.Where("\"UserId\" = ?", UserId).Find(&subjects).Error
    return subjects, err
}

func (r *SubjectsRepository) Update(subject *models.Subjects) error {
	return r.db.Save(subject).Error
}

func (r *SubjectsRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Subjects{}, "id = ?", id).Error
}

func (r *SubjectsRepository) GetSubjectsWithBookCount(UserId string) ([]map[string]interface{}, error) {
	var results []map[string]any
	err := r.db.Model(&models.Subjects{}).
		Select("subjects.*, COUNT(books.id) as book_count").
		Joins("LEFT JOIN books ON books.subject_id = subjects.id AND books.UserId = subjects.UserId").
		Where("subjects.UserId = ?", UserId).
		Group("subjects.id").
		Scan(&results).Error
	return results, err
}
