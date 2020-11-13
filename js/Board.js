class Board {
    constructor(options) {
        this.options = Object.assign({
            id: null,
            cols: 20,
            rows: 20,
            squareSize: 20,
            game: null
        }, options);

        this.game = this.options.game;

        this.container = document.querySelector('#' + this.options.id);
        this.paper = Raphael(this.options.id);
        this.squares = {};
        this.prevSquares = [];

        this.initEvents();
    }

    async buildCol(rowId) {
        this.squares[rowId] = [];
        for (let i = 0; i < this.options.cols; i++) {
            let x = i * this.options.squareSize;
            let y = rowId * this.options.squareSize;

            let square = this.paper.rect(x, y, this.options.squareSize, this.options.squareSize);
            square.attr(config.squareStyle.white);
            this.squares[rowId].push(square);
        }

        let percent = Math.round((rowId + 1) / this.options.rows * 100);
        debugLow(`generating grid ${percent}%`);
        return;
    }

    async buildGrid() {
        this.width = this.options.cols * this.options.squareSize;
        this.height = this.options.rows * this.options.squareSize;
        this.paper.setSize(this.width, this.height);

        console.groupCollapsed('buildGrid');
        let i = 0;
        while (i < this.options.rows) {
            await this.buildCol(i);
            i++;
        }
        console.groupEnd('buildGrid');
    }

    colorizeSquare(square, color, duration) {
        duration = duration || 50;
        square.animate({
            fill: color
        }, duration);
    }

    initEvents() {
        this.container.onclick = this.click;
        this.container.onmousemove = this.mousemove;
        this.container.onmouseout = this.mouseout;
    }

    click = (e) => {
        e.preventDefault();

        console.log('click board');

        let coord = this.coord.toGrid(e.offsetX, e.offsetY, this.game.squareSize);
        this.game.addTurret(...coord)
        this.game.controls.hideUpgrade()
    }

    mouseout = (e) => {
        if(this.prevSquares.length > 0){
            this.prevSquares.forEach(ps => {
                if(ps)
                    ps.attr({ fill: config.squareStyle.lightgray.white })
            })
            this.prevSquares = [];
        }
    }
    mousemove = (e) => {
        e.preventDefault();
        if(this.game.controls.turretType === null){
            return;
        }
        if(this.prevSquares.length > 0){
            this.prevSquares.forEach(ps => {
                if(ps)
                    ps.attr({ fill: config.squareStyle.lightgray.white })
            })
        }
        this.prevSquares = [];
        let [x, y] = this.coord.toGrid(e.offsetX, e.offsetY, this.game.squareSize);
        if(this.squares[y][x] === undefined){
            return;
        }
        this.squares[y][x].attr({ fill: config.squareStyle.lightgray.fill })
        this.prevSquares.push(this.squares[y][x]);

        if(this.game.controls.turretType && this.game.controls.turretType === 'big'){
            let sq = this.squares[y] ? this.squares[y][x + 1] : null;
            if(sq) sq.attr({ fill: config.squareStyle.lightgray.fill });
            this.prevSquares.push(sq);
            sq = this.squares[y + 1] ? this.squares[y + 1][x + 1] : null;
            if(sq) sq.attr({ fill: config.squareStyle.lightgray.fill });
            this.prevSquares.push(sq);
            sq = this.squares[y + 1] ? this.squares[y + 1][x] : null;
            if(sq) sq.attr({ fill: config.squareStyle.lightgray.fill });
            this.prevSquares.push(sq);
        }
    }

    coord = {
        toGrid: (pageX, pageY, squareSize) => {
            if(!this.gridCoords) this.gridCoords = {};
            let key = [pageX, pageY, squareSize].join('_');
            if(this.gridCoords[key]){
                return this.gridCoords[key];
            }
            this.gridCoords[key] = [
                Math.floor(pageX / squareSize),
                Math.floor(pageY / squareSize)
            ];
            return this.gridCoords[key];
        },

        toMouse: (x, y, squareSize) => {
            if(!this.mouseCoords) this.mouseCoords = {};
            let key = [x, y, squareSize].join('_');
            if(this.mouseCoords[key]){
                return this.mouseCoords[key];
            }
            this.mouseCoords[key] = [
                Math.floor(x * squareSize),
                Math.floor(y * squareSize)
            ];
            return this.mouseCoords[key];
        }
    }
}

