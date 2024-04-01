"use strict";

import {balls, bricks, cleanField, COLUMNS, createBricks, paddle, removeBricks, ROWS} from "./cleanField.js";
import {hideHowToPlay, showHowToPlay} from "./instructions.js";
import {highscores, showHighScoreList} from "./highScoreList.js";

document.addEventListener('DOMContentLoaded', () => {
    initGame();
});


const BALL_RADIUS = 20;
const INITIAL_LIVES = 3;
const PADDING = 10;
const INITIAL_BALL_SPEED = 2;
const TOP_PADDING = 100;
const BRICK_HEIGHT = 30;
const LOOP_SPEED = 10;
let ballSpeed, brickHeight, brickWidth, leftPressed, level, lives, rightPressed, score, fieldWidth, fieldHeight;
let interval = null;
let throttled = false;
let goingOut = false;
let throttleTimeout = 100;
let menu = `<h2>Menu</h2>
<p><key>Enter</key> / <key>Return</key>: Start Game</p>
<p><key>Space</key> / <key>P</key>: Pause Game/Resume Game</p>
<p><key>R</key>: Restart Game</p>`;
menu = menu.toUpperCase();

const GameState = {
    NotStarted: 0,
    Running: 1,
    Paused: 2,
    GameOver: 3
};
let gameState = GameState.NotStarted;

export const menuOptions = [
    {key: "Enter", action: startGame, description: "Start Game"},
    {key: "Space/P", action: togglePause, description: "Pause Game/Resume Game"},
    {key: "R", action: restartGame, description: "Restart Game"}
];

export let currentSelectionIndex = 0; // Start with the first option selected
export function showInfo() {
    let html = "<h2>Menu</h2>";
    menuOptions.forEach((option, index) => {
        if (index === currentSelectionIndex) {
            // Apply the .selected class for the current selection
            html += `<p class="selected"><key>${option.key}</key>: ${option.description}</p>`;
        } else {
            html += `<p><key>${option.key}</key>: ${option.description}</p>`;
        }
    });
    let infoBox = document.querySelector("#info");
    infoBox.innerHTML = html;
    infoBox.style.visibility = "visible";
}

function initGame() {
    updateFieldDimensions();
    showInfo();
    showHowToPlay();
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    document.addEventListener("mousemove", mouseMoveHandler, false);
    window.addEventListener('resize', function () {
        if (!throttled) {
            resizeGame();
            throttled = true;
            setTimeout(function () {
                throttled = false;
            }, throttleTimeout);
        }
    });
}

export function startGame() {
    if (gameState === GameState.NotStarted || gameState === GameState.GameOver) {
        gameState = GameState.Running;

        hideInfo();
        hideHowToPlay(); // Hide "How to Play" when the game starts
        createBricks();
        drawBricks();
        drawPaddle();
        ballSpeed = INITIAL_BALL_SPEED;
        drawBall();
        level = 1;
        updateLevel();
        lives = INITIAL_LIVES;
        updateLives();
        score = 0;
        updateScore();
        interval = setInterval(loop, LOOP_SPEED);
    }
}


export function restartGame() {
    if (gameState !== GameState.Running) {
        gameState = GameState.NotStarted; // Reset game state
        hideHowToPlay(); // Hide "How to Play" upon restart
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        cleanField();
        startGame();
    }
}


// Call this function when the page loads
function loadGame() {
    initGame();

}


function drawBricks() {
    brickWidth = (fieldWidth - ((COLUMNS + 1) * PADDING)) / COLUMNS;
    brickHeight = BRICK_HEIGHT;
    for (let r = 0; r < bricks.length; r++) {
        for (let c = 0; c < bricks[r].length; c++) {
            if (!bricks[r][c].hit) {
                let brick = document.createElement("div");
                brick.classList.add("brick", "row" + (r + 1), "col" + (c + 1));
                bricks[r][c].w = brickWidth;
                brick.style.width = bricks[r][c].w + "px";
                bricks[r][c].h = BRICK_HEIGHT;
                brick.style.height = bricks[r][c].h + "px";
                bricks[r][c].x = PADDING + (bricks[r][c].w * c) + (c * PADDING);
                brick.style.left = bricks[r][c].x + "px";
                bricks[r][c].y = TOP_PADDING + (bricks[r][c].h * r) + (r * PADDING);
                brick.style.top = bricks[r][c].y + "px";
                bricks[r][c].node = document.body.appendChild(brick);
            }
        }
    }
}

