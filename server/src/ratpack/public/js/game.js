var game = {
    sizeX: 1,
    sizeY: 1,
    currentPlayer:0,
    aliveCharacters: [0,0],
    remoteCommandNumber: 0,
    remoteCommandList: [],
    currentCommand:0,
    owner: false,
    characters: [],

    setup: function() {
        this.currentAction = null;
        this.characters = [];
        this.obstacles = [];

        //Board
        this.board = [];
        for (i=0;i< this.sizeY; i++) {
            this.board.push([]);
            for (j=0;j< this.sizeX; j++) {
                this.board[i].push(null);
            }

        }
        gui.setup();
    },

    addCharacter: function(character) {
        game.characters.push(character);
        game.aliveCharacters[character.belongsTo]++;
        game.board[character.y][character.x] = character;
    },

    addObstacle: function(obstacle) {
        game.obstacles.push(obstacle);
        game.board[obstacle.y][obstacle.x] = obstacle;
    },

    boardClick: function(e) {
        if (game.canClick()) {
            var position = gui.clickPosition(e);
            var targetCharacter = game.board[position.y][position.x];
            if ((targetCharacter instanceof Character) &&
                (targetCharacter.belongsTo == game.currentPlayer)) {
                game.selectCharacter(targetCharacter);
                gui.refresh();
            } else {
                if ((game.currentAction != null) &&
                    (game.currentCharacter.belongsTo == game.currentPlayer)) {
                        game.executeAction(e);
                } else {
                    var position = gui.clickPosition(e);
                    var targetCharacter = game.board[position.y][position.x];
                    if (targetCharacter instanceof Character) {
                        game.selectCharacter(targetCharacter);
                        gui.refresh();
                    }
                }
            }
        }
    },

    executeAction: function(e) {
            var position = gui.clickPosition(e);
            var targetCharacter = game.board[position.y][position.x];

            var distance = game.distance(game.currentCharacter.x, game.currentCharacter.y, position.x, position.y);

            if ((game.currentAction.type == "MOVE")||(game.currentAction.type == "FLY")) {
                if (targetCharacter instanceof Character) {
                    game.selectCharacter(targetCharacter);
                    gui.refresh();
                } else {
                    //Move
                    if ((game.board[position.y][position.x] == null) &&
                        (distance <= game.currentAction.range)) {
                        game.moveCharacter(game.currentCharacter, position.x, position.y);
                        game.sendRemoteCommand(game.currentAction.type, game.currentCharacter, game.currentAction, position.x, position.y);
                        game.clearAction();
                        gui.refresh();

                    }
                }
            } else if (game.currentAction.type == "ATACK"){
                //Atack
                if ((targetCharacter instanceof Character) &&
                    (targetCharacter.belongsTo != game.currentPlayer) &&
                    (game.onReachables(position.x, position.y)!=null)){
                    var damage = game.atack(targetCharacter);
                    game.sendRemoteCommand(game.currentAction.type, game.currentCharacter, game.currentAction, 0, 0, targetCharacter, damage);
                    game.clearAction();
                    gui.refresh();
                }
            }
    },

    atack: function(character, prob, dam, isRemote){
        var probability = prob || game.probability(character);
        var damage = 0;
        if ((Math.random() * 100) < probability) {
            damage = dam || Math.floor((Math.random() * (game.currentAction.maxDamage - game.currentAction.minDamage + 1)) + game.currentAction.minDamage);
            game.successAtack(character, damage);
        } else {
            game.failedAtack(character);
        }
        game.currentAction.coolDown = game.currentAction.maxCoolDown;
        game.currentCharacter.numActions = 0;
        return damage;
    },

    successAtack: function(character, damage) {
        gui.log(game.currentAction.name + " from " + game.currentCharacter.name + " to " + character.name + " deals " + damage + " damage");

        gui.showAtackLightbox(game.currentCharacter, character,  game.currentAction, "deals " + damage + " damage");
        character.life -=  damage;
        if (character.life <= 0) {
            gui.log(character.name + " is dead");
            game.board[character.y][character.x] = null;
            var index = game.characters.indexOf(character);
            game.characters.splice(index, 1);
            game.aliveCharacters[character.belongsTo]--;
            if (game.aliveCharacters[character.belongsTo] == 0) {
                gui.showAtackLightbox(game.currentCharacter, character,  game.currentAction, "deals " + damage + " damage. " + character.name + " is dead!", game.playerName[game.currentPlayer]);
                game.currentPlayer = -1;
            } else {
                gui.showAtackLightbox(game.currentCharacter, character,  game.currentAction, "deals " + damage + " damage. " + character.name + " is dead!");
            }

        } else {
            gui.showAtackLightbox(game.currentCharacter, character,  game.currentAction, "deals " + damage + " damage");
        }
    },

    failedAtack: function(character){
        gui.log(game.currentAction.name + " from " + game.currentCharacter.name + " to " + character.name + " miss");
        gui.showAtackLightbox(game.currentCharacter, character,  game.currentAction, "miss");
    },

    selectCharacter: function(character){
        game.clearAction();
        game.currentCharacter = character;
        game.selectFirstAction();
    },

    drawPath: function() {
        game.drawing = true;
        if (game.path.length > 0) {
            var pos = game.path.shift();
            game.currentCharacter.x = pos.x;
            game.currentCharacter.y = pos.y;
            gui.refresh();
            setTimeout(game.drawPath, 300);
        } else {
            game.drawing = false;
        }

    },

    moveCharacter: function(character, x, y){
        game.board[character.y][character.x] = null;

        var path = [];
        var pos = game.onReachables(x, y);
        if (pos.fromX != null) {
            while (pos.fromX != null) {
                path.unshift(pos);
                pos = game.onReachables(pos.fromX, pos.fromY);
            }
        } else {
            path.unshift(pos);
        }
        game.path = path;

        game.drawPath();

        game.board[y][x] = character;
        game.currentAction.coolDown = game.currentAction.maxCoolDown;
        gui.log("Move " + game.currentCharacter.name + " to " + x + ", " + y);
        game.currentCharacter.numActions -= 1;
    },

    actionClick: function(imageAction){
        if (game.canClick()) {
            game.selectAction(imageAction.data("number"));
        }
    },

    selectAction: function(actionNumber) {
        var action = game.currentCharacter.actions[actionNumber];
        if ((action.coolDown == 0) &&
            (game.currentCharacter.numActions !=0)) {
            game.currentAction = action;
            if (action.type=="MOVE") {
                game.reachablePositions = game.reachables(game.currentCharacter.x, game.currentCharacter.y, action.range);
            } else {
                game.reachablePositions = game.onDistance(game.currentCharacter.x, game.currentCharacter.y, action.range);
            }

        } else {
            game.clearAction();
        }
        gui.refresh();
    },

    actionEndTurn: function() {
        if (game.canClick()) {
            game.sendRemoteCommand("ENDTURN", null, null, 0, 0);
            game.endTurn();
        }
    },

    endTurn: function() {
        game.currentPlayer = (game.currentPlayer + 1) % 2;
        for (i=0;i<game.characters.length;i++){
            var character = game.characters[i];
            character.numActions = 2;
            if (character.belongsTo == game.currentPlayer) {
                for (j=0;j<character.actions.length;j++){
                    if (character.actions[j].coolDown > 0) {
                        character.actions[j].coolDown--;
                    }
                }
            }
        }

        game.clearAction();
        gui.startTurn(game.playerName[game.currentPlayer]);
        game.selectFirstCharacter();
    },

    selectFirstCharacter: function(){
        var character;
        for (i=0;i<game.characters.length;i++) {
            if (game.characters[i].belongsTo == game.currentPlayer){
                game.selectCharacter(game.characters[i]);
                gui.refresh();
                break;
            }
        }
    },

    selectNextCharacter: function(){
        var id = game.characters.indexOf(game.currentCharacter);

        for (i=id+1;i<game.characters.length;i++) {
            if (game.characters[i].belongsTo == game.currentPlayer){
                console.log("ok "+i);
                game.selectCharacter(game.characters[i]);
                gui.refresh();
                return;
            }
        }

        for (i=0; i<id;i++) {
            if (game.characters[i].belongsTo == game.currentPlayer){
                game.selectCharacter(game.characters[i]);
                gui.refresh();
                return;
            }
        }
        console.log(2);
    },

     selectPreviousCharacter: function(){
         var id = game.characters.indexOf(game.currentCharacter);

        for (i=id-1;i>=0;i--) {
            if (game.characters[i].belongsTo == game.currentPlayer){
                game.selectCharacter(game.characters[i]);
                gui.refresh();
                return;
            }
        }

        for (i=game.characters.length-1; i>id;i--) {
            if (game.characters[i].belongsTo == game.currentPlayer){
                game.selectCharacter(game.characters[i]);
                gui.refresh();
                return;
            }
        }
    },

    selectFirstAction: function(){
        var action = $(".action").first();
        if (action.size() == 1) {
            game.selectAction(0);
        } else {
            setTimeout(game.selectFirstAction, 200);
        }
    },

    clearAction: function() {
        game.currentAction = null;
    },

    distance: function(x1, y1, x2, y2) {
        return Math.abs(x1 -x2) + Math.abs(y1 - y2);
    },

    probability: function(character) {
        return game.currentAction.success - character.armor;
    },

    onDistance: function(charX, charY, range) {
        var positions = [];
        for (y=0; y<game.sizeY; y++) {
            for (x=0; x<game.sizeX; x++) {
                var distance = game.distance(charX, charY, x, y);
                if (distance <=range){
                    positions.push({x:x, y:y, range:distance});
                }
            }
        }
        return positions;
    },

    reachables: function(x, y, range) {
        var positions = [];
        game.addToPositions(positions, x, y, range, null, null);
        var current = 0;
        while (current < positions.length) {
            var pos = positions[current];
            if (pos.range > 0) {
                if (pos.y > 0) {
                    if (game.board[pos.y -1][pos.x] == null) {
                        game.addToPositions(positions, pos.x, pos.y-1, pos.range-1, pos.x, pos.y);
                    }
                }
                if (pos.y < game.sizeY -1) {
                    if (game.board[pos.y +1][pos.x] == null) {
                        game.addToPositions(positions, pos.x, pos.y+1, pos.range-1, pos.x, pos.y);
                    }
                }
                if (pos.x > 0) {
                    if (game.board[pos.y][pos.x-1] == null) {
                        game.addToPositions(positions, pos.x-1, pos.y, pos.range-1, pos.x, pos.y);
                    }
                }
                if (pos.x < game.sizeX-1) {
                    if (game.board[pos.y][pos.x+1] == null) {
                        game.addToPositions(positions, pos.x+1, pos.y, pos.range-1, pos.x, pos.y);
                    }
                }
            }
            current++;
        }
        return positions;

    },

    addToPositions: function(positions, x, y, range, fromX, fromY) {
        var find = false;
        for (i=0; i<positions.length; i++) {
            if ((positions[i].x == x) && (positions[i].y == y)) {
                find = true;
                if (positions[i].range < range) {
                    //positions.push({x:x, y:y, range:range});
                    positions[i].range = range;
                    positions[i].fromX = fromX;
                    positions[i].fromY = fromY;
                }
            }
        }

        if (find == false) {
            positions.push({x:x, y:y, range:range, fromX:fromX, fromY:fromY});
        }

    },

    onReachables: function(x, y) {
        for (i=0; i<game.reachablePositions.length;i++){
            if ((game.reachablePositions[i].x == x) &&
                (game.reachablePositions[i].y == y)){
                    return game.reachablePositions[i];
                }
        }
        return null;
    },
    findCharacterById: function(id) {
        for (i=0; i<game.characters.length;i++) {
            if (game.characters[i].id == id) {
                return game.characters[i];
            }
        }
    },

    executeRemoteCommand: function(remoteCommandNum){
        if (!game.drawing) {
            var remoteCommand = game.remoteCommandList[remoteCommandNum];
            console.log("executing remote command:");
            console.log(remoteCommand);

            if (remoteCommand.type=="ENDTURN") {
                game.endTurn();
            } else {
                game.selectCharacter(game.findCharacterById(remoteCommand.characterNum));
                game.selectAction(remoteCommand.actionNum);
                if ((game.currentAction.type == "MOVE")||(game.currentAction.type == "FLY")) {
                    game.moveCharacter(game.currentCharacter, remoteCommand.x, remoteCommand.y);
                } else if (game.currentAction.type == "ATACK"){ //atack
                    var targetCharacter = game.findCharacterById(remoteCommand.targetCharacterNum);
                    if (remoteCommand.damage > 0) {
                        game.atack(targetCharacter, 1000, remoteCommand.damage, true);
                    } else {
                        game.atack(targetCharacter, -1, 0, true);
                    }
                    game.currentAction.coolDown = game.currentAction.maxCoolDown;
                    game.currentCharacter.numActions = 0;
                }

                game.clearAction();
                gui.refresh();
            }
        } else {
            setTimeout(function() {game.executeRemoteCommand(remoteCommandNum)}, 500);
        }
    },

    executeRemoteCommandList: function(){
        if (!game.drawing) {
            if (game.remoteCommandList.length > 0) {
                if (game.currentCommand < game.remoteCommandList.length) {
                    game.executeRemoteCommand(game.currentCommand++);
                }
            }
        }
        setTimeout(game.executeRemoteCommandList, 1000);

    },

    sendRemoteCommand: function(type, character, action, x, y, targetCharacter, damage){
        var numCharacter = -1;
        var numAction=-1;
        var dmg = damage || 0;
        var targetCharacterNum = -1;

        if (character) {
            numCharacter = character.id;
            if (action) {
                numAction = action.id;
            }
        }

        if (targetCharacter) {
            targetCharacterNum = targetCharacter.id;
        }


        //characterNum, actionNum, targetCharacterNum, x , y, damage
        var remoteCommand = new RemoteCommand(type, numCharacter, numAction, targetCharacterNum, x , y, dmg);
        communications.sendRemoteCommand(remoteCommand);

    },

    canClick: function(){
        if (!game.drawing) {
            if (game.currentPlayer == 0) {
                return (game.isOwner);
            } else {
                return (! game.isOwner);
            }
        }
    }

};


