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
const API_URL = "https://todos-app-be.herokuapp.com";
let activeTab = null;

window.onload = async () => {
  try {
    getAllToDos();
  } catch (error) {
    console.error(error);
  }
  activeTab = allToDosContainer;
}

inputCheckButton.onclick = () => {
  const checkIcon = document.getElementById("checkIcon");
  toggleHiddenClass(checkIcon);
  toggleActiveClass(inputCheckButton);
  toggleCompletedClass(toDoInput);
  if (inputCheckButton.classList.contains("active")) {
    toDoInput.placeholder = "Create a new completed task...";
  } else {
    toDoInput.placeholder = "Create a new todo...";
  }
}

toDoInput.onkeydown = async keyPressed => {
  if (keyPressed.key === "Enter") {
    if (toDoInput.value.trim() !== "") {
      const toDo = toDoInput.value;
      const isCompleted = inputCheckButton.classList.contains("active");
      try {
        await createToDo(toDo, isCompleted);
        refreshActiveTab();
      } catch (error) {
        console.error(error);
      }
      toDoInput.value = null
    }
  }
}

allToDosButton.onclick = () => {
  try {
    getAllToDos();
  } catch (error) {
    console.error(error);
  }
  toggleFilter(allToDosButton, allToDosContainer);
  activeTab = allToDosContainer;
}

activeToDosButton.onclick = async () => {
  try {
    getActiveToDos();
  } catch (error) {
    console.error(error);
  }
  toggleFilter(activeToDosButton, activeToDosContainer);
  activeTab = activeToDosContainer;
}

completedToDosButton.onclick = async () => {
  try {
    getCompletedToDos();
  } catch (error) {
    console.error(error);
  }
  toggleFilter(completedToDosButton, completedToDosContainer);
  activeTab = completedToDosContainer;
}

clearCompletedButton.onclick = async () => {
  try {
    await fetch(`${API_URL}/todos/completed`, {
      method: "DELETE"
    });
    location.reload();
  } catch (error) {
    console.error(error);
  }
}

async function refreshActiveTab() {
  try {
    if (activeTab.id === activeToDosContainer.id) {
      await getActiveToDos();
    } else if (activeTab.id === completedToDosContainer.id) {
      await getCompletedToDos();
    } else {
      await getAllToDos();
    }
  } catch (error) {
    console.error(error);
  }
}

function toggleFilter(clickedTab, toDosContainer) {
  const filters = [allToDosButton, activeToDosButton, completedToDosButton];
  filters.forEach(filter => {
    if (filter.id === clickedTab.id) {
      filter.style.color = "var(--pagePrimaryColor)";
    } else {
      filter.style.color = "var(--inactiveFontColor)";
    }
  });

  const containers = [allToDosContainer, activeToDosContainer, completedToDosContainer];
  containers.forEach(container => {
    if (container.id === toDosContainer.id) {
      container.classList.remove("hidden");
    } else {
      container.classList.add("hidden");
    }
  })
}

