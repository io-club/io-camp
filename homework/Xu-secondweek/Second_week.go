package main

import (
	// "strconv"
	"strconv"
	// "time"

	"gorm.io/driver/sqlite" // Sqlite driver based on CGO

	// "github.com/glebarez/sqlite" // Pure go SQLite driver, checkout https://github.com/glebarez/sqlite for details
	"gorm.io/gorm"

	"net/http"

	"github.com/gin-gonic/gin"
)

var db *gorm.DB
var user User
var users []User

// github.com/mattn/go-sqlite3
//
//	type Login struct {
//		// 结构字段必须以大写字母（导出）开头，JSON 包才能看到其值。
//		User     string `form:"user" json:"user" xml:"user"  binding:"required"`
//		Id       string `form:"id" json:"id" binding:"-"`
//		Password string `form:"password" json:"password" xml:"password" binding:"required"`
//	}
type User struct {
	gorm.Model
	Name string `form:"user" json:"user" xml:"user"  binding:"-"`
	Id   string `form:"id" json:"id" binding:"-"`
	Age  string
}

func CreateUser(c *gin.Context) {
	//var user User
	//var db *gorm.DB
	user.Age = c.DefaultPostForm("age", "")

	if err := c.ShouldBind(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// db.Model(&user).Create(map[string]interface{}{
	// 	"Name": user.Name,
	// 	"id":   user.Id,
	// })
	db.Create(&user)

	c.JSON(http.StatusOK, gin.H{
		"name": user.Name,
		"id":   user.Id,
		"age":  user.Age,
	})
}

func SelectOneUser(c *gin.Context) {
	//var db *gorm.DB
	//var user User

	db.Where("id = ?", c.Param("id")).First(&user)

	c.JSON(http.StatusOK, gin.H{
		"name": user.Name,
		"id":   user.Id,
		"age":  user.Age,
	})
}

func Paginate(c *gin.Context) {
	//var users []User
	//var r *http.Request

	q := c.Request.URL.Query()
	page, _ := strconv.Atoi(q.Get("page")) // 用于将字符串类型转换为int类型
	if page <= 0 {
		page = 1
	}

	pageSize, _ := strconv.Atoi(q.Get("page_size"))

	offset := (page - 1) * pageSize
	var users []User
	result := db.Offset(offset).Limit(pageSize).Find(&users)
	// 对单个对象使用Find而不带limit，db.Find(&user)将会查询整个表并且只返回第一个对象

	// result := db.Find(&users)
	//err := result.Error
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": result.Error})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"users": users,
	})

}

func UpdateOneUser(c *gin.Context) {
	//var db *gorm.DB
	//var user User

	user.Name = c.DefaultPostForm("name", "Tom")
	user.Id = c.Param("id")
	user.Age = c.PostForm("age")

	db.Model(&user).Updates(map[string]interface{}{
		"name": user.Name,
		"id":   user.ID,
		"age":  user.Age,
	})

	c.JSON(http.StatusOK, gin.H{
		"name": user.Name,
		"id":   user.ID,
		"age":  user.Age,
	})
}

func DeleteUser(c *gin.Context) {
	//var db *gorm.DB
	//var user User
	user.Id = c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"id": c.Param("id"),
	})
	db.Where("id = ?", c.Param("id")).First(&user)

	result := db.Delete(&user)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": result.Error})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "OK",
	})

}

func main() {
	r := gin.Default()
	var err error
	db, err = gorm.Open(sqlite.Open("gorm.db"), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		panic("failed to connect database")
	}
	db.AutoMigrate(&User{})

	r.POST("/create/form", CreateUser)

	r.GET("/:id", SelectOneUser)

	r.GET("/users", Paginate)

	r.PUT("/users/:id", UpdateOneUser)

	r.DELETE("/users/:id", DeleteUser)

	r.Run(":8080")
}
