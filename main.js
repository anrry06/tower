let map = {
    cols: 45,
    rows: 45,
    entry: {
        length: 1,
        width: 5,
        x: 0,
        y: 20
    },
    exit: {
        length: 1,
        width: 5,
        x: 44,
        y: 20
    },
    squareSize: 20
}

let tower = new Game({
    id: 'tower',
    map: map
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