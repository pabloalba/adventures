$(document).ready(function() {
    console.log( "ready!" );
    var playerId;


    $('.dataForm').submit(function(event){
        // cancels the form submission
        event.preventDefault();
    });

    var getData = function() {
        var data = {
            playerName: $( "input[name='playerName']" ).val(),
            character1Name: $( "input[name='character1Name']" ).val(),
            character2Name: $( "input[name='character2Name']" ).val(),
            character3Name: $( "input[name='character3Name']" ).val(),
            character4Name: $( "input[name='character4Name']" ).val(),
            character1Type: $( "select[name='character1Type']" ).val(),
            character2Type: $( "select[name='character2Type']" ).val(),
            character3Type: $( "select[name='character3Type']" ).val(),
            character4Type: $( "select[name='character4Type']" ).val(),
            gameName: $( "input[name='gameName']" ).val()
        }

        if (
            (data['playerName'] != "") &&
            (data['character1Name'] != "") &&
            (data['character2Name'] != "") &&
            (data['character3Name'] != "") &&
            (data['character4Name'] != "")) {
                return data;
        }
        return null;
    }



    $(".createButton").click(function(e) {

        $('.gameName').attr("required", "required");
        $('#submitButton').click();

        var data = getData();
        if ((data != null) && ((data['gameName'] != ""))) {
                $.ajax({
                    url : "/api/game",
                    type: "POST",
                    data : data,
                    dataType: "json",
                    success: function(data){
                        playerId = data.game.player1Id
                        $(".gameManager").addClass("hide");
                        $(".gameWait").removeClass("hide");
                        pool(data.game.gameId);
                    },
                    error: function (jqXHR, textStatus, errorThrown){
                        alert('error');
                    }
                });
            }

    });



    $(".joinButton").click(function(e) {
        $('.gameName').removeAttr("required");
        $('#submitButton').click();

        var data = getData();
        if (data != null) {
            var gameId = $(this).data('gameid');
            $.ajax({
                url : "/api/game/"+gameId,
                type: "POST",
                data : data,
                dataType: "json",
                success: function(data){
                    playerId = data.game.player2Id
                    document.location = "/game/"+data.game.gameId+"?playerId="+playerId;
                },
                error: function (jqXHR, textStatus, errorThrown){
                    alert('error');
                }
            });
        }


    });


    var pool = function(gameId) {
        $.ajax({
            url: "api/game/"+gameId,
            success: function(data) {
                if (data.player2Name) {
                    document.location = "/game/"+data.gameId+"?playerId="+playerId;
                } else {
                    setTimeout(function() {pool(gameId)}, 2000);
                }
           },
           timeout: 30000, // sets timeout to 30 seconds
           dataType: "json",
           error: function(jqXHR, textStatus){
                alert('error');
            },
        });
    }

});
