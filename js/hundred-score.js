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

    // Hide total row initially
    const totalRow = document.querySelector('.total-row');
    if (totalRow) {
        totalRow.style.display = 'none';
    }
});

function calculatePoints(row, playerIndex) {
    const answerInput = row.querySelector(`td:nth-child(${(playerIndex - 1) * 3 + 2}) input`);
    const correctInput = row.querySelector(`td:nth-child(${(playerIndex - 1) * 3 + 3}) input`);
    const pointsCell = row.querySelector(`td:nth-child(${(playerIndex - 1) * 3 + 4})`);
    
    if (!answerInput || !correctInput) return;
    
    const answer = parseInt(answerInput.value) || 0;
    const correct = parseInt(correctInput.value) || 0;
    
    if (answer === correct && answer !== 0) {
        pointsCell.textContent = '-10';
    } else if (answer !== 0 && correct !== 0) {
        pointsCell.textContent = Math.abs(answer - correct).toString();
    } else {
        pointsCell.textContent = '-';
    }
    
    calculateSectionSums();
}

function calculateSectionSums() {
    const playerCount = document.querySelectorAll('#playerHeaders th').length - 1;
    
    for (let player = 1; player <= playerCount; player++) {
        const sections = [
            { rows: [2, 3, 4, 5, 6, 7, 8], sumRow: 9 },
            { rows: [10, 11, 12, 13, 14, 15, 16], sumRow: 17 },
            { rows: [18, 19, 20, 21, 22, 23, 24], sumRow: 25 }
        ];

        sections.forEach(section => {
            let sectionSum = 0;
            section.rows.forEach(rowIndex => {
                const row = document.querySelector(`tbody tr:nth-child(${rowIndex})`);
                if (row) {
                    const pointsCell = row.querySelector(`td:nth-child(${(player - 1) * 3 + 4})`);
                    if (pointsCell && pointsCell.textContent !== '-') {
                        const points = parseInt(pointsCell.textContent);
                        if (!isNaN(points)) {
                            sectionSum += points;
                        }
                    }
                }
            });

            const sumRow = document.querySelector(`tbody tr:nth-child(${section.sumRow})`);
            if (sumRow) {
                const sumCell = sumRow.querySelector(`td:nth-child(${(player - 1) * 3 + 2})`);
                if (sumCell) {
                    sumCell.colSpan = "3";
                    sumCell.textContent = sectionSum;
                }
            }
        });
    }

    // Remove the automatic total calculation
    // calculateFinalTotal();
}

function calculateFinalTotal() {
    const totalRow = document.querySelector('.total-row');
    if (totalRow) {
        totalRow.style.display = 'table-row'; // Show the total row
    }

    const playerCount = document.querySelectorAll('#playerHeaders th').length - 1;
    
    for (let player = 1; player <= playerCount; player++) {
        let totalSum = 0;
        const sumRows = document.querySelectorAll('.sum-row');
        
        sumRows.forEach(sumRow => {
            const sumCell = sumRow.querySelector(`td:nth-child(${(player - 1) * 3 + 2})`);
            if (sumCell && sumCell.textContent && sumCell.textContent !== '-') {
                totalSum += parseInt(sumCell.textContent) || 0;
            }
        });
        
        const totalCell = totalRow.querySelector(`td:nth-child(${(player - 1) * 3 + 2})`);
        if (totalCell) {
            totalCell.colSpan = "3";
            totalCell.textContent = totalSum;
            totalCell.style.backgroundColor = '#3498db';
            totalCell.style.color = 'white';
            totalCell.style.fontWeight = 'bold';
        }
    }
}