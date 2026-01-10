package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/mohammed-ayoub-javascript/study-backend/models"
	"github.com/mohammed-ayoub-javascript/study-backend/repositories"
)

type SubjectsHandler struct {
	repo *repositories.SubjectsRepository
}

func NewSubjectsHandler(repo *repositories.SubjectsRepository) *SubjectsHandler {
	return &SubjectsHandler{repo: repo}
}

func (h *SubjectsHandler) CreateSubject(c *fiber.Ctx) error {
	UserId, ok := c.Locals("UserId").(string)
	if !ok || UserId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	var subject models.Subjects
	if err := c.BodyParser(&subject); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	subject.UserId = UserId

	if err := h.repo.Create(&subject); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create subject",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(subject)
}

func (h *SubjectsHandler) GetSubjects(c *fiber.Ctx) error {
	UserId, ok := c.Locals("UserId").(string)
	if !ok || UserId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	subjects, err := h.repo.FindByUserId(UserId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch subjects",
		})
	}

	return c.JSON(subjects)
}

func (h *SubjectsHandler) GetSubject(c *fiber.Ctx) error {
	UserId, ok := c.Locals("UserId").(string)
	if !ok || UserId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid subject ID",
		})
	}

	subject, err := h.repo.FindByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Subject not found",
		})
	}

	if subject.UserId != UserId {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You don't have permission to access this subject",
		})
	}

	return c.JSON(subject)
}

func (h *SubjectsHandler) UpdateSubject(c *fiber.Ctx) error {
	UserId, ok := c.Locals("UserId").(string)
	if !ok || UserId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid subject ID",
		})
	}

	subject, err := h.repo.FindByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Subject not found",
		})
	}

	if subject.UserId != UserId {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You don't have permission to update this subject",
		})
	}

	var updates models.Subjects
	if err := c.BodyParser(&updates); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	subject.Title = updates.Title

	if err := h.repo.Update(subject); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update subject",
		})
	}

	return c.JSON(subject)
}

func (h *SubjectsHandler) DeleteSubject(c *fiber.Ctx) error {
	UserId, ok := c.Locals("UserId").(string)
	if !ok || UserId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid subject ID",
		})
	}

	subject, err := h.repo.FindByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Subject not found",
		})
	}

	if subject.UserId != UserId {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You don't have permission to delete this subject",
		})
	}

	if err := h.repo.Delete(id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete subject",
		})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
