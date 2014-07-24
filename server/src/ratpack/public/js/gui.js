var gui = {
    base: 72,
    scale: 1,
    setup: function() {


        $("#gameInfo").append(game.name);

        $(".teams .player0").html(game.playerName[0]+"'s team");
        $(".teams .player1").html(game.playerName[1]+"'s team");




        this.currentPlayer = 0;
        var canvas = $("#board");
        var width = game.sizeX * this.base;
        var height = game.sizeY * this.base;
        canvas.attr("width", width);
        canvas.attr("height", height);

        this.ctx = canvas[0].getContext("2d");
        this.ctx.font="14px Georgia";

        //background
        this.imgBackground = new Image();
        this.imgBackground.src = "/images/grass.png";
        this.imgBackground.onload = this.refresh();

        this.playerAura = [];

        this.playerAura[0] = new Image();
        this.playerAura[0].src = "/images/player1-aura.png";
        this.playerAura[1] = new Image();
        this.playerAura[1].src = "/images/player2-aura.png";

    },

    zoom: function(inc){
        this.clear();

        var canvas = $("#board");

        var baseWidth = game.sizeX * this.base + 50;
        var baseHeight = game.sizeY * this.base;

        var width = canvas.width() + inc;

        var scale =  width / baseWidth;

        canvas.attr("width", width);
        canvas.attr("height", baseHeight * scale);
        this.ctx.scale(scale,scale);
        this.scale = scale;

        this.refresh();
    },

    drawBackground: function() {
        for (x=0; x<game.sizeX; x++) {
            for (y=0; y<game.sizeY; y++) {
                gui.ctx.drawImage(gui.imgBackground, x * gui.base, y * gui.base);
                this.ctx.strokeStyle="#000000";
                gui.ctx.strokeRect(x * gui.base, y * gui.base, gui.base, gui.base);
            }
        }
    },


    drawCharacters: function() {
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


    drawTeams: function() {
        $(".team0").html("");
        $(".team1").html("");

        for (i=0; i<game.characters.length; i++) {
            var character = game.characters[i];
            var team = $(".team"+character.belongsTo);

            var member = $("<div />");
            member.addClass("memberContainer");
            if (character == game.currentCharacter) {
                $(member).addClass("teamMemberSelected");
            }

            var image = new Image();
            image.src = character.src;
            $(image).data("num", i);
            $(image).addClass("teamMember");
            if (character.numActions <=0) {
                $(image).addClass("grayscale");
            }


            member.append(image);



            var data = $("<div />");
            data.addClass("teamMemberData");
            data.html(character.life+" / "+character.maxLife);

            member.append(data);




            team.append(member);
        }
    },

    drawObstacles: function() {
        for (i=0; i<game.obstacles.length; i++) {
            var obstacle = game.obstacles[i];
            this.ctx.drawImage(obstacle.image, obstacle.x * this.base + obstacle.offsetX, obstacle.y * this.base + obstacle.offsetY);
        }
    },

    drawProbabilities: function() {
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
                var span = $("<span />");
                span.css("position","relative");
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

                span.append($(image))

                $("#actions").append(span);

                if (game.currentCharacter.actions[i].coolDown > 0) {
                    span.append("<span class='cooldown'>"+game.currentCharacter.actions[i].coolDown+"</span>");
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
                    $("#actionDetails").append("<div>Damage: "+game.currentAction.minDamage+"-"+game.currentAction.maxDamage+"</div>");
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
        this.drawTeams();
    },

    clickPosition: function(e) {
        var offset = $("#board").offset();
        var left = (e.clientX - offset.left) / this.scale;
        var top = (e.clientY - offset.top) / this.scale;
        var x = Math.floor(left/this.base);
        var y = Math.floor(top/this.base);

        return  {x:x , y:y}
    },

    startTurn: function (name) {
        gui.log("====== START " + name + "'s TURN ======");
        gui.info(name + "'s turn");
        $("#turn").html(name + "'s turn");
    },

    log:function(txt){
        $("#log").append("<div>"+txt+"</div>");
    },

    showAtackLightbox: function(atacker, defender, action, result, winnerName){
        $('#atack-info').find(".title").html(atacker.name + " atacks " +defender.name + " with " + action.name);
        $('#atack-info').find(".atacker").attr('src', atacker.srcAtack);
        $('#atack-info').find(".defender").attr('src', defender.src);
        $('#atack-info').find(".weapon").attr('src', action.src);
        $('#atack-info').find(".result").html(" and " + result);
        game.drawing = true;
        if (winnerName) {
            gui.winnerName = winnerName;
        }

        gui.lightbox($('#atack-info'), function(){
            if (gui.winnerName) {
                gui.info("Game over - Winner " + gui.winnerName);
            }
        });

    },
    info: function(txt) {
        $('#info').find(".title").html(txt);
        game.drawing = true;
        gui.lightbox($("#info"));
    },

    lightbox: function(element, onClose) {
        var overlay = $('<div class="overlay"/>');
        $("body").append(overlay);
        gui.lightboxOnClose = onClose;
        gui.lightboxElement = element;

        gui.lightboxElement.show();

        setTimeout(gui.closeLightbox, 5000);
    },

    closeLightbox: function(element) {
        gui.lightboxElement.hide();
        $(".overlay").remove();
        game.drawing = false;
        gui.refresh();
        if (gui.lightboxOnClose) {
            gui.lightboxOnClose();
        }
    }


}
