const modeButton = document.getElementById("modeIconButton");
const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
const inputCheckButton = document.getElementById("inputCheckButton");
const toDoInput = document.getElementById("toDoInput");
const allToDosButton = document.getElementById("allToDosButton");
const activeToDosButton = document.getElementById("activeToDosButton");
const completedToDosButton = document.getElementById("completedToDosButton");
const allToDosContainer = document.getElementById("allToDosContainer");
const activeToDosContainer = document.getElementById("activeToDosContainer");
const completedToDosContainer = document.getElementById("completedToDosContainer");
const clearCompletedButton = document.getElementById("clearCompletedButton");

window.onload = async () => {
  try {
    await getAllToDos();
  } catch (error) {
    console.error(error);
  }
}

allToDosButton.onclick = () => {
  try {
    getAllToDos();
  } catch (error) {
    console.error(error);
  }
  allToDosButton.style.color = "var(--pagePrimaryColor)";
  allToDosContainer.classList.remove("undisplay");
  activeToDosButton.style.color = "var(--inactiveFontColor)";
  activeToDosContainer.classList.add("undisplay");
  completedToDosButton.style.color = "var(--inactiveFontColor)";
  completedToDosContainer.classList.add("undisplay");
}

activeToDosButton.onclick = async () => {
  try {
    getActiveToDos();
  } catch (error) {
    console.error(error);
  }
  allToDosButton.style.color = "var(--inactiveFontColor)";
  allToDosContainer.classList.add("undisplay");
  activeToDosButton.style.color = "var(--pagePrimaryColor)";
  activeToDosContainer.classList.remove("undisplay");
  completedToDosButton.style.color = "var(--inactiveFontColor)";
  completedToDosContainer.classList.add("undisplay");
}

completedToDosButton.onclick = async () => {
  try {
    getCompletedToDos();
  } catch (error) {
    console.error(error);
  }
  allToDosButton.style.color = "var(--inactiveFontColor)";
  allToDosContainer.classList.add("undisplay");
  activeToDosButton.style.color = "var(--inactiveFontColor)";
  activeToDosContainer.classList.add("undisplay");
  completedToDosButton.style.color = "var(--pagePrimaryColor)";
  completedToDosContainer.classList.remove("undisplay");
}

inputCheckButton.onclick = () => {
  const checkIcon = document.getElementById("checkIcon");
  const inputText = inputCheckButton.parentElement.nextElementSibling;
  checkIcon.classList.toggle("undisplay");
  toggleActiveClass(inputCheckButton);
  toggleCompletedClass(inputText);
  if (inputCheckButton.classList.contains("active")) {
    inputText.placeholder = "Create a new completed task...";
  } else {
    inputText.placeholder = "Create a new todo...";
  }
}

toDoInput.onkeypress = async keyPressed => {
  if (keyPressed.key === "Enter") {
    if (toDoInput.value.trim() !== "") {
      const toDo = toDoInput.value;
      const checkButton = toDoInput.previousElementSibling.firstElementChild;
      const isCompleted = checkButton.classList.contains("active");
      try {
        await postNewToDo(toDo, isCompleted);
        await getAllToDos();
      } catch (error) {
        console.error(error);
      }
      if (!isCompleted) {
        try {
          await getActiveToDos();
        } catch (error) {
          console.error(error);
        }
      } else {
        try {
          await getCompletedToDos();;
        } catch (error) {
          console.error(error);
        }
      }
      toDoInput.value = null
    }
  }
}

async function postNewToDo(toDo, isCompleted) {
  try {
    await fetch("https://todos-app-be.herokuapp.com/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "description": toDo,
        "isCompleted": isCompleted
      })
    })
  } catch (error) {
    console.error(error);
  }
}

async function getAllToDos() {
  allToDosContainer.innerHTML = null;
  try {
    const toDos = await fetch("https://todos-app-be.herokuapp.com/todos");
    const toDosJson = await toDos.json()
    toDosJson.map(toDo => {
      allToDosContainer.innerHTML += createTaskTemplate(toDo.isCompleted, toDo.id, toDo.description);
    })
    const checkButtons = createCheckButtonsArray();
    listenCheckButtons(checkButtons);

    setItemsLeft();

    const deleteButtons = createDeleteButtonsArray();
    listenDeleteButtons(deleteButtons, getAllToDos);
  } catch (error) {
    console.error(error)
  }
}

async function getActiveToDos() {
  activeToDosContainer.innerHTML = null;
  try {
    const toDos = await fetch("https://todos-app-be.herokuapp.com/todos");
    const toDosJson = await toDos.json()
    const activeToDos = toDosJson.filter(toDo => !toDo.isCompleted);
    activeToDos.map(toDo => {
      activeToDosContainer.innerHTML += createTaskTemplate(toDo.isCompleted, toDo.id, toDo.description);
    })
    const checkButtons = createCheckButtonsArray();
    listenCheckButtons(checkButtons);

    setItemsLeft();

    const deleteButtons = createDeleteButtonsArray();
    listenDeleteButtons(deleteButtons, getActiveToDos);
  } catch (error) {
    console.error(error)
  }
}

async function getCompletedToDos() {
  completedToDosContainer.innerHTML = null;
  try {
    const toDos = await fetch("https://todos-app-be.herokuapp.com/todos");
    const toDosJson = await toDos.json()
    const completedToDos = toDosJson.filter(toDo => toDo.isCompleted);
    completedToDos.map(toDo => {
      completedToDosContainer.innerHTML += createTaskTemplate(toDo.isCompleted, toDo.id, toDo.description);
    })
    const checkButtons = createCheckButtonsArray();
    listenCheckButtons(checkButtons);

    setItemsLeft();

    const deleteButtons = createDeleteButtonsArray();
    listenDeleteButtons(deleteButtons, getCompletedToDos);
  } catch (error) {
    console.error(error)
  }
}

