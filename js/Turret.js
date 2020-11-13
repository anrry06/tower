class Turret {
    constructor(options) {
        this.options = Object.assign({
            x: null,
            y: null,
            dmg: 10,
            speed: 1, //shoot/second,
            range: 2,
            resetCannonMs: 2050,
            shootingCannonMs: 150,
            size: null,
            style: {
                body: 'yellow',
                turret: 'red',
                cannon: 'blue',
                shoot: 'yellow',
                reload: 'green'
            },
            name: null,
            data: null,
            game: null
        }, options);

        this.game = this.options.game;
        this.size = this.options.size || this.game.squareSize;
        this.style = this.options.style;
        this.reloading = false;
        this.shooting = false;
        this.following = false;
        this.upgradeLevel = -1;

        this.id = this.options.game.turrets.length;
        debugLow(`TURRET ID ${this.id}`)

        let gridSize = this.size / this.game.squareSize;
        this.matrix = [[this.options.x, this.options.y]];
        if (gridSize > 1) {
            this.matrix.push([this.options.x, this.options.y + 1])
            this.matrix.push([this.options.x + 1, this.options.y + 1])
            this.matrix.push([this.options.x + 1, this.options.y])
        }

        this.options.range = this.options.range * this.size;
        // console.log(this.options);
        // debugLow(this);
        // debugLow(this.options);
    }

    blockPath() {
        let gridSize = this.size / this.game.squareSize;
        for (let i = 0; i < gridSize; i++) {
            this.game.grid.setWalkableAt(this.options.x + i, this.options.y, false);
            this.game.grid.setWalkableAt(this.options.x, this.options.y + i, false);
            this.game.grid.setWalkableAt(this.options.x + i, this.options.y + i, false);
        }
    }

    unblockPath() {
        let gridSize = this.size / this.game.squareSize;
        for (let i = 0; i < gridSize; i++) {
            this.game.grid.setWalkableAt(this.options.x + i, this.options.y, true);
            this.game.grid.setWalkableAt(this.options.x, this.options.y + i, true);
            this.game.grid.setWalkableAt(this.options.x + i, this.options.y + i, true);
        }
    }

    build() {
        if (this.options.sound) {
            this.sound = new sound(this.options.sound);
        }

        this.buildBody();
        this.buildTurret();
        this.buildCannon();
        this.buildRange();

        this.set = this.game.board.paper.set();
        this.set.push(
            this.body,
            this.turret,
            this.cannon
        );

        this.set.mouseover((e) => {
            this.rangeCircle.show()
        })

        this.set.mouseout((e) => {
            this.rangeCircle.hide()
        })

        this.set.click((e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('click turret set');
            this.game.controls.displayUpgrade(this);
            this.game.controls.disableTurretSelection()
        })

        this.turretSet = this.game.board.paper.set();
        this.turretSet.push(
            this.turret,
            this.cannon
        );

        this.resetCannon();
    }

    buildBody() {
        let coord = this.game.board.coord.toMouse(this.options.x, this.options.y, this.game.squareSize);
        this.body = this.game.board.paper.rect(...coord, this.size, this.size);
        this.body.attr(config.squareStyle[this.style.body]);
    }

    buildTurret() {
        let coord = this.game.board.coord.toMouse(this.options.x, this.options.y, this.game.squareSize);
        let center = coord.map(c => c + (this.size / 2));
        this.turret = this.game.board.paper.circle(...center, this.size / 4);
        this.turret.attr({ fill: config.squareStyle[this.style.turret].fill });
    }

    buildCannon() {
        let coord = this.game.board.coord.toMouse(this.options.x, this.options.y, this.game.squareSize);
        let center = coord.map(c => c + (this.size / 2));
        let cannonCoord = [coord[0] + (this.size / 2) - 1, center[1]];
        this.cannon = this.game.board.paper.rect(...cannonCoord, 2, this.size / 2);
        this.cannon.attr(config.squareStyle[this.style.cannon]);
    }

    buildRange() {
        let coord = this.game.board.coord.toMouse(this.options.x, this.options.y, this.game.squareSize);
        let center = coord.map(c => c + (this.size / 2));
        this.rangeCircle = this.game.board.paper.circle(...center, this.options.range);
        this.rangeCircle.attr({ stroke: config.squareStyle.red.fill });
        this.rangeCircle.hide();
    }

    resetCannon(animate) {
        let data = this.getRotationData(this.game.entrySquares[0].attr('x'), this.game.entrySquares[0].attr('y'));

        if (animate) {
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
        this.prevEnemy = null;
        debug(`Turret ${this.id}: Searching for an enemy`);

        this.game.timer.addTask({
            cptInterval: 1,
            key: `turret-${this.id}`,
            fn: () => {
                if (this.game.state === 0) {
                    debug(`Turret ${this.id}: No enemy left`);
                    this.disableFollow('no more enemy');
                    // this.resetCannon(true);
                    this.game.timer.removeTask(`turret-${this.id}`);
                    this.game.timer.removeTask(`turret-follow-${this.id}`);
                    return;
                }

                if (this.following === false) {
                    this.enemy = this.search();
                    let same = this.enemy === this.prevEnemy;
                    // console.log(this.enemy.id, this.prevEnemy.id, )
                    this.prevEnemy = this.enemy;
                    if (this.enemy !== null) {
                        if (same === false)
                            debug(`Turret ${this.id}: Found ${same ? 'same' : 'a new'} enemy ${this.enemy.id}`);
                        // console.log(same)
                        this.enableFollow(same);
                    }
                    else if (this.game.enemies.length > 0 && !this.enemy) {
                        this.disableFollow('enemy null');
                    }
                }
            }
        })
    }

    restart() {
        this.game.timer.removeTask(`turret-${this.id}`);
        this.game.timer.removeTask(`turret-follow-${this.id}`);
        this.start();
    }

    search() {
        let found = { enemy: null, diff: null };
        this.game.enemies.forEach(enemy => {
            if (enemy.destroyed === true) {
                return;
            }
            let coord = this.game.board.coord.toMouse(this.options.x, this.options.y, this.game.squareSize);
            let center = coord.map(c => c + (this.size / 2));

            let diffX = Math.abs(enemy.getCenterX() - center[0]);
            let diffY = Math.abs(enemy.getCenterY() - center[1]);
            if (diffX <= this.options.range && diffY <= this.options.range) {
                let diff = diffX + diffY;
                if (!found.diff || diff < found.diff) {
                    found.enemy = enemy;
                    found.diff = diff;
                }
            }
        });

        return found.enemy;
    }

    enableFollow(same) {
        if (this.shooting === true) {
            return;
        }

        debug(`Turret ${this.id}: Following new enemy ${this.enemy.id}`);
        this.following = true;
        this.game.timer.addTask({
            cptInterval: 1,
            key: `turret-follow-${this.id}`,
            fn: () => {
                let data = this.getRotationData(this.enemy.getCenterX(), this.enemy.getCenterY());
                let animParams = {
                    transform: `r${data.angle} ${data.center.x} ${data.center.y}`
                }
                this.turretSet.animate(animParams, 10, 'linear', () => {
                    if (this.enemy) {
                        if (this.shooting === false && this.enemy.destroyed === false) {
                            this.startShooting();
                        }
                        else if (this.enemy.destroyed === true) {
                            if (this.following === true) console.log(this.enemy)
                            this.disableFollow('follow enemy destroyed ' + this.enemy.id)
                        }
                    }
                });
            }
        });
    }

    disableFollow(from) {
        if (this.following === true) {
            debug(`Turret ${this.id}: Stop following enemy`, '-', from);
            this.game.timer.removeTask(`turret-follow-${this.id}`);
            this.following = false;
        }
    }

    startShooting() {
        if (this.reloading === true) {
            return;
        }

        this.shooting = true;

        debug(`Turret ${this.id}: Shooting on an new enemy ${this.enemy.id}`);
        this.shoot();
        this.reloading = true;

        this.body.attr({ fill: config.squareStyle[this.style.reload].fill });
        this.body.animate(config.squareStyle[this.style.body], 1000 / this.options.speed, 'linear', () => {
            this.reloading = false;
        })
    }

    shoot() {
        if (this.sound) {
            this.sound.play();
        }

        this.cannon.animate(config.squareStyle[this.style.shoot], this.options.shootingCannonMs, 'linear', () => {
            this.cannon.animate(config.squareStyle[this.style.cannon], this.options.shootingCannonMs, 'linear')
        })

        let coord = this.game.board.coord.toMouse(this.options.x, this.options.y, this.game.squareSize);
        let center = coord.map(c => c + (this.size / 2));
        let bulletCoord = [coord[0] + (this.size / 2), center[1]];
        // let bullet = this.game.board.paper.rect(...bulletCoord, 10, 10)
        let bullet = this.game.board.paper.circle(...bulletCoord, 5);
        bullet.attr({ fill: config.squareStyle[this.style.turret].fill })
        bullet.animate({
            cx: this.enemy.getCenterX(),
            cy: this.enemy.getCenterY()
        }, 150, 'linear', () => {
            if (this.sound) {
                this.sound.stop();
            }
            if (this.enemy) {
                this.enemy.removeHp(this.options.dmg);
            }
            bullet.remove();
            this.disableFollow('shoot');
            this.shooting = false;
        })
    }

    getAngle(p1, p2) {
        let angleRadians = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        let angleDeg = angleRadians * 180 / Math.PI;

        return {
            rad: angleRadians,
            deg: angleDeg
        }
    }

    getRotationData(x, y) {
        let coord = this.game.board.coord.toMouse(this.options.x, this.options.y, this.game.squareSize);
        let center = coord.map(c => {
            return c + (this.size / 2);
        });

        let angle = this.getAngle({
            x: center[0],
            y: center[1]
        }, {
            x: x,
            y: y
        });

        angle = angle.deg - 90;

        if (this.prevAngle < 0 && angle > 0) {
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

    isCrossing(matrix) {
        let found = this.matrix.find(p => {
            for (let i = 0, l = matrix.length; i < l; i++) {
                // console.log(p, matrix[i], p.join('') === matrix[i].join(''))
                if (p.join('') === matrix[i].join('')) {
                    return true;
                }
            }
        });

        if (found) {
            return true;
        }

        return false;
    }

    upgrade(){
        let upgrade = this.options.data.upgrades[this.upgradeLevel + 1];
        if(this.game.money - upgrade.cost < 0){
            return;
        }
        this.upgradeLevel += 1;
        this.game.money -= upgrade.cost;
        this.game.controls.setMoney(this.game.money)
        this.options.dmg = upgrade.damage;
        this.options.range = upgrade.range * this.size;

        this.turret.attr({
            'stroke-opacity': 0.8,
            'stroke-width': this.upgradeLevel + 1
        })
    }
}

class BigTurret extends Turret {
    constructor(options) {
        options = Object.assign({
            x: null,
            y: null,
            dmg: 10,
            speed: 1, //shoot/second,
            range: null,
            resetCannonMs: 10,
            shootingCannonMs: 150,
            style: {
                body: 'yellow',
                turret: 'red',
                cannon: 'blue',
                shoot: 'yellow',
                reload: 'green'
            },
            cost: 5,
            sound: './sounds/M1 Garand Single.mp3',
            game: null
        }, options);

        options.size = options.game.squareSize * 2;

        super(options);
    }

    buildBody() {
        let coord = this.game.board.coord.toMouse(this.options.x, this.options.y, this.game.squareSize);
        let bodyCoord = coord.map(c => c + (this.size / 2));
        this.body = this.game.board.paper.circle(...bodyCoord, this.size / 2);
        this.body.attr(config.squareStyle[this.style.body]);
    }

    buildTurret() {
        let coord = this.game.board.coord.toMouse(this.options.x, this.options.y, this.game.squareSize);
        let turretCoord = coord.map(c => c + (this.size / 4));
        this.turret = this.game.board.paper.rect(...turretCoord, this.size / 2, this.size / 2);
        this.turret.attr(config.squareStyle[this.style.turret]);
    }

    buildCannon() {
        let coord = this.game.board.coord.toMouse(this.options.x, this.options.y, this.game.squareSize);
        let center = coord.map(c => c + (this.size / 2));
        let cannonCoord = [coord[0] + (this.size / 2) - 2, center[1]];
        this.cannon = this.game.board.paper.rect(...cannonCoord, 4, this.size / 1.5);
        this.cannon.attr(config.squareStyle[this.style.cannon]);
    }

}

class BigRedTurret extends BigTurret {
    constructor(options) {
        options = Object.assign({
            x: null,
            y: null,
            dmg: 5,
            speed: 2, //shoot/second,
            range: null,
            resetCannonMs: 10,
            shootingCannonMs: 150,
            style: {
                body: 'red',
                turret: 'yellow',
                cannon: 'blue',
                shoot: 'yellow',
                reload: 'green'
            },
            cost: 25,
            sound: './sounds/Laser.mp3',
            game: null
        }, options);

        options.size = options.game.squareSize * 2;

        super(options);
    }
}