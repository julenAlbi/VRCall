package models

import (
	"errors"
	"net/http"
)

type Call struct {
	Answer           Description
	Offer            Description
	AnswerCandidates []Candidate
	OfferCandidates  []Candidate
}

type Description struct {
	Sdp  string `json:"sdp"`
	Type string `json:"type"`
}

func (d *Description) Bind(r *http.Request) error {
	if d.Sdp == "" {
		return errors.New("missing required Sdp field")
	}
	if d.Type == "" {
		return errors.New("missing required Type field")
	}
	return nil
}

type Candidate struct {
	Candidate     string `json:"candidate"`
	SdpMLineIndex int    `json:"sdpMLineIndex"`
	SdpMid        string `json:"sdpMid"`
}

func (c *Candidate) Bind(r *http.Request) error {
	if c.Candidate == "" {
		return errors.New("missing required Candidate field")
	}
	if c.SdpMid == "" {
		return errors.New("missing required SdpMid field")
	}
	return nil
}

type CandidateList struct {
	Candidates []Candidate `json:"candidates"`
}

func (c *CandidateList) Bind(r *http.Request) error {
	return nil
}
