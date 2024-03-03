package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func uploadFiles(c *gin.Context) {
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
	c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
	c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")
	// Multipart form
	form, _ := c.MultipartForm()
	comic := form.Value["comic"][0]
	ep := form.Value["ep"][0]
	files := form.File["upload[]"]

	for _, file := range files {
		log.Println(file.Filename)
		// Upload the file to specific dst.
		c.SaveUploadedFile(file, "uploads/"+comic+"/"+ep+"/"+file.Filename)

	}
	c.String(http.StatusOK, fmt.Sprintf("%d files uploaded!", len(files)))
}

func main() {
	router := gin.Default()
	router.POST("/upload", uploadFiles)

	router.Run("localhost:8080")
}
