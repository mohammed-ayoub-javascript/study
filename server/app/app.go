package app

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/mohammed-ayoub-javascript/study-backend/auth"
	"github.com/mohammed-ayoub-javascript/study-backend/database"
	"github.com/mohammed-ayoub-javascript/study-backend/handlers"
	"github.com/mohammed-ayoub-javascript/study-backend/middleware"
	"github.com/mohammed-ayoub-javascript/study-backend/repositories"
)

func SetupApp() *fiber.App {
	app := fiber.New()

	app.Use(logger.New())

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, https://endlinefocus.vercel.app",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS, PATCH",
		ExposeHeaders:    "Content-Length",
		AllowCredentials: true,
	}))

	database.ConnectDB()
	db := database.DB

	sessionRepo := repositories.NewSessionRepository(db)
	userRepo := repositories.NewUserRepository(db)
	booksRepo := repositories.NewBooksRepository(db)
	customMessagesRepo := repositories.NewCustomMessagesRepository(db)
	subjectsRepo := repositories.NewSubjectsRepository(db)
	tasksRepo := repositories.NewTasksRepository(db)
	noteRepo := repositories.NewNoteRepository(db)
	noteHandler := handlers.NewNoteHandler(noteRepo)
	authService := auth.NewAuthService()
	authHandler := handlers.NewAuthHandler(authService, db)
	sessionHandler := handlers.NewSessionHandler(sessionRepo)
	userHandler := handlers.NewUserHandler(userRepo)
	booksHandler := handlers.NewBooksHandler(booksRepo)
	customMessagesHandler := handlers.NewCustomMessagesHandler(customMessagesRepo)
	subjectsHandler := handlers.NewSubjectsHandler(subjectsRepo)
	tasksHandler := handlers.NewTasksHandler(tasksRepo)

	authRoutes := app.Group("/api/auth")
	{
		authRoutes.Post("/register", authHandler.Register)
		authRoutes.Post("/login", authHandler.Login)
	}

	api := app.Group("/api", middleware.AuthMiddleware(authService))

	sessionRoutes := api.Group("/sessions")
	{
		sessionRoutes.Post("/", sessionHandler.CreateSession)
		sessionRoutes.Get("/", sessionHandler.GetSessions)
		sessionRoutes.Get("/:id", sessionHandler.GetSession)
		sessionRoutes.Put("/:id", sessionHandler.UpdateSession)
		sessionRoutes.Delete("/:id", sessionHandler.DeleteSession)
	}

	userRoutes := api.Group("/users")
	{
		userRoutes.Get("/", userHandler.GetUsers)
		userRoutes.Get("/:id", userHandler.GetUser)
		userRoutes.Delete("/:id", userHandler.DeleteUser)
	}

	booksRoutes := api.Group("/books")
	{
		booksRoutes.Post("/", booksHandler.CreateBook)
		booksRoutes.Get("/", booksHandler.GetBooks)
		booksRoutes.Get("/search", booksHandler.SearchBooks)
		booksRoutes.Get("/:id", booksHandler.GetBook)
		booksRoutes.Put("/:id", booksHandler.UpdateBook)
		booksRoutes.Delete("/:id", booksHandler.DeleteBook)
	}
	messagesRoutes := api.Group("/messages")
	{
		messagesRoutes.Post("/", customMessagesHandler.CreateMessage)
		messagesRoutes.Get("/", customMessagesHandler.GetMessages)
		messagesRoutes.Get("/:id", customMessagesHandler.GetMessage)
		messagesRoutes.Put("/:id", customMessagesHandler.UpdateMessage)
		messagesRoutes.Delete("/:id", customMessagesHandler.DeleteMessage)
	}

	subjectsRoutes := api.Group("/subjects")
	{
		subjectsRoutes.Post("/", subjectsHandler.CreateSubject)
		subjectsRoutes.Get("/", subjectsHandler.GetSubjects)
		subjectsRoutes.Get("/:id", subjectsHandler.GetSubject)
		subjectsRoutes.Put("/:id", subjectsHandler.UpdateSubject)
		subjectsRoutes.Delete("/:id", subjectsHandler.DeleteSubject)
		subjectsRoutes.Get("/:subject_id/books", booksHandler.GetBooksBySubject)
	}

	tasksRoutes := api.Group("/tasks")
	{
		tasksRoutes.Post("/", tasksHandler.CreateTask)
		tasksRoutes.Get("/", tasksHandler.GetTasks)
		tasksRoutes.Get("/pending", tasksHandler.GetPendingTasks)
		tasksRoutes.Get("/today", tasksHandler.GetTodayTasks)
		tasksRoutes.Get("/:id", tasksHandler.GetTask)
		tasksRoutes.Put("/:id", tasksHandler.UpdateTask)
		tasksRoutes.Patch("/:id/complete", tasksHandler.MarkTaskAsCompleted)
		tasksRoutes.Delete("/:id", tasksHandler.DeleteTask)
	}

	noteGroup := api.Group("/notes")
	{
		noteGroup.Post("/", noteHandler.CreateNote)
		noteGroup.Get("/", noteHandler.GetUserNotes)
		noteGroup.Get("/search", noteHandler.SearchNotes)
		noteGroup.Get("/book/:bookId", noteHandler.GetNotesByBook)
		noteGroup.Get("/book/:bookId/pages", noteHandler.GetDistinctPages)
		noteGroup.Get("/:id", noteHandler.GetNoteByID)
		noteGroup.Put("/:id", noteHandler.UpdateNote)
		noteGroup.Delete("/:id", noteHandler.DeleteNote)
	
	}

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "Server is running",
		})
	})

	return app
}
