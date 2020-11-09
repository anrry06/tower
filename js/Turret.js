class Turret {
    constructor(options) {
        this.options = Object.assign({
            x: null,
            y: null,
            dmg: 10,
            speed: 2, //shoot/second,
            range: null,
            resetCannonMs: 10,
            shootingCannonMs: 150,
            game: null
        }, options);

        this.game = this.options.game;

        this.id = this.options.game.turrets.length;
        debugLow(`TURRET ID ${this.id}`)

        this.game.grid.setWalkableAt(this.options.x, this.options.y, false);

        this.options.range = this.options.range || this.game.squareSize * 2;

        // debugLow(this);
        // debugLow(this.options);

        this.build()
    }

    build(){
        this.buildBody();
        this.buildCannon();
        this.buildRange();

        this.set = this.game.board.paper.set();
        this.set.push(
            this.square,
            this.circle,
            this.cannon
        );

        this.set.mouseover((e) => {
            this.rangeCircle.show()
        })

        this.set.mouseout((e) => {
            this.rangeCircle.hide()
        })
 
        this.turretSet = this.game.board.paper.set();
        this.turretSet.push(
            this.circle,
            this.cannon
        );

        this.resetCannon();
   }

    buildBody(){
        let coord = this.game.board.coord.toMouse(this.options.x, this.options.y, this.game.squareSize);
        this.square = this.game.board.paper.rect(...coord, this.game.squareSize, this.game.squareSize);
        this.square.attr(config.squareStyle.yellow);

        let center = coord.map(c => c + (this.game.squareSize / 2));
        this.circle = this.game.board.paper.circle(...center, this.game.squareSize / 4);
        this.circle.attr({ fill: config.squareStyle.red.fill });
    }

    buildCannon(){
        let coord = this.game.board.coord.toMouse(this.options.x, this.options.y, this.game.squareSize);
        let center = coord.map(c => c + (this.game.squareSize / 2));
        let cannonCoord = [coord[0] + (this.game.squareSize / 2) - 1, center[1]];
        this.cannon = this.game.board.paper.rect(...cannonCoord, 2, this.game.squareSize / 2);
        this.cannon.attr(config.squareStyle.blue);
    }

    buildRange(){
        let coord = this.game.board.coord.toMouse(this.options.x, this.options.y, this.game.squareSize);
        let center = coord.map(c => c + (this.game.squareSize / 2));
        this.rangeCircle = this.game.board.paper.circle(...center, this.options.range);
        this.rangeCircle.attr({ stroke: config.squareStyle.red.fill });
        this.rangeCircle.hide();
    }

    resetCannon(animate){
        let data = this.getRotationData(this.game.entrySquares[0].attr('x'), this.game.entrySquares[0].attr('y'));
        
        if(animate){
            let animParams = {
                transform: `r${data.angle} ${data.center.x} ${data.center.y}`
            }
            let anim = Raphael.animation(animParams, this.options.resetCannonMs, 'linear');
            this.turretSet.animate(anim);
        }
        else {
            this.turretSet.transform(`r${data.angle} ${data.center.x} ${data.center.y}`);
        }
    }

    start() {
        let prevEnemy = null;
        debug(`Turret ${this.id}: Searching for an enemy`);

        this.game.timer.addTask({
            ms: 10,
            key: `turret-${this.id}`,
            fn: () => {
                if (this.game.state === 0) {
                    debug(`Turret ${this.id}: No enemy left`);
                    this.disableFollow();
                    this.resetCannon(true);
                    this.game.timer.removeTask(`turret-${this.id}`);
                    this.game.timer.removeTask(`turret-follow-${this.id}`);
                    return;
                }
    
                let enemy = this.search();
                if (enemy && enemy !== prevEnemy) {
                    debug(`Turret ${this.id}: Found an enemy`);
                    this.enableFollow(enemy, enemy === prevEnemy);
                    this.startShooting(enemy, enemy === prevEnemy);
                    prevEnemy = enemy;
                }
    
                if(!enemy){
                    this.disableFollow();
                }
            }
        })
    }

    restart(){
        this.game.timer.removeTask(`turret-${this.id}`);
        this.game.timer.removeTask(`turret-follow-${this.id}`);
        this.start();
    }

    search() {
        let found = { enemy: null, diff: null };
        this.game.enemies.forEach(enemy => {
            let coord = this.game.board.coord.toMouse(this.options.x, this.options.y, this.game.squareSize);
            let center = coord.map(c => c + (this.game.squareSize / 2));

            let diffX = Math.abs(enemy.getCenterX() - center[0]);
            let diffY = Math.abs(enemy.getCenterY() - center[1]);
            if (diffX <= this.options.range && diffY <= this.options.range) {
                let diff = diffX + diffY;
                if(!found.diff || diff < found.diff){
                    found.enemy = enemy;
                    found.diff = diff;
                }
            }
        });

        return found.enemy;
    }

    shoot(){
        this.cannon.animate(config.squareStyle.yellow, this.options.shootingCannonMs, 'linear', () => {
            this.cannon.animate(config.squareStyle.blue, this.options.shootingCannonMs, 'linear')
        })
    }

    startShooting(enemy, same){
        if(this.reload === true || (this.shootingTimeout && same === true)){
            return;
        }

        clearTimeout(this.shootingTimeout);

        debug(`Turret ${this.id}: Shooting on an new enemy`);
        enemy.removeHp(this.options.dmg);
        this.shoot();
        this.reload = true;

        this.shootingTimeout = setTimeout(() => {
            this.reload = false;
        }, 1000 / this.options.speed);
    }

    enableFollow(enemy, same){
        if(same === true){
            return;
        }

        this.game.timer.removeTask(`turret-follow-${this.id}`);

        debug(`Turret ${this.id}: Following new enemy`);
        this.game.timer.addTask({
            ms: 10,
            key: `turret-follow-${this.id}`,
            fn: () => {
                let data = this.getRotationData(enemy.getCenterX(), enemy.getCenterY());
                let animParams = {
                    transform: `r${data.angle} ${data.center.x} ${data.center.y}`
                }
                let anim = Raphael.animation(animParams, 10, 'linear');
                this.turretSet.animate(anim);
            }
        });
    }

    disableFollow(){
        debug(`Turret ${this.id}: Stop following enemy`);
        this.game.timer.removeTask(`turret-follow-${this.id}`);
    }

    getAngle(p1, p2) {
        let angleRadians = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        let angleDeg = angleRadians * 180 / Math.PI;

        return {
            rad: angleRadians,
            deg: angleDeg
        }
    }

    getRotationData(x, y){
        let coord = this.game.board.coord.toMouse(this.options.x, this.options.y, this.game.squareSize);
        let center = coord.map(c => {
            return c + (this.game.squareSize / 2);
        });

        let angle = this.getAngle({
            x: center[0],
            y: center[1]
        }, {
            x: x,
            y: y
        });

        angle = angle.deg - 90;

        if(this.prevAngle < 0 && angle > 0){
            angle -= 360;
        }

        this.prevAngle = angle;

        return {
            angle: angle,
            center: {
                x: center[0],
                y: center[1]
            }
        }
    }
}

