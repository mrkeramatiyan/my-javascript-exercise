class Task {
    constructor(label, id) {
        this.label = label;
        this.isCompeleted = false;
        this.taskId = id;
    }
}

class TodoList {
    
    constructor(elementInitApp, preset = {}) {
        this.titleOfApp = preset.title || 'Todo List App';
        this.idOfApp = preset.id || '';
        this.elementInitApp = elementInitApp;
        this.state = [];
        this.arrayOfLiElementsToaster = [];
        this.isAlertBoxActive = true;
        this.createStructureApp();
        this.checkDataForState();
    }

    checkDataForState() {
        const getDataFromlocalStorage = localStorage.getItem(this.idOfApp || this.elementInitApp.getAttribute('id'));
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
        if(id) element.setAttribute('id', id);
        return element;
    }

    createStructureApp() {
        // create wrapper app
        const wrapperElementApp = this.createElement('section','','wrapper-todo-app');

        // create Title
        const h1 = this.createElement('h1');
        h1.innerText = this.titleOfApp;
        wrapperElementApp.append(h1);

        const wrapperInsertTask = this.createElement('section','', 'wrapper-insert');
        const addTaskBtn = this.createElement('button', 'Add Task', 'add-task-btn');
        const inputElement = this.createElement('input', '', 'input-text-task');
        inputElement.setAttribute('type','text');
        inputElement.setAttribute('placeholder','Enter New Task');
        wrapperInsertTask.append(addTaskBtn);
        wrapperInsertTask.append(inputElement);
        wrapperElementApp.append(wrapperInsertTask);

        const wrapperListOfTasks = this.createElement('ul', '', 'wrapper-list-taks');
        wrapperElementApp.append(wrapperListOfTasks);

        // get context this for use inside function
        const mainContext = this;
        // function of event
        function handlerAddTaskBtn(event) {
            let value = '';
            if(this.tagName == 'INPUT') {
                value = this.value.trim();
            } else if(this.tagName == 'BUTTON') {
                value = this.closest('section').querySelector('.input-text-task').value.trim();     
            }
            
            if(value.length > 0 ) {
                const uniqueIdTask = mainContext.genarateUID(6);
                const newTask = new Task(value, uniqueIdTask);
                mainContext.state = [
                    ...mainContext.state,
                    newTask
                ];
                event.target.value = '';
                mainContext.renderTodoTasks();
            } else {
                if(mainContext.isAlertBoxActive) {
                    mainContext.isAlertBoxActive = false;
                    mainContext.runToaster('You should enter something for add task!');
                }
            }
        };

        // Add EventListeners
        addTaskBtn.addEventListener('click', handlerAddTaskBtn);
        inputElement.addEventListener('change', handlerAddTaskBtn);

        this.elementInitApp.append(wrapperElementApp);
    }

    renderTodoTasks() {
        const fragment = document.createDocumentFragment();
        const wrapperListOfTasks = this.elementInitApp.querySelector('.wrapper-todo-app .wrapper-list-taks');
        wrapperListOfTasks.innerHTML = '';
        
        this.state.forEach((taskObj) => {
            const guid = this.genarateUID(5);

            const li = this.createElement('li');
            li.setAttribute('id', taskObj.taskId);

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
            li.append(label);
            li.append(editBtn);
            li.append(deleteBtn);

            // functions of events
            const handlerEditBtn = (event) => {
                const li = event.target.closest('li');
                const id = event.target.closest('li').getAttribute('id');
                const label = li.querySelector('label');
                
                const input = this.createElement('input');
                input.setAttribute('type', 'text');
                input.setAttribute('value', label.innerText);
                li.childNodes.forEach(element => element.classList.add('display-none'));
                li.prepend(input);
                input.focus();
                
                // functions
                const handelerChange = (event) => {
                    const objOfTask = this.state.filter(objTask => objTask.taskId == id);
                    objOfTask[0].label = event.target.value;
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
                const id = event.target.closest('li').getAttribute('id');
                const objOfTask = this.state.filter(objTask => objTask.taskId == id);
                const value = objOfTask[0].label;
                this.runToaster(`Are you sure for delete task? => ${value}`, true, callBackForResult, id);

                const mainContext = this;
                function callBackForResult() {
                    mainContext.state = mainContext.state.filter(taskObj => taskObj.taskId != id);
                    mainContext.renderTodoTasks();
                }
            };

            const handlerChecked = (event) => {
                const id = event.target.closest('li').getAttribute('id');
                const objOfTask = this.state.filter(objTask => objTask.taskId == id);
                objOfTask[0].isCompeleted = !objOfTask[0].isCompeleted;

                this.renderTodoTasks();
                label.removeEventListener('click', handlerChecked);
            };

            // Add Event Listners
            editBtn.addEventListener('click', handlerEditBtn);
            deleteBtn.addEventListener('click', handlerDeleteBtn);
            label.addEventListener('click', handlerChecked);

            fragment.append(li);
        });
               
        // Add Taks to DOM
        wrapperListOfTasks.append(fragment);

        // After any call renderTodoTasks method save to localStorage
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        const nameDataFromId = this.idOfApp || this.elementInitApp.getAttribute('id');
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

    runToaster(_text, _confirm = false, _callBackFn, _targetId) {
        const mainContext = this;
        const existToaster = [...document.querySelector('body').children].some(item => item.className == 'toaster');
        
        if(!existToaster) {
            const bodyElement = document.body;
            const createToasterElement = this.createElement('ul', '', 'toaster', this.guidForToaseter);
            bodyElement.append(createToasterElement);
        }

        const toasterElement = document.querySelector('.toaster');
        
        // Check Box is confirm or simple
        if(_confirm) {
            const wrapperButtons = this.createElement('div', '', 'wrapper-btn');
            wrapperButtons.hidden = false;
            const toasterYesButton = this.createElement('button', 'Yes', 'yes-btn', '');
            const toasterCancelButton = this.createElement('button', 'Cancel', 'cancel-btn', '');
            wrapperButtons.append(toasterYesButton, toasterCancelButton);            
            const existToaster = this.arrayOfLiElementsToaster.some(itemObj => itemObj.targetId == _targetId);
            let liToaster;
            if(!existToaster) {
                liToaster = createLi(true, wrapperButtons);
            }

            // add Event Listener
            toasterYesButton.addEventListener('click', function handlerYesBtn() {
                _callBackFn();
 
                mainContext.arrayOfLiElementsToaster = mainContext.arrayOfLiElementsToaster.filter(toasterObj => toasterObj.id != liToaster.id);
                liToaster.el.remove();
                toasterYesButton.removeEventListener('click', handlerYesBtn);
            });
            toasterCancelButton.addEventListener('click', function handlerCancelBtn() {
                liToaster.el.remove();
                toasterCancelButton.removeEventListener('click', handlerCancelBtn);
            });            
            
            // Add to DOM
            if (liToaster) {
                toasterElement.append(liToaster.el);
            }
        } else {
            const li = createLi();
            toasterElement.append(li.el);
            
            setTimeout(() => {
                li.el.remove();

                // for prevent repeat alert box
                this.isAlertBoxActive = true;
            }, 5000);
        }    
                
        // helper function
        function createLi(haveButton = false, element) {
            const id = mainContext.genarateUID(5);
            const li = mainContext.createElement('li');
            const textToasteser = mainContext.createElement('span', _text,'text-toaster');
            li.append(textToasteser);
            if(haveButton) {
                li.append(element);
            }
            const obj = {
                id,
                el: li,
                targetId: _targetId
            };
            mainContext.arrayOfLiElementsToaster.push(obj);
            return obj;
        }
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



