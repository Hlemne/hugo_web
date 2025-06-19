document.addEventListener('DOMContentLoaded', () => {
    // Get number of players from URL
    const urlParams = new URLSearchParams(window.location.search);
    const playerCount = parseInt(urlParams.get('players')) || 1;
    
    // Add player columns to table
    const headerRow = document.getElementById('playerHeaders');
    const rows = document.querySelectorAll('tbody tr');
    
    for (let i = 1; i <= playerCount; i++) {
        // Add header with editable player name
        const th = document.createElement('th');
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = `Player ${i}`;
        nameInput.className = 'player-name';
        nameInput.placeholder = 'Enter name';
        
        // Add click handler to select all text
        nameInput.addEventListener('focus', function() {
            this.select();
        });
        
        th.appendChild(nameInput);
        headerRow.appendChild(th);
        
        // Add input cells
        rows.forEach(row => {
            const td = document.createElement('td');
            if (!row.classList.contains('sum-row') && 
                !row.classList.contains('bonus-row') && 
                !row.classList.contains('total-row')) {
                const input = document.createElement('input');
                input.type = 'number';
                input.min = '0';
                input.max = '100'; // Higher max for Maxi Yatzy
                input.onchange = calculateMaxiScores;
                td.appendChild(input);
            } else {
                td.textContent = '0';
            }
            row.appendChild(td);
        });
    }

    // Hide total score row initially
    const totalRow = document.querySelector('.total-row');
    if (totalRow) {
        totalRow.style.display = 'none';
    }
});

function calculateMaxiScores() {
    const rows = document.querySelectorAll('tbody tr');
    const playerCount = document.querySelectorAll('#playerHeaders th').length - 1;

    for (let player = 1; player <= playerCount; player++) {
        let upperSum = 0;
        let allUpperFieldsFilled = true;

        // Check and calculate upper section (1-6)
        for (let i = 0; i < 6; i++) {
            const input = rows[i].querySelectorAll('input')[player - 1];
            if (input && input.value !== '') {
                upperSum += parseInt(input.value);
            } else {
                allUpperFieldsFilled = false;
            }
        }

        // Update upper section sum only if all fields are filled
        const sumRow = rows[6].querySelectorAll('td')[player];
        sumRow.textContent = allUpperFieldsFilled ? upperSum : '-';

        // Check for bonus (75 or more in upper section gets 50 bonus points)
        const bonusRow = rows[7].querySelectorAll('td')[player];
        bonusRow.textContent = (allUpperFieldsFilled && upperSum >= 75) ? '50' : '-';
    }
}

function calculateFinalScore() {
    const rows = document.querySelectorAll('tbody tr');
    const playerCount = document.querySelectorAll('#playerHeaders th').length - 1;
    const totalRow = document.querySelector('.total-row');
    
    // Show total row when calculating final score
    if (totalRow) {
        totalRow.style.display = 'table-row';
    }

    for (let player = 1; player <= playerCount; player++) {
        let totalSum = 0;
        
        // Get upper section sum and bonus
        const upperSum = parseInt(rows[6].querySelectorAll('td')[player].textContent) || 0;
        const bonus = parseInt(rows[7].querySelectorAll('td')[player].textContent) || 0;
        
        totalSum = upperSum + bonus;

        // Calculate lower section
        for (let i = 8; i < rows.length - 1; i++) {
            const input = rows[i].querySelectorAll('input')[player - 1];
            if (input && input.value !== '') {
                totalSum += parseInt(input.value);
            }
        }

        // Update total score
        const totalCell = rows[rows.length - 1].querySelectorAll('td')[player];
        totalCell.textContent = totalSum || '-';
        totalCell.style.fontWeight = 'bold';
        totalCell.style.backgroundColor = '#e8f4f8';
    }
}

function saveScores() {
    console.log('Saving Maxi Yatzy scores...');
    alert('Scores saved!');
}