function createTaskTemplate(isCompleted, id, description) {
  const template = `
  <div class="toDo">
  <div class="checkButtonBorder">
    <button class="checkButton ${isCompleted ? "active" : ""}">
      <img src="./Resources/icon-check.svg" alt="check Icon" class="${isCompleted ? "" : "undisplay"}">
    </button>
  </div>
  <p class="text ${isCompleted ? "completed" : ""}" id="${id}">${description}</p>
  <button class="deleteButton">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"><path class="deleteIcon" fill="#494C6B" fill-rule="evenodd" d="M16.97 0l.708.707L9.546 8.84l8.132 8.132-.707.707-8.132-8.132-8.132 8.132L0 16.97l8.132-8.132L0 .707.707 0 8.84 8.132 16.971 0z"/></svg>
  </button>
  `
  return template;
}

function createCheckButtonsArray(){
  const buttons = Array.from(document.querySelectorAll(".checkButton:not(#inputCheckButton)"));
  return buttons;
}

function createDeleteButtonsArray(){
  const buttons = Array.from(document.getElementsByClassName("deleteButton"));
  return buttons;
}

function setItemsLeft(){
  const currentToDosContainer = document.querySelectorAll(".toDosContainer>div:not(.undisplay, .toDosFooter)")[0];
  const numberOfItemsLeft = currentToDosContainer.childElementCount;
  const itemsLeft = document.getElementById("itemsLeft");
  itemsLeft.innerText = `${numberOfItemsLeft} items left`
}

function listenCheckButtons(checkButtonsArray) {
  checkButtonsArray.forEach(button => {
    button.onclick = async () => {
      toggleActiveClass(button);
      const task = button.parentElement.nextElementSibling;
      const checkIconImg = button.firstElementChild;
      if (button.classList.contains("active")) {
        checkIconImg.classList.remove("undisplay");
        try {
          await patchTask(task.id, task.innerText, true);
        } catch (error) {
          console.error(error);
        }
        task.classList.add("completed");
      } else {
        checkIconImg.classList.add("undisplay");
        try {
          const response = patchTask(task.id, task.innerText, false);
        } catch (error) {
          console.error(error);
        }
        task.classList.remove("completed");
      }
    }
  });
}

async function patchTask(id, description, isCompleted) {
  try {
    await fetch(`https://todos-app-be.herokuapp.com/todos/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "description": description,
        "isCompleted": isCompleted
      })
    })
  } catch (error) {
    console.error(error);
  }
}

function listenDeleteButtons(deleteButtonsArray, deletedTaskContainerFunction) {
  deleteButtonsArray.forEach(button => {
    button.onclick = async () => {
      const taskId = button.previousElementSibling.id;
      try {
        await fetch(`https://todos-app-be.herokuapp.com/todos/${taskId}`, {
          method: "DELETE"
        });
        await deletedTaskContainerFunction();
      } catch (error) {
        console.error(error);
      }
    }
  });
}

clearCompletedButton.onclick = async () => {
  try {
    await fetch("https://todos-app-be.herokuapp.com/todos/completed", {
      method: "DELETE"
    });
    location.reload();
  } catch (error) {
    console.error(error);
  }
}

function toggleActiveClass(button) {
  button.classList.toggle("active");
}

function toggleCompletedClass(text) {
  text.classList.toggle("completed");
}

function changeThemeIcon() {
  if (document.body.classList.contains("darkMode")) {
    modeButton.innerHTML=`
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26"><path class="modeIcon" fill="#FFF" fill-rule="evenodd" d="M13 21a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-5.657-2.343a1 1 0 010 1.414l-2.121 2.121a1 1 0 01-1.414-1.414l2.12-2.121a1 1 0 011.415 0zm12.728 0l2.121 2.121a1 1 0 01-1.414 1.414l-2.121-2.12a1 1 0 011.414-1.415zM13 8a5 5 0 110 10 5 5 0 010-10zm12 4a1 1 0 110 2h-3a1 1 0 110-2h3zM4 12a1 1 0 110 2H1a1 1 0 110-2h3zm18.192-8.192a1 1 0 010 1.414l-2.12 2.121a1 1 0 01-1.415-1.414l2.121-2.121a1 1 0 011.414 0zm-16.97 0l2.121 2.12A1 1 0 015.93 7.344L3.808 5.222a1 1 0 011.414-1.414zM13 0a1 1 0 011 1v3a1 1 0 11-2 0V1a1 1 0 011-1z"/></svg>
    `
  } else {
    modeButton.innerHTML=`
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26"><path class="modeIcon" fill="#FFF" fill-rule="evenodd" d="M13 0c.81 0 1.603.074 2.373.216C10.593 1.199 7 5.43 7 10.5 7 16.299 11.701 21 17.5 21c2.996 0 5.7-1.255 7.613-3.268C23.22 22.572 18.51 26 13 26 5.82 26 0 20.18 0 13S5.82 0 13 0z"/></svg>
    `
  }
}

function saveUserThemePreferences(){
  if (document.body.classList.contains("darkMode")){
    localStorage.setItem("darkMode", "true");
  } else {
    localStorage.setItem("darkMode", "false");
  }
}

modeButton.onclick = () => {
  document.body.classList.toggle("darkMode");
  saveUserThemePreferences();
  changeThemeIcon();
}

if (prefersDarkMode) {
  document.body.classList.add("darkMode");
  changeThemeIcon()
}

if (localStorage.getItem("darkMode") === "true"){
  document.body.classList.add("darkMode");
  changeThemeIcon();
} else {
  document.body.classList.remove("darkMode");
  changeThemeIcon();
}