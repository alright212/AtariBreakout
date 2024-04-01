export let highscores = [];

export function showHighScoreList() {
    // Function to display high scores
    let html = "<h2>GAME OVER</h2>";
    html += highScoreList();
    html += "<p>Press <key>R</key> to restart</p>"; // Add restart instruction
    let infoBox = document.querySelector("#info");
    infoBox.innerHTML = html;
    infoBox.style.visibility = "visible"; // Ensure the info box is visible
}

function highScoreList() {
    // Sort highscores and limit the list to the top 10 scores
    highscores.sort((a, b) => b.score - a.score);
    highscores = highscores.slice(0, 10);

    let scoresHTML = "<h2>Highscores</h2>";
    let dot = ".";
    for (let i = 0; i < highscores.length; i++) {
        scoresHTML += `<p>${highscores[i].name}${dot.repeat(30 - (highscores[i].name.length + highscores[i].score.toString().length))}${highscores[i].score}</p>`;
    }
    return scoresHTML;
}
