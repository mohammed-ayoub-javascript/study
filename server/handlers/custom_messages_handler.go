package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/mohammed-ayoub-javascript/study-backend/models"
	"github.com/mohammed-ayoub-javascript/study-backend/repositories"
)

type CustomMessagesHandler struct {
	repo *repositories.CustomMessagesRepository
}

func NewCustomMessagesHandler(repo *repositories.CustomMessagesRepository) *CustomMessagesHandler {
	return &CustomMessagesHandler{repo: repo}
}

func (h *CustomMessagesHandler) CreateMessage(c *fiber.Ctx) error {
	UserId, ok := c.Locals("UserId").(string)
	if !ok || UserId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	var message models.CustomMessages
	if err := c.BodyParser(&message); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	message.UserId = UserId

	if err := h.repo.Create(&message); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create message",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(message)
}

func (h *CustomMessagesHandler) GetMessages(c *fiber.Ctx) error {
	UserId, ok := c.Locals("UserId").(string)
	if !ok || UserId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	messages, err := h.repo.FindByUserId(UserId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch messages",
		})
	}

	return c.JSON(messages)
}

func (h *CustomMessagesHandler) GetMessage(c *fiber.Ctx) error {
	UserId, ok := c.Locals("UserId").(string)
	if !ok || UserId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid message ID",
		})
	}

	message, err := h.repo.FindByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Message not found",
		})
	}

	if message.UserId != UserId {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You don't have permission to access this message",
		})
	}

	return c.JSON(message)
}

func (h *CustomMessagesHandler) UpdateMessage(c *fiber.Ctx) error {
	UserId, ok := c.Locals("UserId").(string)
	if !ok || UserId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid message ID",
		})
	}

	message, err := h.repo.FindByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Message not found",
		})
	}

	if message.UserId != UserId {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You don't have permission to update this message",
		})
	}

	var updates models.CustomMessages
	if err := c.BodyParser(&updates); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	message.Title = updates.Title

	if err := h.repo.Update(message); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update message",
		})
	}

	return c.JSON(message)
}

func (h *CustomMessagesHandler) DeleteMessage(c *fiber.Ctx) error {
	UserId, ok := c.Locals("UserId").(string)
	if !ok || UserId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid message ID",
		})
	}

	message, err := h.repo.FindByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Message not found",
		})
	}

	if message.UserId != UserId {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You don't have permission to delete this message",
		})
	}

	if err := h.repo.Delete(id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete message",
		})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
