class Controls {
    constructor(game){

        this.game = game;
        this.container = document.querySelector('#controls');

        this.turretType = null;
        this.turretCat = null;

        let html = this.getHtml();
        this.container.innerHTML = html;
        this.initEvents();
    }

    initEvents(){
        this.container.querySelector('#new-wave').onclick = this.newWave;
        this.container.querySelectorAll('.add-turret').forEach(bt => {
            bt.onclick = this.addTurret;
        })
    }

    newWave = (e) => {
        e.preventDefault();
        this.game.startWave();
    }

    addTurret = (e) => {
        e.preventDefault();
        this.turretCat = e.target.getAttribute('data-cat');
        this.turretType = e.target.getAttribute('data-type');
        if(e.target.classList.contains('btn-info')){
            this.turretType = null;
            this.turretCat = null;
            e.target.classList.remove('btn-info');
        }
        else {
            this.container.querySelectorAll('.add-turret').forEach(bt => {
                bt.classList.remove('btn-info');
            })
            e.target.classList.add('btn-info');
        }
    }

    setLives(lives){
        this.container.querySelector('#lives').innerHTML = lives;
    }

    setMoney(money){
        this.container.querySelector('#money').innerHTML = money;
    }

    setWave(wave, waveId){
        this.container.querySelector('#wave-id').innerHTML = waveId;
        this.container.querySelector('#quantity').innerHTML = wave.quantity;
        this.container.querySelector('#health').innerHTML = wave.health;
        this.container.querySelector('#speed').innerHTML = wave.speed;
        this.container.querySelector('#gain').innerHTML = wave.gain;
    }

    getHtml(){
        return `
            <button class="btn btn-primary" id="new-wave">New Wave</button>
            <hr>
            <div class="btn-group" role="group" aria-label="Basic example">
                <button class="btn btn-secondary add-turret" data-type="small" data-cat="basic">Small turret</button>
                <button class="btn btn-secondary add-turret" data-type="small" data-cat="red">Small red turret</button>
            </div>
            <hr>
            <div class="btn-group" role="group" aria-label="Basic example">
                <button class="btn btn-secondary add-turret" data-type="big" data-cat="basic">Big turret</button>
                <button class="btn btn-secondary add-turret" data-type="big" data-cat="red">Big red turret</button>
            </div>
            <hr>
            <ul>
                <li>lives: <font id="lives">0</font></li>
                <li>money: <font id="money">0</font></li>
            </ul>
            <hr>
            <ul>
                <li>wave id: <font id="wave-id">0</font></li>
                <li>quantity: <font id="quantity">0</font></li>
                <li>health: <font id="health">0</font></li>
                <li>speed: <font id="speed">0</font></li>
                <li>gain: <font id="gain">0</font></li>
            </ul>
        `;
    }
}