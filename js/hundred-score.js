document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const playerCount = parseInt(urlParams.get('players')) || 1;
    
    const headerRow = document.getElementById('playerHeaders');
    const subheaderRow = document.querySelector('.subheader');
    const rows = document.querySelectorAll('tbody tr:not(.subheader)');
    
    // Add player columns
    for (let i = 1; i <= playerCount; i++) {
        // Add player name header
        const th = document.createElement('th');
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = `Player ${i}`;
        nameInput.className = 'player-name';
        nameInput.placeholder = 'Enter name';
        th.colSpan = "3";
        th.appendChild(nameInput);
        headerRow.appendChild(th);
        
        // Add Answer/Correct/Points subheaders
        const answerTd = document.createElement('td');
        answerTd.textContent = 'Answer';
        const correctTd = document.createElement('td');
        correctTd.textContent = 'Correct';
        const pointsTd = document.createElement('td');
        pointsTd.textContent = 'Points';
        subheaderRow.appendChild(answerTd);
        subheaderRow.appendChild(correctTd);
        subheaderRow.appendChild(pointsTd);
        
        // Add input cells for each row
        rows.forEach(row => {
            if (row.classList.contains('sum-row') || row.classList.contains('total-row')) {
                // Sum rows get three columns with one merged cell
                const td = document.createElement('td');
                td.colSpan = "3";
                td.className = 'sum-cell';
                td.textContent = '0';
                row.appendChild(td);
            } else {
                // Regular rows get answer, correct, and points cells
                const answerCell = document.createElement('td');
                const correctCell = document.createElement('td');
                const pointsCell = document.createElement('td');
                
                if (!row.classList.contains('total-row')) {
                    const answerInput = document.createElement('input');
                    answerInput.type = 'number';
                    answerInput.min = '0';
                    answerInput.max = '100';
                    answerInput.className = 'score-input';
                    answerInput.dataset.type = 'answer';
                    
                    const correctInput = document.createElement('input');
                    correctInput.type = 'number';
                    correctInput.min = '0';
                    correctInput.max = '100';
                    correctInput.className = 'score-input';
                    correctInput.dataset.type = 'correct';
                    
                    answerInput.oninput = () => calculatePoints(row, i);
                    correctInput.oninput = () => calculatePoints(row, i);
                    
                    answerCell.appendChild(answerInput);
                    correctCell.appendChild(correctInput);
                }
                
                pointsCell.className = 'points-cell';
                pointsCell.textContent = '-';
                
                row.appendChild(answerCell);
                row.appendChild(correctCell);
                row.appendChild(pointsCell);
            }
        });
    }
});

function calculatePoints(row, playerIndex) {
    const inputs = row.getElementsByClassName('score-input');
    const answer = parseInt(inputs[0].value) || 0;
    const correct = parseInt(inputs[1].value) || 0;
    const pointsCell = row.querySelector('.points-cell');
    
    if (answer === correct) {
        pointsCell.textContent = '-10';
    } else {
        pointsCell.textContent = Math.abs(answer - correct).toString();
    }
    
    calculateSectionSums();
}

function calculateSectionSums() {
    const playerCount = document.querySelectorAll('#playerHeaders th').length - 1;
    
    for (let player = 1; player <= playerCount; player++) {
        let sections = [[1,7], [8,14], [15,21]];
        
        sections.forEach((range, index) => {
            let sum = 0;
            for (let q = range[0]; q <= range[1]; q++) {
                const points = document.querySelector(`tr:nth-child(${q + 2}) .points-cell:nth-child(${player * 3 + 1})`);
                if (points && points.textContent !== '-') {
                    sum += parseInt(points.textContent);
                }
            }
            const sumRow = document.querySelector(`tr.sum-row:nth-child(${range[1] + 3}) .sum-cell:nth-child(${player + 1})`);
            if (sumRow) sumRow.textContent = sum;
        });
    }
}

function calculateFinalScore() {
    const playerCount = document.querySelectorAll('#playerHeaders th').length - 1;
    
    for (let player = 1; player <= playerCount; player++) {
        let totalSum = 0;
        document.querySelectorAll('.sum-cell').forEach(cell => {
            if (parseInt(cell.textContent)) {
                totalSum += parseInt(cell.textContent);
            }
        });
        const totalRow = document.querySelector('.total-row .sum-cell');
        totalRow.textContent = totalSum;
    }
}