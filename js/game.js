function Action(type, name, imageSrc, range, damage, success, coolDown){
            this.name = name;
            this.src = imageSrc,
            this.range = range;
            this.damage = damage;
            this.type = type;
            this.coolDown = 0;
            this.maxCoolDown = coolDown;
            this.success = success;
}



function Character(belongsTo, name, imageSrc, life, x, y, actions){
            this.belongsTo = belongsTo;
            this.name = name;
            this.src = imageSrc;
            this.image = new Image(),
            this.life = life;
            this.maxLife = life;
            this.x = x;
            this.y = y;
            this.numActions = 2;

            this.actions = actions;

            this.image.src = imageSrc;
}

var characterGenerator = {
    generateThief: function(belongsTo, name, x, y) {
        var actions = [
            new Action("MOVE", "Walk", "images/walk.png", 5, null, 100, 0),
            new Action("ATACK", "Dagger", "images/dagger.png", 1, 4, 80, 0),
            new Action("ATACK", "Throw dagger", "images/dagger_throw.png", 3, 2, 70, 0),
            new Action("ATACK", "Throw poisoned dagger", "images/dagger_throw_poison.png", 3, 1, 70, 2)
        ];
        return new Character(belongsTo, name, "images/thief.png", 4, x, y, actions);

    },
    generateWarrior: function(belongsTo, name, x, y) {
        var actions = [
            new Action("MOVE", "Walk", "images/walk.png", 4, null, 100, 0),
            new Action("ATACK", "Sword", "images/sword.png", 1, 8, 95, 0),
            new Action("ATACK", "Bow", "images/bow.png", 5, 6, 80, 0)
        ];
        return new Character(belongsTo, name, "images/warrior.png", 10, x, y, actions);
    }
}

