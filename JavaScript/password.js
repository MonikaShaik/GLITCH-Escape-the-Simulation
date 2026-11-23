/* GLITCH: Escape the Simulation
 * Stage 2 (Path A - Hacker): Crack the Password
 *
 * Contributions (fill in your team's actual names):
 * [Name] - puzzle and game rules
 * [Name] - saving and loading
 * [Name] - HTML and CSS
 */

const SAVE_KEY = "glitchSave";
const CORRECT_ANSWER = "keyboard";
const WRONG_ANSWER_PENALTY = 15;

function newGameState() {
  return {
    character: "hacker",
    path: "A",
    stage: 2,
    suspicion: 0,
    inventory: [],
    score: 0,
    solved: { password: false },
    attempts: 0,
    gameOver: false
  };
}

let state = newGameState();

// Find the HTML elements once by their IDs.
const answerInput = document.getElementById("answerInput");
const submitBtn = document.getElementById("submitBtn");
const answerRow = document.getElementById("answerRow");
const riddle = document.getElementById("riddle");
const lockIcon = document.getElementById("lockIcon");
const feedback = document.getElementById("feedback");
const attempts = document.getElementById("attempts");
const unlocked = document.getElementById("unlocked");
const suspicion = document.getElementById("suspicion");
const suspicionValue = document.getElementById("suspicionValue");
const suspicionBar = document.getElementById("suspicionBar");
const suspicionFill = document.getElementById("suspicionFill");
const gameOver = document.getElementById("gameOver");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");

function saveGame() {
  try {
    const saveText = JSON.stringify(state);
    localStorage.setItem(SAVE_KEY, saveText);
  } catch (error) {
    console.warn("Could not save game.", error);
  }
}

function loadGame() {
  try {
    const saveText = localStorage.getItem(SAVE_KEY);
    if (!saveText) {
      return;
    }

    const savedGame = JSON.parse(saveText);

    // Copy saved values over the defaults. Keep defaults for missing fields.
    for (const field in savedGame) {
      if (field !== "solved") {
        state[field] = savedGame[field];
      }
    }

    for (const puzzle in savedGame.solved) {
      state.solved[puzzle] = savedGame.solved[puzzle];
    }
  } catch (error) {
    console.warn("Could not load game. Starting fresh.", error);
    state = newGameState();
  }
}

function restartGame() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.warn("Could not remove the saved game.", error);
  }

  state = newGameState();
  answerInput.value = "";
  feedback.textContent = "";
  renderGame();
}

function addInventoryItem(itemName) {
  for (let i = 0; i < state.inventory.length; i++) {
    if (state.inventory[i] === itemName) {
      return;
    }
  }

  state.inventory.push(itemName);
}

function checkAnswer() {
  if (state.solved.password || state.gameOver) {
    return;
  }

  // Ignore spaces around the answer and accept uppercase or lowercase.
  const typedAnswer = answerInput.value.trim();
  const answer = typedAnswer.toLowerCase();

  if (answer === "") {
    feedback.textContent = "Type an answer first.";
    return;
  }

  state.attempts = state.attempts + 1;

  if (answer === CORRECT_ANSWER) {
    state.solved.password = true;
    state.score = state.score + 10;
    addInventoryItem("Encryption Key");
    addInventoryItem("DB Coordinates");
    feedback.textContent = "";
  } else {
    state.suspicion = state.suspicion + WRONG_ANSWER_PENALTY;

    if (state.suspicion >= 100) {
      state.suspicion = 100;
      state.gameOver = true;
    }

    feedback.textContent = "Wrong password. Suspicion +" + WRONG_ANSWER_PENALTY + ". Try again.";
  }

  saveGame();
  renderGame();

  if (!state.solved.password && !state.gameOver) {
    answerInput.select();
  }
}

function renderSuspicion() {
  const percent = state.suspicion + "%";
  suspicionValue.textContent = percent;
  suspicionFill.style.width = percent;
  suspicionBar.setAttribute("aria-valuenow", state.suspicion);

  suspicion.classList.remove("warning", "danger");

  if (state.suspicion >= 70) {
    suspicion.classList.add("danger");
  } else if (state.suspicion >= 40) {
    suspicion.classList.add("warning");
  }
}

function renderGame() {
  renderSuspicion();
  attempts.textContent = "Attempts: " + state.attempts;

  const solved = state.solved.password;
  unlocked.hidden = !solved;
  riddle.hidden = solved;
  answerRow.hidden = solved;
  attempts.hidden = solved;
  feedback.hidden = solved;

  if (solved) {
    lockIcon.classList.add("is-open");
  } else {
    lockIcon.classList.remove("is-open");
  }

  gameOver.hidden = !state.gameOver;
  answerInput.disabled = state.gameOver;
  submitBtn.disabled = state.gameOver;

  if (state.gameOver) {
    restartBtn.focus();
  } else if (solved) {
    nextBtn.focus();
  } else {
    answerInput.focus();
  }
}

function handleAnswerKey(event) {
  if (event.key === "Enter") {
    checkAnswer();
  }
}

function continueToStageThree() {
  state.stage = 3;
  saveGame();
  window.location.href = "pattern.html";
}


submitBtn.addEventListener("click", checkAnswer);
answerInput.addEventListener("keydown", handleAnswerKey);
restartBtn.addEventListener("click", restartGame);
nextBtn.addEventListener("click", continueToStageThree);

document.getElementById("replayBtn").addEventListener("click", restartGame);

loadGame();
renderGame();