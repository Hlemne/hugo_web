const WINNING_SCORE = 52;
const CARD_STOP_SCORE = 42;
const CHICAGO_SUCCESS_POINTS = 15;
const BROKEN_CHICAGO_POINTS = -15;
const BREAK_REWARD = 5;

let game =
    JSON.parse(
        localStorage.getItem("chicagoGame")
    ) || [];

let history =
    JSON.parse(
        localStorage.getItem("chicagoHistory")
    ) || [];

let activeChicago =
    JSON.parse(
        localStorage.getItem("activeChicago")
    );

let activeFourKind = null;

let undoStack = [];

function saveGame() {

    localStorage.setItem(
        "chicagoGame",
        JSON.stringify(game)
    );

    localStorage.setItem(
        "chicagoHistory",
        JSON.stringify(history)
    );

    localStorage.setItem(
        "activeChicago",
        JSON.stringify(activeChicago)
    );

}

function saveUndo() {

    undoStack.push(
        JSON.stringify({
            game: JSON.parse(
                JSON.stringify(game)
            ),
            history: JSON.parse(
                JSON.stringify(history)
            ),
            activeChicago: activeChicago,
            winner: localStorage.getItem(
                "chicagoWinner"
            )
        })
    );

    if (undoStack.length > 30) {
        undoStack.shift();
    }

}

function undoAction() {

    if (undoStack.length === 0) {

        alert("Inget att ångra.");

        return;

    }

    const state =
        JSON.parse(
            undoStack.pop()
        );

    game = state.game;
    history = state.history;
    activeChicago = state.activeChicago;

    if (state.winner === null) {

        localStorage.removeItem(
            "chicagoWinner"
        );

    } else {

        localStorage.setItem(
            "chicagoWinner",
            state.winner
        );

    }

    saveGame();
    render();

}

function addHistory(text) {

    history.unshift(text);

}

function newGame() {

    const confirmed =
        confirm(
            "Vill du starta ett nytt spel?"
        );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem(
        "chicagoGame"
    );

    localStorage.removeItem(
        "chicagoHistory"
    );

    localStorage.removeItem(
        "activeChicago"
    );

    localStorage.removeItem(
        "chicagoWinner"
    );

    localStorage.removeItem(
        "chicagoRound"
    );

    location.href = "chicago.html";

}

function addScore(index) {

    if (activeFourKind !== null) {

        alert(
            "Avgör det aktiva fyrtalet först."
        );
    
        return;
    
    }

    if (activeChicago !== null) {

        alert(
            "Avgör den aktiva Chicagon först."
        );

        return;

    }

    const input =
        document.getElementById(
            "score" + index
        );

    if (!input || input.value === "") {
        return;
    }

    const value =
        Number(input.value);

    if (!Number.isFinite(value)) {

        alert("Ange ett giltigt poängtal.");

        return;

    }

    saveUndo();

    game[index].score += value;

    addHistory(
        game[index].name +
        " fick " +
        formatPoints(value) +
        "."
    );

    input.value = "";

    checkWinner(index);

    saveGame();
    render();

}

function openChicagoPlayerSelection() {

    if (activeFourKind !== null) {

        alert(
            "Avgör det aktiva fyrtalet först."
        );
    
        return;
    
    }

    if (activeChicago !== null) {

        alert(
            "En Chicago är redan aktiv."
        );

        return;

    }

    const panel =
        document.getElementById(
            "chicagoPlayerPanel"
        );

    const buttons =
        document.getElementById(
            "chicagoPlayerButtons"
        );

    buttons.innerHTML = "";

    game.forEach(function(player, index) {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "chicago-player-choice";

        button.textContent =
            player.name;

        button.onclick =
            function() {
                selectChicagoPlayer(index);
            };

        buttons.appendChild(button);

    });

    panel.classList.remove("hidden");

    panel.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}

function closeChicagoPlayerSelection() {

    document
        .getElementById(
            "chicagoPlayerPanel"
        )
        .classList
        .add("hidden");

}

function selectChicagoPlayer(index) {

    saveUndo();

    activeChicago = index;

    addHistory(
        game[index].name +
        " sade Chicago."
    );

    closeChicagoPlayerSelection();

    saveGame();
    render();

    document
        .getElementById(
            "chicagoResultPanel"
        )
        .scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

}