var gui = {
    base: 72,
    scale: 1,
    setup: function() {
        var canvas = $("#board");
        var width = game.sizeX * this.base+50;
        var height = game.sizeY * this.base;
        canvas.attr("width", width);
        canvas.attr("height", height);

        this.ctx = canvas[0].getContext("2d");
        this.ctx.font="18px Georgia";

        //background
        this.imgBackground = new Image();
        this.imgBackground.src = "images/grass.png";
        this.imgBackground.onload = this.refresh();

    },

    zoom: function(inc){
        this.clear();

        var canvas = $("#board");

        var baseWidth = game.sizeX * this.base + 50;
        var baseHeight = game.sizeY * this.base;

        console.log(canvas.width());
        var width = canvas.width() + inc;

        var scale =  width / baseWidth;

        canvas.attr("width", width);
        canvas.attr("height", baseHeight * scale);
        this.ctx.scale(scale,scale);
        this.scale = scale;

        this.refresh();
    },

    drawBackground: function() {
        console.log('drawBackground');
        for (x=0; x<game.sizeX; x++) {
            for (y=0; y<game.sizeY; y++) {
                gui.ctx.drawImage(gui.imgBackground, x * gui.base, y * gui.base);
                gui.ctx.strokeRect(x * gui.base, y * gui.base, gui.base, gui.base);
            }
        }
    },


    drawCharacters: function() {
        console.log('drawCharacters ' + game.characters.length);
        for (i=0; i<game.characters.length; i++) {
            var character = game.characters[i];
            this.ctx.drawImage(character.image, character.x * this.base, character.y * this.base);
            this.ctx.fillStyle="#FF0000";
            //this.ctx.fillText("75%", character.x * this.base + 20, character.y * this.base + 70);
        }
    },

    drawCurrentCharacter: function() {
        if (game.currentCharacter) {
            $("#characterImg").attr('src', game.currentCharacter.src);
            $("#actions").html("");

            for (i=0; i<game.currentCharacter.actions.length;i++) {
                var image = new Image();
                image.src = game.currentCharacter.actions[i].src;
                $(image).attr("title", game.currentCharacter.actions[i].name);
                $(image).data("number", i);
                $(image).addClass("action");
                if (game.currentCharacter.actions[i] == game.currentAction) {
                    $(image).addClass("selected");
                }

                if ((game.currentCharacter.numActions == 0) ||
                    (game.currentCharacter.actions[i].coolDown > 0)){
                    $(image).addClass("grayscale");
                }

                $("#actions").append($(image));

                if (game.currentCharacter.actions[i].coolDown > 0) {
                    $("#actions").append("<span class='cooldown'>"+game.currentCharacter.actions[i].coolDown+"</span>");
                }


            }


            $("#life").html(game.currentCharacter.life + " / " + game.currentCharacter.maxLife);
            $("#numActions").html(game.currentCharacter.numActions);
            $("#characterName").html(game.currentCharacter.name);
        }
    },



    drawRange: function() {
        this.ctx.globalAlpha=0.2;

        if (game.currentAction) {
            if (game.currentCharacter.belongsTo == 0) {
                this.ctx.fillStyle="#0000FF";
            } else {
                this.ctx.fillStyle="#FF0000";
            }
            for (x=0; x<game.sizeX; x++) {
                for (y=0; y<game.sizeY; y++) {
                    if (game.distance(game.currentCharacter.x, game.currentCharacter.y, x, y) <= game.currentAction.range) {
                        gui.ctx.fillRect(x * gui.base, y * gui.base, gui.base, gui.base);
                    }
                }
            }
        }
        this.ctx.globalAlpha=1;
    },

    clear: function() {
        this.ctx.clearRect(0, 0, game.sizeX*gui.base+50, game.sizeY*gui.base+50);
    },


    refresh: function() {
        this.drawBackground();
        this.drawRange();
        this.drawCharacters();
        this.drawCurrentCharacter();
    },

    clickPosition: function(e) {
        var offset = $("#board").offset();
        var left = (e.clientX - offset.left) / this.scale;
        var top = (e.clientY - offset.top) / this.scale;
        var x = Math.floor(left/this.base);
        var y = Math.floor(top/this.base);

        console.log ("x: "+x+"   y: "+y);
        return  {x:x , y:y}
    },

    log:function(txt){
        $("#log").append("<div>"+txt+"</div>");
    }


}
var game = {
    sizeX: 20,
    sizeY: 10,
    currentPlayer:0,
    aliveCharacters: [1,1],
    setup: function() {
        this.currentAction = null;

        //Board
        this.board = [];
        for (i=0;i< this.sizeY; i++) {
            this.board.push([]);
            for (j=0;j< this.sizeX; j++) {
                this.board[i].push(null);
            }

        }


        //characters
        this.characters = []
        this.characters.push(characterGenerator.generateThief(0, "Arik", 5, 1));
        this.characters.push(characterGenerator.generateWarrior(1, "Thair", 5, 2));

        for (i=0; i<this.characters.length; i++) {
            var character = this.characters[i];
            console.log(character);
            this.board[character.y][character.x] = character;
        }

        gui.setup();
        this.selectFirstCharacter();
        gui.log("=== START PLAYER " + this.currentPlayer + " TURN ===");

    },

    boardClick: function(e) {
        var position = gui.clickPosition(e);
        console.log("current action " + this.currentAction);
        var targetCharacter = this.board[position.y][position.x];

        if ((this.currentAction != null) &&
            (this.currentCharacter.belongsTo == this.currentPlayer)) {
                var distance = this.distance(this.currentCharacter.x, this.currentCharacter.y, position.x, position.y);

                if (this.currentAction.type == "MOVE") {
                    //Walk
                    if (targetCharacter instanceof Character) {
                        this.selectCharacter(targetCharacter);
                    }

                    if ((this.board[position.y][position.x] == null) &&
                        (distance <= this.currentAction.range)) {
                        this.moveCharacter(this.currentCharacter, position.x, position.y);
                        this.clearAction();
                        this.currentCharacter.numActions -= 1;
                        gui.log("Move " + this.currentCharacter.name + " to " + position.x + ", " + position.y);
                    }
                } else {
                    //Atack

                    if ((targetCharacter instanceof Character) &&
                        (distance <= this.currentAction.range)){
                        var target = targetCharacter;
                        var damage = Math.floor((Math.random() * this.currentAction.damage) + 1);

                        gui.log(this.currentAction.name + " from " + this.currentCharacter.name + " to " + targetCharacter.name + " deals " + damage + " damage");


                        target.life -=  damage;

                        if (target.life <= 0) {
                            gui.log(targetCharacter.name + " is dead");
                            this.board[position.y][position.x] = null;
                            var index = this.characters.indexOf(targetCharacter);
                            this.characters.splice(index, 1);
                            this.aliveCharacters[targetCharacter.belongsTo]--;
                            if (this.aliveCharacters[targetCharacter.belongsTo] == 0) {
                                alert("Game over - Winner player " + this.currentPlayer);
                            }

                        }
                        this.currentAction.coolDown = this.currentAction.maxCoolDown;


                        this.clearAction();
                        this.currentCharacter.numActions = 0;
                    }
                }

        } else {
            if (targetCharacter instanceof Character) {
                this.selectCharacter(targetCharacter);
            }
        }
        gui.refresh();

    },

    selectCharacter: function(character){
        this.clearAction();
        this.currentCharacter = character;
        this.selectFirstAction();
    },

    moveCharacter: function(character, x, y){
        console.log("Move from " + character.x+" "+character.y);
        this.board[character.y][character.x] = 0;
        character.x = x;
        character.y = y;
        this.board[character.y][character.x] = character;
        console.log("Move to " + character.x+" "+character.y);
    },


    selectAction: function(imageAction) {
        var action = this.currentCharacter.actions[imageAction.data("number")];
        if ((this.currentAction != action) &&
            (action.coolDown == 0) &&
            (this.currentCharacter.numActions !=0)) {
            this.currentAction = action;
        } else {
            this.clearAction();
        }
        gui.refresh();
    },

    actionEndTurn: function() {
        this.currentPlayer = (this.currentPlayer + 1) % 2;
        for (i=0;i<this.characters.length;i++){
            var character = this.characters[i];
            character.numActions = 2;
            if (character.belongsTo == this.currentPlayer) {
                for (j=0;j<character.actions.length;j++){
                    if (character.actions[j].coolDown > 0) {
                        character.actions[j].coolDown--;
                    }
                }
            }
        }

        this.clearAction();
        alert("Next player");
        this.selectFirstCharacter();
        gui.log("=== START PLAYER " + this.currentPlayer + " TURN ===");
    },

    selectFirstCharacter: function(){
        var character;
        for (i=0;i<this.characters.length;i++) {
            if (this.characters[i].belongsTo == this.currentPlayer){
                this.selectCharacter(this.characters[i]);
                gui.refresh();
                break;
            }
        }
    },

    selectFirstAction: function(){
        var action = $(".action").first();
        if (action.size() == 1) {
            game.selectAction(action);
        } else {
            setTimeout(this.selectFirstAction, 200);
        }
    },

    clearAction: function() {
        this.currentAction = null;
    },

    distance: function(x1, y1, x2, y2) {
        return Math.abs(x1 -x2) + Math.abs(y1 - y2);
    }

};






$(document).ready(function() {
    console.log( "ready!" );
    game.setup();

    $("#board").click(function(e) {
        game.boardClick(e);
    });

    $( "#actions" ).on( "click", ".action", function() {
        game.selectAction($(this));
    });


    $("#actionEndTurn").click(function(e) {
        game.actionEndTurn();
    });
    $("#zoomIn").click(function(e) {
        gui.zoom(100);
    });
    $("#zoomOut").click(function(e) {
        gui.zoom(-100);
    });
});