function drawPaddle() {
    if (!paddle.node) { // Only create a new paddle if it doesn't already exist
        paddle.width = brickWidth;
        paddle.height = brickHeight;
        paddle.x = (fieldWidth / 2) - (paddle.width / 2);
        paddle.y = fieldHeight - paddle.height - PADDING;
        let element = document.createElement("div");
        element.classList.add("paddle");
        element.style.width = paddle.width + "px";
        element.style.height = paddle.height + "px";
        element.style.left = paddle.x + "px";
        element.style.top = paddle.y + "px";
        paddle.node = document.body.appendChild(element);
    }
}

function movePaddle() {
    if (rightPressed && paddle.x < fieldWidth - brickWidth) {
        paddle.x += 7;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= 7;
    }
    paddle.node.style.left = paddle.x + "px";
}

function resizePaddle() {
    paddle.width = brickWidth;
    paddle.height = brickHeight;
    paddle.node.style.width = paddle.width + "px";
    paddle.node.style.height = paddle.height + "px";
    paddle.y = fieldHeight - paddle.height - PADDING;
    paddle.node.style.top = paddle.y + "px";

}

function mouseMoveHandler(e) {
    const relativeX = e.clientX;
    let halfBrick = brickWidth / 2;
    if (relativeX > halfBrick && relativeX < (fieldWidth - halfBrick)) {
        paddle.x = relativeX - halfBrick;
    }
}

function drawBall() {
    if (balls.length === 0) { // Only create a new ball if there are no balls
        let num = balls.length;
        balls[num] = {};
        balls[num].width = BALL_RADIUS * 2;
        balls[num].height = BALL_RADIUS * 2;
        balls[num].x = (fieldWidth / 2) - BALL_RADIUS;
        balls[num].y = (fieldHeight / 2) - BALL_RADIUS;
        balls[num].speedx = ballSpeed;
        balls[num].speedy = -ballSpeed;

        let ball = document.createElement("div");
        ball.classList.add("ball");
        ball.style.width = balls[num].width + "px";
        ball.style.height = balls[num].height + "px";
        ball.style.left = balls[num].x + "px";
        ball.style.top = balls[num].y + "px";
        balls[num].node = document.body.appendChild(ball);
    }
}

function updateScore() {
    document.querySelector("#score").innerHTML = "SCORE: " + score;
}

function updateLevel() {
    document.querySelector("#level").innerHTML = "LEVEL: " + level;
}

function updateLives() {
    let livesContainer = document.querySelector("#lives");
    livesContainer.innerHTML = ""; // Clear existing lives

    for (let i = 0; i < lives; i++) {
        let img = document.createElement("img");
        img.src = 'img/heart.png'; // Replace with the actual path to the heart image
        img.classList.add("life-heart");
        livesContainer.appendChild(img);
    }
}


function hideInfo() {
    document.querySelector("#info").style.visibility = "hidden";
}

function updateFieldDimensions() {
    fieldWidth = Math.max(
        document.body.offsetWidth, document.documentElement.offsetWidth,
        document.body.clientWidth, document.documentElement.clientWidth
    );
    fieldHeight = Math.max(
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
    );
}

function resizeGame() {
    updateFieldDimensions();
    removeBricks();
    drawBricks();
    resizePaddle();
}

function moveBall() {
    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];

        // Bounce back from sides
        if (ball.x + ball.speedx > fieldWidth - ball.width || ball.x + ball.speedx < 0) {
            ball.speedx = -ball.speedx;
        }

        // Bounce back from top
        if (ball.y + ball.speedy < 0) {
            ball.speedy = -ball.speedy;
        }

        // Bounce back from paddle
        if (ball.y + ball.height + ball.speedy > paddle.y && !goingOut) {
            if (ball.x + BALL_RADIUS + ball.speedx > paddle.x && ball.x + BALL_RADIUS < paddle.x + brickWidth) {
                ball.speedy = -ball.speedy;
            } else {
                goingOut = true;
            }
        }

        // Detect losing a ball
        if (ball.y > fieldHeight) {
            out();
        }

        ball.x += ball.speedx;
        ball.y += ball.speedy;
        ball.node.style.left = ball.x + "px";
        ball.node.style.top = ball.y + "px";
    }
}

