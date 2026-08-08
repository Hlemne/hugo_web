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

        finalRoundActive: false,
        finalRoundTriggerIndex: null,
        finalTurnsRemaining: 0,

        gameOver: false,

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
        if (
            typeof parsedState.finalRoundActive !==
            'boolean'
        ) {
            parsedState.finalRoundActive = false;
        }
        
        if (
            !Number.isInteger(
                parsedState.finalRoundTriggerIndex
            )
        ) {
            parsedState.finalRoundTriggerIndex = null;
        }
        
        if (
            !Number.isInteger(
                parsedState.finalTurnsRemaining
            )
        ) {
            parsedState.finalTurnsRemaining = 0;
        }
        
        if (
            typeof parsedState.gameOver !==
            'boolean'
        ) {
            parsedState.gameOver = false;
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
        finalRoundActive:
            gameState.finalRoundActive,
        
        finalRoundTriggerIndex:
            gameState.finalRoundTriggerIndex,
        
        finalTurnsRemaining:
            gameState.finalTurnsRemaining,
        
        gameOver:
            gameState.gameOver,
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

    scoreInput.value =
        currentValue + score;

    renderProjectedTotal();
    renderFinalRoundTarget();
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

function startFinalRoundIfNeeded(playerIndex) {

    if (gameState.finalRoundActive) {
        return;
    }

    const player =
        gameState.players[playerIndex];

    if (player.totalScore < 10000) {
        return;
    }

    gameState.finalRoundActive = true;

    gameState.finalRoundTriggerIndex =
        playerIndex;

    // Alla ANDRA spelare får en sista tur.
    gameState.finalTurnsRemaining =
        gameState.players.length - 1;

    gameState.history.unshift(
        `${player.name} nådde ${player.totalScore.toLocaleString('sv-SE')} ` +
        `poäng. Slutrundan har börjat!`
    );
}

function finishFinalTurn() {

    if (!gameState.finalRoundActive) {
        return false;
    }

    gameState.finalTurnsRemaining -= 1;

    if (gameState.finalTurnsRemaining <= 0) {

        gameState.finalTurnsRemaining = 0;
        gameState.gameOver = true;

        saveGameState();

        showWinner();

        return true;
    }

    return false;
}

function showWinner() {

    const highestScore =
        Math.max(
            ...gameState.players.map(
                (player) =>
                    player.totalScore
            )
        );

    const winners =
        gameState.players.filter(
            (player) =>
                player.totalScore ===
                highestScore
        );

    const winnerTitle =
        document.getElementById(
            'winnerPopupTitle'
        );

    const winnerText =
        document.getElementById(
            'winnerPopupText'
        );

    if (winners.length === 1) {

        winnerTitle.textContent =
            '🏆 ' +
            winners[0].name +
            ' vinner!';

        winnerText.textContent =
            winners[0].totalScore
                .toLocaleString('sv-SE') +
            ' poäng';

    } else {

        winnerTitle.textContent =
            '🤝 Oavgjort!';

        winnerText.textContent =
            winners
                .map(
                    (player) =>
                        player.name
                )
                .join(' & ') +
            ' – ' +
            highestScore
                .toLocaleString('sv-SE') +
            ' poäng';

    }

    document
        .getElementById('winnerPopup')
        .classList
        .remove('hidden');
}

function closeWinnerPopup() {
    const popup =
        document.getElementById('winnerPopup');

    if (popup) {
        popup.classList.add('hidden');
    }
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
    
    const finalRoundWasAlreadyActive =
        gameState.finalRoundActive;
    
    startFinalRoundIfNeeded(
        gameState.currentPlayerIndex
    );
    
    gameState.history.unshift(
        `${currentPlayer.name} sparade ` +
        `${gameState.turnScore} poäng. ` +
        `Total: ${currentPlayer.totalScore}.`
    );

    gameState.turnScore = 0;

    /*
    Den spelare som STARTAR slutrundan
    ska inte räknas som en av de sista
    turena.
    
    Därför räknar vi bara ner om
    slutrundan redan var aktiv när
    spelaren började avsluta sin tur.
    */
    
    if (finalRoundWasAlreadyActive) {
    
        const gameEnded =
            finishFinalTurn();
    
        if (gameEnded) {
    
            saveGameState();
            clearScoreInput();
            renderGame();
    
            return;
        }
    }
    
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

    if (gameState.finalRoundActive) {

        const gameEnded =
            finishFinalTurn();
    
        if (gameEnded) {
    
            saveGameState();
            clearScoreInput();
            renderGame();
    
            return;
        }
    }

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
        
    gameState.finalRoundActive =
        previousState.finalRoundActive;
    
    gameState.finalRoundTriggerIndex =
        previousState.finalRoundTriggerIndex;
    
    gameState.finalTurnsRemaining =
        previousState.finalTurnsRemaining;
    
    gameState.gameOver =
        previousState.gameOver;

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

    closeWinnerPopup();

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
        `- ${projectedTotal.toLocaleString('sv-SE')}`;
}

function renderFinalRoundTarget() {
    const targetElement =
        document.getElementById('finalRoundTarget');

    const currentIndex =
        gameState.currentPlayerIndex;

    const currentPlayer =
        gameState.players[currentIndex];

    // Högsta sparade poängen i hela spelet.
    // Används bara för att avgöra om 10 000-fasen har börjat.
    const highestScoreOverall =
        Math.max(
            ...gameState.players.map(
                (player) => player.totalScore
            )
        );

    // Dölj informationen tills någon nått 10 000.
    if (!gameState.finalRoundActive) {
        targetElement.classList.add('hidden');
    
        targetElement.classList.remove(
            'target-red',
            'target-green',
            'target-orange'
        );
    
        targetElement.textContent = '';
    
        return;
    }

    // Hitta den högsta poängen bland ALLA ANDRA spelare.
    const otherPlayers =
        gameState.players.filter(
            (player, index) =>
                index !== currentIndex
        );

    const highestOtherScore =
        Math.max(
            ...otherPlayers.map(
                (player) => player.totalScore
            )
        );

    const scoreInput =
        document.getElementById('scoreInput');

    const enteredScore =
        Number(scoreInput.value) || 0;

    // Aktiva spelarens möjliga total just nu.
    const currentProjectedTotal =
        currentPlayer.totalScore +
        gameState.turnScore +
        enteredScore;

    targetElement.classList.remove(
        'hidden',
        'target-red',
        'target-green',
        'target-orange'
    );

    // SPELAREN LEDER
    if (
        currentProjectedTotal >
        highestOtherScore
    ) {
        targetElement.classList.add(
            'target-green'
        );

        targetElement.textContent =
            `Du leder med ` +
            `${currentProjectedTotal.toLocaleString('sv-SE')} poäng!`;

        return;
    }

    // SPELAREN LIGGER EXAKT LIKA
    if (
        currentProjectedTotal ===
        highestOtherScore
    ) {
        targetElement.classList.add(
            'target-orange'
        );

        targetElement.textContent =
            `Delad ledning på ` +
            `${currentProjectedTotal.toLocaleString('sv-SE')} poäng – ` +
            `50 poäng till krävs för ensam ledning.`;

        return;
    }

    // SPELAREN LIGGER EFTER
    const winningTotal =
        highestOtherScore + 50;

    const pointsNeeded =
        winningTotal -
        currentProjectedTotal;

    targetElement.classList.add(
        'target-red'
    );

    targetElement.textContent =
        `Behöver ` +
        `${winningTotal.toLocaleString('sv-SE')} totalt – ` +
        `${pointsNeeded.toLocaleString('sv-SE')} poäng till.`;
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
    renderFinalRoundTarget();
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
        renderFinalRoundTarget();
    });

document
    .getElementById('scoreInput')
    .addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            addThrowScore();
        }
    });

renderGame();
