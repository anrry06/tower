let config = {
    squareStyle: {
        white: {
            'fill': 'white',
            'stroke-opacity': 0.2, // the border
        },
        lightgray: {
            'fill': '#CCCCCC',
            'stroke-opacity': 0.2, // the border
        },
        green: {
            'fill': 'green',
            'stroke-opacity': 0.2, // the border
        },
        red: {
            'fill': 'red',
            'stroke-opacity': 0.2, // the border
        },
        lightred: {
            'fill': '#F77E7E',
            'stroke-opacity': 0.2, // the border
        },
        blue: {
            'fill': 'blue',
            'stroke-opacity': 0.2, // the border
        },
        yellow: {
            'fill': 'yellow',
            'stroke-opacity': 0.2, // the border
        }
    }
};

let prevDebug = {
    game: null,
    turret: null,
    enemy: null
}
let debug = (...args) => {
    console.log(...args);
    if (args[0].match(/Game/i)) {
        if (prevDebug.game && prevDebug.game === args[0]) {
            return;
        }
        prevDebug.game = args[0];
        args[0] = args[0].replace('Game', '<font class="game">Game</font>')
    }
    if (args[0].match(/Turret/i)) {
        if (prevDebug.turret && prevDebug.turret === args[0]) {
            return;
        }
        prevDebug.turret = args[0];
        args[0] = args[0].replace('Turret', '<font class="turret">Turret</font>')
    }
    if (args[0].match(/Enemy/i)) {
        if (prevDebug.enemy && prevDebug.enemy === args[0]) {
            return;
        }
        prevDebug.enemy = args[0];
        args[0] = args[0].replace('Enemy', '<font class="enemy">Enemy</font>')
    }
    // document.querySelector('#log').innerHTML = `<li>${args.join(' ')}</li>` + document.querySelector('#log').innerHTML;
}

let debugLow = (...args) => {
    console.log(...args);
}

const setIntervalAsync = (fn, ms) => {
    fn().then(() => {
        setTimeout(() => setIntervalAsync(fn, ms), ms);
    });
};

let animate = (fn, ms) => {
    let startTime = -1;
    let animationLength = ms; // Animation length in milliseconds

    function doAnimation(timestamp) {
        // Calculate animation progress
        let progress = 0;

        if (startTime < 0) {
            startTime = timestamp;
        } else {
            progress = timestamp - startTime;
        }

        fn()

        // Do animation ...
        if (progress < animationLength) {
            requestAnimationFrame(doAnimation);
        }
    }

    // Start animation
    requestAnimationFrame(doAnimation);
}
