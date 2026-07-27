const WINNING_SCORE = 52;
const CARD_STOP_SCORE = 42;
const FAILED_CHICAGO = -15;
const BREAK_REWARD = 5;

let game = JSON.parse(localStorage.getItem("chicagoGame")) || [];
let history = JSON.parse(localStorage.getItem("chicagoHistory")) || [];
let round = Number(localStorage.getItem("chicagoRound")) || 1;
let activeChicago = JSON.parse(localStorage.getItem("activeChicago"));

let undoStack = [];

function saveGame(){

    localStorage.setItem(
        "chicagoGame",
        JSON.stringify(game)
    );

    localStorage.setItem(
        "chicagoHistory",
        JSON.stringify(history)
    );

    localStorage.setItem(
        "chicagoRound",
        round
    );

    localStorage.setItem(
        "activeChicago",
        JSON.stringify(activeChicago)
    );

}

function saveUndo(){

    undoStack.push(

        JSON.stringify({

            game:JSON.parse(JSON.stringify(game)),
            history:JSON.parse(JSON.stringify(history)),
            round:round,
            activeChicago:activeChicago

        })

    );

    if(undoStack.length>30){

        undoStack.shift();

    }

}

function undoAction(){

    if(undoStack.length===0){

        alert("Inget att ångra.");

        return;

    }

    const state=
        JSON.parse(undoStack.pop());

    game=state.game;
    history=state.history;
    round=state.round;
    activeChicago=state.activeChicago;

    saveGame();

    render();

}

function addHistory(text){

    history.unshift(

        "Runda "+round+": "+text

    );

}

function nextRound(){

    if(activeChicago!==null){

        alert(
            "Avgör Chicago först."
        );

        return;

    }

    saveUndo();

    round++;

    addHistory(
        "Ny runda startade."
    );

    saveGame();

    render();

}

function newGame(){

    if(
        !confirm(
            "Starta nytt spel?"
        )
    ){

        return;

    }

    localStorage.removeItem(
        "chicagoGame"
    );

    localStorage.removeItem(
        "activeChicago"
    );

    localStorage.removeItem(
        "chicagoHistory"
    );

    localStorage.removeItem(
        "chicagoRound"
    );
    
    localStorage.removeItem(
    "chicagoWinner"
    );

    location.href="chicago.html";

}

function addScore(index){

    if(activeChicago!==null){

        alert(
            "Avgör Chicago först."
        );

        return;

    }

    const input=
        document.getElementById(
            "score"+index
        );

    const value=
        Number(input.value);

    if(
        input.value===""
    ){

        return;

    }

    saveUndo();

    game[index].score+=value;

    addHistory(

        game[index].name+
        " fick "+
        (value>0?"+":"")+
        value+
        " poäng."

    );

    input.value="";

    checkWinner(index);

    saveGame();

    render();

}

function sayChicago(index){

    if(activeChicago!==null){

        alert(
            "Någon har redan sagt Chicago."
        );

        return;

    }

    saveUndo();

    activeChicago=index;

    addHistory(

        game[index].name+
        " sade Chicago."

    );

    saveGame();

    render();

}
function completeChicago(){

    if(activeChicago===null){

        return;

    }

    saveUndo();

    const player=game[activeChicago];

    player.chicago++;

    addHistory(

        player.name+
        " klarade Chicago och har nu "+
        player.chicago+
        " Chicago."

    );

    const playerIndex=activeChicago;

    activeChicago=null;

    checkWinner(playerIndex);

    saveGame();

    render();

}

function failChicago(){

    if(activeChicago===null){

        return;

    }

    saveUndo();

    const player=game[activeChicago];

    player.score+=FAILED_CHICAGO;

    player.chicago=Math.max(
        0,
        player.chicago-1
    );

    addHistory(

        player.name+
        " misslyckades med Chicago och fick "+
        FAILED_CHICAGO+
        " poäng. Chicago: "+
        player.chicago+"."

    );

    activeChicago=null;

    saveGame();

    render();

}

function showBreakerSelection(){

    if(activeChicago===null){

        return;

    }

    const select=
        document.getElementById(
            "breakerSelect"
        );

    select.innerHTML="";

    game.forEach(function(player,index){

        if(index===activeChicago){

            return;

        }

        const option=
            document.createElement("option");

        option.value=index;

        option.textContent=
            player.name;

        select.appendChild(option);

    });

    document
        .getElementById(
            "breakerSelection"
        )
        .classList
        .remove("hidden");

}

function hideBreakerSelection(){

    document
        .getElementById(
            "breakerSelection"
        )
        .classList
        .add("hidden");

}

function breakChicago(){

    if(activeChicago===null){

        return;

    }

    const breakerIndex=
        Number(
            document
            .getElementById(
                "breakerSelect"
            )
            .value
        );

    if(
        breakerIndex===activeChicago ||
        !Number.isInteger(breakerIndex)
    ){

        alert(
            "Välj vem som bräckte."
        );

        return;

    }

    saveUndo();

    const chicagoPlayer=
        game[activeChicago];

    const breaker=
        game[breakerIndex];

    chicagoPlayer.score+=FAILED_CHICAGO;

    chicagoPlayer.chicago=Math.max(
        0,
        chicagoPlayer.chicago-1
    );

    breaker.score+=BREAK_REWARD;

    addHistory(

        breaker.name+
        " bräckte "+
        chicagoPlayer.name+
        ". "+
        breaker.name+
        " fick +"+
        BREAK_REWARD+
        " poäng och "+
        chicagoPlayer.name+
        " fick "+
        FAILED_CHICAGO+
        " poäng. Chicago: "+
        chicagoPlayer.chicago+"."

    );

    activeChicago=null;

    checkWinner(breakerIndex);

    saveGame();

    render();

}

