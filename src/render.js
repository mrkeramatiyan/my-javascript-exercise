export default class Render {
    constructor(
        {
            idOfApp,
            elementInitApp,
            titleOfApp,
            state,
            arrayOfLiElementsToaster
        },
        eventsHandlerMethods,
        methodsNeededInRender
    ) {
        this.idOfApp = idOfApp;
        this.elementInitApp = elementInitApp;
        this.titleOfApp = titleOfApp;
        this.state = state;
        this.eventsHandlerMethods = eventsHandlerMethods;
        this.methodsNeededInRender = methodsNeededInRender;
        this.arrayOfLiElementsToaster = arrayOfLiElementsToaster;
    }

    createStructureApp() {
        // create wrapper app
        var wrapperElementApp = this.createElement('section','','wrapper-todo-app');

        // create Title
        var h1 = this.createElement('h1');
        h1.innerText = this.titleOfApp;
        wrapperElementApp.append(h1);

        var wrapperInsertTask = this.createElement('section','', 'wrapper-insert');
        var addTaskBtn = this.createElement('button', 'Add Task', 'add-task-btn', `${this.idOfApp}-add-btn`);
        var inputElement = this.createElement('input', '', 'input-text-task');
        inputElement.setAttribute('type','text');
        inputElement.setAttribute('placeholder','Enter New Task');
        wrapperInsertTask.append(addTaskBtn);
        wrapperInsertTask.append(inputElement);
        wrapperElementApp.append(wrapperInsertTask);

        var wrapperListOfTasks = this.createElement('ul','','wrapper-list-taks');
        wrapperElementApp.append(wrapperListOfTasks);
       
        // Add EventListeners
        addTaskBtn.addEventListener('click', this.eventsHandlerMethods.handlerAddTaskBtn);
        inputElement.addEventListener('keypress', this.eventsHandlerMethods.handlerAddTaskBtn);

        this.elementInitApp.append(wrapperElementApp);
    }  

    // helper method
    createElement(elementName, value='', addClass='', id='') {
        var element =  document.createElement(elementName);
        if(addClass) element.classList.add(addClass);
        if(value) element.innerText = value;
        if(id) element.setAttribute('id', id);
        return element;
    }

    renderTodoTasks(stateFromLogic) {
        var fragment = document.createDocumentFragment();
        var wrapperListOfTasks = this.elementInitApp.querySelector('.wrapper-todo-app .wrapper-list-taks');
        wrapperListOfTasks.innerHTML = '';
        
        this.state = stateFromLogic;
        this.state.forEach((taskObj) => {
            var guid = this.methodsNeededInRender.genarateUID(5);

            var li = this.createElement('li');
            li.setAttribute('id', taskObj.taskId);

            var label = this.createElement('label');
            label.setAttribute('for', guid);
            label.innerText = taskObj.label;
            taskObj.isCompeleted ? label.classList.add('checked') : label.classList.remove('checked');
            
            var checkbox = this.createElement('input','', '', guid);
            checkbox.setAttribute('type', 'checkbox');
            if(taskObj.isCompeleted) {
                checkbox.checked = true;
            }

            var editBtn = this.createElement('button', 'Edit','edit-btn');
            var deleteBtn = this.createElement('button', 'Delete', 'delete-btn');

            label.prepend(checkbox);
            li.append(label);
            li.append(editBtn);
            li.append(deleteBtn);

            // Add Event Listners
            editBtn.addEventListener('click', this.eventsHandlerMethods.handlerEditBtn);
            deleteBtn.addEventListener('click', this.eventsHandlerMethods.handlerDeleteBtn);
            label.addEventListener('click', (event) => {
                this.eventsHandlerMethods.handlerChecked(event, label);
            });

            fragment.append(li);
        });
               
        // Add Taks to DOM
        wrapperListOfTasks.append(fragment);

        // After any call renderTodoTasks method save to localStorage
        this.methodsNeededInRender.saveToLocalStorage();
    }

    setToEdit(li,id,label) {
        var input = this.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('value', label.innerText);
        li.childNodes.forEach(element => element.classList.add('display-none'));
        li.prepend(input);
        input.focus();

        input.addEventListener('change', (event) => {
            this.eventsHandlerMethods.handelerChange(event, id, input);
        });
        input.addEventListener('keydown', (event) => {
            this.eventsHandlerMethods.handlerKeyEvent(event, input);
        });
    }

    runToaster(_text, _confirm = false, _callBackFn, _targetId) {
        var mainContext = this;
        var existToaster = [...document.querySelector('body').children].some(item => item.className == 'toaster');
        
        if(!existToaster) {
            var bodyElement = document.body;
            var createToasterElement = this.createElement('ul', '', 'toaster', this.guidForToaseter);
            bodyElement.append(createToasterElement);
        }

        var toasterElement = document.querySelector('.toaster');

        // helper function for manage li in toaster
        function manageLiOfToaster(liToaster) {
            mainContext.arrayOfLiElementsToaster = mainContext.arrayOfLiElementsToaster.filter(toasterObj => toasterObj.id != liToaster.id);
        }

        // Check Box is confirm or simple
        if(_confirm) {
            var wrapperButtons = this.createElement('div', '', 'wrapper-btn');
            wrapperButtons.hidden = false;
            var toasterYesButton = this.createElement('button', 'Yes', 'yes-btn', '');
            var toasterCancelButton = this.createElement('button', 'Cancel', 'cancel-btn', '');
            wrapperButtons.append(toasterYesButton, toasterCancelButton);
            var existToaster = this.arrayOfLiElementsToaster.some(itemObj => itemObj.targetId == _targetId);
            var liToaster;
            
            if(!existToaster) {
                liToaster = createLi(true, wrapperButtons);
            }

            // add Event Listener
            toasterYesButton.addEventListener('click', function handlerYesBtn() {
                _callBackFn();
                manageLiOfToaster(liToaster);                             

                liToaster.el.remove();
                toasterYesButton.removeEventListener('click', handlerYesBtn);
            });
            toasterCancelButton.addEventListener('click', function handlerCancelBtn() {
                manageLiOfToaster(liToaster);
                liToaster.el.remove();
                toasterCancelButton.removeEventListener('click', handlerCancelBtn);
            });
           
            // Add to DOM            
            if (liToaster) {
                toasterElement.append(liToaster.el);
            }
        } else {
            var li = createLi();
            toasterElement.append(li.el);
            
            setTimeout(() => {
                manageLiOfToaster(li);
                li.el.remove();
            } , 2500);
        }    
        
        // helper function for toaster
        function createLi(haveButton = false, element) {
            var id = mainContext.methodsNeededInRender.genarateUID(5);
            var li = mainContext.createElement('li');
            var textToasteser = mainContext.createElement('span', _text,'text-toaster');
            li.append(textToasteser);
            if(haveButton) {
                li.classList.add('include-button');
                li.append(element);
            } else {
                li.classList.add('simple');
            }
            var obj = {
                id,
                el: li,
                targetId: _targetId
            };
            mainContext.arrayOfLiElementsToaster.push(obj);
            return obj;
        }
    }
}