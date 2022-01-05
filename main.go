package main

import (
	"github.com/gin-gonic/gin"
)

var idCounter = 4

type Call struct {
	Id      string `json:"id"`
	Desc    string `json:"desc"`
	URLName string `json:"urlName"`
	OnCall  bool   `json:"onCall"`
}

type CallRequest struct {
	URLName string `json:"urlName"`
	Desc    string `json:"desc"`
}

var calls = []Call{
	{"1", "Call 1", "iepa", false},
	{"2", "Call 2", "iepa", false},
	{"3", "Call 3", "iepa", true},
}

func main() {
	router := gin.Default()
	router.GET("/call/:id", getCall)
	router.POST("/call/:id", startCall)
	router.GET("/calls", getCalls)

	router.Run("localhost:8080")
}

// Get all calls
func getCalls(c *gin.Context) {
	// fmt.Println(c.GetPostForm("desc"))
	// fmt.Println(c.GetRawData())
	// fmt.Println(c.ClientIP())
	c.IndentedJSON(200, calls)
}

func startCall(c *gin.Context) {
	var callR CallRequest
	if err := c.BindJSON(&callR); err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	var call = Call{
		Id:      string(idCounter),
		Desc:    callR.Desc,
		URLName: callR.URLName,
		OnCall:  false,
	}
	idCounter++
	calls = append(calls, call)
	c.JSON(200, gin.H{"message": "call saved"})
}

func getCall(c *gin.Context) {
	id := c.Param("id")
	for _, call := range calls {
		if call.Id == id {
			c.JSON(200, call)
			return
		}
	}
	c.JSON(404, gin.H{"error": "call not found"})
}
