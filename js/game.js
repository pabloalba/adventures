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



function Character(belongsTo, name, imageSrc, srcAtack, life, armor, x, y, actions){
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
            this.srcAtack = srcAtack;

            this.actions = actions;

            this.image.src = imageSrc;
}

function Obstacle(imageSrc, x, y, offsetX, offsetY){
            this.src = imageSrc;
            this.image = new Image(),
            this.x = x;
            this.y = y;
            this.offsetX = offsetX;
            this.offsetY = offsetY;
            this.image.src = imageSrc;
}

var characterGenerator = {
    generateThief: function(belongsTo, name, x, y) {
        var actions = [
            new Action("MOVE", "Walk", "images/walk.png", 5, null, 100, 0),
            new Action("ATACK", "Dagger", "images/dagger.png", 1, 4, 80, 0),
            new Action("ATACK", "Throw dagger", "images/dagger_throw.png", 3, 2, 70, 0),
            new Action("ATACK", "Throw poisoned dagger", "images/dagger_throw_poison.png", 3, 10, 70, 2)
        ];
        return new Character(belongsTo, name, "images/thief.png", "images/thief.gif", 10, 20, x, y, actions);

    },
    generateWarrior: function(belongsTo, name, x, y) {
        var actions = [
            new Action("MOVE", "Walk", "images/walk.png", 4, null, 100, 0),
            new Action("ATACK", "Sword", "images/sword.png", 1, 8, 95, 0),
            new Action("ATACK", "Morningstar", "images/mace-and-chain.png", 2, 6, 80, 0)
        ];
        return new Character(belongsTo, name, "images/warrior.png", "images/warrior.gif", 20, 50, x, y, actions);
    },
    generateDwarf: function(belongsTo, name, x, y) {
        var actions = [
            new Action("MOVE", "Walk", "images/walk.png", 3, null, 100, 0),
            new Action("ATACK", "Battle Axe", "images/battleaxe.png", 1, 10, 95, 0),
            new Action("ATACK", "Throw rock", "images/rock_thrown.png", 3, 4, 85, 0)
        ];
        return new Character(belongsTo, name, "images/dwarf.png","images/dwarf.gif",  25, 60, x, y, actions);
    },
    generateCleric: function(belongsTo, name, x, y) {
        var actions = [
            new Action("MOVE", "Walk", "images/walk.png", 5, null, 100, 0),
            new Action("ATACK", "Quarterstaf", "images/quarterstaff.png", 1, 8, 95, 0),
            new Action("ATACK", "Sling", "images/sling.png", 4, 3, 80, 0),
            new Action("ATACK", "Fire rain", "images/fire-rain.png", 1000, 10, 1000, 4),
        ];
        return new Character(belongsTo, name, "images/cleric.png","images/cleric.gif",  15, 0, x, y, actions);
    },
    generateMage: function(belongsTo, name, x, y) {
        var actions = [
            new Action("MOVE", "Walk", "images/walk.png", 5, null, 100, 0),
            new Action("MOVE", "Teleport", "images/teleport.png", 1000, null, 100, 2),
            new Action("ATACK", "Dagger", "images/dagger.png", 1, 4, 80, 0),
            new Action("ATACK", "Lighting bolt", "images/lightning.png", 10, 6, 1000, 4),
        ];
        return new Character(belongsTo, name, "images/mage.png","images/mage.gif",  10, 0, x, y, actions);
    },
    generateRanger: function(belongsTo, name, x, y) {
        var actions = [
            new Action("MOVE", "Walk", "images/walk.png", 6, null, 100, 0),
            new Action("ATACK", "Short sword", "images/sword-short.png", 1, 6, 90, 0),
            new Action("ATACK", "Bow", "images/bow.png", 8, 8, 80, 0),
        ];
        return new Character(belongsTo, name, "images/ranger.png","images/ranger.gif",  15, 30, x, y, actions);
    }
}

