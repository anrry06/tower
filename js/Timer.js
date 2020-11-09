class Timer {
    constructor(ms){
        this.ms = ms || 10;
        this.state = 0;
        this.totalProgress = 0;
        this.tasks = [];
    }
    debug(...args){
        // console.log(...args);
    }

    start(){
        this.state = 1;
        let cpt = 0;
    
        let run = (timestamp) => {
            cpt++;
            if(cpt%this.ms === 0){
                this.totalProgress += this.ms;
                this.ping();
                cpt = 0;
            }

            if(this.state === 1){    
                requestAnimationFrame(run);
            }
        }
        
        requestAnimationFrame(run);
    }

    stop(){
        this.state = 0;
    }

    ping(){
        this.tasks.forEach(t => {
            if(this.totalProgress%t.ms === 0){
                this.debug(`EXECUTE TASK ${t.key}`, this.tasks.map(t => t.key))
                t.fn();
            }
        })
    }

    addTask(task){
        this.debug(`REGISTER TASK ${task.key}`)
        this.tasks.push(task);
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