function out() {
    gameState = GameState.GameOver;
    clearInterval(interval);
    goingOut = false;
    interval = null;
    lives--;
    updateLives();

    for (let i = 0; i < balls.length; i++) {
        balls[i].node.remove();
    }
    balls.splice(0, balls.length);

    if (lives) {
        drawBall();
        updateLives();
        interval = setInterval(loop, LOOP_SPEED);
    } else {
        let name = ""; // Initialize name as an empty string
        // Keep asking for a name until a non-empty, non-whitespace string is provided
        while (!name.trim()) {
            name = prompt("Name cannot be empty. Please enter your name:");
            // If the user presses Cancel on the prompt, break out of the loop to avoid an infinite loop
            if (name === null) {
                // Optionally handle the case where the user cancels the prompt, e.g., by breaking out of the function
                // For now, we'll just set name to a default value to avoid adding an empty score
                name = "Anonymous";
                break;
            }
        }
        // Only add the score if a name has been provided
        if (name.trim()) {
            highscores.push({"score": score, "name": name.trim()});
            // Sort highscores and limit the list to a certain size, e.g., top 10 scores
            highscores.sort((a, b) => b.score - a.score);

            showHighScoreList(); // Call a function to display the highscore list
        }
    }
}



function keyDownHandler(e) {
    // Allow menu navigation if the game is not started, paused, or is over
    if (gameState === GameState.NotStarted || gameState === GameState.Paused || gameState === GameState.GameOver) {
        if (e.key === "ArrowUp") {
            // Wrap selection to the last option if currently at the first option
            currentSelectionIndex = (currentSelectionIndex - 1 + menuOptions.length) % menuOptions.length;
            showInfo();
        } else if (e.key === "ArrowDown") {
            // Wrap selection back to the first option if currently at the last option
            currentSelectionIndex = (currentSelectionIndex + 1) % menuOptions.length;
            showInfo();
        } else if (e.key === "Enter") {
            // Perform the action of the currently selected option, if it has an action
            const action = menuOptions[currentSelectionIndex].action;
            if (action) {
                action();
            }
        }
    }

    // Movement and pause toggle logic remains unchanged
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
    if (e.key === " " || e.key === "p" || e.key === "P") {
        togglePause();
    }
}


function keyUpHandler(e) {
    // Start the game only if it's not already started
    if ((e.key === "Return" || e.key === "Enter") && !interval && balls.length === 0) {
        startGame();
    }
    // Restart the game if it's over and the user presses "R"
    else if (e.key === "r" || e.key === "R") {
        restartGame();
    }

    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

export function togglePause() {
    if (gameState === GameState.Running) {
        gameState = GameState.Paused;
        showInfo(); // Show pause menu
        clearInterval(interval);
        interval = null;
    } else if (gameState === GameState.Paused) {
        gameState = GameState.Running;
        hideInfo();
        hideHowToPlay(); // Ensure how to play is hidden when resuming
        interval = setInterval(loop, LOOP_SPEED);
    }
}


function detectCollision() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLUMNS; c++) {
            let brick = bricks[r][c];
            if (brick.hit === false) {
                for (let i = 0; i < balls.length; i++) {
                    let ball = balls[i];
                    if (ball.x + ball.width > brick.x && ball.x < brick.x + brickWidth && ball.y > brick.y && ball.y < brick.y + brickHeight) {
                        ball.speedy = -ball.speedy;
                        brick.hit = true;
                        brick.node.remove();
                        score++;
                    }
                }
            }
        }
    }
}

function displaySpeedIncreaseMessage() {
    let messageElement = document.createElement("div");
    messageElement.id = "speed-increase-message";
    messageElement.innerHTML = "Next level! Speed Increased!";
    messageElement.style.position = "absolute";
    messageElement.style.top = "50%";
    messageElement.style.left = "50%";
    messageElement.style.transform = "translate(-50%, -50%)";
    messageElement.style.color = "white";
    messageElement.style.fontSize = "2em";
    document.body.appendChild(messageElement);

    setTimeout(function () {
        document.body.removeChild(messageElement);
    }, 2000); // Remove the message after 2 seconds
}

function detectLevelCompletion() {
    let b = document.querySelectorAll(".brick");//If you intend to check if there are any .brick elements left, you should use document.querySelectorAll and then check the .length property of the returned NodeList:
    if (!b.length) {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        hideInfo();
        cleanField();
        createBricks();
        drawBricks();
        drawPaddle();
        ballSpeed += 1; // Increase ball speed after each level
        displaySpeedIncreaseMessage(); // Display the speed increase message
        drawBall();
        level++;
        updateLevel();
        updateLives();
        updateScore();
        interval = setInterval(loop, LOOP_SPEED);
    }
}

function loop() {
    moveBall();
    movePaddle();
    detectCollision();
    updateScore();
    updateLevel();
    updateLives();
    detectLevelCompletion();
}