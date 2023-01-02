class Task {
    constructor(label) {
        this.label = label;
        this.isCompeleted = false;
    }
}

class TodoList {
    
    constructor(elementInitApp, preset = {}) {
        this.titleOfApp = preset.title ? preset.title : 'Todo List App';
        this.idOfApp = preset.id ? preset.id : '';
        this.elementInitApp = elementInitApp;
        this.state = [];
        this.createStructureApp();
        this.checkDataForState();
    }

    checkDataForState() {
        const getDataFromlocalStorage = localStorage.getItem(this.elementInitApp.getAttribute('id'));
        if(getDataFromlocalStorage) {
            this.state = JSON.parse(getDataFromlocalStorage);
            this.renderTodoTasks();
        } else {
            this.state = [];
        }
    }

    // helper method
    createElement(elementName, value='', addClass='', id='') {
        const element =  document.createElement(elementName);
        if(addClass) element.classList.add(addClass);
        if(value) element.innerText = value;
        if(id) element.setAttribute('id', id + '');
        return element;
    }

    createStructureApp() {
        // create wrapper app
        const wrapperElementApp = this.createElement('section','','wrapper-todo-app');

        // create Title
        const h1 = this.createElement('h1');
        h1.innerText = this.titleOfApp;
        wrapperElementApp.appendChild(h1);

        const wrapperInsertTask = this.createElement('section','', 'wrapper-insert');
        const addTaskBtn = this.createElement('button', 'Add Task', 'add-task-btn');
        const inputElement = this.createElement('input', '', 'input-text-task');
        inputElement.setAttribute('type','text');
        inputElement.setAttribute('placeholder','Enter New Task');
        wrapperInsertTask.appendChild(addTaskBtn);
        wrapperInsertTask.appendChild(inputElement);
        wrapperElementApp.appendChild(wrapperInsertTask);

        const wrapperListOfTasks = this.createElement('ul', '', 'wrapper-list-taks');
        wrapperElementApp.appendChild(wrapperListOfTasks);

        // get context this for use inside functions
        const mainContext = this;
        // function of event
        function handlerAddTaskBtn(event) {
            let value = '';
            // console.log(this.tagName)
            if(this.tagName == 'INPUT') {
                value = this.value.trim();
            } else if(this.tagName == 'BUTTON') {
                value = this.closest('section').querySelector('.input-text-task').value;         
            }
            
            const result = Boolean(mainContext.state.find(taskObj => taskObj.label == value));
            if(result) {
                alert('Your task is already have!!!')
            }
            if(value != '' && value != ' ' && !result) {
                const newTask = new Task(value);
                mainContext.state = [
                    ...mainContext.state,
                    newTask
                ];
                event.target.value = '';
                mainContext.renderTodoTasks();
            }
        };

        // Add EventListeners
        addTaskBtn.addEventListener('click', handlerAddTaskBtn);
        inputElement.addEventListener('change', handlerAddTaskBtn);

        this.elementInitApp.appendChild(wrapperElementApp);
    }

    renderTodoTasks() {
        const fragment = document.createDocumentFragment();
        const wrapperListOfTasks = this.elementInitApp.querySelector('.wrapper-todo-app .wrapper-list-taks');
        wrapperListOfTasks.innerHTML = '';

        this.state.forEach((taskObj, index) => {
            const guid = this.genarateUID(5);

            const li = this.createElement('li');
            li.setAttribute('id', `${index}`);

            const label = this.createElement('label');
            label.setAttribute('for', guid);
            label.innerText = taskObj.label;
            taskObj.isCompeleted ? label.classList.add('checked') : label.classList.remove('checked');
            
            const checkbox = this.createElement('input','', '', guid);
            checkbox.setAttribute('type', 'checkbox');
            if(taskObj.isCompeleted) {
                checkbox.checked = true;
            }
            
            const editBtn = this.createElement('button', 'Edit','edit-btn');
            const deleteBtn = this.createElement('button', 'Delete', 'delete-btn');

            label.prepend(checkbox);
            li.appendChild(label);
            li.appendChild(editBtn);
            li.appendChild(deleteBtn);

            // functions of events
            const handlerEditBtn = (event) => {
                const li = event.target.closest('li');
                const id = parseInt(event.target.closest('li').getAttribute('id'), 10);
                const label = li.querySelector('label');
                
                const input = this.createElement('input');
                input.setAttribute('type', 'text');
                input.setAttribute('value', label.innerText);
                li.childNodes.forEach(element => element.classList.add('display-none'));
                li.prepend(input);
                input.focus();
                
                // functions
                const handelerChange = (event) => {
                    this.state[id].label = event.target.value;
                    this.renderTodoTasks();

                    input.removeEventListener('change', handelerChange);
                    input.removeEventListener('keypress', handelerChange);
                };
                
                const handlerKeyEvent = (event) => {
                    if(event.key === 'Enter' || event.key === 'Escape') {
                        this.renderTodoTasks();
                    }
                };

                // handler events
                input.addEventListener('change', handelerChange);
                input.addEventListener('keydown', handlerKeyEvent);
                
                editBtn.removeEventListener('click', handlerEditBtn);
            };

            const handlerDeleteBtn = (event) => {
                const id = parseInt(event.target.closest('li').getAttribute('id'), 10);
                const value = event.target.closest('li').querySelector('label').innerText;
                if(confirm(`Are you sure for delete task? => ${value}`)) {
                    this.state = this.state.filter(taskObj => taskObj.label != value);
                    this.renderTodoTasks();
                }
                deleteBtn.removeEventListener('click', handlerDeleteBtn);
            };

            const handlerChecked = (event) => {
                const id = parseInt(event.target.closest('li').getAttribute('id'), 10);
                this.state[id].isCompeleted = !this.state[id].isCompeleted;
                this.renderTodoTasks();
                label.removeEventListener('click', handlerChecked);
            };

            // Add Event Listners
            editBtn.addEventListener('click', handlerEditBtn);
            deleteBtn.addEventListener('click', handlerDeleteBtn);
            label.addEventListener('click', handlerChecked);

            fragment.appendChild(li);
        });
        
        // Add Taks to DOM
        wrapperListOfTasks.appendChild(fragment);

        // After any call renderTodoTasks method save to localStorage
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        const nameDataFromId = this.idOfApp ? this.idOfApp : this.elementInitApp.getAttribute('id');
        const data = JSON.stringify(this.state);
        localStorage.setItem(nameDataFromId, data);
    }

    genarateUID(lengthOfId = 4) {
        let myId = '';
        for(let i = 0; i < lengthOfId; i++) {
            const randomNum = this.getRandomInt(1,4);
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

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }
}

const preset1 = {
    title: 'Todo list app one',
    id: 'todoList1'
};

const myapp1 = document.getElementById('myapp1');
const myapp2 = document.getElementById('myapp2');

const myApp = new TodoList(myapp1, preset1);
const myApp2 = new TodoList(myapp2);