function completeChicago() {

    if (activeChicago === null) {
        return;
    }

    saveUndo();

    const playerIndex =
        activeChicago;

    const player =
        game[playerIndex];

    player.score +=
        CHICAGO_SUCCESS_POINTS;

    player.chicago++;

    addHistory(
        player.name +
        " klarade Chicago, fick +15 poäng och har nu " +
        player.chicago +
        " Chicago."
    );

    activeChicago = null;

    checkWinner(playerIndex);

    saveGame();
    render();

}



function showBreakerSelection() {

    if (activeChicago === null) {
        return;
    }

    const selection =
        document.getElementById(
            "breakerSelection"
        );

    const select =
        document.getElementById(
            "breakerSelect"
        );

    select.innerHTML = "";

    game.forEach(function(player, index) {

        if (index === activeChicago) {
            return;
        }

        const option =
            document.createElement("option");

        option.value = index;
        option.textContent = player.name;

        select.appendChild(option);

    });

    selection.classList.remove("hidden");

}

function breakChicago() {

    if (activeChicago === null) {
        return;
    }

    const select =
        document.getElementById(
            "breakerSelect"
        );

    const breakerIndex =
        Number(select.value);

    if (
        !Number.isInteger(breakerIndex) ||
        breakerIndex === activeChicago ||
        !game[breakerIndex]
    ) {

        alert(
            "Välj vem som bräckte."
        );

        return;

    }

    saveUndo();

    const chicagoPlayer =
        game[activeChicago];

    const breaker =
        game[breakerIndex];

    chicagoPlayer.score +=
        BROKEN_CHICAGO_POINTS;

    chicagoPlayer.chicago =
        Math.max(
            0,
            chicagoPlayer.chicago - 1
        );

    breaker.score +=
        BREAK_REWARD;

    addHistory(
        breaker.name +
        " bräckte " +
        chicagoPlayer.name +
        ". " +
        breaker.name +
        " fick +5 poäng och " +
        chicagoPlayer.name +
        " fick −15 poäng. Chicago: " +
        chicagoPlayer.chicago +
        "."
    );

    activeChicago = null;

    checkWinner(breakerIndex);

    saveGame();
    render();

}

function cancelActiveChicago() {

    if (activeChicago === null) {
        return;
    }

    const confirmed =
        confirm(
            "Vill du avbryta Chicagon utan att ändra poängen?"
        );

    if (!confirmed) {
        return;
    }

    saveUndo();

    addHistory(
        game[activeChicago].name +
        " avbröt sin Chicago."
    );

    activeChicago = null;

    saveGame();
    render();

}

function dropToTwenty(index) {

    if (activeFourKind !== null) {

        alert(
            "Avgör det aktiva fyrtalet först."
        );
    
        return;
    
    }

    if (activeChicago !== null) {

        alert(
            "Avgör den aktiva Chicagon först."
        );

        return;

    }

    const player =
        game[index];

    if (player.score < CARD_STOP_SCORE) {

        return;

    }

    const confirmed =
        confirm(
            player.name +
            " går ner från " +
            player.score +
            " till 20 poäng. Fortsätta?"
        );

    if (!confirmed) {
        return;
    }

    saveUndo();

    const oldScore =
        player.score;

    player.score = 20;

    addHistory(
        player.name +
        " gick ner från " +
        oldScore +
        " till 20 poäng."
    );

    const currentWinner =
        localStorage.getItem(
            "chicagoWinner"
        );

    if (
        currentWinner !== null &&
        Number(currentWinner) === index
    ) {

        localStorage.removeItem(
            "chicagoWinner"
        );

    }

    saveGame();
    render();

}

function openFourKindPlayerSelection() {

    if (activeChicago !== null) {

        alert(
            "Avgör den aktiva Chicagon först."
        );

        return;

    }

    if (activeFourKind !== null) {

        alert(
            "Ett fyrtal är redan aktivt."
        );

        return;

    }

    closeChicagoPlayerSelection();

    const panel =
        document.getElementById(
            "fourKindPlayerPanel"
        );

    const buttons =
        document.getElementById(
            "fourKindPlayerButtons"
        );

    buttons.innerHTML = "";

    game.forEach(function(player, index) {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "chicago-player-choice four-kind-player-choice";

        button.textContent =
            player.name;

        button.onclick =
            function() {

                selectFourKindPlayer(index);

            };

        buttons.appendChild(button);

    });

    panel.classList.remove("hidden");

    panel.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}

