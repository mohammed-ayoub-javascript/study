package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/mohammed-ayoub-javascript/study-backend/models"
	"github.com/mohammed-ayoub-javascript/study-backend/repositories"
)

type AskHandler struct {
	repo *repositories.AskRepository
}

func NewAskHandler(repo *repositories.AskRepository) *AskHandler {
	return &AskHandler{repo: repo}
}

func (h *AskHandler) CreateAsk(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)

	var ask models.Ask
	if err := c.BodyParser(&ask); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	ask.UserId = userID 

	if err := h.repo.Create(&ask); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to save your response",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(ask)
}

func (h *AskHandler) GetAsksBySession(c *fiber.Ctx) error {
	sessionID := c.Params("sessionId")

	asks, err := h.repo.FindBySessionID(sessionID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch session responses",
		})
	}

	return c.JSON(asks)
}

func (h *AskHandler) DeleteAsk(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid Ask ID",
		})
	}

	if err := h.repo.DeleteByIDAndUserID(id, userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete response or access denied",
		})
	}

	return c.SendStatus(fiber.StatusNoContent)
}