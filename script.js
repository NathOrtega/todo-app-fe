const modeButton = document.getElementById("modeIconButton");
const modeIcon = document.getElementById("modeIcon");
const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
const checkButtons = Array.from(document.getElementsByClassName("checkButton"));
const toDoInput = document.getElementById("toDoInput");

checkButtons.forEach(button => {
  button.onclick = () => {
    button.classList.toggle("active");
  }
});

toDoInput.onkeypress = keyPressed => {
  if (keyPressed.key === "Enter"){
    if (toDoInput.value.trim() !== ""){
      const toDo = toDoInput.value;
      const checkButton=toDoInput.previousElementSibling.firstElementChild;
      const isCompleted=checkButton.classList.contains("active");
      postNewToDo(toDo, isCompleted);
      getAllToDos();
      toDoInput.value=null
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
  const allToDosContainer=document.getElementById("allToDosContainer");
  try {
    const toDos=await fetch("https://todos-app-be.herokuapp.com/todos");
    const toDosJson=await toDos.json()
    toDosJson.map(toDo => {
      allToDosContainer.innerHTML+=`
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
  } catch(error){
    console.log(error)
  }
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