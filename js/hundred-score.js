document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const playerCount = parseInt(urlParams.get('players')) || 1;
    
    const headerRow = document.getElementById('playerHeaders');
    const subheaderRow = document.querySelector('.subheader');
    const rows = document.querySelectorAll('tbody tr:not(.subheader)');
    
    // Add player columns
    for (let i = 1; i <= playerCount; i++) {
        // Add header with editable player name
        const th = document.createElement('th');
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = `Player ${i}`;
        nameInput.className = 'player-name';
        nameInput.placeholder = 'Enter name';
        th.colSpan = "3"; // Makes the header span all three columns
        
        // Add click handler to select all text
        nameInput.addEventListener('focus', function() {
            this.select();
        });
        
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
                // First, clear existing player columns (but keep the label cell)
                while (row.children.length > 1) {
                    row.removeChild(row.lastChild);
                }
        
                // Add one <td colspan=3> for this player
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

    // Add event listener for Calculate Score button
    const calculateButton = document.querySelector('.btn.blue');
    if (calculateButton) {
        calculateButton.addEventListener('click', calculateFinalTotal);
    }

    // Add navigation warning
    window.addEventListener('beforeunload', function(e) {
        // Check if any scores have been entered
        const inputs = document.querySelectorAll('input[type="number"], input.player-name');
        let hasEnteredData = false;
        
        inputs.forEach(input => {
            if (input.value && input.value !== input.defaultValue) {
                hasEnteredData = true;
            }
        });

        if (hasEnteredData) {
            e.preventDefault();
            // Custom message (note: modern browsers show their own message)
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return e.returnValue;
        }
    });

    // Add confirmation to back button
    document.querySelector('a[href="hundred.html"]').addEventListener('click', function(e) {
        const inputs = document.querySelectorAll('input[type="number"], input.player-name');
        let hasEnteredData = false;
        
        inputs.forEach(input => {
            if (input.value && input.value !== input.defaultValue) {
                hasEnteredData = true;
            }
        });

        if (hasEnteredData) {
            if (!confirm('Are you sure you want to go back? All entered scores will be lost.')) {
                e.preventDefault();
            }
        }
    });
});

function calculatePoints(row, playerIndex) {
    const answerInput = row.querySelector(`td:nth-child(${(playerIndex - 1) * 3 + 2}) input`);
    const correctInput = row.querySelector(`td:nth-child(${(playerIndex - 1) * 3 + 3}) input`);
    const pointsCell = row.querySelector(`td:nth-child(${(playerIndex - 1) * 3 + 4})`);
    
    if (!answerInput || !correctInput) return;

    const answerVal = answerInput.value.trim();
    const correctVal = correctInput.value.trim();

    const answer = answerVal === '' ? null : parseInt(answerVal);
    const correct = correctVal === '' ? null : parseInt(correctVal);

    if (answer === null || correct === null || isNaN(answer) || isNaN(correct)) {
        pointsCell.textContent = '-';
    } else if (answer === correct) {
        pointsCell.textContent = '-10';
    } else {
        pointsCell.textContent = Math.abs(answer - correct).toString();
    }

    calculateSectionSums();
}

function calculateSectionSums() {
    const playerCount = document.querySelectorAll('#playerHeaders th').length - 1;

    // Get all table rows excluding headers
    const allRows = Array.from(document.querySelectorAll('tbody tr'));

    // Identify sections: groups of 7 question rows followed by a sum-row
    let currentGroup = [];
    let sectionGroups = [];
    allRows.forEach(row => {
        if (row.classList.contains('sum-row')) {
            sectionGroups.push({ questionRows: [...currentGroup], sumRow: row });
            currentGroup = [];
        } else if (!row.classList.contains('total-row')) {
            currentGroup.push(row);
        }
    });

    // Process each section for each player
    for (let player = 1; player <= playerCount; player++) {
        sectionGroups.forEach(section => {
            let sectionSum = 0;
            section.questionRows.forEach(row => {
                const pointsCell = row.querySelector(`td:nth-child(${(player - 1) * 3 + 4})`);
                if (pointsCell && pointsCell.textContent !== '-') {
                    const points = parseInt(pointsCell.textContent);
                    if (!isNaN(points)) {
                        sectionSum += points;
                    }
                }
            });

            const sumCell = section.sumRow.querySelector(`td:nth-child(${(player - 1) * 3 + 2})`);
            if (sumCell) {
                sumCell.colSpan = "3";
                sumCell.textContent = sectionSum;
            }
        });
    }
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