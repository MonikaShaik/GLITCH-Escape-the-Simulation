/* ===== DATA - Contributor: <NAME> =====
   Layout legend: '.' open node, '#' blocked, 'S' start/source, 'E' exit.
   One reusable maze, four configurations (one per storyline, Stage 4). */
const MAZES = {
  A: {
    title: "Hacker A - Decrypt Message",
    time: 60,
    penalty: 30,
    story:
      "FIREWALL ACTIVATED. Connect the infected network to the central NEXUS server.",
    grid: [
      "S.#...",
      "#.#.#.",
      "....#.",
      ".####.".replace("####", "#..#"),
      "......",
      "####.E",
    ],
  },
  B: {
    title: "Hacker B - Trace Message",
    time: 60,
    penalty: 25,
    story: "Follow GHOST's network signal without triggering security.",
    grid: ["S..#..", "##.#.#", "......", ".####.", "...#..", "##...E"],
  },
  C: {
    title: "Detective C - Open Locker",
    time: 60,
    penalty: 20,
    story: "Connect underground security terminals to unlock the control room.",
    grid: ["S#....", ".#.##.", "...#..", "##...#", "...#..", ".###.E"],
  },
  D: {
    title: "Detective D - Open Computer",
    time: 75,
    penalty: 20,
    story:
      "Reconnect all three surveillance sources to the central node to restore Daniel's final recording.",
    grid: ["S..#.S", "##.#.#", "..E...", ".####.", "......", "S#####"],
  },
};
// Fix layout A (kept as plain rows for readability)
MAZES.A.grid = ["S.#...", "#.#.#.", "....#.", ".#####", "......", "####.E"];
MAZES.A.grid[2] = "....#.";
MAZES.A.grid[3] = ".####.";

/* ===== SAVE / LOAD - Contributor: <NAME> ===== */
const SAVE_KEY = "glitchSave.";
function defaultSave() {
  return { character: "Hacker", path: "A", suspicion: 0, mazesCompleted: {} };
}
function loadGame() {
  const game = defaultSave();
  const path = localStorage.getItem(SAVE_KEY + "path");
  const stageValue = localStorage.getItem(SAVE_KEY + "stage");
  const suspicionValue = localStorage.getItem(SAVE_KEY + "suspicion");
  const stage = Number(stageValue);
  const suspicion = Number(suspicionValue);
  const character = localStorage.getItem(SAVE_KEY + "character");
  if (MAZES[path]) game.path = path;
  if (stageValue !== null && Number.isFinite(stage) && stage > 0)
    game.stage = stage;
  if (suspicionValue !== null && Number.isFinite(suspicion) && suspicion >= 0)
    game.suspicion = suspicion;
  if (character) game.character = character;
  Object.keys(MAZES).forEach((id) => {
    const movesValue = localStorage.getItem(SAVE_KEY + "maze." + id + ".moves");
    const timeLeftValue = localStorage.getItem(
      SAVE_KEY + "maze." + id + ".timeLeft",
    );
    const moves = Number(movesValue);
    const timeLeft = Number(timeLeftValue);
    if (
      movesValue !== null &&
      timeLeftValue !== null &&
      Number.isFinite(moves) &&
      moves >= 0 &&
      Number.isFinite(timeLeft) &&
      timeLeft >= 0
    ) {
      game.mazesCompleted[id] = { moves, timeLeft };
    }
  });
  return game;
}
function saveGame() {
  localStorage.setItem(SAVE_KEY + "character", save.character);
  localStorage.setItem(SAVE_KEY + "path", save.path);
  localStorage.setItem(SAVE_KEY + "stage", save.stage);
  localStorage.setItem(SAVE_KEY + "suspicion", save.suspicion);
  Object.keys(save.mazesCompleted).forEach((id) => {
    const result = save.mazesCompleted[id];
    localStorage.setItem(SAVE_KEY + "maze." + id + ".moves", result.moves);
    localStorage.setItem(
      SAVE_KEY + "maze." + id + ".timeLeft",
      result.timeLeft,
    );
  });
}

/* ===== MAZE STATE - Contributor: <NAME> ===== */
let save = loadGame();
let cfg, cells, rows, cols;
let paths = []; // one array of "r,c" keys per source
let active = 0; // index of the source being drawn
let moves = 0,
  timeLeft = 0,
  timer = null,
  locked = false;
let canRetry = false;

const $ = (id) => document.getElementById(id);
const key = (r, c) => r + "," + c;
const parse = (k) => k.split(",").map(Number);