var gui = {
    base: 72,
    scale: 1,
    setup: function() {
        this.currentPlayer = 0;
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
                this.ctx.strokeStyle="#000000";
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

            if (character == game.currentCharacter) {
                this.ctx.strokeStyle="#FFFFFF";
                gui.ctx.strokeRect(character.x * gui.base, character.y * gui.base, gui.base, gui.base);
            }
        }
    },

    drawObstacles: function() {
        console.log('drawObstacles ' + game.obstacles.length);
        for (i=0; i<game.obstacles.length; i++) {
            var obstacle = game.obstacles[i];
            this.ctx.drawImage(obstacle.image, obstacle.x * this.base + obstacle.offsetX, obstacle.y * this.base + obstacle.offsetY);
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

            $("#characterDetails").html("");

            $("#characterDetails").append("<div>"+game.currentCharacter.name+"</div>");
            $("#characterDetails").append("<div>Armor: " + game.currentCharacter.armor+"</div>");
            $("#characterDetails").append("<div>Life points: " + game.currentCharacter.life + " / " + game.currentCharacter.maxLife+"</div>");
            $("#characterDetails").append("<div>Num actions: " + game.currentCharacter.numActions+ "</div>");


            $("#life").html();
            $("#numActions").html();
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
                    $("#actionDetails").append("<div>Damage: 1-"+game.currentAction.damage+"</div>");
                    if (game.currentAction.maxCoolDown) {
                        $("#actionDetails").append("<div>Cooldown: "+game.currentAction.coolDown+" / "+game.currentAction.maxCoolDown+"</div>");
                    }
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
                this.ctx.fillStyle="#FF7700";
            }

            for (i=0; i<game.reachablePositions.length;i++) {
                var pos = game.reachablePositions[i];
                gui.ctx.fillRect(pos.x * gui.base, pos.y * gui.base, gui.base, gui.base);
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
        this.drawObstacles();
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
        gui.log("===== START PLAYER " + game.currentPlayer + " TURN =====");
        $("#turn").html("Player " + player + " turn");
    },

    log:function(txt){
        $("#log").append("<div>"+txt+"</div>");
    },

    showAtackLightbox: function(atacker, defender, action, result){
        $('#atack-info').find(".title").html(atacker.name + " atacks " +defender.name + " with " + action.name);
        $('#atack-info').find(".atacker").attr('src', atacker.srcAtack);
        $('#atack-info').find(".defender").attr('src', defender.src);
        $('#atack-info').find(".weapon").attr('src', action.src);
        $('#atack-info').find(".result").html(" and " + result);
        $('#atack-info').lightbox_me({
            centered: true
        });
    },
    info: function(txt) {
        $('#info').find(".title").html(txt);
        $('#info').lightbox_me({
            centered: true
        });
    }


}
var game = {
    paused: true,
    sizeX: 20,
    sizeY: 10,
    currentPlayer:0,
    aliveCharacters: [0,0],

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

    start: function(){
        gui.log("====== START PLAYER " + this.currentPlayer + " TURN ======");
        this.selectFirstCharacter();
        this.paused = false;
    },

    addCharacter: function(character) {
        this.characters.push(character);
        this.aliveCharacters[character.belongsTo]++;
        this.board[character.y][character.x] = character;
    },

    addObstacle: function(obstacle) {
        this.obstacles.push(obstacle);
        this.board[obstacle.y][obstacle.x] = obstacle;
    },

    boardClick: function(e) {
        if (!this.paused) {
            if ((this.currentAction != null) &&
                (this.currentCharacter.belongsTo == this.currentPlayer)) {
                    this.boardRightClick(e);
            } else {
                var position = gui.clickPosition(e);
                var targetCharacter = this.board[position.y][position.x];
                if (targetCharacter instanceof Character) {
                    this.selectCharacter(targetCharacter);
                    gui.refresh();
                }
            }
        }
    },

    boardRightClick: function(e) {
        if (!this.paused) {

                var position = gui.clickPosition(e);
                var targetCharacter = this.board[position.y][position.x];

                var distance = this.distance(this.currentCharacter.x, this.currentCharacter.y, position.x, position.y);

                if (this.currentAction.type == "MOVE") {
                    if (targetCharacter instanceof Character) {
                        this.selectCharacter(targetCharacter);
                        gui.refresh();
                    } else {
                        //Move
                        if ((this.board[position.y][position.x] == null) &&
                            (distance <= this.currentAction.range)) {
                            this.moveCharacter(this.currentCharacter, position.x, position.y);
                            this.currentAction.coolDown = this.currentAction.maxCoolDown;
                            this.clearAction();
                            this.currentCharacter.numActions -= 1;
                            gui.log("Move " + this.currentCharacter.name + " to " + position.x + ", " + position.y);

                        }
                    }
                } else {
                    //Atack
                    if ((targetCharacter instanceof Character) &&
                        (targetCharacter.belongsTo != this.currentPlayer) &&
                        (this.onReachables(position.x, position.y)!=null)){
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

            gui.showAtackLightbox(this.currentCharacter, character,  this.currentAction, "deals " + damage + " damage");


            character.life -=  damage;

            if (character.life <= 0) {
                gui.log(character.name + " is dead");
                this.board[character.y][character.x] = null;
                var index = this.characters.indexOf(character);
                this.characters.splice(index, 1);
                this.aliveCharacters[character.belongsTo]--;
                if (this.aliveCharacters[character.belongsTo] == 0) {
                    gui.info("Game over - Winner player " + this.currentPlayer);
                }

            }
        } else {
            gui.log(this.currentAction.name + " from " + this.currentCharacter.name + " to " + character.name + " miss");
            gui.showAtackLightbox(this.currentCharacter, character,  this.currentAction, "miss");
        }
        this.currentAction.coolDown = this.currentAction.maxCoolDown;
        this.currentCharacter.numActions = 0;
    },

    selectCharacter: function(character){
        this.clearAction();
        this.currentCharacter = character;
        this.selectFirstAction();
    },

    drawPath: function() {
        if (game.path.length > 0) {
            var pos = game.path.shift();
            game.currentCharacter.x = pos.x;
            game.currentCharacter.y = pos.y;
            console.log(game.currentCharacter.x + ", " +game.currentCharacter.y);
            gui.refresh();
            setTimeout(game.drawPath, 300);
        }

    },

    moveCharacter: function(character, x, y){
        console.log("Move from " + character.x+" "+character.y);
        this.board[character.y][character.x] = null;

        var path = [];
        var pos = this.onReachables(x, y);
        while (pos.fromX != null) {
            path.unshift(pos);
            pos = this.onReachables(pos.fromX, pos.fromY);
        }
        this.path = path;

        this.drawPath();

        this.board[y][x] = character;
        console.log("Move to " + character.x+" "+character.y);
    },


    selectAction: function(imageAction) {
        if (!this.paused) {
            var action = this.currentCharacter.actions[imageAction.data("number")];
            if ((this.currentAction != action) &&
                (action.coolDown == 0) &&
                (this.currentCharacter.numActions !=0)) {
                this.currentAction = action;
                if (action.type=="MOVE") {
                    this.reachablePositions = this.reachables(this.currentCharacter.x, this.currentCharacter.y, action.range);
                } else {
                    this.reachablePositions = this.onDistance(this.currentCharacter.x, this.currentCharacter.y, action.range);
                }

            } else {
                this.clearAction();
            }
            gui.refresh();
        }
    },

    actionEndTurn: function() {
        if (!this.paused) {
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
            gui.info("Next player");
            this.selectFirstCharacter();
            gui.startTurn(this.currentPlayer);
        }
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
    },

    onDistance: function(charX, charY, range) {
        var positions = [];
        for (y=0; y<this.sizeY; y++) {
            for (x=0; x<this.sizeX; x++) {
                var distance = this.distance(charX, charY, x, y);
                if (distance <=range){
                    positions.push({x:x, y:y, range:distance});
                }
            }
        }
        return positions;
    },

    reachables: function(x, y, range) {
        var positions = [];
        this.addToPositions(positions, x, y, range, null, null);
        var current = 0;
        while (current < positions.length) {
            var pos = positions[current];
            if (pos.range > 0) {
                if (pos.y > 0) {
                    if (this.board[pos.y -1][pos.x] == null) {
                        this.addToPositions(positions, pos.x, pos.y-1, pos.range-1, pos.x, pos.y);
                    }
                }
                if (pos.y < this.sizeY -1) {
                    if (this.board[pos.y +1][pos.x] == null) {
                        this.addToPositions(positions, pos.x, pos.y+1, pos.range-1, pos.x, pos.y);
                    }
                }
                if (pos.x > 0) {
                    if (this.board[pos.y][pos.x-1] == null) {
                        this.addToPositions(positions, pos.x-1, pos.y, pos.range-1, pos.x, pos.y);
                    }
                }
                if (pos.x < this.sizeX-1) {
                    if (this.board[pos.y][pos.x+1] == null) {
                        this.addToPositions(positions, pos.x+1, pos.y, pos.range-1, pos.x, pos.y);
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
        for (i=0; i<this.reachablePositions.length;i++){
            if ((this.reachablePositions[i].x == x) &&
                (this.reachablePositions[i].y == y)){
                    return this.reachablePositions[i];
                }
        }
        return null;
    }

};



function createGame() {
    //obstacles

        game.addObstacle(new Obstacle("images/rock1.png", 7, 8, 0, 0));
        game.addObstacle(new Obstacle("images/rock1.png", 2, 6, 0, 0));
        game.addObstacle(new Obstacle("images/rock1.png", 1, 2, 0, 0));
        game.addObstacle(new Obstacle("images/rock1.png", 8, 1, 0, 0));
        game.addObstacle(new Obstacle("images/tree.png", 5, 4, 0, -50));
        game.addObstacle(new Obstacle("images/tree.png", 10, 7, 0, -50));
        game.addObstacle(new Obstacle("images/tree.png", 4, 9, 0, -50));


        //characters
        game.addCharacter(characterGenerator.generateThief(0, "Arik", 5, 1));
        game.addCharacter(characterGenerator.generateWarrior(1, "Thair", 5, 2));
        game.addCharacter(characterGenerator.generateCleric(0, "Karl", 8, 3));
        game.addCharacter(characterGenerator.generateMage(1, "Zoo", 1, 1));
        game.addCharacter(characterGenerator.generateRanger(0, "LongShot", 8, 5));
        game.addCharacter(characterGenerator.generateDwarf(1, "Tholi", 10, 2));
}




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


    createGame();
    game.start();
});
