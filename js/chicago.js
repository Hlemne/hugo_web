const WINNING_SCORE = 52;
const CARD_STOP_SCORE = 42;

const CHICAGO_SUCCESS_POINTS = 15;
const BROKEN_CHICAGO_POINTS = -15;
const BREAK_REWARD = 5;
const FOUR_KIND_POINTS = 16;

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

let selectedPlayerIndex = null;

let undoStack = [];


/* =========================
   START OCH KOMPATIBILITET
========================= */

function prepareGameData() {

    game.forEach(function(player) {

        if (
            typeof player.score !== "number" ||
            !Number.isFinite(player.score)
        ) {
            player.score = 0;
        }

        if (
            typeof player.chicago !== "number" ||
            !Number.isFinite(player.chicago)
        ) {
            player.chicago = 0;
        }

        player.chicago =
            Math.max(
                0,
                Math.floor(player.chicago)
            );

    });

    if (
        activeChicago !== null &&
        (
            !Number.isInteger(activeChicago) ||
            !game[activeChicago]
        )
    ) {
        activeChicago = null;
    }

}


/* =========================
   SPARA OCH ÅNGRA
========================= */

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
            activeFourKind: activeFourKind,
            selectedPlayerIndex:
                selectedPlayerIndex,
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

    activeChicago =
        state.activeChicago;

    activeFourKind =
        state.activeFourKind ?? null;

    selectedPlayerIndex =
        state.selectedPlayerIndex ?? null;

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


/* =========================
   HISTORIK
========================= */

function addHistory(text) {

    history.unshift(text);

}


/* =========================
   NYTT SPEL
========================= */

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


/* =========================
   GEMENSAM POÄNGINMATNING
========================= */

function selectPlayer(index) {

    if (!game[index]) {
        return;
    }

    selectedPlayerIndex = index;

    renderScoreboard();
    renderSelectedPlayer();

}

function addScoreToSelectedPlayer() {

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

    if (
        selectedPlayerIndex === null ||
        !game[selectedPlayerIndex]
    ) {

        alert(
            "Välj först en spelare i poängtavlan."
        );

        return;

    }

    const input =
        document.getElementById(
            "sharedScoreInput"
        );

    if (!input || input.value.trim() === "") {

        alert("Skriv in poängen.");

        return;

    }

    const value =
        Number(input.value);

    if (!Number.isFinite(value)) {

        alert(
            "Ange ett giltigt poängtal."
        );

        return;

    }

    saveUndo();

    const player =
        game[selectedPlayerIndex];

    const oldScore =
        player.score;

    player.score += value;

    addHistory(
        player.name +
        " fick " +
        formatPoints(value) +
        ". Total: " +
        player.score +
        " poäng."
    );

    input.value = "";
    input.blur();

    updateWinnerAfterScoreChange(
        selectedPlayerIndex,
        oldScore
    );

    saveGame();
    render();

}


/* =========================
   CHICAGO
========================= */

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

    closeFourKindPlayerSelection();

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

    const panel =
        document.getElementById(
            "chicagoPlayerPanel"
        );

    if (panel) {
        panel.classList.add("hidden");
    }

}

function selectChicagoPlayer(index) {

    if (!game[index]) {
        return;
    }

    saveUndo();

    activeChicago = index;

    addHistory(
        game[index].name +
        " sade Chicago."
    );

    closeChicagoPlayerSelection();

    saveGame();
    render();

    const resultPanel =
        document.getElementById(
            "chicagoResultPanel"
        );

    if (resultPanel) {

        resultPanel.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }

}

