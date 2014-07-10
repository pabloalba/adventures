package adventure

import java.util.Random

class Game {
    String gameId
    String name
    String player1Name
    String player2Name
    String player1Id
    String player2Id
    def actions1 = []
    def actions2 = []
    def characters1 = []
    def characters2 = []
    int sizeX = 18
    int sizeY = 10
    def obstacles = []

    boolean isPlayerValid(String playerId){
        return ((player1Id == playerId) || (player2Id == playerId))
    }

    Action getAction(playerId, num){
        def actionList
        if (player1Id == playerId){
            actionList = actions1
        } else {
            actionList = actions2
        }

        if (actionList.size() > num) {
            return actionList[num]
        }
        return null
    }

    void addAction(playerId, action){
        def actionList
        if (player1Id == playerId){
            actionList = actions2
        } else {
            actionList = actions1
        }

        //do not add repeated action
        if (! actionList.find{it.messageNumber == action.messageNumber}){
            actionList << action
        }
    }

    void generateObstacles(int num) {
        Random rand = new Random()
        num.times {
            def x = rand.nextInt(sizeX - 2) +1
            def y = rand.nextInt(sizeY -2) +1
            def type = rand.nextInt(2)
            if (! obstacles.find{it.x==x && it.y==y}) {
                obstacles << [type:type, x:x, y:y]
            }
        }

        obstacles << [type:1, x:3, y:3]
        obstacles << [type:0, x:3, y:2]


        obstacles << [type:1, x:4, y:3]
        obstacles << [type:0, x:4, y:2]

        obstacles = obstacles.sort{ it.type }
    }


}


class Action {
    String actionData
    String messageNumber
}
