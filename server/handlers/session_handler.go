package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/mohammed-ayoub-js/backend/models"
	"github.com/mohammed-ayoub-js/backend/repositories"
)

type SessionHandler struct {
	repo *repositories.SessionRepository
}

func NewSessionHandler(repo *repositories.SessionRepository) *SessionHandler {
	return &SessionHandler{repo: repo}
}

func (h *SessionHandler) CreateSession(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string) 

	var session models.Session
	if err := c.BodyParser(&session); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	session.UserID = userID

	if err := h.repo.Create(&session); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create session",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(session)
}

func (h *SessionHandler) GetSessions(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)

	sessions, err := h.repo.FindByUserID(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch sessions",
		})
	}

	return c.JSON(sessions)
}

func (h *SessionHandler) GetSession(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid session ID",
		})
	}

	session, err := h.repo.FindByIDAndUserID(id, userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Session not found or access denied",
		})
	}

	return c.JSON(session)
}

func (h *SessionHandler) UpdateSession(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)
	id := c.Params("id")

	sessionID, _ := uuid.Parse(id)
	_, err := h.repo.FindByIDAndUserID(sessionID, userID)
	if err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You don't have permission to update this session",
		})
	}

	var updates map[string]interface{}
	if err := c.BodyParser(&updates); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	delete(updates, "user_id")

	if err := h.repo.UpdateFields(id, updates); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update session",
		})
	}

	return c.JSON(fiber.Map{"status": "success", "updated_fields": updates})
}

func (h *SessionHandler) DeleteSession(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid session ID",
		})
	}

	if err := h.repo.DeleteByIDAndUserID(id, userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete session or access denied",
		})
	}

	return c.SendStatus(fiber.StatusNoContent)
}

