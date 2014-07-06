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



function Character(belongsTo, name, imageSrc, life, armor, x, y, actions){
            this.belongsTo = belongsTo;
            this.name = name;
            this.src = imageSrc;
            this.image = new Image(),
            this.life = life;
            this.maxLife = life;
            this.x = x;
            this.y = y;
            this.numActions = 2;
            this.armor = armor;

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
        return new Character(belongsTo, name, "images/thief.png", 10, 20, x, y, actions);

    },
    generateWarrior: function(belongsTo, name, x, y) {
        var actions = [
            new Action("MOVE", "Walk", "images/walk.png", 4, null, 100, 0),
            new Action("ATACK", "Sword", "images/sword.png", 1, 8, 95, 0),
            new Action("ATACK", "Morningstar", "images/mace-and-chain.png", 2, 6, 80, 0)
        ];
        return new Character(belongsTo, name, "images/warrior.png", 20, 50, x, y, actions);
    },
    generateCleric: function(belongsTo, name, x, y) {
        var actions = [
            new Action("MOVE", "Walk", "images/walk.png", 5, null, 100, 0),
            new Action("ATACK", "Quarterstaf", "images/quarterstaff.png", 1, 8, 95, 0),
            new Action("ATACK", "Sling", "images/sling.png", 4, 3, 80, 0),
            new Action("ATACK", "Fire rain", "images/fire-rain.png", 10, 1000, 1000, 4),
        ];
        return new Character(belongsTo, name, "images/cleric.png", 15, 0, x, y, actions);
    },
    generateMage: function(belongsTo, name, x, y) {
        var actions = [
            new Action("MOVE", "Walk", "images/walk.png", 5, null, 100, 0),
            new Action("MOVE", "Teleport", "images/teleport.png", 1000, null, 100, 2),
            new Action("ATACK", "Dagger", "images/dagger.png", 1, 4, 80, 0),
            new Action("ATACK", "Lighting bolt", "images/lightning.png", 10, 6, 1000, 4),
        ];
        return new Character(belongsTo, name, "images/mage.png", 10, 0, x, y, actions);
    },
    generateRanger: function(belongsTo, name, x, y) {
        var actions = [
            new Action("MOVE", "Walk", "images/walk.png", 6, null, 100, 0),
            new Action("ATACK", "Short sword", "images/sword-short.png", 1, 6, 90, 0),
            new Action("ATACK", "Bow", "images/bow.png", 8, 8, 80, 0),
        ];
        return new Character(belongsTo, name, "images/ranger.png", 15, 0, x, y, actions);
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
        this.ctx.font="14px Georgia";

        //background
        this.imgBackground = new Image();
        this.imgBackground.src = "images/grass.png";
        this.imgBackground.onload = this.refresh();

        this.playerAura = [];

        this.playerAura[0] = new Image();
        this.playerAura[0].src = "images/player1-aura.png";
        this.playerAura[1] = new Image();
        this.playerAura[1].src = "images/player2-aura.png";

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
            if (this.playerAura) {
                this.ctx.drawImage(this.playerAura[character.belongsTo], character.x * this.base -36, character.y * this.base - 36);
            }
        }
    },

    drawProbabilities: function() {
        console.log('drawProbabilities ' + game.characters.length);

        if ((game.currentAction) &&
            (game.currentAction.type=="ATACK")){

            for (i=0; i<game.characters.length; i++) {
                var character = game.characters[i];

                if ((character.belongsTo != game.currentCharacter.belongsTo) &&
                    (game.distance(game.currentCharacter.x, game.currentCharacter.y, character.x, character.y) <= game.currentAction.range)) {
                    var probability = game.probability(character);
                    if (probability > 100) {
                        probability = 100;
                    }
                    if (probability < 0) {
                        probability = 0;
                    }

                    this.ctx.fillStyle="#FF0000";
                    this.ctx.fillText(probability + "%", character.x * this.base + 45, character.y * this.base + 15);
                }
            }
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


            $("#life").html("Life points: " + game.currentCharacter.life + " / " + game.currentCharacter.maxLife);
            $("#numActions").html("Num actions: " + game.currentCharacter.numActions);
            $("#characterName").html(game.currentCharacter.name);

            $("#actionDetails").html("");
            if (game.currentAction) {
                $("#actionDetails").append("<div>" + game.currentAction.name + " (" + game.currentAction.type.toLowerCase() + ") </div>");
                if (game.currentAction.type == "ATACK") {
                    var probability = game.currentAction.success;
                    if (probability > 100) {
                        probability = 100;
                    }
                    if (probability < 0) {
                        probability = 0;
                    }
                    $("#actionDetails").append("<div>Success base: "+probability+"%</div>");
                }
            }

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
        this.drawProbabilities();
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

    startTurn: function (player) {
        gui.log("=== START PLAYER " + this.currentPlayer + " TURN ===");
        $("#turn").html("Player " + player + " turn");
    },

    log:function(txt){
        $("#log").append("<div>"+txt+"</div>");
    }


}
var game = {
    sizeX: 20,
    sizeY: 10,
    currentPlayer:0,
    aliveCharacters: [0,0],
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
        this.addCharacter(characterGenerator.generateThief(0, "Arik", 5, 1));
        this.addCharacter(characterGenerator.generateWarrior(1, "Thair", 5, 2));
        this.addCharacter(characterGenerator.generateCleric(0, "Karl", 8, 3));
        this.addCharacter(characterGenerator.generateMage(1, "Zoo", 1, 1));
        this.addCharacter(characterGenerator.generateRanger(0, "LongShot", 8, 5));

        for (i=0; i<this.characters.length; i++) {
            var character = this.characters[i];
            console.log(character);
            this.board[character.y][character.x] = character;
        }

        gui.setup();
        this.selectFirstCharacter();
        gui.log("====== START PLAYER " + this.currentPlayer + " TURN ======");

    },

    addCharacter: function(character) {
        this.characters.push(character);
        this.aliveCharacters[character.belongsTo]++;
    },

    boardClick: function(e) {
        var position = gui.clickPosition(e);
        var targetCharacter = this.board[position.y][position.x];
        if (targetCharacter instanceof Character) {
            this.selectCharacter(targetCharacter);
            gui.refresh();
        }
    },

    boardRightClick: function(e) {
        if ((this.currentAction != null) &&
            (this.currentCharacter.belongsTo == this.currentPlayer)) {
                var position = gui.clickPosition(e);
                var targetCharacter = this.board[position.y][position.x];

                var distance = this.distance(this.currentCharacter.x, this.currentCharacter.y, position.x, position.y);

                if (this.currentAction.type == "MOVE") {
                    //Move
                    if ((this.board[position.y][position.x] == null) &&
                        (distance <= this.currentAction.range)) {
                        this.moveCharacter(this.currentCharacter, position.x, position.y);
                        this.currentAction.coolDown = this.currentAction.maxCoolDown;
                        this.clearAction();
                        this.currentCharacter.numActions -= 1;
                        gui.log("Move " + this.currentCharacter.name + " to " + position.x + ", " + position.y);

                    }
                } else {
                    //Atack
                    if ((targetCharacter instanceof Character) &&
                        (distance <= this.currentAction.range)){
                        this.atack(targetCharacter);
                        this.clearAction();
                    }
                }
                gui.refresh();
        }
    },

    atack: function(character){
        var probability = this.probability(character);
        if ((Math.random() * 100) < probability) {


            var damage = Math.floor((Math.random() * this.currentAction.damage) + 1);

            gui.log(this.currentAction.name + " from " + this.currentCharacter.name + " to " + character.name + " deals " + damage + " damage");


            character.life -=  damage;

            if (character.life <= 0) {
                gui.log(character.name + " is dead");
                this.board[character.y][character.x] = null;
                var index = this.characters.indexOf(character);
                this.characters.splice(index, 1);
                this.aliveCharacters[character.belongsTo]--;
                if (this.aliveCharacters[character.belongsTo] == 0) {
                    alert("Game over - Winner player " + this.currentPlayer);
                }

            }
        } else {
            gui.log(this.currentAction.name + " from " + this.currentCharacter.name + " to " + character.name + " miss");
        }
        this.currentAction.coolDown = this.currentAction.maxCoolDown;
        this.currentCharacter.numActions = 0;
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
        gui.startTurn(this.currentPlayer);
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
    },

    probability: function(character) {
        return this.currentAction.success - character.armor;
    }

};






$(document).ready(function() {
    console.log( "ready!" );
    document.oncontextmenu = function() {return false;};
    game.setup();

    $("#board").click(function(e) {
        game.boardClick(e);
    });

    $("#board").mousedown(function(e) {
        if( e.button == 2 ) {
            game.boardRightClick(e);
            return false;
        }
        return true;
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
