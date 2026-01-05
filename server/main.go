package main

import (
	"log"
	"os"

	"github.com/mohammed-ayoub-javascript/study-backend/app"
)

func main() {
	server := app.SetupApp()
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(server.Listen(":" + port))
}