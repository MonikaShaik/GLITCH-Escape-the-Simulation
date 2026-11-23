const newGameBtn = document.getElementById("newGameBtn");

newGameBtn.addEventListener("click", function () {
  document.getElementById("mainMenu").hidden = true;
  document.getElementById("characterSelect").hidden = false;
});

function selectCharacter(character) {
  localStorage.setItem("selectedCharacter", character);
  window.location.href = "network-maze.html";
}
