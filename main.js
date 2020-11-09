let map = {
    cols: 20,
    rows: 20,
    entry: {
        length: 1,
        width: 4,
        x: 0,
        y: 9
    },
    exit: {
        length: 1,
        width: 4,
        x: 19,
        y: 8
    },
}

let tower = new Game({
    id: 'tower',
    squareSize: 30,
    // map: map
});

tower.build().then(() => {

    tower.start();

    // tower.addTurret(10, 10);
    // // tower.addTurret(10, 9);
    // // tower.addTurret(9, 10);
    // tower.addTurret(8, 10);
    // tower.addTurret(12, 10);

    // tower.addMultipleEnemies(20, 500);
    // tower.addEnemy();

}).catch(error => {
    throw error;
})