function closeFourKindPlayerSelection() {

    const panel =
        document.getElementById(
            "fourKindPlayerPanel"
        );

    if (panel) {

        panel.classList.add("hidden");

    }

}

function selectFourKindPlayer(index) {

    activeFourKind = index;

    closeFourKindPlayerSelection();

    renderFourKindPanel();

    document
        .getElementById(
            "fourKindResultPanel"
        )
        .scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

}

function renderFourKindPanel() {

    const resultPanel =
        document.getElementById(
            "fourKindResultPanel"
        );

    if (!resultPanel) {
        return;
    }

    if (activeFourKind === null) {

        resultPanel.classList.add(
            "hidden"
        );

        return;

    }

    const player =
        game[activeFourKind];

    document
        .getElementById(
            "fourKindPlayerName"
        )
        .textContent =
            player.name +
            " fick fyrtal";

    resultPanel.classList.remove(
        "hidden"
    );

}

function resetOthersAfterFourKind() {

    if (activeFourKind === null) {
        return;
    }

    const fourKindPlayer =
        game[activeFourKind];

    const confirmed =
        confirm(
            "Nollställ poäng och Chicago för alla utom " +
            fourKindPlayer.name +
            "?"
        );

    if (!confirmed) {
        return;
    }

    saveUndo();

    game.forEach(function(player, index) {

        if (index !== activeFourKind) {

            player.score = 0;
            player.chicago = 0;

        }

    });

    localStorage.removeItem(
        "chicagoWinner"
    );

    addHistory(
        fourKindPlayer.name +
        " fick fyrtal. Alla andra spelare nollställdes till 0 poäng och 0 Chicago."
    );

    activeFourKind = null;

    saveGame();
    render();

}

function giveFourKindPoints() {

    if (activeFourKind === null) {
        return;
    }

    saveUndo();

    const playerIndex =
        activeFourKind;

    const player =
        game[playerIndex];

    player.score += 16;

    addHistory(
        player.name +
        " fick fyrtal och +16 poäng."
    );

    activeFourKind = null;

    checkWinner(playerIndex);

    saveGame();
    render();

}

function cancelFourKind() {

    activeFourKind = null;

    closeFourKindPlayerSelection();

    renderFourKindPanel();

}

function checkWinner(index) {

    const player =
        game[index];

    if (
        player.score >= WINNING_SCORE &&
        player.chicago >= 1
    ) {

        localStorage.setItem(
            "chicagoWinner",
            index
        );

        addHistory(
            player.name +
            " vann med " +
            player.score +
            " poäng och " +
            player.chicago +
            " Chicago!"
        );

    } else {

        const currentWinner =
            localStorage.getItem(
                "chicagoWinner"
            );

        if (
            currentWinner !== null &&
            Number(currentWinner) === index
        ) {

            localStorage.removeItem(
                "chicagoWinner"
            );

        }

    }

}

function getLeaderScore() {

    if (game.length === 0) {
        return 0;
    }

    return Math.max(
        ...game.map(function(player) {
            return player.score;
        })
    );

}

function render() {

    if (game.length === 0) {

        location.href =
            "chicago.html";

        return;

    }

    renderWinner();
    renderScoreboard();
    renderChicagoPanel();
    renderFourKindPanel();
    renderHistory();
    
}

function renderWinner() {

    const winnerBox =
        document.getElementById(
            "winnerBox"
        );

    const winnerIndex =
        localStorage.getItem(
            "chicagoWinner"
        );

    if (winnerIndex === null) {

        winnerBox
            .classList
            .add("hidden");

        return;

    }

    const winner =
        game[Number(winnerIndex)];

    if (
        !winner ||
        winner.score < WINNING_SCORE ||
        winner.chicago < 1
    ) {

        localStorage.removeItem(
            "chicagoWinner"
        );

        winnerBox
            .classList
            .add("hidden");

        return;

    }

    document
        .getElementById(
            "winnerName"
        )
        .textContent =
            winner.name +
            " – " +
            winner.score +
            " poäng och " +
            winner.chicago +
            " Chicago";

    winnerBox
        .classList
        .remove("hidden");

}