/* createMaze(): builds the grid with document.createElement */
function createMaze(id) {
  clearInterval(timer);
  canRetry = false;
  $("startAgain").hidden = true;
  save.path = id;
  saveGame();
  cfg = MAZES[id];
  rows = cfg.grid.length;
  cols = cfg.grid[0].length;
  cells = cfg.grid.map((r) => r.split(""));
  paths = [];
  moves = 0;
  locked = false;
  active = 0;
  timeLeft = cfg.time;
  cells.forEach((row, r) =>
    row.forEach((ch, c) => {
      if (ch === "S") paths.push([key(r, c)]);
    }),
  );

  const grid = $("grid");
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${cols}, 80px)`;
  cells.forEach((row, r) =>
    row.forEach((ch, c) => {
      const b = document.createElement("button");
      b.className = "node";
      b.id = "n" + key(r, c).replace(",", "_");
      b.textContent = ch === "S" ? "START" : ch === "E" ? "EXIT" : "";
      b.addEventListener("click", () => connectNode(r, c));
      grid.appendChild(b);
    }),
  );
  $("story").textContent = cfg.story;
  setMsg(
    paths.length > 1
      ? "Select a source, then build a path to the EXIT."
      : "Click START, then build a path to the EXIT.",
    "",
  );
  $("suspicion").textContent = save.suspicion;
  render();
  timer = setInterval(tick, 1000);
}

/* connectNode(): validates that the clicked node is adjacent to the path head */
function connectNode(r, c) {
  if (locked) return;
  const ch = cells[r][c],
    k = key(r, c);
  if (ch === "#") return;

  if (ch === "S") {
    // pick / restart a source
    const i = paths.findIndex((p) => p[0] === k);
    active = i;
    paths[i] = [k];
    render();
    return;
  }
  const p = paths[active];
  const head = parse(p[p.length - 1]);
  if (p[p.length - 1] === k && p.length > 1) {
    p.pop();
    moves++;
    render();
    return;
  } // undo
  if (isDone(active)) return;
  const adjacent = Math.abs(head[0] - r) + Math.abs(head[1] - c) === 1;
  const used = paths.some((q) => q.includes(k));
  if (!adjacent) return setMsg("Nodes must be adjacent.", "bad");
  if (used && ch !== "E") return setMsg("Node already in use.", "bad");
  p.push(k);
  moves++;
  setMsg("", "");
  render();
  checkMazeSolved();
}

function isDone(i) {
  const last = paths[i][paths[i].length - 1];
  return cells[parse(last)[0]][parse(last)[1]] === "E";
}

/* checkMazeSolved(): all sources must reach the exit */
function checkMazeSolved() {
  if (!paths.every((_, i) => isDone(i))) return;
  clearInterval(timer);
  locked = true;
  save.mazesCompleted[save.path] = { moves, timeLeft };
  save.stage = 5;
  saveGame();
  setMsg("ACCESS GRANTED - proceeding to the next stage.", "ok");
  log(
    "Saved: maze " +
      save.path +
      " completed in " +
      moves +
      " moves, " +
      timeLeft +
      "s left.",
  );
  showEnding();
}

/* ===== TIMER + SUSPICION - Contributor: <NAME> ===== */
function tick() {
  timeLeft--;
  if (timeLeft <= 0) {
    timeLeft = 0;
    failMaze();
  }
  updateHud();
}
function updateSuspicion(n) {
  save.suspicion = Math.min(100, save.suspicion + n);
  saveGame();
  $("suspicion").textContent = save.suspicion;
}
function failMaze() {
  clearInterval(timer);
  locked = true;
  updateSuspicion(cfg.penalty);
  if (save.suspicion >= 100) {
    setMsg("SUBJECT DELETED. GAME OVER.", "bad");
  } else {
    canRetry = true;
    $("startAgain").hidden = false;
    setMsg(
      "CONNECTION LOST (+" + cfg.penalty + " suspicion). Start again to retry.",
      "bad",
    );
  }
}

/* ===== RENDER - Contributor: <NAME> ===== */
function render() {
  document
    .querySelectorAll(".node")
    .forEach((n) => n.classList.remove("path", "head", "done"));
  paths.forEach((p, i) => {
    p.forEach((k, j) => {
      const el = $("n" + k.replace(",", "_"));
      el.classList.add(isDone(i) ? "done" : "path");
      if (i === active && j === p.length - 1 && !isDone(i))
        el.classList.add("head");
    });
  });
  updateHud();
}
function updateHud() {
  $("time").textContent = timeLeft;
  $("time").className = timeLeft <= 10 ? "low" : "";
}
function setMsg(t, cls) {
  $("msg").textContent = t;
  $("msg").className = cls;
}
function log(t) {
  $("log").textContent = t;
}

/* ===== UI WIRING - Contributor: <NAME> ===== */
$("startAgain").addEventListener("click", () => {
  if (!canRetry || save.suspicion >= 100) return;
  createMaze(save.path);
});

// Start with the saved path
createMaze(save.path);

// SHOW ENDING POPUP

function showEnding() {
  document.getElementById("endingPopup").hidden = false;
}

// PLAY AGAIN

function playAgain() {
  window.location.href = "menu.html";
}
