package handlers

import (

	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/mohammed-ayoub-js/backend/auth"
	"github.com/mohammed-ayoub-js/backend/models"
	"gorm.io/gorm"
)

type AuthHandler struct {
	Service *auth.AuthService
	DB      *gorm.DB
}

func NewAuthHandler(service *auth.AuthService, db *gorm.DB) *AuthHandler {
	return &AuthHandler{
		Service: service,
		DB:      db,
	}
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	type RegisterRequest struct {
		Name    string `json:"name"`
		Password string `json:"password"`
	}

	var req RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	hashedPassword, err := h.Service.HashPassword(req.Password)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not hash password"})
	}

	user := models.User{
		ID:       uuid.New(),
		Name:  req.Name,
		Password: hashedPassword,
	}

	if err := h.DB.Create(&user).Error; err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "User already exists or database error"})
	}

	return c.Status(201).JSON(fiber.Map{"message": "User created successfully"})
}


func (h *AuthHandler) Login(c *fiber.Ctx) error {
	type LoginRequest struct {
		Name    string `json:"name"`
		Password string `json:"password"`
	}

	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	var user models.User

    if err := h.DB.Where("name = ?", req.Name).First(&user).Error; err != nil {
        return c.Status(401).JSON(fiber.Map{"error": "Invalid name or password"})
    }

	if !h.Service.CheckPasswordHash(req.Password, user.Password) {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid name or password"})
	}

	tokens, err := h.Service.GenerateTokenPair(&user)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not generate tokens"})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    tokens.RefreshToken,
		Expires:  time.Now().Add(time.Hour * 24 * 7),
		HTTPOnly: true, 
		Secure:   false, 
	})

	return c.JSON(tokens)
}