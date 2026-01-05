package database

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/mohammed-ayoub-javascript/study-backend/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using system env variables")
	}
_ = godotenv.Load() 

dsn := os.Getenv("DB_URL")

database, err := gorm.Open(postgres.New(postgres.Config{
    DSN: dsn,
    PreferSimpleProtocol: true, 
}), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	fmt.Println(" Database connection established")

	DB = database

	err = DB.AutoMigrate(&models.User{}, &models.Session{}, &models.Ask{})
	if err != nil {
		log.Fatal("Migration Failed: ", err)
	}
}
