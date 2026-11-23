// ============ 1. DATA ============
const SYMBOLS = ["△", "○", "□", "✕", "◇", "⬡"];  // the 6 symbols
const SEQUENCE_LENGTH = 3;
const SUSPICION_STEP = 20;                        // each wrong attempt adds 20%

let correctSequence = [];   // the correct sequence
let selected = [];          // what the player has selected so far
let suspicion = 0;
let locked = false;         // true once the game is won or lost

// ============ 2. ELEMENTS from the HTML ============
const targetEl   = document.getElementById("target");
const symbolsEl  = document.getElementById("symbols");
const slotsEl    = document.getElementById("slots");
const messageEl  = document.getElementById("message");
const confirmBtn = document.getElementById("confirmBtn");
const resetBtn   = document.getElementById("resetBtn");
const fillEl     = document.getElementById("suspicionFill");
const suspTextEl = document.getElementById("suspicionText");

// ============ 3. Create a correct symbol sequence ============
function createSequence() {
  // shuffle the symbols, then take the first 3
  const shuffled = [...SYMBOLS].sort(() => Math.random() - 0.5);
  correctSequence = shuffled.slice(0, SEQUENCE_LENGTH);
  targetEl.innerHTML = correctSequence.map(s => `<span>${s}</span>`).join("");
}

// ============ 4. Display clickable symbols ============
function renderSymbols() {
  symbolsEl.innerHTML = "";
  SYMBOLS.forEach(symbol => {
    const btn = document.createElement("button");
    btn.className = "symbol";
    btn.textContent = symbol;
    btn.addEventListener("click", () => selectSymbol(symbol, btn));
    symbolsEl.appendChild(btn);
  });
}

// ============ 5. Allow players to select symbols + Highlight ============
function selectSymbol(symbol, btn) {
  if (locked || selected.length >= SEQUENCE_LENGTH) return;
  selected.push(symbol);
  btn.classList.add("selected");          // highlight the clicked symbol
  renderSlots();
}

function renderSlots() {
  slotsEl.innerHTML = "";
  for (let i = 0; i < SEQUENCE_LENGTH; i++) {
    const slot = document.createElement("div");
    slot.className = "slot" + (selected[i] ? " filled" : "");
    slot.textContent = selected[i] || "";
    slotsEl.appendChild(slot);
  }
}

// ============ 6. Check the selected order ============
function checkOrder() {
  if (locked) return;
  if (selected.length < SEQUENCE_LENGTH) {
    showMessage("Select all 3 symbols first.", "error");
    return;
  }
  const isCorrect = selected.every((s, i) => s === correctSequence[i]);
  if (isCorrect) {
    win();
  } else {
    wrongAttempt();
  }
}

// ============ 7. Increase suspicion after wrong attempts ============
function wrongAttempt() {
  suspicion = Math.min(100, suspicion + SUSPICION_STEP);
  updateSuspicion();
  slotsEl.classList.add("shake");
  setTimeout(() => slotsEl.classList.remove("shake"), 400);

  if (suspicion >= 100) {
    lose();
  } else {
    showMessage("Wrong order. NEXUS is getting suspicious.", "error");
    resetPattern();                        // clear the selection so the player can retry
  }
}

function updateSuspicion() {
  fillEl.style.width = suspicion + "%";
  suspTextEl.textContent = suspicion + "%";
}

// ============ 8. Reset Pattern button ============
function resetPattern() {
  selected = [];
  document.querySelectorAll(".symbol").forEach(b => b.classList.remove("selected"));
  renderSlots();
}

// ============ 9. Win / Lose ============
function win() {
  locked = true;
  confirmBtn.disabled = true;
  showMessage("Access granted. Pattern accepted.", "success");
  // Later, call your next stage from here, e.g. goToNextStage();
}

function lose() {
  locked = true;
  confirmBtn.disabled = true;
  showMessage("NEXUS found you. Connection lost.", "error");
}

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = "message " + type;
}

// ============ 10. START ============
confirmBtn.addEventListener("click", checkOrder);
resetBtn.addEventListener("click", resetPattern);

createSequence();
renderSymbols();
renderSlots();
