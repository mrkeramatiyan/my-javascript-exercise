import Render from "./render.js";

class Task {
    constructor(label, id) {
        this.label = label;
        this.isCompeleted = false;
        this.taskId = id;
    }
}

export default class Logic {
    constructor(elementInitApp, preset) {
        var defaultValues = {
            titleOfApp: 'Todo List App',
            idOfApp: '',
            elementInitApp,
            state: [],
            arrayOfLiElementsToaster: []
        };
        Object.assign(this, defaultValues, preset);

        var methodsNeededInRender = {
            saveToLocalStorage: this.saveToLocalStorage.bind(this),
            genarateUID: this.genarateUID.bind(this)
        };

        var eventsHandlerMethods = {
            handlerAddTaskBtn: this.handlerAddTaskBtn.bind(this),
            handlerEditBtn: this.handlerEditBtn.bind(this),
            handlerDeleteBtn: this.handlerDeleteBtn.bind(this),
            handlerChecked: this.handlerChecked.bind(this),
            handelerChange: this.handelerChange.bind(this),
            handlerKeyEvent: this.handlerKeyEvent.bind(this)
        };

        this.checkDataForState();
        
        this.renderTasks = new Render(
            {
                idOfApp: this.idOfApp,
                elementInitApp,
                titleOfApp: this.titleOfApp,
                state: this.state,
                arrayOfLiElementsToaster: this.arrayOfLiElementsToaster
            },
            eventsHandlerMethods,
            methodsNeededInRender
        );
        this.renderTasks.createStructureApp();
        this.renderTasks.renderTodoTasks(this.state);
    }

    checkDataForState() {
        var getDataFromlocalStorage = localStorage.getItem(this.idOfApp || this.elementInitApp.getAttribute('id'));
        if(getDataFromlocalStorage) {
            this.state = JSON.parse(getDataFromlocalStorage);
            
        } else {
            this.state = [];
        }
        
    }

    // Events Methods **************************************

    handlerAddTaskBtn(event) {
        var value = '';
        var checkEnterKey = event.key === 'Enter';
        var checkTagNameButton = event.currentTarget.tagName === 'BUTTON';
        if(checkEnterKey) {
            value = event.currentTarget.value.trim();
        } else if(checkTagNameButton) {
            value = event.currentTarget.closest('section').querySelector('.input-text-task').value.trim();
        }
        
        if(checkTagNameButton || checkEnterKey) {
            if(value.length > 0 ) {
                var uniqueIdTask = this.genarateUID(6);
                var newTask = new Task(value, uniqueIdTask);
                this.state = [
                    ...this.state,
                    newTask
                ];
                event.target.value = '';
                this.renderTasks.renderTodoTasks(this.state);
            } else {
                var existAlertBox = this.renderTasks.arrayOfLiElementsToaster.some(objToaster => objToaster.targetId == `${this.idOfApp}-add-btn`);
                if(!existAlertBox) {
                    this.renderTasks.runToaster('You should enter something for add task!', false, undefined, `${this.idOfApp}-add-btn`);                    
                }
            }
        }           
    }

    handlerEditBtn(event){
        var li = event.target.closest('li');
        var id = event.target.closest('li').getAttribute('id');
        var label = li.querySelector('label');
        var editBtn = li.querySelector('.edit-btn');
        this.renderTasks.setToEdit(li,id,label);

        editBtn.removeEventListener('click', this.handlerEditBtn);
    }

    handelerChange(event, id, input) {
        var objOfTask = this.state.filter(objTask => objTask.taskId == id);
        objOfTask[0].label = event.target.value;
        this.renderTasks.renderTodoTasks(this.state);

        input.removeEventListener('change', this.handelerChange);
        input.removeEventListener('keypress', this.handelerChange);
    }
    
    handlerKeyEvent(event, input) {
        if(event.key === 'Enter' || event.key === 'Escape') {
            this.renderTasks.renderTodoTasks(this.state);

            input.removeEventListener('keydown', this.handlerKeyEvent);
        }
    }

    handlerDeleteBtn(event) {
        
        var id = event.target.closest('li').getAttribute('id');
        var objOfTask = this.state.filter(objTask => objTask.taskId == id);
        var value = objOfTask[0].label;
        this.renderTasks.runToaster(`Are you sure for delete task? => ${value}`, true, callBackForResult, id);

        var mainContext = this;
        function callBackForResult() {
            mainContext.state = mainContext.state.filter(taskObj => taskObj.taskId != id);
            mainContext.renderTasks.renderTodoTasks(mainContext.state);
        }
    }

    handlerChecked(event, label) {
        var id = event.target.closest('li').getAttribute('id');
        var objOfTask = this.state.filter(objTask => objTask.taskId == id);
        objOfTask[0].isCompeleted = !objOfTask[0].isCompeleted;

        this.renderTasks.renderTodoTasks(this.state);
        label.removeEventListener('click', this.handlerChecked);
    }

    saveToLocalStorage() {
        var nameDataFromId = this.idOfApp || this.elementInitApp.getAttribute('id');
        var data = JSON.stringify(this.state);
        localStorage.setItem(nameDataFromId, data);
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }

    genarateUID(lengthOfId = 4) {
        var myId = '';
        for(let i = 0; i < lengthOfId; i++) {
            var randomNum = this.getRandomInt(1,4);
            switch (randomNum) {
                case 1: myId += String.fromCharCode(this.getRandomInt(97,122));
                    break;
                case 2: myId += String.fromCharCode(this.getRandomInt(65,90));
                    break;
                case 3: myId += this.getRandomInt(1, 10);
                    break;
            }
        }
        return myId;
    }
}