async function createToDo(toDo, isCompleted) {
  try {
    toggleSpinner()
    await fetch(`${API_URL}/todos`, {
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
  } finally {
    toggleSpinner();
  }
}

async function fetchToDos(criteriaFunction) {
  try {
    toggleSpinner();
    const response = await fetch(`${API_URL}/todos`);
    const toDos = await response.json();
    sortToDos(toDos);
    if (criteriaFunction) {
      return toDos.filter(criteriaFunction);
    }
    return toDos;
  } catch (error) {
    console.error(error);
  } finally {
    toggleSpinner();
  }
}

function renderToDos(toDos, container) {
  container.innerHTML = null;
  toDos.map(toDo => {
    container.innerHTML += createTaskTemplate(toDo.isCompleted, toDo.id, toDo.description);
  })

  setItemsLeft(container);
}

async function getAllToDos() {
  const toDos = await fetchToDos();
  renderToDos(toDos, allToDosContainer);
}

async function getActiveToDos() {
  const toDos = await fetchToDos(toDo => !toDo.isCompleted);
  renderToDos(toDos, activeToDosContainer);
}

async function getCompletedToDos() {
  const toDos = await fetchToDos(toDo => toDo.isCompleted);
  renderToDos(toDos, completedToDosContainer);
}

function createTaskTemplate(isCompleted, id, description) {
  const template = `
  <div class="toDo">
  <div class="checkButtonBorder">
    <button class="checkButton ${isCompleted ? "active" : ""}" id="checkButton${id}" onclick="toggleToDo(${id}, ${isCompleted})">
      <img src="./Resources/icon-check.svg" alt="check Icon" class="${isCompleted ? "" : "hidden"}" id="checkIcon${id}">
    </button>
  </div>
  <p class="text ${isCompleted ? "completed" : ""}" id="${id}">${description}</p>
  <button class="deleteButton" id="deleteButton${id}" onclick="removeToDo(${id})">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"><path class="deleteIcon" fill="#494C6B" fill-rule="evenodd" d="M16.97 0l.708.707L9.546 8.84l8.132 8.132-.707.707-8.132-8.132-8.132 8.132L0 16.97l8.132-8.132L0 .707.707 0 8.84 8.132 16.971 0z"/></svg>
  </button>
  `
  return template;
}


function setItemsLeft(container) {
  const numberOfItemsLeft = container.childElementCount;
  const itemsLeft = document.getElementById("itemsLeft");
  itemsLeft.innerText = `${numberOfItemsLeft} ${numberOfItemsLeft === 1 ? "item left" : "items left"}`;
}

async function toggleToDo(id, isCompleted) {
  const task = document.getElementById(id);
  const button = document.getElementById(`checkButton${id}`)
  const checkIcon = document.getElementById(`checkIcon${id}`);
  try {
    await patchTask(task.id, !isCompleted);
    toggleActiveClass(button);
    toggleHiddenClass(checkIcon);
    toggleCompletedClass(task);
  } catch (error) {
    console.error(error);
  }
  refreshActiveTab();
}

async function patchTask(id, isCompleted) {
  try {
    toggleSpinner();
    await fetch(`${API_URL}/todos/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "isCompleted": isCompleted
      })
    })
  } catch (error) {
    console.error(error);
  } finally {
    toggleSpinner();
  }
}

async function removeToDo(id) {
  try {
    await fetch(`${API_URL}/todos/${id}`, {
      method: "DELETE"
    });
  } catch (error) {
    console.error(error);
  }
  refreshActiveTab();
}

async function sortToDos(toDos) {
  toDos.forEach(toDo => {
    toDo.date = new Date(toDo.createdAt);
  });
  toDos.sort((elementA, elementB) => {
    return elementB.date - elementA.date
  })
}

function toggleSpinner() {
  const lightBox = document.getElementById("lightBox");
  const spinner = document.getElementById("spinnerContainer");

  toggleHiddenClass(lightBox);
  toggleHiddenClass(spinner);
}

function toggleActiveClass(element) {
  element.classList.toggle("active");
}

function toggleCompletedClass(element) {
  element.classList.toggle("completed");
}

function toggleHiddenClass(element) {
  element.classList.toggle("hidden");
}

// Handle dark mode

function changeThemeIcon() {
  if (document.body.classList.contains("darkMode")) {
    modeButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26"><path class="modeIcon" fill="#FFF" fill-rule="evenodd" d="M13 21a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-5.657-2.343a1 1 0 010 1.414l-2.121 2.121a1 1 0 01-1.414-1.414l2.12-2.121a1 1 0 011.415 0zm12.728 0l2.121 2.121a1 1 0 01-1.414 1.414l-2.121-2.12a1 1 0 011.414-1.415zM13 8a5 5 0 110 10 5 5 0 010-10zm12 4a1 1 0 110 2h-3a1 1 0 110-2h3zM4 12a1 1 0 110 2H1a1 1 0 110-2h3zm18.192-8.192a1 1 0 010 1.414l-2.12 2.121a1 1 0 01-1.415-1.414l2.121-2.121a1 1 0 011.414 0zm-16.97 0l2.121 2.12A1 1 0 015.93 7.344L3.808 5.222a1 1 0 011.414-1.414zM13 0a1 1 0 011 1v3a1 1 0 11-2 0V1a1 1 0 011-1z"/></svg>
    `
  } else {
    modeButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26"><path class="modeIcon" fill="#FFF" fill-rule="evenodd" d="M13 0c.81 0 1.603.074 2.373.216C10.593 1.199 7 5.43 7 10.5 7 16.299 11.701 21 17.5 21c2.996 0 5.7-1.255 7.613-3.268C23.22 22.572 18.51 26 13 26 5.82 26 0 20.18 0 13S5.82 0 13 0z"/></svg>
    `
  }
}

function saveUserThemePreferences() {
  if (document.body.classList.contains("darkMode")) {
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

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("darkMode");
  changeThemeIcon();
} else {
  document.body.classList.remove("darkMode");
  changeThemeIcon();
}