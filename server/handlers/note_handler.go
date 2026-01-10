package handlers

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/mohammed-ayoub-javascript/study-backend/repositories"
)

type NoteHandler struct {
	noteRepo *repositories.NoteRepository
}

func NewNoteHandler(noteRepo *repositories.NoteRepository) *NoteHandler {
	return &NoteHandler{noteRepo: noteRepo}
}

type CreateNoteRequest struct {
	Content    string `json:"content" validate:"required,min=1"`
	BookID     string `json:"book_id" validate:"required,uuid"`
	PageNumber string `json:"page_number" validate:"required"`
}


type UpdateNoteRequest struct {
	Content    string `json:"content" validate:"required,min=1"`
	PageNumber string `json:"page_number" validate:"required"`
}


func (h *NoteHandler) CreateNote(c *fiber.Ctx) error {
	var req CreateNoteRequest


	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "بيانات غير صالحة",
			"details": err.Error(),
		})
	}


	if req.Content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "محتوى الملاحظة مطلوب",
		})
	}

	if req.BookID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "معرف الكتاب مطلوب",
		})
	}

	if req.PageNumber == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "رقم الصفحة مطلوب",
		})
	}


	userID := c.Locals("UserId")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "غير مصرح بالوصول",
		})
	}


	note := &repositories.Note{
		ID:         uuid.New().String(),
		Content:    strings.TrimSpace(req.Content),
		BookID:     req.BookID,
		UserID:     userID.(string),
		PageNumber: req.PageNumber,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}


	if err := h.noteRepo.CreateNote(note); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "فشل في إنشاء الملاحظة",
			"details": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "تم إنشاء الملاحظة بنجاح",
		"note":    note,
	})
}


func (h *NoteHandler) GetNoteByID(c *fiber.Ctx) error {
	noteID := c.Params("id")

	userID := c.Locals("UserId")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "غير مصرح بالوصول",
		})
	}

	note, err := h.noteRepo.GetNoteByID(noteID, userID.(string))
	if err != nil {
		status := fiber.StatusInternalServerError
		if err.Error() == "الملاحظة غير موجودة" {
			status = fiber.StatusNotFound
		}

		return c.Status(status).JSON(fiber.Map{
			"error":   "فشل في الحصول على الملاحظة",
			"details": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"note": note,
	})
}


func (h *NoteHandler) GetNotesByBook(c *fiber.Ctx) error {
	bookID := c.Params("bookId")
	pageNumber := c.Query("page")

	userID := c.Locals("UserId")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "غير مصرح بالوصول",
		})
	}

	var notes []repositories.Note
	var err error


	if pageNumber != "" {
		notes, err = h.noteRepo.GetNotesByBookAndPage(bookID, userID.(string), pageNumber)
	} else {

		notes, err = h.noteRepo.GetNotesByBook(bookID, userID.(string))
	}

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "فشل في الحصول على الملاحظات",
			"details": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"notes": notes,
		"count": len(notes),
		"page":  pageNumber,
	})
}


func (h *NoteHandler) GetDistinctPages(c *fiber.Ctx) error {
	bookID := c.Params("bookId")

	userID := c.Locals("UserId")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "غير مصرح بالوصول",
		})
	}

	pages, err := h.noteRepo.GetDistinctPages(bookID, userID.(string))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "فشل في جلب الصفحات",
			"details": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"pages": pages,
		"count": len(pages),
	})
}


func (h *NoteHandler) GetUserNotes(c *fiber.Ctx) error {
	userID := c.Locals("UserId")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "غير مصرح بالوصول",
		})
	}

	notes, err := h.noteRepo.GetNotesByUser(userID.(string))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "فشل في الحصول على الملاحظات",
			"details": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"notes": notes,
		"count": len(notes),
	})
}


func (h *NoteHandler) UpdateNote(c *fiber.Ctx) error {
	noteID := c.Params("id")

	var req UpdateNoteRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "بيانات غير صالحة",
			"details": err.Error(),
		})
	}

	if req.Content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "محتوى الملاحظة مطلوب",
		})
	}

	if req.PageNumber == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "رقم الصفحة مطلوب",
		})
	}

	userID := c.Locals("UserId")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "غير مصرح بالوصول",
		})
	}


	updates := map[string]interface{}{
		"content":     strings.TrimSpace(req.Content),
		"page_number": req.PageNumber,
		"updated_at":  time.Now(),
	}

	if err := h.noteRepo.UpdateNote(noteID, userID.(string), updates); err != nil {
		status := fiber.StatusInternalServerError
		if err.Error() == "الملاحظة غير موجودة أو غير مسموح بالتعديل" {
			status = fiber.StatusNotFound
		}

		return c.Status(status).JSON(fiber.Map{
			"error":   "فشل في تحديث الملاحظة",
			"details": err.Error(),
		})
	}


	note, err := h.noteRepo.GetNoteByID(noteID, userID.(string))
	if err != nil {
		return c.JSON(fiber.Map{
			"message": "تم تحديث الملاحظة بنجاح",
		})
	}

	return c.JSON(fiber.Map{
		"message": "تم تحديث الملاحظة بنجاح",
		"note":    note,
	})
}


func (h *NoteHandler) DeleteNote(c *fiber.Ctx) error {
	noteID := c.Params("id")

	userID := c.Locals("UserId")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "غير مصرح بالوصول",
		})
	}

	if err := h.noteRepo.DeleteNote(noteID, userID.(string)); err != nil {
		status := fiber.StatusInternalServerError
		if err.Error() == "الملاحظة غير موجودة أو غير مسموح بالحذف" {
			status = fiber.StatusNotFound
		}

		return c.Status(status).JSON(fiber.Map{
			"error":   "فشل في حذف الملاحظة",
			"details": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "تم حذف الملاحظة بنجاح",
	})
}


func (h *NoteHandler) SearchNotes(c *fiber.Ctx) error {
	query := c.Query("q")
	if query == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "كلمة البحث مطلوبة",
		})
	}

	userID := c.Locals("UserId")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "غير مصرح بالوصول",
		})
	}

	notes, err := h.noteRepo.SearchNotes(userID.(string), query)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "فشل في البحث",
			"details": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"notes": notes,
		"count": len(notes),
		"query": query,
	})
}