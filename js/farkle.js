const savedPlayers = JSON.parse(
    localStorage.getItem('farklePlayers') || '[]'
);

if (savedPlayers.length === 0) {
    window.location.href = 'farkle.html';
}

let gameState = loadGameState();

function createInitialState(startingPlayerIndex = 0) {
    return {
        players: savedPlayers.map((name) => ({
            name: name,
            totalScore: 0,
            consecutiveFarkles: 0
        })),
        startingPlayerIndex: startingPlayerIndex,
        currentPlayerIndex: startingPlayerIndex,
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
        if (
            !parsedState.players ||
            parsedState.players.length === 0
        ) {
            return createInitialState();
        }

        parsedState.snapshots = [];

        if (
            !Number.isInteger(
                parsedState.startingPlayerIndex
            )
        ) {
            parsedState.startingPlayerIndex = 0;
        }

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
        startingPlayerIndex:
            gameState.startingPlayerIndex,
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

    const currentPlayer =
        gameState.players[
            gameState.currentPlayerIndex
        ];
    
    gameState.turnScore += score;
    
    

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
        
    currentPlayer.consecutiveFarkles = 0;
    
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

    saveSnapshot();

    currentPlayer.consecutiveFarkles += 1;

    let message;

    if (currentPlayer.consecutiveFarkles >= 3) {
        currentPlayer.totalScore -= 1000;

        message =
            `${currentPlayer.name} fick sin tredje ` +
            `Farkle i rad och förlorar 1 000 poäng. ` +
            `Total: ${currentPlayer.totalScore}.`;

        currentPlayer.consecutiveFarkles = 0;
    } else {
        const lostTurnScore =
            gameState.turnScore;

        if (lostTurnScore > 0) {
            message =
                `${currentPlayer.name} fick Farkle och ` +
                `förlorar ${lostTurnScore} turpoäng. ` +
                `Farkle i rad: ` +
                `${currentPlayer.consecutiveFarkles}.`;
        } else {
            message =
                `${currentPlayer.name} fick Farkle. ` +
                `Farkle i rad: ` +
                `${currentPlayer.consecutiveFarkles}.`;
        }
    }

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

    gameState.startingPlayerIndex =
    previousState.startingPlayerIndex;

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
        'Vill du starta en ny match med samma spelare? Nästa spelare i ordningen börjar.'
    );

    if (!shouldReset) {
        return;
    }

    const previousStartingPlayer =
        Number.isInteger(
            gameState.startingPlayerIndex
        )
            ? gameState.startingPlayerIndex
            : 0;

    const nextStartingPlayer =
        (
            previousStartingPlayer + 1
        ) % savedPlayers.length;

    gameState = createInitialState(
        nextStartingPlayer
    );

    saveGameState();
    clearScoreInput();
    renderGame();
}

function renderProjectedTotal() {
    const currentPlayer =
        gameState.players[
            gameState.currentPlayerIndex
        ];

    const scoreInput =
        document.getElementById('scoreInput');

    const enteredScore =
        Number(scoreInput.value) || 0;

    const projectedTotal =
        currentPlayer.totalScore +
        gameState.turnScore +
        enteredScore;

    document.getElementById(
        'currentPlayerProjectedTotal'
    ).textContent =
        `(${projectedTotal.toLocaleString('sv-SE')})`;
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

    renderProjectedTotal();
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

    let currentPosition = 0;

    sortedPlayers.forEach((player, index) => {

        if (
            index === 0 ||
            player.totalScore !==
            sortedPlayers[index - 1].totalScore
        ) {
            currentPosition = index + 1;
        }

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
        position.textContent = currentPosition;

        const name =
            document.createElement('span');

        name.className = 'player-name';
        name.textContent = player.name;

        const farkleStreak =
            document.createElement('span');

        farkleStreak.className =
            'player-farkle-streak';

        farkleStreak.textContent =
            player.consecutiveFarkles > 0
                ? '❌'.repeat(
                    player.consecutiveFarkles
                )
                : '';

        const total =
            document.createElement('span');

        total.className = 'player-total';
        total.textContent =
            player.totalScore.toLocaleString('sv-SE');

        row.appendChild(position);
        row.appendChild(name);
        row.appendChild(farkleStreak);
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
    .addEventListener('input', () => {
        renderProjectedTotal();
    });

document
    .getElementById('scoreInput')
    .addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            addThrowScore();
        }
    });

renderGame();

document
    .getElementById('scoreInput')
    .addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            addThrowScore();
        }
    });

renderGame();