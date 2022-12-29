// => State
let todos = [];

// Select Elements
const app = document.querySelector('.todo-container');
const inputTodo = app.querySelector('#add-todo');
const addBtnTodo = app.querySelector('.wrapper-add .add-btn');
const wrapperList = app.querySelector('.wrapper-list');
const description = app.querySelector('.description');
const clearButton = app.querySelector('.wrapper-description .clear-all');


// => functions
function renderTodos() {
    const completedTask = todos.filter(todoObj => todoObj.checked == true).length;
    description.innerText = `Completed tasks ${completedTask}`;
    let todoString = '';
    wrapperList.innerHTML = '';

    completedTask > 0 ? clearButton.hidden = false : clearButton.hidden = true;

    todos.forEach((todoObj, index) => {
        todoString += `
            <li id='${index}'>
                <label class="todo-wrapper" for="task${index}">
                    <div class="flex-left">
                        <input type="checkbox" name="todo-task" id="task${index}" class="todo-checkbox" ${todoObj.checked ? 'checked' : ''}>
                        <span class="todo-text">${todoObj.label}</span>
                        <span class="checkmark"></span>
                        <input type="text" class="todo-edit" value="${todoObj.label}" hidden>
                    </div>
                    <div class="flex-right">
                        <button class="delete-todo">&#8999;</button>
                        <button class="edit-todo">&#10247;</button>
                    </div>
                </label>
            </li>
        `;
        wrapperList.innerHTML = todoString;
    });
    
    saveToLocalStorageState();
}

function addTodo(event) {
    event.preventDefault();
    const label = this.value.trim();
    let checked = false;
    if(this.value != '' && !todos.find(todo => todo == this.value)) {
        todos = [
            ...todos,
            {
                label: this.value,
                checked
            }
        ];
        this.value = '';
        renderTodos();
    }
}

// Handler checked todo task
function handlerCheckedTodo(event) {
    if(event.target.tagName === 'INPUT' && event.target.getAttribute('name') == 'todo-task') {
        const id = parseInt(event.target.closest('li').getAttribute('id'), 10);
        todos[id].checked = !todos[id].checked;
        renderTodos();
    }
}

// Delete Todo item
function handlerDeleteTodo(event) {
    if(event.target.getAttribute('class') === 'delete-todo') {
        const id = parseInt(event.target.closest('li').getAttribute('id'), 10);
        if(confirm(`Are you sure to delete this task ==> ${todos[id].label}`)) {
            todos = todos.filter(todoObj => todoObj.label != todos[id].label);
            renderTodos();
        }
    }
}

// Edite Todo Item
function handlerEditTodo(event) {
    if(event.target.getAttribute('class') === 'edit-todo') {
        // wrapperList.removeEventListener('click', handlerCheckedTodo);
        const id = parseInt(event.target.closest('li').getAttribute('id'), 10);
        const todoText = app.querySelector(`li[id='${id}'] .todo-text`);
        const todoEdit = app.querySelector(`li[id='${id}'] .todo-edit`);

        // hidden true todo text
        todoText.hidden = true;
        // hidden false input edite
        todoEdit.hidden = false;

        // replace this value input to todo list array
        function changeValueOfTodo(event) {
            todos[id].label = this.value;
            renderTodos();

            // Clean the memory
            todoEdit.hidden = true;
            todoEdit.removeEventListener('change', changeValueOfTodo);
        }
        todoEdit.addEventListener('change', changeValueOfTodo);

        function handelerDoesntChaneValue(event) {
            if(event.key === 'Enter' && todos[id].label == this.value) {
                todoEdit.hidden = true;
                renderTodos();
            }

            // Clean the memory
            todoEdit.removeEventListener('keypress', changeValueOfTodo);
        }
        todoEdit.addEventListener('keypress', handelerDoesntChaneValue);
    }
}

function handlerClearBtn() {
    if(confirm('Are you sure for remove completed tasks?')) {
        todos = todos.filter(todoObj => todoObj.checked == false);
        renderTodos();
    }
}

function saveToLocalStorageState() {
    localStorage.setItem('todoApp', JSON.stringify(todos));
}

// => Initialize
const init = () => {
    // Initialize data from localStorage if exist
    const dataFromLocalStorage = JSON.parse(localStorage.getItem('todoApp'));
    todos = dataFromLocalStorage ? dataFromLocalStorage : [];
    renderTodos();
    
    // Add Todo
    inputTodo.addEventListener('change', addTodo);
    addBtnTodo.addEventListener('click', addTodo);
    // Update Todo
    wrapperList.addEventListener('click', handlerCheckedTodo);
    wrapperList.addEventListener('click', handlerDeleteTodo);
    wrapperList.addEventListener('click', handlerEditTodo);

    // Clear all compeleted task
    clearButton.addEventListener('click', handlerClearBtn)
}

// On Load
init();