function completeChicago() {

    if (
        activeChicago === null ||
        !game[activeChicago]
    ) {
        return;
    }

    saveUndo();

    const playerIndex =
        activeChicago;

    const player =
        game[playerIndex];

    player.score +=
        CHICAGO_SUCCESS_POINTS;

    player.chicago += 1;

    addHistory(
        player.name +
        " klarade Chicago och fick +15 poäng och +1 Chicago. " +
        "Total: " +
        player.score +
        " poäng och " +
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

    if (
        activeChicago === null ||
        !game[activeChicago]
    ) {
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

    const chicagoPlayerIndex =
        activeChicago;

    const chicagoPlayer =
        game[chicagoPlayerIndex];

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
        " fick −15 poäng och har nu " +
        chicagoPlayer.chicago +
        " Chicago."
    );

    activeChicago = null;

    removeWinnerIfInvalid(
        chicagoPlayerIndex
    );

    checkWinner(breakerIndex);

    saveGame();
    render();

}

function cancelActiveChicago() {

    if (
        activeChicago === null ||
        !game[activeChicago]
    ) {
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


/* =========================
   NER TILL 20
========================= */

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

    if (
        !player ||
        player.score < CARD_STOP_SCORE
    ) {
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

    removeWinnerIfInvalid(index);

    saveGame();
    render();

}


/* =========================
   FYRTAL
========================= */

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

    if (!game[index]) {
        return;
    }

    activeFourKind = index;

    closeFourKindPlayerSelection();
    renderFourKindPanel();

    const resultPanel =
        document.getElementById(
            "fourKindResultPanel"
        );

    if (resultPanel) {

        resultPanel.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }

}

function renderFourKindPanel() {

    const resultPanel =
        document.getElementById(
            "fourKindResultPanel"
        );

    if (!resultPanel) {
        return;
    }

    if (
        activeFourKind === null ||
        !game[activeFourKind]
    ) {

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

    if (
        activeFourKind === null ||
        !game[activeFourKind]
    ) {
        return;
    }

    const selectedIndex =
        activeFourKind;

    const fourKindPlayer =
        game[selectedIndex];

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

        if (index !== selectedIndex) {

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

    checkWinner(selectedIndex);

    saveGame();
    render();

}

function giveFourKindPoints() {

    if (
        activeFourKind === null ||
        !game[activeFourKind]
    ) {
        return;
    }

    saveUndo();

    const playerIndex =
        activeFourKind;

    const player =
        game[playerIndex];

    player.score +=
        FOUR_KIND_POINTS;

    addHistory(
        player.name +
        " fick fyrtal och +16 poäng. Total: " +
        player.score +
        " poäng."
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


/* =========================
   VINNARE
========================= */

function checkWinner(index) {

    const player =
        game[index];

    if (!player) {
        return;
    }

    if (
        player.score >= WINNING_SCORE &&
        player.chicago >= 1
    ) {

        const existingWinner =
            localStorage.getItem(
                "chicagoWinner"
            );

        localStorage.setItem(
            "chicagoWinner",
            index
        );

        if (
            existingWinner === null ||
            Number(existingWinner) !== index
        ) {

            addHistory(
                player.name +
                " vann med " +
                player.score +
                " poäng och " +
                player.chicago +
                " Chicago!"
            );

        }

    } else {

        removeWinnerIfInvalid(index);

    }

}

function removeWinnerIfInvalid(index) {

    const currentWinner =
        localStorage.getItem(
            "chicagoWinner"
        );

    if (
        currentWinner === null ||
        Number(currentWinner) !== index
    ) {
        return;
    }

    const player =
        game[index];

    if (
        !player ||
        player.score < WINNING_SCORE ||
        player.chicago < 1
    ) {

        localStorage.removeItem(
            "chicagoWinner"
        );

    }

}

function updateWinnerAfterScoreChange(index) {

    removeWinnerIfInvalid(index);
    checkWinner(index);

}


/* =========================
   RENDERING
========================= */

function render() {

    if (game.length === 0) {

        location.href =
            "chicago.html";

        return;

    }

    if (
        selectedPlayerIndex !== null &&
        !game[selectedPlayerIndex]
    ) {
        selectedPlayerIndex = null;
    }

    renderWinner();
    renderScoreboard();
    renderSelectedPlayer();
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

        winnerBox.classList.add(
            "hidden"
        );

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

        winnerBox.classList.add(
            "hidden"
        );

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

    winnerBox.classList.remove(
        "hidden"
    );

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

        const row =
            document.createElement("div");

        row.className =
            "player-list-row";

        if (
            selectedPlayerIndex === index
        ) {
            row.classList.add(
                "selected"
            );
        }

        if (
            player.score === leaderScore
        ) {
            row.classList.add(
                "leader"
            );
        }

        if (
            activeChicago === index
        ) {
            row.classList.add(
                "active-chicago"
            );
        }

        if (
            winnerIndex !== null &&
            Number(winnerIndex) === index
        ) {
            row.classList.add(
                "winner"
            );
        }

        row.onclick =
            function() {

                selectPlayer(index);

            };

        const chicagoStars =
            player.chicago > 0
                ? "🌟".repeat(
                    player.chicago
                )
                : "–";

        const showDropButton =
            player.score >=
            CARD_STOP_SCORE;

        const actionsDisabled =
            activeChicago !== null ||
            activeFourKind !== null;

        row.innerHTML = `

            <div class="list-player-name">

                ${
                    player.score === leaderScore
                        ? '<span class="leader-icon">🏆</span>'
                        : ""
                }

                <span>
                    ${escapeHtml(player.name)}
                </span>

            </div>

            <div
                class="list-chicago-stars"
                aria-label="${player.chicago} Chicago"
            >
                ${chicagoStars}
            </div>

            <div class="list-player-score">
                ${player.score}
            </div>

            <div class="list-player-action">

                ${
                    showDropButton
                        ? `
                            <button
                                type="button"
                                class="drop-inline-button"
                                onclick="event.stopPropagation(); dropToTwenty(${index})"
                                ${actionsDisabled ? "disabled" : ""}
                                aria-label="Sätt ${escapeHtml(player.name)} till 20 poäng"
                            >
                                → 20
                            </button>
                        `
                        : ""
                }

            </div>

        `;

        scoreboard.appendChild(row);

    });

}

function renderSelectedPlayer() {

    const nameElement =
        document.getElementById(
            "selectedPlayerName"
        );

    const input =
        document.getElementById(
            "sharedScoreInput"
        );

    const addButton =
        document.querySelector(
            ".shared-add-button"
        );

    const locked =
        activeChicago !== null ||
        activeFourKind !== null;

    if (
        selectedPlayerIndex === null ||
        !game[selectedPlayerIndex]
    ) {

        nameElement.textContent =
            "Välj en spelare";

        input.disabled = true;
        addButton.disabled = true;

        return;

    }

    nameElement.textContent =
        game[selectedPlayerIndex].name;

    input.disabled = locked;
    addButton.disabled = locked;

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

    if (
        activeChicago === null ||
        !game[activeChicago]
    ) {

        resultPanel.classList.add(
            "hidden"
        );

        breakerSelection.classList.add(
            "hidden"
        );

        return;

    }

    playerPanel.classList.add(
        "hidden"
    );

    const player =
        game[activeChicago];

    document
        .getElementById(
            "chicagoPlayerName"
        )
        .textContent =
            player.name +
            " har sagt Chicago";

    resultPanel.classList.remove(
        "hidden"
    );

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


/* =========================
   HJÄLPFUNKTIONER
========================= */

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

function formatPoints(value) {

    if (value > 0) {
        return "+" + value + " poäng";
    }

    return value + " poäng";

}

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        String(text);

    return div.innerHTML;

}

function toggleSection(
    contentId,
    button
) {

    const content =
        document.getElementById(
            contentId
        );

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


/* =========================
   TANGENTBORD
========================= */

const sharedScoreInput =
    document.getElementById(
        "sharedScoreInput"
    );

if (sharedScoreInput) {

    sharedScoreInput.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                event.preventDefault();

                addScoreToSelectedPlayer();

            }

        }
    );

}


/* =========================
   STARTA
========================= */

prepareGameData();
saveGame();
render();