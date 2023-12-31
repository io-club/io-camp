package main

import (
	"fmt"
	"github.com/bytedance/sonic"
	"github.com/gin-gonic/gin"
	"net/http"
)

type Login struct {
	User     string `json:"user" binfing:"required"`
	Password string `json:"password" binding:"required"`
}

func main() {
	json1 := Login{User: "a", Password: "123"}
	json := Login{User: "b", Password: "456"}
	library := []Login{}
	library = append(library, json)
	library = append(library, json1)
	r := gin.Default()

	r.GET("/GetUser", func(c *gin.Context) { GetUser(library, c) })

	r.POST("/LoginUser", func(c *gin.Context) { LoginPost(c) })

	r.PUT("/ChangeUser0", func(c *gin.Context) { ChangeUser0(library, c) })

	r.DELETE("/DeleteUser0", func(c *gin.Context) { DeleteUser0(library, c) })

	r.Run(":8080") // 监听并在 0.0.0.0:8080 上启动服务

}

func mmd(library []Login, c *gin.Context) (b []Login) {
	a, err := sonic.Marshal(&library)
	if err != nil {
		fmt.Print("error!")
	}

	err = sonic.Unmarshal(a, &b)
	if err != nil {
		fmt.Print("error!")
	}

	fmt.Println(b)
	return b
}

func ChangeUser0(library []Login, c *gin.Context) {
	library[0].Password = "456"
	library[0].User = "q"
	c.JSON(http.StatusOK, gin.H{"message": mmd(library, c)})
}

func DeleteUser0(library []Login, c *gin.Context) {
	library1 := library[1:]
	c.JSON(http.StatusOK, gin.H{"message": mmd(library1, c)})
}

func GetUser(library []Login, c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": mmd(library, c)})
}

func LoginPost(c *gin.Context) {
	var json3 Login
	if err := c.ShouldBind(&json3); err == nil {
		if json3.User == "ylx" && json3.Password == "123" {
			c.JSON(http.StatusOK, gin.H{"status": "LOGIN"})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"status": "UNLOGIN"})
		}
	}
}
