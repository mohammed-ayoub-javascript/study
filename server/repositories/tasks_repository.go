package repositories

import (
	"time"

	"github.com/google/uuid"
	"github.com/mohammed-ayoub-javascript/study-backend/models"
	"gorm.io/gorm"
)

type TasksRepository struct {
	db *gorm.DB
}

func NewTasksRepository(db *gorm.DB) *TasksRepository {
	return &TasksRepository{db: db}
}

func (r *TasksRepository) Create(task *models.Tasks) error {
	return r.db.Create(task).Error
}

func (r *TasksRepository) FindAll() ([]models.Tasks, error) {
	var tasks []models.Tasks
	err := r.db.Find(&tasks).Error
	return tasks, err
}

func (r *TasksRepository) FindByID(id uuid.UUID) (*models.Tasks, error) {
	var task models.Tasks
	err := r.db.First(&task, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &task, nil
}

func (r *TasksRepository) FindByUserId(UserId string) ([]models.Tasks, error) {
	var tasks []models.Tasks
	err := r.db.Where("UserId = ?", UserId).Find(&tasks).Error
	return tasks, err
}

func (r *TasksRepository) FindPendingByUserId(UserId string) ([]models.Tasks, error) {
	var tasks []models.Tasks
	err := r.db.Where("UserId = ? AND completed = ?", UserId, false).Find(&tasks).Error
	return tasks, err
}

func (r *TasksRepository) Update(task *models.Tasks) error {
	return r.db.Save(task).Error
}

func (r *TasksRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Tasks{}, "id = ?", id).Error
}

func (r *TasksRepository) MarkAsCompleted(id uuid.UUID) error {
	return r.db.Model(&models.Tasks{}).
		Where("id = ?", id).
		Update("completed", true).
		Update("completed_at", time.Now()).
		Error
}

func (r *TasksRepository) GetTodayTasks(UserId string) ([]models.Tasks, error) {
	var tasks []models.Tasks
	today := time.Now().Format("2006-01-02")
	err := r.db.Where("UserId = ? AND DATE(created_at) = ?", UserId, today).Find(&tasks).Error
	return tasks, err
}
