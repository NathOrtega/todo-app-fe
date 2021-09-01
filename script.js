const modeButton = document.getElementById("modeIconButton");
const modeIcon = document.getElementById("modeIcon");
const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
const inputCheckButton = document.getElementById("inputCheckButton");
const toDoInput = document.getElementById("toDoInput");

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
      await postNewToDo(toDo, isCompleted);
      getAllToDos();
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
  const allToDosContainer = document.getElementById("allToDosContainer");
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
    const checkButtons = Array.from(document.getElementsByClassName("checkButton"));
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