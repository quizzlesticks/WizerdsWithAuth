class TaskScheduler {

    #tasks_to_finish = 0;
    #tasks_finished = 0;
    #callback;
    #optional_parameter;

    #log;
    #name = "NoName";

    #id = 0;

    constructor(log=false, name="NoName") {
        this.finishedTask = this.finishedTask.bind(this);
        this.#name = name;
        this.#log = log;
    }

    registerTask() {
        this.#tasks_to_finish++;
        if(this.#log) console.log(this.#name + " registered a task. There are " + this.#tasks_finished + "/" + this.#tasks_to_finish + " tasks.");
    }

    finishedTask(id) {
        if(id != this.#id) {
            return;
        }
        this.#tasks_finished++;
        if(this.#log) console.log(this.#name + " finished a task. There are " + this.#tasks_finished + "/" + this.#tasks_to_finish + " tasks.");
        if(this.#tasks_to_finish == this.#tasks_finished && this.#callback != undefined) {
            if(this.#optional_parameter != undefined) {
                this.#callback(this.#optional_parameter);
            } else {
                this.#callback();
            }
        }
    }

    get task_finish_callback() {
        var temp = this.#id;
        return (x=temp,y=this.finishedTask) => y(x);
    }

    set callback(cb) {
        this.#callback = cb;
        if(this.#log) console.log(this.#name + " set callback. There are " + this.#tasks_finished + "/" + this.#tasks_to_finish + " tasks.");
        if(this.#tasks_to_finish == this.#tasks_finished && this.#callback != undefined) {
            this.#callback();
        }
    }

    setCallback(cb, op=undefined) {
        this.#callback = cb;
        this.#optional_parameter = op;
        if(this.#log) console.log(this.#name + " set callback with options. There are " + this.#tasks_finished + "/" + this.#tasks_to_finish + " tasks.");
        if(this.#tasks_to_finish == this.#tasks_finished && this.#callback != undefined) {
            if(this.#optional_parameter != undefined) {
                this.#callback(this.#optional_parameter);
            } else {
                this.#callback();
            }
        }
    }

    reset() {
        this.#id += 1;
        this.#callback = undefined;
        this.#optional_parameter = undefined;
        this.#tasks_to_finish = 0;
        this.#tasks_finished = 0;
    }
}

module.exports = TaskScheduler;
