const modeButton = document.getElementById("modeIconButton");
const modeIcon = document.getElementById("modeIcon");
const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

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
} else {
  document.body.classList.remove("darkMode");
  changeThemeIcon()
}