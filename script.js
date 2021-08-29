const modeButton=document.getElementById("modeIconButton");
const modeIcon=document.getElementById("modeIcon");

modeButton.onclick = () => {
  document.body.classList.toggle("darkMode");
  if (document.body.classList.contains("darkMode")){
    modeIcon.src="./Resources/icon-sun.svg";
  } else {
    modeIcon.src="./Resources/icon-moon.svg";
  }
}