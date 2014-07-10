import static ratpack.groovy.Groovy.groovyTemplate
import static ratpack.groovy.Groovy.ratpack
import static groovy.json.JsonOutput.toJson
import static java.util.UUID.randomUUID

import ratpack.form.Form

import adventure.Game
import adventure.Action

def games = [:]




ratpack {

  handlers {
    get {
      render groovyTemplate("index.html", games:games.findAll{! it.value.player2Id })
    }

    handler('test') {
        sessionPlayerId = getSessionPlayerId(request)
        def game = games[id]?:[]



        render "${request.metaClass.methods*.name.sort().unique()}"
    }


    handler('game/:id') {
        def id = pathTokens.id
        def game = games[id]


        def playerId = request.queryParams.playerId
        if (game && game.isPlayerValid(playerId)) {
            render groovyTemplate("game.html", title: "Adventures of Wesnoth", gameId:id, playerId:playerId)
        } else {
            render "Not allowed"
        }

    }


    handler('api/game') {
        byMethod {
            get {
                response.send 'application/json', toJson(games)
            }
            post { //create
                def form = parse Form

                def gameName = form.get("gameName")
                def playerName = form.get("playerName")
                def gameId = randomUUID() as String
                def player1Id = randomUUID() as String

                def game = new Game(name:gameName, player1Name:playerName, gameId:gameId, player1Id:player1Id)

                game.generateObstacles(15)

                game.characters1 << [name:form.get("character1Name"), type:form.get("character1Type")]
                game.characters1 << [name:form.get("character2Name"), type:form.get("character2Type")]
                game.characters1 << [name:form.get("character3Name"), type:form.get("character3Type")]
                game.characters1 << [name:form.get("character4Name"), type:form.get("character4Type")]



                games[gameId] = game


                response.send 'application/json', toJson(['success': 'success', 'game':game])
            }
        }
    }

    handler('api/game/:id') {
        byMethod {
            get {
                def id = pathTokens.id
                def game = games[id]?:[]
                def playerId = request.queryParams.playerId
                if (game) { // && game.isPlayerValid(playerId)) {
                    def gameData=[
                        gameId: game.gameId,
                        sizeX: game.sizeX,
                        sizeY: game.sizeY,
                        name: game.name,
                        player1Name: game.player1Name,
                        player2Name: game.player2Name,
                        characters1: game.characters1,
                        characters2: game.characters2,
                        obstacles: game.obstacles,
                        isOwner: (playerId == game.player1Id)
                    ]
                    response.send 'application/json', toJson(gameData)
                } else {
                    response.send 'application/json', toJson([])
                }
            }
            post { //join
                def id = pathTokens.id
                def form = parse Form
                def playerName = form.get("playerName")

                def game = games[id]

                if (!game.player2Id) {
                    game.player2Name = playerName
                    game.player2Id = randomUUID() as String

                    game.characters2 << [name:form.get("character1Name"), type:form.get("character1Type")]
                    game.characters2 << [name:form.get("character2Name"), type:form.get("character2Type")]
                    game.characters2 << [name:form.get("character3Name"), type:form.get("character3Type")]
                    game.characters2 << [name:form.get("character4Name"), type:form.get("character4Type")]

                    response.send 'application/json', toJson(['game':game])
                } else {
                    response.send 'application/json', toJson([])
                }
            }
        }
    }

    handler('api/game/:id/action') {
        byMethod {
            get {
                def id = pathTokens.id
                def game = games[id]
                def playerId = request.queryParams.playerId
                int num = Integer.parseInt(request.queryParams.num)

                if (game && game.isPlayerValid(playerId)) {
                    def action = game.getAction(playerId, num)
                    if (action) {
                        response.send 'application/json', toJson(['success':true, 'action':action])
                        return
                    }
                }

                response.send 'application/json', toJson(['success':false])
            }

            post {
                def form = parse Form
                def id = pathTokens.id
                def game = games[id]
                def playerId = form.get("playerId")
                def actionData = form.get("actionData")
                def messageNumber = form.get("messageNumber")

                if (game && game.isPlayerValid(playerId)) {
                    game.addAction(playerId, new Action(actionData:actionData, messageNumber: messageNumber))
                    response.send 'application/json', toJson(['success': 'true'])
                }

                response.send 'application/json', toJson(['success':false])
            }
        }
    }


    assets "public"
  }
}
