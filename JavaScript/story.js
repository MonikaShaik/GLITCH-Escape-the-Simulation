// =====================================
// GLITCH - STORY SELECTION
// =====================================

// SELECTED CHARACTER

const character = localStorage.getItem("selectedCharacter");

// HTML ELEMENTS

const storySelection = document.getElementById("storySelection");
const characterLabel = document.getElementById("characterLabel");
const storyContainer = document.getElementById("storyOptions");

const gameScene = document.getElementById("gameScene");
const sceneCharacter = document.getElementById("sceneCharacter");
const sceneTitle = document.getElementById("sceneTitle");
const sceneText = document.getElementById("sceneText");
const sceneChoices = document.getElementById("sceneChoices");
const sceneMessage = document.getElementById("sceneMessage");

// =====================================
// STORIES
// =====================================

const storyOptions = {
  // HACKER

  hacker: [
    {
      id: "decrypt",
      title: "DECRYPT THE MESSAGE",
      description:
        "An encrypted message has appeared on your computer. " +
        "Decode it to uncover the truth about NEXUS.",
      firstScene: "hacker_decrypt_1",
      mazePath: "A",
    },

    {
      id: "trace",
      title: "TRACE THE MESSAGE",
      description:
        "A mysterious person called GHOST has contacted you. " +
        "Track their location and discover who they really are.",
      firstScene: "hacker_trace_1",
      mazePath: "B",
    },
  ],

  // DETECTIVE

  detective: [
    {
      id: "locker",
      title: "OPEN THE LOCKER",
      description:
        "A programmer has mysteriously disappeared. " +
        "Investigate a locked locker and search for evidence.",
      firstScene: "detective_locker_1",
      mazePath: "C",
    },

    {
      id: "computer",
      title: "OPEN THE COMPUTER",
      description:
        "You discover a suspicious computer in the missing " +
        "programmer's apartment. Search its secret files.",
      firstScene: "detective_computer_1",
      mazePath: "D",
    },
  ],
};

// =====================================
// FIRST SCENES
// =====================================

const scenes = {
  // HACKER - DECRYPT

  hacker_decrypt_1: {
    title: "ENCRYPTED MESSAGE",
    text:
      "NEXUS has sent a secret code: 01000001. " +
      "What letter does this binary code represent?",
    answers: ["A", "B", "C"],
    correct: "A",
    success: "ACCESS GRANTED. The message is decrypted!",
    failure: "ACCESS DENIED. Try another answer.",
  },

  // HACKER - TRACE

  hacker_trace_1: {
    title: "TRACE THE SIGNAL",
    text:
      "GHOST sent you a mysterious message. " +
      "Which information can help identify the network source?",
    answers: ["IP ADDRESS", "FONT SIZE", "SCREEN COLOR"],
    correct: "IP ADDRESS",
    success: "SIGNAL FOUND. You located the next clue!",
    failure: "SIGNAL LOST. Try again.",
  },

  // DETECTIVE - LOCKER

  detective_locker_1: {
    title: "LOCKED EVIDENCE",
    text:
      "You discover a locked locker. " +
      "A note says: The code is the number of sides " +
      "of a triangle. What is the code?",
    answers: ["3", "4", "5"],
    correct: "3",
    success: "LOCKER OPENED. You found a secret document!",
    failure: "WRONG CODE. Try again.",
  },

  // DETECTIVE - COMPUTER

  detective_computer_1: {
    title: "SECRET COMPUTER",
    text:
      "You find three files on the programmer's computer. " +
      "Which one looks most relevant to the NEXUS investigation?",
    answers: ["holiday.jpg", "nexus_secret.txt", "music.mp3"],
    correct: "nexus_secret.txt",
    success: "FILE OPENED. You found important evidence!",
    failure: "NOT THE RIGHT FILE. Try again.",
  },
};

// =====================================
// SHOW STORY SELECTION
// =====================================

function showStorySelection() {
  // CHECK CHARACTER

  if (!storyOptions[character]) {
    window.location.href = "menu.html";
    return;
  }

  // SHOW STORY SCREEN

  storySelection.hidden = false;
  gameScene.hidden = true;

  // CHARACTER NAME

  characterLabel.textContent = "CHARACTER: " + character.toUpperCase();

  // DETECTIVE THEME

  storySelection.classList.toggle("detective-theme", character === "detective");

  // CLEAR PREVIOUS CARDS

  storyContainer.innerHTML = "";

  // CREATE TWO STORY CARDS

  storyOptions[character].forEach(function (story) {
    const card = document.createElement("button");

    card.className = "story-card";
    card.type = "button";

    // STORY TITLE

    const title = document.createElement("h2");
    title.textContent = story.title;

    // STORY DESCRIPTION

    const description = document.createElement("p");
    description.textContent = story.description;

    // ADD CONTENT

    card.appendChild(title);
    card.appendChild(description);

    // CLICK STORY

    card.addEventListener("click", function () {
      selectStory(story);
    });

    storyContainer.appendChild(card);
  });
}

// =====================================
// SELECT STORY
// =====================================

function selectStory(story) {
  // SAVE CHARACTER AND STORY

  const selection = {
    character: character,
    storyPath: story.id,
    currentScene: story.firstScene,
    mazePath: story.mazePath,
  };

  localStorage.setItem("glitchStorySelection", JSON.stringify(selection));

  localStorage.setItem("selectedStory", story.id);
  localStorage.setItem("currentScene", story.firstScene);
  localStorage.setItem("glitchSave.path", story.mazePath);

  // OPEN FIRST SCENE

  showScene(story.firstScene);
}

// =====================================
// SHOW SCENE
// =====================================

function showScene(sceneId) {
  const scene = scenes[sceneId];

  if (!scene) {
    return;
  }

  // HIDE STORY SELECTION

  storySelection.hidden = true;

  // SHOW GAME

  gameScene.hidden = false;

  // CHARACTER THEME

  gameScene.classList.toggle("detective-theme", character === "detective");

  // CHARACTER LABEL

  sceneCharacter.textContent = "CHARACTER: " + character.toUpperCase();

  // SCENE CONTENT

  sceneTitle.textContent = scene.title;
  sceneText.textContent = scene.text;

  // CLEAR OLD ANSWERS

  sceneChoices.innerHTML = "";

  sceneMessage.textContent = "";
  sceneMessage.className = "";

  // CREATE ANSWER BUTTONS

  scene.answers.forEach(function (answer) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = answer;

    // CHECK ANSWER

    button.addEventListener("click", function () {
      if (answer === scene.correct) {
        // CORRECT ANSWER

        sceneMessage.textContent = scene.success;
        sceneMessage.className = "success";

        // DISABLE ANSWER BUTTONS

        const buttons = sceneChoices.querySelectorAll("button");

        buttons.forEach(function (btn) {
          btn.disabled = true;
        });

        // SAVE COMPLETED SCENE

        localStorage.setItem("completedScene", sceneId);

        // OPEN NEXT GAME AFTER 1.5 SECONDS

        setTimeout(function () {
          window.location.href = "password.html";
        }, 1500);
      } else {
        // WRONG ANSWER

        sceneMessage.textContent = scene.failure;
        sceneMessage.className = "error";
      }
    });

    sceneChoices.appendChild(button);
  });
}

// =====================================
// START GAME
// =====================================

showStorySelection();