function createGame() {

        //characters
        var gameId = $("#gameId").val();
        var playerId = $("#playerId").val();
        game.id = gameId;
        game.playerId = playerId;

        $.ajax({
            url : "/api/game/"+gameId+"?playerId="+playerId,
            dataType: "json",
            success: function(data){
                console.log(data);
                game.sizeX = data.sizeX;
                game.sizeY = data.sizeY;
                game.name = data.name;

                game.setup();
                var numCharacter = 0;

                console.log("characters1");
                for (i=0; i<data.characters1.length; i++) {
                    var c = data.characters1[i];
                    var cc = characterGenerator.generate(numCharacter++, 0, c.name, 0, i+3, c.type);
                    console.log(cc);
                    game.addCharacter(cc);
                }

                console.log("characters2");
                for (i=0; i<data.characters2.length; i++) {
                    var c = data.characters2[i];
                    console.log(c);
                    game.addCharacter(characterGenerator.generate(numCharacter++, 1, c.name, 17, i+3, c.type));
                }

                console.log("obstacles");
                //obstacles
                for (i=0; i<data.obstacles.length; i++) {
                    var obstacle = data.obstacles[i]
                    if (obstacle.type == 0) {
                        game.addObstacle(characterGenerator.generateRock(obstacle.x, obstacle.y));
                    } else {
                        game.addObstacle(characterGenerator.generateTree(obstacle.x, obstacle.y));
                    }
                }


                game.isOwner = data.isOwner;
                game.playerName = []
                game.playerName[0] = data.player1Name;
                game.playerName[1] = data.player2Name;
                gui.startTurn(game.playerName[0]);
                game.selectFirstCharacter();

            },
            error: function (jqXHR, textStatus, errorThrown){
                alert('error');
            }
        });

        communications.pool();

}


$(document).ready(function() {
    console.log( "ready!" );

    $(".board-container").width($("body").width() - $(".actions-container").width()-2);


    $("#board").click(function(e) {
        game.boardClick(e);
    });

    $( "#actions" ).on( "click", ".action", function() {
        game.actionClick($(this));
    });

    $( "body" ).on( "click", ".overlay", function() {
        gui.closeLightbox();
    });


    $("#actionEndTurn").click(function(e) {
        if (game.canClick()) {
            game.actionEndTurn();
        }
    });

    $("#actionPrevious").click(function(e) {
        if (game.canClick()) {
            game.selectPreviousCharacter();
        }
    });

    $("#actionNext").click(function(e) {
        if (game.canClick()) {
            game.selectNextCharacter();
        }
    });


    $("#zoomIn").click(function(e) {
        gui.zoom(100);
    });
    $("#zoomOut").click(function(e) {
        gui.zoom(-100);
    });

    createGame();




    setTimeout(game.executeRemoteCommandList, 1000);
});
