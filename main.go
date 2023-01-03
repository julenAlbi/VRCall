package main

import (
	"github.com/gin-gonic/gin"
)

var idCounter = 4

type Answer struct {
}

var calls map[string]Call

type Call struct {
	answer           Description
	offer            Description
	answerCandidates map[string]Candidate
	offerCandidates  map[string]Candidate
}

type Description struct {
	sdp   string
	typee string
}

type Candidate struct {
	candidate     string
	sdpMLineIndex int
	sdpMid        string
}

func main() {
	calls = make(map[string]Call)

	router := gin.Default()
	router.SetTrustedProxies(nil) // Avoid some unnecessary computation: https://pkg.go.dev/github.com/gin-gonic/gin#section-readme
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
