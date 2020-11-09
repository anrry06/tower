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
        // this.container.onmousemove = this.mouseMove;
    }

    click = (e) => {
        e.preventDefault();

        let coord = this.coord.toGrid(e.offsetX, e.offsetY, this.game.squareSize);
        this.game.addTurret(...coord)
    }

    mouseMove = (e) => {
        e.preventDefault();
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

