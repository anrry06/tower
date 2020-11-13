class Game {
    constructor(options) {
        this.options = Object.assign({
            id: null,
            map: {
                cols: 30,
                rows: 30,
                entry: {
                    length: 4,
                    width: 1,
                    x: 13,
                    y: 0
                },
                exit: {
                    length: 4,
                    width: 1,
                    x: 13,
                    y: 29
                },
                squareSize: 20,
            },
            lives: 20,
            money: 85,
            waves: []
        }, options);

        this.id = this.options.id;
        this.cols = this.options.map.cols;
        this.rows = this.options.map.rows;
        this.map = this.options.map;
        this.lives = this.options.lives;
        this.money = this.options.money;
        this.squareSize = this.map.squareSize;
        this.waves = this.options.waves || [];

        this.container = document.querySelector(this.options.id);
        this.entrySquares = [];
        this.entryMatrix = [];
        this.exitSquares = [];
        this.exitMatrix = [];
        this.enemies = [];
        this.turrets = [];
        this.state = 0; // 0 stopped - 1 started
        this.waveId = -1;

        this.timer = new Timer(10);
        this.timer.start();

        this.board = new Board({
            id: this.id,
            cols: this.cols,
            rows: this.rows,
            squareSize: this.squareSize,
            game: this
        });

        this.grid = new PF.Grid(this.cols, this.rows);

        // this.grid.setWalkableAt(9, 10, false);
        // this.grid.setWalkableAt(10, 10, false);
        // this.grid.setWalkableAt(11, 10, false);

    }

    async build() {
        try {
            await this.board.buildGrid();

            debugLow(this);

            this.buildMap();

            this.controls = new Controls(this);
            this.controls.setLives(this.lives);
            this.controls.setMoney(this.money);

        } catch (error) {
            throw error;
        }
    }

    buildMap() {
        this.buildEntry();
        this.buildExit();
    }

    buildEntry() {
        let length = this.map.entry.length;
        let width = this.map.entry.width;
        let startX = this.map.entry.x;
        let startY = this.map.entry.y;
        for (let i = 0; i < length; i++) {
            for (let j = 0; j < width; j++) {
                let [x, y] = this.board.coord.toMouse(startX + i, startY + j, this.squareSize)
                let square = this.board.paper.rect(x, y, this.squareSize, this.squareSize);
                square.attr(config.squareStyle.green);
                this.entrySquares.push(square);
                this.entryMatrix.push([startX + i, startY + j]);
            }
        }
    }

    buildExit() {
        let length = this.map.exit.length;
        let width = this.map.exit.width;
        let startX = this.map.exit.x;
        let startY = this.map.exit.y;
        for (let i = 0; i < length; i++) {
            for (let j = 0; j < width; j++) {
                let [x, y] = this.board.coord.toMouse(startX + i, startY + j, this.squareSize)
                let square = this.board.paper.rect(x, y, this.squareSize, this.squareSize);
                square.attr(config.squareStyle.red);
                this.exitSquares.push(square);
                this.exitMatrix.push([startX + i, startY + j]);
            }
        }
    }

    isPathOpen() {
        let path = this.getPath(this.map.entry.x, this.map.entry.y, this.map.exit.x, this.map.exit.y);
        return path.length > 0;
    }

    start() {
        this.state = 1;
    }

    stop() {
        this.state = 0;
    }

    addMultipleEnemies(n, maxTime) {
        return new Promise(resolve => {
            this.waveLength = n;
            let run = (i) => {
                if (i >= n) {
                    return resolve();
                }
                let to = Math.floor(Math.random() * maxTime) + 1;
                setTimeout(() => {
                    this.addEnemy();
                    run(i + 1);
                }, to)
            };

            run(0);
        });
    }

    addEnemy() {
        debug(`Game: Adding new enemy`);
        let randomEntryPoint = this.getRandomEntryPoint();
        let entryCoord = this.board.coord.toGrid(randomEntryPoint.x, randomEntryPoint.y, this.squareSize);
        let randomExitPoint = this.getRandomExitPoint();
        let exitCoord = this.board.coord.toGrid(randomExitPoint.x, randomExitPoint.y, this.squareSize);

        let enemy = new Enemy({
            x: entryCoord[0],
            y: entryCoord[1],
            dx: exitCoord[0],
            dy: exitCoord[1],
            hp: this.currentWave.health,
            speed: this.currentWave.speed,
            gain: this.currentWave.gain,
            game: this
        });

        this.enemies.push(enemy);

        enemy.move().then(() => {

        }).catch(error => {
            throw error;
        })
    }

    removeEnemy(enemy) {
        debug(`Game: Removing new enemy`);
        let i = this.enemies.indexOf(enemy);
        this.enemies.splice(i, 1);
        this.waveLength -= 1;
        if (enemy.destroy === false) {
            this.lives -= 1;
            this.controls.setLives(this.lives);
        }
        else {
            this.money += enemy.options.gain;
            this.controls.setMoney(this.money);
        }
        if (this.lives === 0 || this.waveLength === 0) {
            debug(`Game: Stopping`);
            this.stop();
        }
    }

    addTurret(x, y) {
        let turretType = this.controls.turretType;
        if (turretType === null) {
            return;
        }

        let turretCat = this.controls.turretCat;
        let turretClass = null;

        let type = [turretType, turretCat].join('-');
        switch (type) {
            case 'big-basic':
                turretClass = BigTurret;
                break;
            case 'big-red':
                turretClass = BigRedTurret;
                break;
            case 'small-basic':
                turretClass = Turret;
                break;
            case 'small-red':
                turretClass = RedTurret;
                break;
        }

        let turret = new turretClass({
            x: x,
            y: y,
            game: this
        });

        let crossing = false;
        // another turret
        for (let i = 0, l = this.turrets.length; i < l; i++) {
            if (this.turrets[i].isCrossing(turret.matrix)) {
                crossing = true;
                i = l;
                return;
            }
        }

        // entry and exit
        if (crossing === false
            && (turret.isCrossing(this.entryMatrix) || turret.isCrossing(this.exitMatrix))) {
            crossing = true;
            return;
        }

        // map limit
        if (crossing === false && (x >= this.map.cols - 1 || y >= this.map.rows - 1)) {
            crossing = true;
            return;
        }

        // no path for enemies
        turret.blockPath();
        if (this.isPathOpen() === false) {
            return turret.unblockPath();
        }

        if (!crossing && this.money > 0 && this.money - turret.options.cost >= 0) {
            debug(`Game: Adding new turret ${type}`);

            turret.build()
            this.turrets.push(turret);

            turret.start();

            this.money -= turret.options.cost;
            this.controls.setMoney(this.money);
        }
    }

    startWave() {
        this.waveId++;
        if (!this.waves[this.waveId]) {
            return alert('c fini');
        }

        this.currentWave = this.waves[this.waveId];
        this.controls.setWave(this.currentWave, this.waveId);

        this.start();
        this.turrets.map(t => t.restart())

        tower.addMultipleEnemies(this.currentWave.quantity, 500);
    }

    getPath(x, y, dx, dy) {
        let gridBackup = this.grid.clone();
        let finder = new PF.AStarFinder({
            allowDiagonal: true,
            dontCrossCorners: true
        });
        let path = finder.findPath(x, y, dx, dy, gridBackup);
        return path;
    }

    getRandomEntryPoint() {
        let randomIndex = Math.floor(Math.random() * this.entrySquares.length);
        let randomEntrySquare = this.entrySquares[randomIndex];

        return {
            x: randomEntrySquare.attr('x'),
            y: randomEntrySquare.attr('y')
        }
    }

    getRandomExitPoint() {
        let randomIndex = Math.floor(Math.random() * this.exitSquares.length);
        let randomExitSquare = this.exitSquares[randomIndex];

        return {
            x: randomExitSquare.attr('x'),
            y: randomExitSquare.attr('y')
        }
    }

}

