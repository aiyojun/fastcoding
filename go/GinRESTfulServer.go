package main

import (
	"github.com/gin-gonic/gin"
)

func Homepage(c *gin.Context) {
	c.String(200, "Homepage")
	return
}

func main() {
	router := gin.Default()
	router.GET("/", Homepage)
	router.Run(":8080")
}