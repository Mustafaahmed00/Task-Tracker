document.addEventListener("DOMContentLoaded", function() {
    loadTasksFromLocalStorage();
    // Listen for changes in the sort select for incomplete tasks
    let sortSelectIncomplete = document.getElementById("sort-by-incomplete");
    sortSelectIncomplete.addEventListener('change', function() {
        sortTasks(incompleteTaskHolder, this.value);
    });

    // Listen for changes in the sort select for completed tasks
    let sortSelectCompleted = document.getElementById("sort-by-completed");
    sortSelectCompleted.addEventListener('change', function() {
        sortTasks(completedTasksHolder, this.value);
    });
});

// Get elements
let taskInput = document.getElementById("new-task");
let taskDate = document.getElementById("task-date");
let taskPriority = document.getElementById("task-priority");
let addButton = document.getElementById("add-task-btn");
let incompleteTaskHolder = document.getElementById("incomplete-tasks");
let completedTasksHolder = document.getElementById("completed-tasks");
let sortSelect = document.getElementById("sort-by");

// Add Task
addButton.addEventListener("click", function() {
    let taskName = taskInput.value;
    let dueDate = taskDate.value;
    let priority = taskPriority.value;

    if (taskName) {
        let listItem = createNewTaskElement(taskName, dueDate, priority);
        incompleteTaskHolder.appendChild(listItem);
        bindTaskEvents(listItem, taskCompleted);
        taskInput.value = "";
        taskDate.value = "";
        taskPriority.value = "low";
        saveTasksToLocalStorage();
    }
});


function createNewTaskElement(taskName, dueDate, priority) {
    let listItem = document.createElement("li");
    let checkBox = document.createElement("input");
    let label = document.createElement("label");
    let date = document.createElement("span");
    let prioritySpan = document.createElement("span");
    let editInput = document.createElement("input");
    let editButton = document.createElement("button");
    let deleteButton = document.createElement("button");

    checkBox.type = "checkbox";
    editInput.type = "text";
    editButton.textContent = "Edit";
    editButton.className = "edit";
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete";
    label.textContent = taskName;
    date.textContent = dueDate;
    prioritySpan.textContent = priority;
    date.setAttribute('data-type', 'date');
    prioritySpan.setAttribute('data-type', 'priority');
    prioritySpan.style.backgroundColor = getPriorityColor(priority);

    listItem.appendChild(checkBox);
    listItem.appendChild(label);
    listItem.appendChild(date);
    listItem.appendChild(prioritySpan);
    listItem.appendChild(editInput);
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);

    return listItem;
}

function getPriorityColor(priority) {
    const colors = {
        high: '#f44336', // red
        medium: '#ffeb3b', // yellow
        low: '#4caf50' // green
    };
    return colors[priority.toLowerCase()];
}

function bindTaskEvents(taskListItem, checkBoxEventHandler) {
    let checkBox = taskListItem.querySelector("input[type=checkbox]");
    let editButton = taskListItem.querySelector("button.edit");
    let deleteButton = taskListItem.querySelector("button.delete");

    editButton.onclick = editTask;
    deleteButton.onclick = deleteTask;
    checkBox.onchange = checkBoxEventHandler;
}

function editTask() {
    let listItem = this.parentNode;
    let editInput = listItem.querySelector("input[type=text]");
    let label = listItem.querySelector("label");
    let containsClass = listItem.classList.contains("editMode");

    if (containsClass) {
        label.innerText = editInput.value;
        listItem.classList.remove("editMode");
    } else {
        editInput.value = label.innerText;
        listItem.classList.add("editMode");
    }
    saveTasksToLocalStorage();
}

function deleteTask() {
    let listItem = this.parentNode;
    let ul = listItem.parentNode;
    ul.removeChild(listItem);
    saveTasksToLocalStorage();
}

function taskCompleted() {
    let listItem = this.parentNode;
    completedTasksHolder.appendChild(listItem);
    bindTaskEvents(listItem, taskIncomplete);
    saveTasksToLocalStorage();
}

function taskIncomplete() {
    let listItem = this.parentNode;
    incompleteTaskHolder.appendChild(listItem);
    bindTaskEvents(listItem, taskCompleted);
    saveTasksToLocalStorage();
}

function sortTasks(taskHolder, sortBy) {
    let tasks = Array.from(taskHolder.children);
    if (sortBy === "date") {
        tasks.sort(function(a, b) {
            let dateA = new Date(a.querySelector("span[data-type='date']").textContent);
            let dateB = new Date(b.querySelector("span[data-type='date']").textContent);
            return dateA - dateB;
        });
    } else if (sortBy === "priority") {
        const priorityLevels = { high: 1, medium: 2, low: 3 };
        tasks.sort(function(a, b) {
            let priorityA = priorityLevels[a.querySelector("span[data-type='priority']").textContent.toLowerCase()];
            let priorityB = priorityLevels[b.querySelector("span[data-type='priority']").textContent.toLowerCase()];
            return priorityA - priorityB;
        });
    }

    tasks.forEach(task => taskHolder.appendChild(task));
}


function saveTasksToLocalStorage() {
    let tasks = [];
    Array.from(incompleteTaskHolder.children).forEach(task => {
        let taskDetails = {
            name: task.querySelector("label").textContent,
            dueDate: task.querySelector("span[data-type='date']").textContent,
            priority: task.querySelector("span[data-type='priority']").textContent
        };
        tasks.push(taskDetails);
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
    let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    tasks.forEach(task => {
        let listItem = createNewTaskElement(task.name, task.dueDate, task.priority);
        incompleteTaskHolder.appendChild(listItem);
        bindTaskEvents(listItem, taskCompleted);
    });
}
