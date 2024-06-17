// Select elements
let taskDue = $('#task-due-date');
let taskTitle = $('#task-title');
let taskDescription = $('#task-description');
const submitButton = $('#submit-button');
const lanes = $('.lane')

// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || [];

// Generates a unique task id
function generateTaskId() {
    
    const taskId = crypto.randomUUID();
    return taskId;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    
    // Create HTML elements
    const bodyClass = $('<div>'); 
    const cardTitle = $('<h5>');
    const cardDescription = $('<p>');
    const cardDueDate = $('<p>');
    const cardDelete = $('<button>');

    // Assign class attributes
    bodyClass.attr('class', 'card-body');
    cardTitle.attr('class', 'card-title')
    cardDescription.attr('class', 'card-text')
    cardDueDate.attr('class', 'card-text')
    cardDelete.attr('class', 'btn btn-danger delete')

    // Add text content
    cardTitle.text(task.title);
    cardDescription.text(task.description);
    cardDueDate.text(task.dueDate);
    cardDelete.text('Delete')
    cardDelete.attr('data-taskId', task.id.toString());

    // Create an event listener for the card's delete button
    cardDelete.on('click', handleDeleteTask)

    // Append elements to the body
    bodyClass.append(cardTitle);
    bodyClass.append(cardDescription);
    bodyClass.append(cardDueDate);
    bodyClass.append(cardDelete);
    return bodyClass
   
}

// Render the task list and make cards draggable
function renderTaskList() {

    // Erase the cards from the lanes
    $('#todo-cards').empty();
    $('#in-progress-cards').empty();
    $('#done-cards').empty();

    for (const task of taskList)
    {
        // Recieve the bodyClass content from the createTaskCard function
        const bodyClass = createTaskCard(task);

        // Create div elements
        const colClass = $('<div>');
        const cardClass = $('<div>');
        
        // Add classes and datasets
        colClass.attr('class', 'col');
        colClass.attr('data-taskId', task.id);
        colClass.attr('data-status', task.status);
        cardClass.attr('class', 'card');

        // Append content to the page in the correct lane
        cardClass.append(bodyClass);
        colClass.append(cardClass)
        $(`#${task.status}-cards`).append(colClass);

        // Change color based on the due date
        if (task.status === 'todo' || task.status === 'in-progress')
        {    
            if(dayjs().isSame(task.dueDate, 'day'))
            {
                // bodyClass.attr('class', '$warning')
                bodyClass.attr('style', 'color: #fff; background-color: #ffc107;')  
            } 
            else if (dayjs().isAfter(task.dueDate, 'day'))
            {
                // bodyClass.attr('class', 'danger')
                bodyClass.attr('style', 'color: #fff; background-color: #dc3545;') 
                $('.btn').attr('style', 'border-color: white')
            }
        }   

        // Make cards draggable
        $( function() {
            $( colClass ).draggable(
                {
                    stack: colClass,
                    opacity: 0.7,
                    revert: 'invalid'
                });
          } );
        
    }
}

// Adds a new task
function handleAddTask(event){
    
    // Prevents page refresh
    event.preventDefault();

    // Task object
    const task = 
    {
        // Sets id to the id ID in local storage or generates one
        id: JSON.parse(localStorage.getItem("nextId")) || generateTaskId(),
        title: taskTitle.val().trim(),
        dueDate: taskDue.val(),
        description: taskDescription.val().trim(),
        status: 'todo'
    }

    // Add task to the array
    taskList.push(task);
    
    // Generates the next id and updates local storage
    localStorage.setItem('nextId',  JSON.stringify(generateTaskId()))
    
    // update the task array in local storage
    localStorage.setItem('tasks', JSON.stringify(taskList))
   
    // Clears form fields
    taskTitle.val('')
    taskDue.val('')
    taskDescription.val('')

    renderTaskList()
}

// Deletes a task 
function handleDeleteTask(event){
   
    // Get the task id of the button
    const thisTaskId = event.target.getAttribute('data-taskId')

    // Create a temporary array
    let temp = []

    for(let task of taskList)
    {
        if (task.id != thisTaskId)
        {
            temp.push(task)
        }
    }
   
    // Update taskList in local storage
    taskList = temp
    localStorage.setItem('tasks', JSON.stringify(taskList));

    // Display the updated taskList 
    renderTaskList()
    
}

// Changes status when dropped into a new lane
function handleDrop(event, ui) {
    
    
    for (let task of taskList)
    {
        // If the task id matches the task id of the card dragged, change the status to the id of the lane
        if(ui.draggable[0].dataset.taskid.match(task.id))
        {
            task.status = event.target.id
        }

    }
    
    // Update taskList in local storage
    localStorage.setItem('tasks', JSON.stringify(taskList))
    
    // Display the updated taskList 
    renderTaskList()
}

// On load setup
$(document).ready(function () {

    // Date Picker
    $( function() {
        $( taskDue ).datepicker({
        changeMonth: true,
        changeYear: true
    });
    } );

    // Makes lanes droppable
    $( function() {
        $( lanes ).droppable({
            drop:  handleDrop
        });
    } );

    // Display tasks when the page loads
    renderTaskList()

    // New task event handler
    submitButton.on('click',handleAddTask);

});
