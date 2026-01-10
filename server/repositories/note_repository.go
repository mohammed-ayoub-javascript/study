package repositories

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

type Note struct {
	ID         string    `json:"id" gorm:"type:uuid;primaryKey"`
	Content    string    `json:"content" gorm:"not null"`
	BookID     string    `json:"book_id" gorm:"not null"`
	UserID     string    `json:"user_id" gorm:"not null;index"`
	PageNumber string    `json:"page_number" gorm:"not null"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type NoteRepository struct {
	db *gorm.DB
}

func NewNoteRepository(db *gorm.DB) *NoteRepository {
	return &NoteRepository{db: db}
}

func (r *NoteRepository) CreateNote(note *Note) error {
	if note.Content == "" {
		return errors.New("محتوى الملاحظة مطلوب")
	}
	if note.BookID == "" {
		return errors.New("معرف الكتاب مطلوب")
	}
	if note.UserID == "" {
		return errors.New("معرف المستخدم مطلوب")
	}
	if note.PageNumber == "" {
		return errors.New("رقم الصفحة مطلوب")
	}

	return r.db.Create(note).Error
}

func (r *NoteRepository) GetNoteByID(id string, userID string) (*Note, error) {
	var note Note
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&note).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("الملاحظة غير موجودة")
		}
		return nil, err
	}
	return &note, nil
}

func (r *NoteRepository) GetNotesByBookAndPage(bookID string, userID string, pageNumber string) ([]Note, error) {
	var notes []Note
	query := r.db.Where("book_id = ? AND user_id = ?", bookID, userID)
	
	if pageNumber != "" {
		query = query.Where("page_number = ?", pageNumber)
	}
	
	err := query.Order("created_at DESC").Find(&notes).Error
	return notes, err
}

func (r *NoteRepository) GetNotesByBook(bookID string, userID string) ([]Note, error) {
	var notes []Note
	err := r.db.Where("book_id = ? AND user_id = ?", bookID, userID).
		Order("page_number, created_at DESC").
		Find(&notes).Error
	return notes, err
}

func (r *NoteRepository) GetNotesByUser(userID string) ([]Note, error) {
	var notes []Note
	err := r.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&notes).Error
	return notes, err
}

func (r *NoteRepository) UpdateNote(id string, userID string, updates map[string]interface{}) error {
	if len(updates) == 0 {
		return errors.New("لا توجد بيانات للتحديث")
	}

	updates["updated_at"] = time.Now()

	result := r.db.Model(&Note{}).
		Where("id = ? AND user_id = ?", id, userID).
		Updates(updates)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("الملاحظة غير موجودة أو غير مسموح بالتعديل")
	}

	return nil
}

func (r *NoteRepository) DeleteNote(id string, userID string) error {
	result := r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&Note{})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("الملاحظة غير موجودة أو غير مسموح بالحذف")
	}

	return nil
}

func (r *NoteRepository) SearchNotes(userID string, query string) ([]Note, error) {
	var notes []Note
	err := r.db.Where("user_id = ? AND (content LIKE ? OR page_number LIKE ?)", 
		userID, "%"+query+"%", "%"+query+"%").
		Order("created_at DESC").
		Find(&notes).Error
	return notes, err
}

func (r *NoteRepository) GetNotesByPageNumber(userID string, pageNumber string) ([]Note, error) {
	var notes []Note
	err := r.db.Where("user_id = ? AND page_number = ?", userID, pageNumber).
		Order("created_at DESC").
		Find(&notes).Error
	return notes, err
}

func (r *NoteRepository) GetDistinctPages(bookID string, userID string) ([]string, error) {
	var pages []string
	err := r.db.Model(&Note{}).
		Distinct().
		Where("book_id = ? AND user_id = ?", bookID, userID).
		Pluck("page_number", &pages).Error
	return pages, err
}