function adjustChicago(index){

    if(activeChicago!==null){

        alert(
            "Avgör Chicago först."
        );

        return;

    }

    const player=game[index];

    const newValue=prompt(

        "Hur många Chicago ska "+
        player.name+
        " ha?",

        player.chicago

    );

    if(newValue===null){

        return;

    }

    const amount=
        Number(newValue);

    if(
        !Number.isInteger(amount) ||
        amount<0
    ){

        alert(
            "Ange ett heltal som är 0 eller större."
        );

        return;

    }

    saveUndo();

    const oldValue=
        player.chicago;

    player.chicago=amount;

    addHistory(

        player.name+
        " ändrade Chicago från "+
        oldValue+
        " till "+
        amount+"."

    );

    checkWinner(index);

    saveGame();

    render();

}

function checkWinner(index){

    const player=
        game[index];

    if(
        player.score>=WINNING_SCORE &&
        player.chicago>=1
    ){

        localStorage.setItem(
            "chicagoWinner",
            index
        );

        addHistory(

            player.name+
            " vann spelet med "+
            player.score+
            " poäng och "+
            player.chicago+
            " Chicago!"

        );

    }

}

function getLeaderScore(){

    if(game.length===0){

        return 0;

    }

    return Math.max(

        ...game.map(function(player){

            return player.score;

        })

    );

}

function render(){

    if(game.length===0){

        location.href="chicago.html";

        return;

    }

    document
        .getElementById(
            "roundNumber"
        )
        .textContent=
            "Runda "+round;

    renderChicagoPanel();

    renderWinner();

    renderScoreboard();

    renderHistory();

}

function renderChicagoPanel(){

    const panel=
        document.getElementById(
            "chicagoPanel"
        );

    if(activeChicago===null){

        panel
            .classList
            .add("hidden");

        hideBreakerSelection();

        return;

    }

    const player=
        game[activeChicago];

    document
        .getElementById(
            "chicagoPlayerName"
        )
        .textContent=
            player.name+
            " har sagt Chicago";

    panel
        .classList
        .remove("hidden");

}

function renderWinner(){

    const winnerBox=
        document.getElementById(
            "winnerBox"
        );

    const winnerIndex=
        localStorage.getItem(
            "chicagoWinner"
        );

    if(winnerIndex===null){

        winnerBox
            .classList
            .add("hidden");

        return;

    }

    const winner=
        game[Number(winnerIndex)];

    if(
        !winner ||
        winner.score<WINNING_SCORE ||
        winner.chicago<1
    ){

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
        .textContent=

            winner.name+
            " – "+
            winner.score+
            " poäng och "+
            winner.chicago+
            " Chicago";

    winnerBox
        .classList
        .remove("hidden");

}

function renderScoreboard(){

    const scoreboard=
        document.getElementById(
            "scoreboard"
        );

    scoreboard.innerHTML="";

    const leaderScore=
        getLeaderScore();

    game.forEach(function(player,index){

        const card=
            document.createElement(
                "div"
            );

        card.className=
            "player-card";

        if(player.score===leaderScore){

            card
                .classList
                .add("leader");

        }

        if(activeChicago===index){

            card
                .classList
                .add("active-chicago");

        }

        const winnerIndex=
            localStorage.getItem(
                "chicagoWinner"
            );

        if(
            winnerIndex!==null &&
            Number(winnerIndex)===index
        ){

            card
                .classList
                .add("winner");

        }

        const cardStop=
            player.score>=CARD_STOP_SCORE;

        const buttonsDisabled=
            activeChicago!==null;

        card.innerHTML=`

            <div class="player-card-header">

                <div class="player-name-area">

                    ${
                        player.score===leaderScore
                        ? '<span class="leader-icon">🏆</span>'
                        : ''
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

                <span class="info-badge ${
                    cardStop
                    ? "exchange-stopped"
                    : "exchange-open"
                }">

                    ${
                        cardStop
                        ? "Kortbyte stoppat"
                        : "Kortbyte tillåtet"
                    }

                </span>

                ${
                    activeChicago===index
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
                    placeholder="+ eller − poäng"
                    ${buttonsDisabled ? "disabled" : ""}
                >

                <button
                    class="add-score-button"
                    onclick="addScore(${index})"
                    ${buttonsDisabled ? "disabled" : ""}
                >
                    Lägg till
                </button>

            </div>

            <div class="player-actions">

                <button
                    class="say-chicago-button"
                    onclick="sayChicago(${index})"
                    ${buttonsDisabled ? "disabled" : ""}
                >
                    Säg Chicago
                </button>

                <button
                    class="adjust-chicago-button"
                    onclick="adjustChicago(${index})"
                    ${buttonsDisabled ? "disabled" : ""}
                >
                    Ändra Chicago
                </button>

            </div>

        `;

        scoreboard.appendChild(card);

    });

}

function renderHistory(){

    const historyBox=
        document.getElementById(
            "history"
        );

    if(history.length===0){

        historyBox.textContent=
            "Inga händelser ännu.";

        return;

    }

    historyBox.innerHTML="";

    history
        .slice(0,25)
        .forEach(function(item){

            const row=
                document.createElement(
                    "div"
                );

            row.className=
                "history-item";

            row.textContent=
                item;

            historyBox.appendChild(row);

        });

}

function escapeHtml(text){

    const div=
        document.createElement(
            "div"
        );

    div.textContent=text;

    return div.innerHTML;

}

render();
