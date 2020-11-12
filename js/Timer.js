class Timer {
    constructor(cptInterval){
        this.cptInterval = cptInterval || 10;
        this.state = 0;
        this.totalProgress = 0;
        this.tasks = [];
    }
    debug(...args){
        // console.log(...args);
    }

    // start(){
    //     this.state = 1;
    //     let cpt = 0;

    //     let start = new Date().getTime();
    
    //     let run = (timestamp) => {
    //         cpt++;

    //         // console.log(cpt, new Date().getTime() - start);
    //         // start = new Date().getTime();

    //         if(cpt%this.cptInterval === 0){
    //             this.totalProgress += this.cptInterval;
    //             this.ping();
    //             cpt = 0;
    //         }

    //         if(this.state === 1){    
    //             requestAnimationFrame(run);
    //         }
    //     }
        
    //     run();
    // }

    start(){
        this.state = 1;
        let run = () => {
            this.totalProgress += this.cptInterval;
            this.ping();

            if(this.state === 1){    
                setTimeout(run, this.cptInterval);
            }
        }
        
        setTimeout(run, this.cptInterval);
    }

    stop(){
        this.state = 0;
    }

    ping(){
        for(let i = 0, l = this.tasks.length; i < l; i++){
            if(this.tasks[i] && (this.totalProgress / this.cptInterval)%this.tasks[i].cptInterval === 0){
                let keys = this.tasks.map(t => t.key).join(' ,');
                this.debug(`EXECUTE TASK ${this.tasks[i].key} - ${keys}`)
                this.tasks[i].fn();
            }
        }
    }

    addTask(task){
        this.debug(`REGISTER TASK ${task.key}`)
        let taskIndex = this.tasks.findIndex(t => t.key === task.key);
        if(taskIndex === -1){
            this.tasks.push(task);
        }
        else {
            this.tasks[taskIndex] = task;
        }
        
    }

    removeTask(key){
        this.debug(`REMOVE TASK ${key}`)
        let taskIndex = this.tasks.findIndex(t => t.key === key);
        if(taskIndex > -1){
            this.tasks.splice(taskIndex, 1);
        }
    }

    clear(){
        this.tasks = [];
    }
}