package repositories

import (
	"github.com/google/uuid"
	"github.com/mohammed-ayoub-javascript/study-backend/models"
	"gorm.io/gorm"
)

type BooksRepository struct {
	db *gorm.DB
}

func NewBooksRepository(db *gorm.DB) *BooksRepository {
	return &BooksRepository{db: db}
}

func (r *BooksRepository) Create(book *models.Books) error {
	return r.db.Create(book).Error
}

func (r *BooksRepository) FindAll() ([]models.Books, error) {
	var books []models.Books
	err := r.db.Find(&books).Error
	return books, err
}

func (r *BooksRepository) FindByID(id uuid.UUID) (*models.Books, error) {
	var book models.Books
	err := r.db.First(&book, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &book, nil
}

func (r *BooksRepository) FindByUserID(userID string) ([]models.Books, error) {
	var books []models.Books
	err := r.db.Where("user_id = ?", userID).Find(&books).Error
	return books, err
}

func (r *BooksRepository) FindBySubjectID(subjectID string) ([]models.Books, error) {
	var books []models.Books
	err := r.db.Where("subject_id = ?", subjectID).Find(&books).Error
	return books, err
}

func (r *BooksRepository) FindBySubjectIDAndUserID(subjectID, userID string) ([]models.Books, error) {
	var books []models.Books
	err := r.db.Where("subject_id = ? AND user_id = ?", subjectID, userID).Find(&books).Error
	return books, err
}

func (r *BooksRepository) Update(book *models.Books) error {
	return r.db.Save(book).Error
}

func (r *BooksRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Books{}, "id = ?", id).Error
}

func (r *BooksRepository) SearchBooks(query, userID string) ([]models.Books, error) {
	var books []models.Books
	err := r.db.Where("(title ILIKE ? OR description ILIKE ?) AND user_id = ?",
		"%"+query+"%", "%"+query+"%", userID).Find(&books).Error
	return books, err
}