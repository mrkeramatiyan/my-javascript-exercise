import { default as App } from "./logic.js";

var preset1 = {
    titleOfApp: 'Todo list app one',
    idOfApp: 'todoList1'
};

const myapp1 = document.getElementById('myapp1');
const myapp2 = document.getElementById('myapp2');

const myApp = new App(myapp1, preset1);
const myApp2 = new App(myapp2);