const savedPlayers = JSON.parse(
    localStorage.getItem('farklePlayers') || '[]'
);

if (savedPlayers.length === 0) {
    window.location.href = 'farkle.html';
}

let gameState = loadGameState();

function createInitialState() {
    return {
        players: savedPlayers.map((name) => ({
            name: name,
            totalScore: 0
        })),
        currentPlayerIndex: 0,
        turnScore: 0,
        round: 1,
        history: [],
        snapshots: []
    };
}

function loadGameState() {
    const savedState =
        localStorage.getItem('farkleGameState');

    if (!savedState) {
        return createInitialState();
    }

    try {
        const parsedState = JSON.parse(savedState);

        if (
            !parsedState.players ||
            parsedState.players.length === 0
        ) {
            return createInitialState();
        }

        parsedState.snapshots = [];

        return parsedState;
    } catch (error) {
        return createInitialState();
    }
}

function saveGameState() {
    const stateToSave = {
        ...gameState,
        snapshots: []
    };

    localStorage.setItem(
        'farkleGameState',
        JSON.stringify(stateToSave)
    );
}

function saveSnapshot() {
    const snapshot = {
        players: gameState.players.map((player) => ({
            ...player
        })),
        currentPlayerIndex:
            gameState.currentPlayerIndex,
        turnScore:
            gameState.turnScore,
        round:
            gameState.round,
        history: [...gameState.history]
    };

    gameState.snapshots.push(snapshot);

    if (gameState.snapshots.length > 20) {
        gameState.snapshots.shift();
    }
}

function getEnteredScore() {
    const scoreInput =
        document.getElementById('scoreInput');

    const score = Number(scoreInput.value);

    if (
        !Number.isInteger(score) ||
        score <= 0
    ) {
        alert('Skriv in poängen från kastet.');

        scoreInput.focus();

        return null;
    }

    return score;
}

function clearScoreInput() {
    const scoreInput =
        document.getElementById('scoreInput');

    scoreInput.value = '';
    scoreInput.blur();
}

function addQuickScore(score) {
    const scoreInput =
        document.getElementById('scoreInput');

    const currentValue =
        Number(scoreInput.value) || 0;

    scoreInput.value = currentValue + score;
}

function addThrowScore() {
    const score = getEnteredScore();

    if (score === null) {
        return;
    }

    saveSnapshot();

    gameState.turnScore += score;

    const currentPlayer =
        gameState.players[
            gameState.currentPlayerIndex
        ];

    gameState.history.unshift(
        `${currentPlayer.name} fick ${score} poäng ` +
        `och fortsätter. Turpoäng: ` +
        `${gameState.turnScore}.`
    );

    saveGameState();
    clearScoreInput();
    renderGame();
}

function bankTurn() {
    const enteredScore =
        Number(document.getElementById('scoreInput').value) || 0;

    if (enteredScore < 0) {
        alert('Poängen kan inte vara negativ.');
        return;
    }

    if (
        gameState.turnScore === 0 &&
        enteredScore === 0
    ) {
        alert(
            'Lägg först till poäng från ett kast.'
        );

        return;
    }

    saveSnapshot();

    if (enteredScore > 0) {
        gameState.turnScore += enteredScore;
    }

    const currentPlayer =
        gameState.players[
            gameState.currentPlayerIndex
        ];

    currentPlayer.totalScore +=
        gameState.turnScore;

    gameState.history.unshift(
        `${currentPlayer.name} sparade ` +
        `${gameState.turnScore} poäng. ` +
        `Total: ${currentPlayer.totalScore}.`
    );

    gameState.turnScore = 0;

    goToNextPlayer();
    saveGameState();
    clearScoreInput();
    renderGame();
}

function farkleTurn() {
    const currentPlayer =
        gameState.players[
            gameState.currentPlayerIndex
        ];

    const message =
        gameState.turnScore > 0
            ? `${currentPlayer.name} förlorar ` +
              `${gameState.turnScore} turpoäng.`
            : `${currentPlayer.name} fick Farkle.`;

    saveSnapshot();

    gameState.history.unshift(message);

    gameState.turnScore = 0;

    goToNextPlayer();
    saveGameState();
    clearScoreInput();
    renderGame();
}

function goToNextPlayer() {
    const isLastPlayer =
        gameState.currentPlayerIndex ===
        gameState.players.length - 1;

    if (isLastPlayer) {
        gameState.currentPlayerIndex = 0;
        gameState.round += 1;
    } else {
        gameState.currentPlayerIndex += 1;
    }
}

function undoLastAction() {
    if (gameState.snapshots.length === 0) {
        alert('Det finns inget att ångra.');
        return;
    }

    const previousState =
        gameState.snapshots.pop();

    gameState.players =
        previousState.players;

    gameState.currentPlayerIndex =
        previousState.currentPlayerIndex;

    gameState.turnScore =
        previousState.turnScore;

    gameState.round =
        previousState.round;

    gameState.history =
        previousState.history;

    saveGameState();
    renderGame();
}

function confirmNewGame() {
    const shouldReset = confirm(
        'Vill du avsluta spelet och börja om?'
    );

    if (!shouldReset) {
        return;
    }

    localStorage.removeItem('farkleGameState');

    window.location.href = 'farkle.html';
}

function renderGame() {
    const currentPlayer =
        gameState.players[
            gameState.currentPlayerIndex
        ];

    document.getElementById(
        'currentPlayerName'
    ).textContent = currentPlayer.name;

    document.getElementById(
        'turnScore'
    ).textContent = gameState.turnScore;

    document.getElementById(
        'roundNumber'
    ).textContent = `Runda ${gameState.round}`;

    renderScoreboard();
    renderHistory();
}

function renderScoreboard() {
    const scoreboard =
        document.getElementById('scoreboard');

    scoreboard.innerHTML = '';

    const sortedPlayers =
        gameState.players
            .map((player, originalIndex) => ({
                ...player,
                originalIndex
            }))
            .sort(
                (a, b) =>
                    b.totalScore - a.totalScore
            );

    sortedPlayers.forEach((player, index) => {
        const row =
            document.createElement('div');

        row.className = 'player-score-row';

        if (
            player.originalIndex ===
            gameState.currentPlayerIndex
        ) {
            row.classList.add('active');
        }

        const position =
            document.createElement('span');

        position.className = 'player-position';
        position.textContent = index + 1;

        const name =
            document.createElement('span');

        name.className = 'player-name';
        name.textContent = player.name;

        const total =
            document.createElement('span');

        total.className = 'player-total';
        total.textContent =
            player.totalScore.toLocaleString('sv-SE');

        row.appendChild(position);
        row.appendChild(name);
        row.appendChild(total);

        scoreboard.appendChild(row);
    });
}

function renderHistory() {
    const historyElement =
        document.getElementById('gameHistory');

    if (gameState.history.length === 0) {
        historyElement.textContent =
            'Inga registrerade rundor ännu.';

        return;
    }

    historyElement.innerHTML = '';

    gameState.history
        .slice(0, 15)
        .forEach((historyText) => {
            const historyItem =
                document.createElement('div');

            historyItem.className =
                'history-item';

            historyItem.textContent =
                historyText;

            historyElement.appendChild(
                historyItem
            );
        });
}

document
    .getElementById('scoreInput')
    .addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            addThrowScore();
        }
    });

renderGame();