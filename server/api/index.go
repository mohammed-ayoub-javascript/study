package handler

import (
	"net/http"
	"github.com/gofiber/fiber/v2/middleware/adaptor"
	"github.com/mohammed-ayoub-javascript/study-backend/app" 
)
func Handler(w http.ResponseWriter, r *http.Request) {
	fiberApp := app.SetupApp()
	
	adaptor.FiberApp(fiberApp)(w, r)
}