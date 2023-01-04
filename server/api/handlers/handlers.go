package handlers

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	"github.com/VRCall/api/models"
	"github.com/go-chi/chi"
	"github.com/go-chi/render"
)

var calls map[string]*models.Call

type ErrResponse struct {
	HTTPStatusCode int    `json:"-"`      // http response status code
	StatusText     string `json:"status"` // user-level status message
}

func (e *ErrResponse) Render(w http.ResponseWriter, r *http.Request) error {
	render.Status(r, http.StatusNotFound)
	return nil
}

var ErrNotFound = &ErrResponse{HTTPStatusCode: 404, StatusText: "Call not found."}
var CallNotSpecified = &ErrResponse{HTTPStatusCode: 404, StatusText: "Call not specified."}

func CallRouter() chi.Router {
	calls = make(map[string]*models.Call)
	r := chi.NewRouter()
	r.Post("/", createCall)
	r.Route("/{callID}", func(r chi.Router) {
		r.Use(callCtx)
		r.Post("/offerCandidates", addOfferCandidates)
		r.Get("/offerCandidates", getOfferCandidates)
		r.Get("/offerDescription", getOfferDescription)
		r.Post("/answerCandidates", addAnswerCandidates)
		r.Get("/answerCandidates", getAnswerCandidates)
		r.Get("/answerDescription", getAnswerDescription)
		r.Post("/answerDescription", setAnswerDescription)
	})
	return r
}

// Create call handler
func createCall(w http.ResponseWriter, r *http.Request) {
	if callID := r.URL.Query().Get("callid"); callID != "" {
		des := &models.Description{}
		if err := render.Bind(r, des); err != nil {
			render.Render(w, r, ErrNotFound)
			return
		}
		call := &models.Call{
			Offer: *des,
		}
		calls[callID] = call
		render.Status(r, http.StatusCreated)
		fmt.Println(calls)
	} else {
		render.Render(w, r, CallNotSpecified)
		return
	}
}

// Add offer candidate handler
func addOfferCandidates(w http.ResponseWriter, r *http.Request) {
	call := r.Context().Value("call").(*models.Call)
	candidateL := &models.CandidateList{}
	if err := render.Bind(r, candidateL); err != nil {
		render.Render(w, r, ErrNotFound)
		return
	}
	call.OfferCandidates = append(call.OfferCandidates, candidateL.Candidates...)
}

// Add answer candidate handler
func addAnswerCandidates(w http.ResponseWriter, r *http.Request) {
	call := r.Context().Value("call").(*models.Call)
	candidateL := &models.CandidateList{}
	if err := render.Bind(r, candidateL); err != nil {
		render.Render(w, r, ErrNotFound)
		return
	}
	call.AnswerCandidates = append(call.AnswerCandidates, candidateL.Candidates...)
}

// Get offer description handler
func getOfferDescription(w http.ResponseWriter, r *http.Request) {
	call := r.Context().Value("call").(*models.Call)
	render.JSON(w, r, call.Offer)
}

// Get answer description handler
func getAnswerDescription(w http.ResponseWriter, r *http.Request) {
	call := r.Context().Value("call").(*models.Call)
	render.JSON(w, r, call.Answer)
}

// Get offer candidates handler
func getOfferCandidates(w http.ResponseWriter, r *http.Request) {
	call := r.Context().Value("call").(*models.Call)
	render.JSON(w, r, call.OfferCandidates)
}

// Get answer candidates handler
func getAnswerCandidates(w http.ResponseWriter, r *http.Request) {
	call := r.Context().Value("call").(*models.Call)
	render.JSON(w, r, call.AnswerCandidates)
}

// Set answer description handler
func setAnswerDescription(w http.ResponseWriter, r *http.Request) {
	call := r.Context().Value("call").(*models.Call)
	des := &models.Description{}
	if err := render.Bind(r, des); err != nil {
		render.Render(w, r, ErrNotFound)
		return
	}
	call.Answer = *des
}

func callCtx(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var call *models.Call
		var err error

		if callID := chi.URLParam(r, "callID"); callID != "" {
			call, err = dbGetCall(callID)
		} else {
			render.Render(w, r, ErrNotFound)
			return
		}
		if err != nil {
			render.Render(w, r, ErrNotFound)
			return
		}

		ctx := context.WithValue(r.Context(), "call", call)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func dbGetCall(callID string) (*models.Call, error) {
	call, ok := calls[callID]
	if !ok {
		return nil, errors.New("Call not found.")
	}
	return call, nil
}
