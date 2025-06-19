function startGame() {
    const playerCount = document.getElementById('playerCount').value;
    if (playerCount < 1 || playerCount > 6) {
        alert('Please enter a number between 1 and 6');
        return;
    }
    window.location.href = `hundred-score.html?players=${playerCount}`;
}