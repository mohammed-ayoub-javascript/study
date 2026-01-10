package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/mohammed-ayoub-javascript/study-backend/models"
	"github.com/mohammed-ayoub-javascript/study-backend/repositories"
)

type TasksHandler struct {
	repo *repositories.TasksRepository
}

func NewTasksHandler(repo *repositories.TasksRepository) *TasksHandler {
	return &TasksHandler{repo: repo}
}

func (h *TasksHandler) CreateTask(c *fiber.Ctx) error {
	UserId, ok := c.Locals("UserId").(string)
	if !ok || UserId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	var task models.Tasks
	if err := c.BodyParser(&task); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	task.UserId = UserId

	if err := h.repo.Create(&task); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create task",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(task)
}

func (h *TasksHandler) GetTasks(c *fiber.Ctx) error {
	UserId, ok := c.Locals("UserId").(string)
	if !ok || UserId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	tasks, err := h.repo.FindByUserId(UserId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch tasks",
		})
	}

	return c.JSON(tasks)
}

func (h *TasksHandler) GetTask(c *fiber.Ctx) error {
	UserId, ok := c.Locals("UserId").(string)
	if !ok || UserId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid task ID",
		})
	}

	task, err := h.repo.FindByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Task not found",
		})
	}

	if task.UserId != UserId {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You don't have permission to access this task",
		})
	}

	return c.JSON(task)
}

func (h *TasksHandler) GetPendingTasks(c *fiber.Ctx) error {
	UserId, ok := c.Locals("UserId").(string)
	if !ok || UserId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	tasks, err := h.repo.FindPendingByUserId(UserId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch pending tasks",
		})
	}

	return c.JSON(tasks)
}

func (h *TasksHandler) UpdateTask(c *fiber.Ctx) error {
	UserId, ok := c.Locals("UserId").(string)
	if !ok || UserId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid task ID",
		})
	}

	task, err := h.repo.FindByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Task not found",
		})
	}

	if task.UserId != UserId {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You don't have permission to update this task",
		})
	}

	var updates models.Tasks
	if err := c.BodyParser(&updates); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	task.Title = updates.Title
	task.Description = updates.Description
	task.Completed = updates.Completed
	task.DueDate = updates.DueDate
	task.Priority = updates.Priority

	if err := h.repo.Update(task); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update task",
		})
	}

	return c.JSON(task)
}

func (h *TasksHandler) DeleteTask(c *fiber.Ctx) error {
	UserId, ok := c.Locals("UserId").(string)
	if !ok || UserId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid task ID",
		})
	}

	task, err := h.repo.FindByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Task not found",
		})
	}

	if task.UserId != UserId {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You don't have permission to delete this task",
		})
	}

	if err := h.repo.Delete(id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete task",
		})
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (h *TasksHandler) MarkTaskAsCompleted(c *fiber.Ctx) error {
	UserId, ok := c.Locals("UserId").(string)
	if !ok || UserId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid task ID",
		})
	}

	task, err := h.repo.FindByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Task not found",
		})
	}

	if task.UserId != UserId {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You don't have permission to update this task",
		})
	}

	if err := h.repo.MarkAsCompleted(id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to mark task as completed",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Task marked as completed successfully",
	})
}

func (h *TasksHandler) GetTodayTasks(c *fiber.Ctx) error {
	UserId, ok := c.Locals("UserId").(string)
	if !ok || UserId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	tasks, err := h.repo.GetTodayTasks(UserId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch today's tasks",
		})
	}

	return c.JSON(tasks)
}
