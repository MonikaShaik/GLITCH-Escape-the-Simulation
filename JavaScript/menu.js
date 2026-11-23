// const newGameBtn = document.getElementById("newGameBtn");

// newGameBtn.addEventListener("click", function () {
//   document.getElementById("mainMenu").hidden = true;
//   document.getElementById("characterSelect").hidden = false;
// });

// function selectCharacter(character) {
//   localStorage.setItem("selectedCharacter", character);
//   window.location.href = "password.html";
// }

/* GLITCH - MAIN MENU */

// NEW GAME
const newGameBtn = document.getElementById("newGameBtn");
const mainMenu = document.getElementById("mainMenu");
const characterSelect = document.getElementById("characterSelect");

// START NEW GAME
newGameBtn.addEventListener("click", function () {
  mainMenu.hidden = true;
  characterSelect.hidden = false;
});

// SELECT CHARACTER
function selectCharacter(character) {
  // Save selected character
  localStorage.setItem("selectedCharacter", character);

  // Open story selection
  window.location.href = "story.html";
}
