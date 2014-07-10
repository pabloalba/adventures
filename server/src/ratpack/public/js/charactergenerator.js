function Character(id, belongsTo, name, imageSrc, srcAtack, life, armor, x, y, actions){
            this.id = id;
            this.belongsTo = belongsTo;
            this.name = name;
            this.src = imageSrc;
            this.image = new Image(),
            this.atackImage = new Image(),
            this.life = life;
            this.maxLife = life;
            this.x = x;
            this.y = y;
            this.numActions = 2;
            this.armor = armor;
            this.srcAtack = srcAtack;

            this.actions = actions;

            this.image.src = imageSrc;
            this.atackImage = srcAtack;
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

function Action(id, type, name, imageSrc, range, minDamage, maxDamage, success, coolDown){
            this.id = id,
            this.name = name;
            this.src = imageSrc,
            this.range = range;
            this.minDamage = minDamage;
            this.maxDamage = maxDamage;
            this.type = type;
            this.coolDown = 0;
            this.maxCoolDown = coolDown;
            this.success = success;
}


var characterGenerator = {
    generate: function(id, belongsTo, name, x, y, type) {
        if (type=='Cleric'){
            return characterGenerator.generateCleric(id, belongsTo, name, x, y);
        } else if (type=='Dwarf'){
            return characterGenerator.generateDwarf(id, belongsTo, name, x, y);
        } else if (type=='Mage'){
            return characterGenerator.generateMage(id, belongsTo, name, x, y);
        } else if (type=='Ranger'){
            return characterGenerator.generateRanger(id, belongsTo, name, x, y);
        } else if (type=='Thief'){
            return characterGenerator.generateThief(id, belongsTo, name, x, y);
        } else if (type=='Warrior'){
            return characterGenerator.generateWarrior(id, belongsTo, name, x, y);
        }
    },

    generateThief: function(id, belongsTo, name, x, y) {
        var actions = [
            new Action(0, "MOVE", "Walk", "/images/walk.png", 5, null, null, 100, 0),
            new Action(1, "ATACK", "Dagger", "/images/dagger.png", 1, 1, 4, 80, 0),
            new Action(2, "ATACK", "Throw dagger", "/images/dagger_throw.png", 3, 1, 4, 70, 0),
            new Action(3, "ATACK", "Throw poisoned dagger", "/images/dagger_throw_poison.png", 3, 2, 12, 70, 2)
        ];
        return new Character(id, belongsTo, name, "/images/thief.png", "/images/thief.gif", 10, 20, x, y, actions);

    },
    generateWarrior: function(id, belongsTo, name, x, y) {
        var actions = [
            new Action(0, "MOVE", "Walk", "/images/walk.png", 4, null, null, 100, 0),
            new Action(1, "ATACK", "Sword", "/images/sword.png", 1, 1, 8, 95, 0),
            new Action(2, "ATACK", "Morningstar", "/images/mace-and-chain.png", 2, 1, 6, 80, 0)
        ];
        return new Character(id, belongsTo, name, "/images/warrior.png", "/images/warrior.gif", 20, 50, x, y, actions);
    },
    generateDwarf: function(id, belongsTo, name, x, y) {
        var actions = [
            new Action(0, "MOVE", "Walk", "/images/walk.png", 3, null, null, 100, 0),
            new Action(1, "ATACK", "Battle Axe", "/images/battleaxe.png", 1, 1, 10, 95, 0),
            new Action(2, "ATACK", "Throw rock", "/images/rock_thrown.png", 3, 1, 4, 85, 0)
        ];
        return new Character(id, belongsTo, name, "/images/dwarf.png","/images/dwarf.gif",  25, 60, x, y, actions);
    },
    generateCleric: function(id, belongsTo, name, x, y) {
        var actions = [
            new Action(0, "MOVE", "Walk", "/images/walk.png", 5, null, null, 100, 0),
            new Action(1, "ATACK", "Quarterstaf", "/images/quarterstaff.png", 1, 1, 6, 95, 0),
            new Action(2, "ATACK", "Sling", "/images/sling.png", 4, 1, 4, 80, 0),
            new Action(3, "ATACK", "Fire rain", "/images/fire-rain.png", 1000, 2, 16, 1000, 4),
        ];
        return new Character(id, belongsTo, name, "/images/cleric.png","/images/cleric.gif",  15, 0, x, y, actions);
    },
    generateMage: function(id, belongsTo, name, x, y) {
        var actions = [
            new Action(0, "MOVE", "Walk", "/images/walk.png", 5, null, null, 100, 0),
            new Action(1, "FLY", "Fly", "/images/fly.png", 1000, null, null, 100, 2),
            new Action(2, "ATACK", "Dagger", "/images/dagger.png", 1, 1, 4, 80, 0),
            new Action(3, "ATACK", "Lighting bolt", "/images/lightning.png", 10, 3, 18, 1000, 3),
        ];
        return new Character(id, belongsTo, name, "/images/mage.png","/images/mage.gif",  10, 0, x, y, actions);
    },
    generateRanger: function(id, belongsTo, name, x, y) {
        var actions = [
            new Action(0, "MOVE", "Walk", "/images/walk.png", 6, null, null, 100, 0),
            new Action(1, "ATACK", "Short sword", "/images/sword-short.png", 1, 1, 6, 90, 0),
            new Action(2, "ATACK", "Bow", "/images/bow.png", 8, 1, 8, 80, 0),
        ];
        return new Character(id, belongsTo, name, "/images/ranger.png","/images/ranger.gif",  15, 30, x, y, actions);
    },

    generateRock: function(x, y) {
        return new Obstacle("/images/rock1.png", x, y, 0, 0);
    },
    generateTree: function(x, y) {
        return new Obstacle("/images/tree.png", x, y, 0, -50);
    }

}
