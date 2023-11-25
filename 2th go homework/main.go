package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"
	"github.com/bytedance/sonic"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type PageDto struct {
	Page     int `form:"page" json:"page"`
	PageSize int `form:"pageSize" json:"pageSize"`
}

type Login struct {
	PageDto
	IID       uint
	CreatedAt time.Time
	UpdatedAt time.Time
	User      string `json:"user" binding:"required"`
	Password  string `json:"password" binding:"required"`
}

func main() {
	db, err := gorm.Open(sqlite.Open("tes.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	err = db.AutoMigrate(&Login{})
	if err != nil {
		log.Fatal("AutoMigrate Fail")
	}

	r := gin.Default()

	r.GET("/GetUser", func(c *gin.Context) { GetUser(c, db) })

	r.POST("/LoginUser", func(c *gin.Context) { LoginPost(c) }) //登录

	r.PUT("/ChangeUser", func(c *gin.Context) { ChangeUser(c, db) })

	r.DELETE("/DeleteUser", func(c *gin.Context) { DeleteUser(c, db) })

	r.POST("/CreateUser", func(c *gin.Context) { CreateUser(c, db) }) //创建信息

	r.Run(":8080") // 监听并在 0.0.0.0:8080 上启动服务

}

func mmd(json Login, c *gin.Context) (b Login) {
	a, err := sonic.Marshal(&json)
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

func ChangeUser(c *gin.Context, db *gorm.DB) {
	var json Login
	db.Limit(1).Find(&json)
	json.Password = "456"
	json.User = "q"
	if err := db.Save(&json); err.Error == nil {
		c.JSON(http.StatusOK, gin.H{"message": mmd(json, c)})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"message": mmd(json, c)})
	}
}

func DeleteUser(c *gin.Context, db *gorm.DB) {
	var json Login
	err1 := db.Limit(1).Find(&json)
	err2 := db.Delete(&json)
	if err1.Error == nil && err2.Error == nil {
		c.JSON(http.StatusOK, gin.H{"message": "Deleted!"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"message": "fail to delete!"})
	}
}

func GetUser(c *gin.Context, db *gorm.DB) {
	var json Login
	if err := db.Limit(1).Find(&json); err.Error == nil {
		c.JSON(http.StatusOK, gin.H{"message1": mmd(json, c)})
		return
	}
	c.JSON(http.StatusBadRequest, gin.H{"message": "fail to get"})

}

func LoginPost(c *gin.Context) {
	var json Login
	if err := c.ShouldBind(&json); err == nil {
		if json.User == "ylx" && json.Password == "123" {
			c.JSON(http.StatusOK, gin.H{"status": "LOGIN"})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"status": "UNLOGIN"})
		}
	}
}

func CreateUser(c *gin.Context, db *gorm.DB) {
	var json Login
	err := c.ShouldBind(&json)
	if err != nil {
		fmt.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"message": "What are your messages?"})
		return
	}
	result := db.Create(&json)
	if result.Error != nil {
		fmt.Println(result.Error)
		c.JSON(http.StatusBadRequest, gin.H{"message": "Fail to create"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Created"})
}

func LimitGet(c *gin.Context, db *gorm.DB, r *http.Request) {
	var json Login
	if err := db.Scopes(Paginate(r)).Find(&json); err == nil {
		c.JSON(http.StatusOK, gin.H{"message": mmd(json, c)})
		return
	}
	c.JSON(http.StatusBadRequest, gin.H{"message": "Fail to LimieGet"})
}

func Paginate(r *http.Request) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		q := r.URL.Query()
		page, _ := strconv.Atoi(q.Get("page"))
		if page <= 0 {
			page = 1
		}

		pageSize, err := strconv.Atoi(q.Get("page_size"))
		if err != nil {
			panic("Fail to Atoi")
		}

		switch {
		case pageSize > 100:
			pageSize = 100
		case pageSize <= 0:
			pageSize = 10
		}

		offset := (page - 1) * pageSize
		return db.Offset(offset).Limit(pageSize)
	}
}
