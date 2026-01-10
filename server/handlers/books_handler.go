package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/mohammed-ayoub-javascript/study-backend/models"
	"github.com/mohammed-ayoub-javascript/study-backend/repositories"
)

type BooksHandler struct {
	repo *repositories.BooksRepository
}

func NewBooksHandler(repo *repositories.BooksRepository) *BooksHandler {
	return &BooksHandler{repo: repo}
}

func (h *BooksHandler) CreateBook(c *fiber.Ctx) error {
	userID, ok := c.Locals("UserId").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	var book models.Books
	if err := c.BodyParser(&book); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	book.UserId = userID

	if err := h.repo.Create(&book); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create book",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(book)
}

func (h *BooksHandler) GetBooks(c *fiber.Ctx) error {
	UserID, ok := c.Locals("UserId").(string)
	if !ok || UserID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	books, err := h.repo.FindByUserID(UserID) 
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch books",
		})
	}

	return c.JSON(books)
}

func (h *BooksHandler) GetBook(c *fiber.Ctx) error {
	UserID, ok := c.Locals("UserId").(string)
	if !ok || UserID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid book ID",
		})
	}

	book, err := h.repo.FindByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Book not found",
		})
	}

	if book.UserId != UserID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You don't have permission to access this book",
		})
	}

	return c.JSON(book)
}

func (h *BooksHandler) GetBooksBySubject(c *fiber.Ctx) error {
	UserID, ok := c.Locals("UserId").(string)
	if !ok || UserID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}


	subjectID := c.Params("subject_id") 
	if subjectID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Subject ID is required",
		})
	}

	books, err := h.repo.FindBySubjectIDAndUserID(subjectID, UserID) 
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch subject books",
		})
	}

	return c.JSON(books)
}

func (h *BooksHandler) UpdateBook(c *fiber.Ctx) error {
	UserID, ok := c.Locals("UserId").(string)
	if !ok || UserID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}


	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid book ID",
		})
	}

	book, err := h.repo.FindByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Book not found",
		})
	}

	if book.UserId != UserID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You don't have permission to update this book",
		})
	}

	var updates models.Books
	if err := c.BodyParser(&updates); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	book.Title = updates.Title
	book.Description = updates.Description
	book.SubjectId = updates.SubjectId

	if err := h.repo.Update(book); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update book",
		})
	}

	return c.JSON(book)
}

func (h *BooksHandler) DeleteBook(c *fiber.Ctx) error {
	UserID, ok := c.Locals("UserId").(string)
	if !ok || UserID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid book ID",
		})
	}

	book, err := h.repo.FindByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Book not found",
		})
	}

	if book.UserId != UserID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You don't have permission to delete this book",
		})
	}

	if err := h.repo.Delete(id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete book",
		})
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (h *BooksHandler) SearchBooks(c *fiber.Ctx) error {
	UserID, ok := c.Locals("UserId").(string)
	if !ok || UserID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}


	query := c.Query("q")
	if query == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Search query is required",
		})
	}

	books, err := h.repo.SearchBooks(query, UserID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to search books",
		})
	}

	return c.JSON(books)
}