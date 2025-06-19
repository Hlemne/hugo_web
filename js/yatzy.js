function startGame() {
    const playerCount = document.getElementById('playerCount').value;
    if (playerCount < 1 || playerCount > 6) {
        alert('Please enter a number between 1 and 6');
        return;
    }
    document.getElementById('gameModal').style.display = 'block';
}

function selectGame(gameType) {
    const playerCount = document.getElementById('playerCount').value;
    const modal = document.getElementById('gameModal');
    modal.style.display = 'none';
    
    if (gameType === 'yatzy') {
        window.location.href = `yatzy-score.html?players=${playerCount}`;
    } else {
        window.location.href = `maxi-yatzy-score.html?players=${playerCount}`;
    }
}

// Close modal if user clicks outside
window.onclick = function(event) {
    const modal = document.getElementById('gameModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}