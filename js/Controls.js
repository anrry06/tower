class Controls {
    constructor(game){

        this.game = game;
        this.container = document.querySelector('#controls');

        let html = this.getHtml();
        this.container.innerHTML = html;
        this.initEvents();
    }

    initEvents(){
        this.container.querySelector('#new-wave').onclick = this.newWave;
    }

    newWave = (e) => {
        e.preventDefault();
        this.game.startWave();
    }

    getHtml(){
        return `
            <button id="new-wave">New Wave</button>
            <button id="add-turret">Add Turret</button>    
        `;
    }
}