class RedTurret extends Turret{
    constructor(options){
        options = Object.assign({
            x: null,
            y: null,
            dmg: 10,
            speed: 2, //shoot/second,
            range: null,
            resetCannonMs: 10,
            shootingCannonMs: 150,
            game: null
        }, options);

        super(options);
        this.options = options;
    }

    buildBody(){
        let coord = this.game.board.coord.toMouse(this.options.x, this.options.y, this.game.squareSize);
        this.square = this.game.board.paper.rect(...coord, this.game.squareSize, this.game.squareSize);
        this.square.attr(config.squareStyle.red);

        let center = coord.map(c => c + (this.game.squareSize / 2));
        this.circle = this.game.board.paper.circle(...center, this.game.squareSize / 4);
        this.circle.attr({ fill: config.squareStyle.yellow.fill });
    }

    buildCannon(){
        let coord = this.game.board.coord.toMouse(this.options.x, this.options.y, this.game.squareSize);
        let center = coord.map(c => c + (this.game.squareSize / 2));
        let cannonCoord = [coord[0] + (this.game.squareSize / 2) - 1, center[1]];
        this.cannon = this.game.board.paper.rect(...cannonCoord, 2, this.game.squareSize / 2);
        this.cannon.attr(config.squareStyle.blue);
    }

}