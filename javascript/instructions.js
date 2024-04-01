export function hideHowToPlay() {
    const howToPlaySection = document.querySelector('#how-to-play');
    if (howToPlaySection) howToPlaySection.style.visibility = 'hidden';
}

export function showHowToPlay() {
    let howToPlaySection = document.querySelector('#how-to-play');
    if (!howToPlaySection) {
        // If it doesn't exist, create it
        const howToPlayHTML = `
            <div id="how-to-play">
                <h2>How to Play:</h2>
                <p>Use <key>Arrow Left</key> and <key>Arrow Right</key> to move the paddle.</p>
                <p>Or just use the <key>Mouse</key>.</p>
                <p>Break all the bricks to advance to the next level.</p>
                <p>Avoid letting the ball fall below the paddle.</p>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', howToPlayHTML);
        howToPlaySection = document.querySelector('#how-to-play');
    }
    howToPlaySection.style.visibility = 'visible';
}