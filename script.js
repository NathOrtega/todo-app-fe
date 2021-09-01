const modeButton = document.getElementById("modeIconButton");
const modeIcon = document.getElementById("modeIcon");
const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
const inputCheckButton = document.getElementById("inputCheckButton");
const toDoInput = document.getElementById("toDoInput");
const allToDosButton = document.getElementById("allToDosButton");
const activeToDosButton = document.getElementById("activeToDosButton");
const completedToDosButton = document.getElementById("completedToDosButton");
const allToDosContainer = document.getElementById("allToDosContainer");
const activeToDosContainer = document.getElementById("activeToDosContainer");
const completedToDosContainer = document.getElementById("completedToDosContainer");

allToDosButton.onclick = () => {
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
  } catch(error){
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
  } catch(error){
    console.error(error);
  }
  allToDosButton.style.color = "var(--inactiveFontColor)";
  allToDosContainer.classList.add("undisplay");
  activeToDosButton.style.color = "var(--inactiveFontColor)";
  activeToDosContainer.classList.add("undisplay");
  completedToDosButton.style.color = "var(--pagePrimaryColor)";
  completedToDosContainer.classList.remove("undisplay"); 
}

window.onload = () => {
  getAllToDos();
}

inputCheckButton.onclick = () => {
  const inputText = inputCheckButton.parentElement.nextElementSibling;
  toggleActiveClass(inputCheckButton);
  toggleCompletedClass(inputText);
  if (inputCheckButton.classList.contains("active")){
    inputText.placeholder = "Create a new completed task...";
  } else {
    inputText.placeholder = "Create a new todo...";
  }
}

toDoInput.onkeypress = async keyPressed => {
  if (keyPressed.key === "Enter"){
    if (toDoInput.value.trim() !== ""){
      const toDo = toDoInput.value;
      const checkButton = toDoInput.previousElementSibling.firstElementChild;
      const isCompleted = checkButton.classList.contains("active");
      try {
        await postNewToDo(toDo, isCompleted);
      } catch(error){
        console.error(error);
      }
      getAllToDos();
      if (!isCompleted){
        getActiveToDos()
      }
      toDoInput.value = null
    }
  }
}

async function postNewToDo(toDo, isCompleted){
  try {
    await fetch("https://todos-app-be.herokuapp.com/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify ({
        "description": toDo,
        "isCompleted": isCompleted
      })
    })
  } catch(error) {
    console.error(error);
  }
}

async function getAllToDos(){
  allToDosContainer.innerHTML = null;
  try {
    const toDos = await fetch("https://todos-app-be.herokuapp.com/todos");
    const toDosJson = await toDos.json()
    toDosJson.map(toDo => {
      allToDosContainer.innerHTML += `
      <div class="toDo">
      <div class="checkButtonBorder">
        <button class="checkButton ${toDo.isCompleted ? "active" : ""}">
          <img src="./Resources/icon-check.svg" alt="">
        </button>
      </div>
      <p class="text ${toDo.isCompleted ? "completed" : ""}">${toDo.description}</p>
      <button class="deleteButton" id="deleteButton">
        <img src="./Resources/icon-cross.svg" alt="Delete Cross">
      </button>
      `
    })
    const checkButtons = Array.from(document.querySelectorAll(".checkButton:not(#inputCheckButton)"));
    listenCheckButtons(checkButtons);
  } catch(error){
    console.log(error)
  }
}

async function getActiveToDos(){
  activeToDosContainer.innerHTML = null;
  try {
    const toDos = await fetch("https://todos-app-be.herokuapp.com/todos");
    const toDosJson = await toDos.json()
    const activeToDos = toDosJson.filter(toDo => !toDo.isCompleted);
    activeToDos.map(toDo => {
      activeToDosContainer.innerHTML += `
      <div class="toDo">
      <div class="checkButtonBorder">
        <button class="checkButton">
          <img src="./Resources/icon-check.svg" alt="">
        </button>
      </div>
      <p class="text">${toDo.description}</p>
      <button class="deleteButton" id="deleteButton">
        <img src="./Resources/icon-cross.svg" alt="Delete Cross">
      </button>
      `
    })
    const checkButtons = Array.from(document.querySelectorAll(".checkButton:not(#inputCheckButton)"));
    listenCheckButtons(checkButtons);
  } catch(error){
  console.log(error)
  }
}

async function getCompletedToDos(){
  completedToDosContainer.innerHTML = null;
  try {
    const toDos = await fetch("https://todos-app-be.herokuapp.com/todos");
    const toDosJson = await toDos.json()
    const completedToDos = toDosJson.filter(toDo => toDo.isCompleted);
    completedToDos.map(toDo => {
      completedToDosContainer.innerHTML += `
      <div class="toDo">
      <div class="checkButtonBorder">
        <button class="checkButton active">
          <img src="./Resources/icon-check.svg" alt="">
        </button>
      </div>
      <p class="text completed">${toDo.description}</p>
      <button class="deleteButton" id="deleteButton">
        <img src="./Resources/icon-cross.svg" alt="Delete Cross">
      </button>
      `
    })
    const checkButtons = Array.from(document.querySelectorAll(".checkButton:not(#inputCheckButton)"));
    listenCheckButtons(checkButtons);
  } catch(error){
  console.log(error)
  }
}

function listenCheckButtons(buttonsArray){
  buttonsArray.forEach(button => {
    button.onclick = () => {
      toggleActiveClass(button);
      const task = button.parentElement.nextElementSibling;
      if (button.classList.contains("active")){
        task.classList.add("completed");
      } else {
        task.classList.remove("completed");
      }
    }
  });
}

function toggleActiveClass(button){
  button.classList.toggle("active");
}

function toggleCompletedClass(text){
  text.classList.toggle("completed");
}

function changeThemeIcon(){
  if (document.body.classList.contains("darkMode")) {
    modeIcon.src = "./Resources/icon-sun.svg";
  } else {
    modeIcon.src = "./Resources/icon-moon.svg";
  }
}

modeButton.onclick = () => {
  document.body.classList.toggle("darkMode");
  changeThemeIcon();
}

if (prefersDarkMode) {
  document.body.classList.add("darkMode");
  changeThemeIcon()
}