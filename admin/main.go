package main

import (
	"github.com/nsf/termbox-go"
)

func tbprint(x, y int, str string, fg, bg termbox.Attribute) {
	for pos, char := range str {
		termbox.SetCell(x+pos, y, char, fg, bg)
	}
}

func main() {
	err := termbox.Init()
	if err != nil {
		panic(err)
	}
	defer termbox.Close()
	for {
		tbprint(0, 0, "Hello There!", termbox.ColorBlack|termbox.AttrBold, termbox.ColorRed)
		termbox.Flush()
		event := termbox.PollEvent()
		if event.Type == termbox.EventInterrupt || event.Type == termbox.EventError {
			return
		} else if event.Type == termbox.EventKey {
			if event.Key == termbox.KeyCtrlC {
				return
			}
		}
	}
}
