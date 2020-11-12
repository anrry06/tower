class Enemy {
    constructor(options) {
        this.options = Object.assign({
            x: null,
            y: null,
            dx: null,
            dy: null,
            hp: 10,
            speed: 10,
            gain: 1,
            game: null
        }, options);

        this.game = this.options.game;

        this.id = this.options.game.enemies.length;
        this.destroyed = false;

        // debugLow(this);
        // debugLow(this.options);

        let coord = this.game.board.coord.toMouse(this.options.x, this.options.y, this.game.squareSize);
        this.square = this.game.board.paper.rect(...coord, this.game.squareSize, this.game.squareSize);
        this.square.attr(config.squareStyle.blue);
    }

    getX() {
        return this.square.attr('x');
    }

    getY() {
        return this.square.attr('y');
    }

    getCenterX() {
        return this.square.attr('x') + (this.game.squareSize / 2);
    }

    getCenterY() {
        return this.square.attr('y') + (this.game.squareSize / 2);
    }

    removeHp(dmg) {
        if(this.destroyed === false){
            debug(`Enemy ${this.id}: Losing ${dmg} health point`);
            this.options.hp -= dmg;
            debug(`Enemy ${this.id}: ${this.options.hp} health point left`);
            if (this.options.hp <= 0) {
                debug(`Enemy: Destroyed`);
                this.destroyed = true;
                this.game.removeEnemy(this);
            }
            this.square.animate(config.squareStyle.red, 150, 'linear', () => {
                if (this.options.hp <= 0) {
                    this.square.remove();
                }
                else {
                    this.square.animate(config.squareStyle.blue, 150, 'linear');
                }
            });
        }
    }

    async move() {
        try {
            let args = [this.options.x, this.options.y, this.options.dx, this.options.dy];
            let path = this.game.getPath(...args);
            let i = 0;

            while (path.length > 0) {
                path.shift();
                let coord = path.shift();
                await this.moveTo(coord);

                if (path.length > 0) {
                    args = [coord[0], coord[1], this.options.dx, this.options.dy];
                    path = this.game.getPath(...args)
                }
                i++;
            }

            debug(`Enemy ${this.id}: Arrived`);
            this.destroy = false;
            this.square.remove();
            this.game.removeEnemy(this);

            return;
        } catch (error) {
            throw error;
        }
    }

    async moveTo(coord) {
        return new Promise((resolve) => {
            coord = this.game.board.coord.toMouse(...coord, this.game.squareSize);
            let [x, y] = coord;

            let ms = (1 / this.options.speed) * 10000;
            this.square.animate({ x, y }, ms, 'linear', resolve)
        })
    }
}

