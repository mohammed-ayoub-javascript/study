package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/mohammed-ayoub-javascript/study-backend/auth"
	"github.com/mohammed-ayoub-javascript/study-backend/handlers"
	"github.com/mohammed-ayoub-javascript/study-backend/middleware"
	"github.com/mohammed-ayoub-javascript/study-backend/repositories"
	"github.com/mohammed-ayoub-javascript/study-backend/database"
)

func main() {
	app := fiber.New()

	app.Use(logger.New())

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
		ExposeHeaders:    "Content-Length",
		AllowCredentials: true,
	}))

	database.ConnectDB()
	db := database.DB

	sessionRepo := repositories.NewSessionRepository(db)
	userRepo := repositories.NewUserRepository(db)

	sessionHandler := handlers.NewSessionHandler(sessionRepo)
	userHandler := handlers.NewUserHandler(userRepo)

	authService := auth.NewAuthService()
	authHandler := handlers.NewAuthHandler(authService, db)

	askRepo := repositories.NewAskRepository(db)
	askHandler := handlers.NewAskHandler(askRepo)

	sessionRoutes := app.Group("/api/sessions", middleware.AuthMiddleware(authService))
	{
		sessionRoutes.Post("/", sessionHandler.CreateSession)
		sessionRoutes.Get("/", sessionHandler.GetSessions)
		sessionRoutes.Get("/:id", sessionHandler.GetSession)
		sessionRoutes.Put("/:id", sessionHandler.UpdateSession)
		sessionRoutes.Delete("/:id", sessionHandler.DeleteSession)

	}

	askRoutes := app.Group("/api/asks", middleware.AuthMiddleware(authService))
    {
        askRoutes.Post("/", askHandler.CreateAsk)
        askRoutes.Get("/session/:sessionId", askHandler.GetAsksBySession)
        askRoutes.Delete("/:id", askHandler.DeleteAsk)
    }

	userRoutes := app.Group("/api/users")
	{
		userRoutes.Post("/", userHandler.CreateUser)
		userRoutes.Get("/", userHandler.GetUsers)
		userRoutes.Get("/:id", userHandler.GetUser)
		userRoutes.Delete("/:id", userHandler.DeleteUser)
	}
	api := app.Group("/api/auth")
	{
		api.Post("/register", authHandler.Register)
		api.Post("/login", authHandler.Login)
	}

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "Server is running",
		})
	})

	log.Fatal(app.Listen(":8080"))
}