function renderScoreboard() {

    const scoreboard =
        document.getElementById(
            "scoreboard"
        );

    scoreboard.innerHTML = "";

    const leaderScore =
        getLeaderScore();

    const winnerIndex =
        localStorage.getItem(
            "chicagoWinner"
        );

    game.forEach(function(player, index) {

        const card =
            document.createElement("div");

        card.className =
            "player-card";

        if (player.score === leaderScore) {
            card.classList.add("leader");
        }

        if (activeChicago === index) {
            card.classList.add(
                "active-chicago"
            );
        }

        if (
            winnerIndex !== null &&
            Number(winnerIndex) === index
        ) {
            card.classList.add("winner");
        }

        const cardStop =
            player.score >=
            CARD_STOP_SCORE;

        const disabled =
            activeChicago !== null;

        card.innerHTML = `

            <div class="player-card-header">

                <div class="player-name-area">

                    ${
                        player.score === leaderScore
                            ? '<span class="leader-icon">🏆</span>'
                            : ""
                    }

                    <span class="player-name">
                        ${escapeHtml(player.name)}
                    </span>

                </div>

                <div class="player-score">
                    ${player.score}
                </div>

            </div>

            <div class="player-info">

                <span class="info-badge chicago-badge">
                    Chicago: ${player.chicago}
                </span>

                <div class="status-row">

                    <span class="info-badge ${
                        cardStop
                            ? "exchange-stopped"
                            : "exchange-open"
                    }">
                
                        ${
                            cardStop
                                ? "Inga kortbyten"
                                : "Kortbyte tillåtet"
                        }
                
                    </span>
                
                    ${
                        cardStop
                            ? `
                                <button
                                    type="button"
                                    class="drop-inline-button"
                                    onclick="dropToTwenty(${index})"
                                    ${disabled ? "disabled" : ""}
                                >
                                    → 20
                                </button>
                            `
                            : ""
                    }
                
                </div>

                    ${
                        cardStop
                            ? "Inga kortbyten"
                            : "Kortbyte tillåtet"
                    }

                </span>

                ${
                    activeChicago === index
                        ? `
                            <span class="info-badge active-badge">
                                Chicago pågår
                            </span>
                        `
                        : ""
                }

            </div>

            <div class="score-controls">

                <input
                    id="score${index}"
                    class="score-input"
                    type="number"
                    inputmode="numeric"
                    placeholder="Poäng"
                    ${disabled ? "disabled" : ""}
                >

                <button
                    type="button"
                    class="add-score-button"
                    onclick="addScore(${index})"
                    ${disabled ? "disabled" : ""}
                >
                    Lägg till
                </button>

            </div>

        `;

        scoreboard.appendChild(card);

    });

}

function renderChicagoPanel() {

    const resultPanel =
        document.getElementById(
            "chicagoResultPanel"
        );

    const playerPanel =
        document.getElementById(
            "chicagoPlayerPanel"
        );

    const breakerSelection =
        document.getElementById(
            "breakerSelection"
        );

    if (activeChicago === null) {

        resultPanel
            .classList
            .add("hidden");

        breakerSelection
            .classList
            .add("hidden");

        return;

    }

    playerPanel
        .classList
        .add("hidden");

    const player =
        game[activeChicago];

    document
        .getElementById(
            "chicagoPlayerName"
        )
        .textContent =
            player.name +
            " har sagt Chicago";

    resultPanel
        .classList
        .remove("hidden");

}

function renderHistory() {

    const historyBox =
        document.getElementById(
            "history"
        );

    if (history.length === 0) {

        historyBox.textContent =
            "Inga händelser ännu.";

        return;

    }

    historyBox.innerHTML = "";

    history
        .slice(0, 30)
        .forEach(function(item) {

            const row =
                document.createElement("div");

            row.className =
                "history-item";

            row.textContent =
                item;

            historyBox.appendChild(row);

        });

}

function formatPoints(value) {

    if (value > 0) {
        return "+" + value + " poäng";
    }

    return value + " poäng";

}

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}

render();

function toggleSection(contentId, button) {

    const content =
        document.getElementById(contentId);

    const arrow =
        button.querySelector(
            ".collapse-arrow"
        );

    const isHidden =
        content.classList.contains(
            "hidden"
        );

    if (isHidden) {

        content.classList.remove(
            "hidden"
        );

        button.setAttribute(
            "aria-expanded",
            "true"
        );

        arrow.textContent = "▲";

    } else {

        content.classList.add(
            "hidden"
        );

        button.setAttribute(
            "aria-expanded",
            "false"
        );

        arrow.textContent = "▼";

    }

}