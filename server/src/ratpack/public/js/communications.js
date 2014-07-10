function RemoteCommand(type, characterNum, actionNum, targetCharacterNum, x , y, damage){
    this.type = type
    this.characterNum = characterNum;
    this.actionNum = actionNum,
    this.targetCharacterNum = targetCharacterNum;
    this.x = x;
    this.y = y;
    this.damage = damage;
    this.messageNumber = -1;
}


var communications = {
    messageNumber: 0,
    hasError: false,

    pool: function() {
        $.ajax({
            url: "/api/game/"+game.id+"/action",
            data : {'playerId':game.playerId, 'num':game.remoteCommandNumber},
            success: function(data) {
                if (data.success) {
                    game.remoteCommandNumber++;

                    var commandDataString = data.action.actionData;

                    var actionData = JSON.parse(commandDataString)

                    var remoteCommand = new RemoteCommand(actionData.type, actionData.characterNum, actionData.actionNum, actionData.targetCharacterNum, actionData.x , actionData.y, actionData.damage)
                    game.remoteCommandList.push(remoteCommand);
                    console.log(data);
                    setTimeout(communications.pool, 2000);
                } else {
                    setTimeout(communications.pool, 5000);
                }
           },
           timeout: 30000, // sets timeout to 30 seconds
           dataType: "json",
           error: function(jqXHR, textStatus){
                //retry
                setTimeout(communications.pool, 1000);
            },
        });
    },

    sendRemoteCommand: function(remoteCommand){
        var commandData = {
            type: remoteCommand.type,
            characterNum: remoteCommand.characterNum,
            actionNum: remoteCommand.actionNum,
            targetCharacterNum: remoteCommand.targetCharacterNum,
            x: remoteCommand.x,
            y: remoteCommand.y,
            damage: remoteCommand.damage,
            messageNumber: communications.messageNumber++
        };
        communications.sendRemoteCommandData(commandData);
    },


    sendRemoteCommandData: function(commandData){
        var commandDataString = JSON.stringify(commandData);
        var data = {playerId:game.playerId, actionData:commandDataString, messageNumber:commandData.messageNumber}
        $.ajax({
            url : "/api/game/"+game.id+"/action",
            type: "POST",
            data : data,
            dataType: "json",
            success: function(data){
                if (communications.hasError) {
                    communications.hasError = false;
                    console.log("ERROR FIX");
                }
                console.log("Remote command sent");
                console.log(data);
            },
            error: function (jqXHR, textStatus, errorThrown){
                console.log('ERROR');
                communications.hasError = true;
                //retry?
                setTimeout(function(){
                    communications.sendRemoteCommandData(commandData);
                }, 1000);
            }
        });
    }
}
