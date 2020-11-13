class Controls {
    constructor(game) {

        this.game = game;
        this.container = document.querySelector('#controls');

        this.turretType = null;
        this.turretCat = null;

        let html = this.getHtml();
        this.container.innerHTML = html;
        this.initEvents();
    }

    initEvents() {
        this.container.querySelector('#new-wave').onclick = this.newWave;
        this.container.querySelector('#upgrade').onclick = this.upgrade;
        // this.container.querySelectorAll('.add-turret').forEach(bt => {
        //     bt.onclick = this.addTurret;
        // })
    }

    newWave = (e) => {
        e.preventDefault();
        this.game.startWave();
    }

    upgrade = (e) => {
        e.preventDefault();

        let disabled = this.container.querySelector('#upgrade').classList.contains('list-group-item-light');
        if(this.currentTurret && !disabled){
            this.currentTurret.upgrade();
            this.displayUpgrade(this.currentTurret);
        }
    }

    addTurret = (e) => {
        e.preventDefault();
        this.turretCat = e.target.getAttribute('data-cat');
        this.turretType = e.target.getAttribute('data-type');
        if (e.target.classList.contains('btn-info')) {
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

    disableTurretSelection(){
        this.turretType = null;
        this.turretCat = null;
        this.container.querySelectorAll('.add-turret').forEach(bt => {
            bt.classList.remove('btn-info');
        })
    }

    setLives(lives) {
        this.container.querySelector('#lives').innerHTML = lives;
    }

    setMoney(money) {
        this.container.querySelector('#money').innerHTML = money;

        if(this.currentTurret){
            let upgrade = this.currentTurret.options.data.upgrades[this.currentTurret.upgradeLevel + 1];
            if (upgrade && this.game.money - upgrade.cost < 0){
                this.container.querySelector('#upgrade').classList.add('list-group-item-light')
            }
            else {
                this.container.querySelector('#upgrade').classList.remove('list-group-item-light')
            }
        }
    }

    setWave(wave, waveId) {
        this.container.querySelector('#wave-info #wave-id').innerHTML = waveId;
        this.container.querySelector('#wave-info #quantity').innerHTML = wave.quantity;
        this.container.querySelector('#wave-info #health').innerHTML = wave.health;
        this.container.querySelector('#wave-info #speed').innerHTML = wave.speed;
        this.container.querySelector('#wave-info #gain').innerHTML = wave.gain;
    }

    addTurretButton(category, name) {
        let html = `<button class="btn btn-secondary add-turret" data-type="big" data-cat="${category}">${name}</button>`;
        this.container.querySelector('#turrets').innerHTML += html;
        setTimeout(() => {
            this.container.querySelector(`#turrets button[data-cat=${category}]`).onclick = this.addTurret;
        }, 1)
    }

    displayUpgrade(turret) {
        this.currentTurret = turret;
        this.container.querySelector('#turret-info #name').innerHTML = turret.options.name;
        this.container.querySelector('#turret-info #cost').innerHTML = turret.options.cost;
        this.container.querySelector('#turret-info #range').innerHTML = turret.options.range;
        this.container.querySelector('#turret-info #damage').innerHTML = turret.options.dmg;
        this.container.querySelector('#turret-info #speed').innerHTML = turret.options.speed;
        this.container.querySelector('#turret-info').style.display = 'block';

        let turretData = turret.options.data;
        let upgrade = turretData.upgrades[turret.upgradeLevel + 1];
        if (upgrade) {
            this.container.querySelector('#upgrade-info #cost').innerHTML = upgrade.cost;
            this.container.querySelector('#upgrade-info #range').innerHTML = upgrade.range * turret.size;
            if (upgrade.range * turret.size > turret.options.range) {
                this.container.querySelector('#upgrade-info #range').classList.add('badge-success')
            }
            else {
                this.container.querySelector('#upgrade-info #range').classList.remove('badge-success')
            }
            this.container.querySelector('#upgrade-info #damage').innerHTML = upgrade.damage;
            if (upgrade.damage > turret.options.dmg) {
                this.container.querySelector('#upgrade-info #damage').classList.add('badge-success')
            }
            else {
                this.container.querySelector('#upgrade-info #damage').classList.remove('badge-success')
            }

            if(this.game.money - upgrade.cost < 0){
                this.container.querySelector('#upgrade').classList.add('list-group-item-light')
            }
            else {
                this.container.querySelector('#upgrade').classList.remove('list-group-item-light')
            }


            this.container.querySelector('#upgrade-info').style.display = 'block';
        }
    }

    hideUpgrade() {
        this.currentTurret = null;
        this.container.querySelector('#turret-info').style.display = 'none';
        this.container.querySelector('#upgrade-info').style.display = 'none';
    }

    getHtml() {
        return `
            <button class="btn btn-primary" id="new-wave">New Wave</button>
            <hr>
            <div class="btn-group" role="group" id="turrets">
            </div>
            <hr>
            <ul class="list-group" id="game-info">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Lives
                    <span class="badge badge-primary badge-pill" id="lives">0</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Money
                    <span class="badge badge-primary badge-pill" id="money">0</span>
                </li>
            </ul>
            <hr>
            <ul class="list-group" id="wave-info">
                <li class="list-group-item d-flex justify-content-between align-items-center list-group-item-info">
                    Wave Infos
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Wave Id
                    <span class="badge badge-primary badge-pill" id="wave-id">0</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Quantity
                    <span class="badge badge-primary badge-pill" id="quantity">0</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Health
                    <span class="badge badge-primary badge-pill" id="health">0</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Speed
                    <span class="badge badge-primary badge-pill" id="speed">0</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Gain
                    <span class="badge badge-primary badge-pill" id="gain">0</span>
                </li>
            </ul>
            <hr>
            <ul class="list-group" id="turret-info">
                <li class="list-group-item d-flex justify-content-between align-items-center list-group-item-info">
                    Turret Infos
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Name
                    <span class="badge badge-primary badge-pill" id="name"></span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Cost
                    <span class="badge badge-primary badge-pill" id="cost">0</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Range
                    <span class="badge badge-primary badge-pill" id="range">0</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Damage
                    <span class="badge badge-primary badge-pill" id="damage">0</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Speed
                    <span class="badge badge-primary badge-pill" id="speed">0</span>
                </li>
            </ul>
            <hr>
            <ul class="list-group" id="upgrade-info">
                <li class="list-group-item d-flex justify-content-between align-items-center list-group-item-info">
                    Upgrade Infos
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Cost
                    <span class="badge badge-primary badge-pill" id="cost">0</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Range
                    <span class="badge badge-primary badge-pill" id="range">0</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Damage
                    <span class="badge badge-primary badge-pill" id="damage">0</span>
                </li>
                <button type="button" class="list-group-item list-group-item-action active" id="upgrade">
                    <center>Upgrade</center>
                </button>
            </ul>
        `;
    }
}