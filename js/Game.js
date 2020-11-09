class Game {
    constructor(options) {
        this.options = Object.assign({
            id: null,
            map: {
                cols: 20,
                rows: 20,
                entry: {
                    length: 4,
                    width: 1,
                    x: 8,
                    y: 0
                },
                exit: {
                    length: 4,
                    width: 1,
                    x: 8,
                    y: 19
                }
            },
            squareSize: 20,
            lives: 20
        }, options);

        this.id = this.options.id;
        this.cols = this.options.map.cols;
        this.rows = this.options.map.rows;
        this.map = this.options.map;
        this.lives = this.options.lives;
        this.squareSize = this.options.squareSize;

        this.container = document.querySelector(this.options.id);
        this.entrySquares = [];
        this.exitSquares = [];
        this.enemies = [];
        this.turrets = [];
        this.state = 0; // 0 stopped - 1 started

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
                let square = this.board.squares[startY + j][startX + i];
                this.board.colorizeSquare(square, config.squareStyle.green.fill);
                this.entrySquares.push(square);
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
                let square = this.board.squares[startY + j][startX + i];
                this.board.colorizeSquare(square, config.squareStyle.red.fill);
                this.exitSquares.push(square);
            }
        }
    }

    start(){
        this.state = 1;
    }
  
    stop(){
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
            hp: 100,
            speed: 50,
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
        }
        if(this.lives === 0 || this.waveLength === 0){
            debug(`Game: Stopping`);
            this.stop();
        }
}

    addTurret(x, y) {
        debug(`Game: Adding new turret`);
        // let turret = new Turret({
        let turret = new RedTurret({
            x: x,
            y: y,
            dmg: 10,
            range: 40,
            game: this
        });

        this.turrets.push(turret);

        turret.start();
    }

    startWave(){
        this.start();
        this.lives = this.options.lives;
        this.turrets.map(t => {
            t.restart();
        })
        tower.addMultipleEnemies(10, 500);
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
