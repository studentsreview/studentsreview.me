package main

import (
	"context"
	"os"
	"time"

	"github.com/nsf/termbox-go"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Handler struct {
	name    string
	handler func()
}

type Menu []Handler

func tbprint(x, y int, str string, fg, bg termbox.Attribute) {
	for pos, char := range str {
		termbox.SetCell(x+pos, y, char, fg, bg)
	}
}

func getReports(client *mongo.Client) []bson.M {
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	reports := make([]bson.M, 0)
	database := client.Database("StudentsReview")
	reportsCol := database.Collection("reports")
	cur, err := reportsCol.Find(ctx, bson.D{})
	defer cur.Close(ctx)
	for cur.Next(ctx) {
		var result bson.M
		err := cur.Decode(&result)
		if err != nil {
			panic(err)
		}
		reports = append(reports, result)
	}
	if err != nil {
		panic(err)
	}
	return reports
}

func main() {
	err := termbox.Init()
	if err != nil {
		panic(err)
	}
	defer termbox.Close()
	client, err := mongo.NewClient(options.Client().ApplyURI(os.Args[1]))
	if err != nil {
		panic(err)
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		panic(err)
	}
	// reports := getReports(client)
	var currentMenu Menu
	menuCursor := 0
	setMenu := func(menu Menu) {
		menuCursor = 0
		currentMenu = menu
	}

	mainMenu := make(Menu, 0)
	mainMenu = append(mainMenu, Handler{name: "Reports", handler: func() {
		reportsMenu := make(Menu, 0)
		reportsMenu = append(reportsMenu, Handler{name: "Back", handler: func() { setMenu(mainMenu) }})
		setMenu(reportsMenu)
	}})
	mainMenu = append(mainMenu, Handler{name: "Reviews", handler: func() {}})
	setMenu(mainMenu)

	for {
		termbox.Clear(termbox.ColorWhite, termbox.ColorBlack)
		tbprint(0, 0, "StudentsReview Admin Interface", termbox.ColorBlack|termbox.AttrUnderline, termbox.ColorRed)
		offset := 1
		for i := range currentMenu {
			var bg, fg termbox.Attribute
			if i == menuCursor {
				fg, bg = termbox.ColorWhite, termbox.ColorBlack
			} else {
				fg, bg = termbox.ColorBlack, termbox.ColorWhite
			}
			tbprint(0, i+offset, currentMenu[i].name, bg, fg)
		}

		termbox.Flush()
		event := termbox.PollEvent()
		if event.Type == termbox.EventInterrupt || event.Type == termbox.EventError {
			return
		} else if event.Type == termbox.EventKey {
			if event.Key == termbox.KeyCtrlC {
				return
			} else if event.Key == termbox.KeyArrowDown {
				if menuCursor < len(currentMenu)-1 {
					menuCursor++
				}
			} else if event.Key == termbox.KeyArrowUp {
				if menuCursor > 0 {
					menuCursor--
				}
			} else if event.Key == termbox.KeyEnter {
				currentMenu[menuCursor].handler()
			}
		}
	}
}
