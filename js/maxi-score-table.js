document.addEventListener('DOMContentLoaded', () => {
    // Get number of players from URL
    const urlParams = new URLSearchParams(window.location.search);
    const playerCount = parseInt(urlParams.get('players')) || 1;
    
    // Add player columns to table
    const headerRow = document.getElementById('playerHeaders');
    const rows = document.querySelectorAll('tbody tr');
    
    for (let i = 1; i <= playerCount; i++) {
        // Add header
        const th = document.createElement('th');
        th.textContent = `Player ${i}`;
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
});

function calculateMaxiScores() {
    // Get all rows
    const rows = document.querySelectorAll('tbody tr');
    const playerCount = document.querySelectorAll('#playerHeaders th').length - 1;

    // Calculate for each player
    for (let player = 1; player <= playerCount; player++) {
        let upperSum = 0;
        let totalSum = 0;

        // Calculate upper section (1-6)
        for (let i = 0; i < 6; i++) {
            const input = rows[i].querySelectorAll('input')[player - 1];
            if (input && input.value) {
                upperSum += parseInt(input.value);
            }
        }

        // Update upper section sum
        const sumRow = rows[6].querySelectorAll('td')[player];
        sumRow.textContent = upperSum;

        // Check for bonus (63 or more in upper section gets 35 bonus points)
        const bonusRow = rows[7].querySelectorAll('td')[player];
        bonusRow.textContent = upperSum >= 63 ? '35' : '0';

        // Calculate total including bonus
        totalSum = upperSum + (upperSum >= 63 ? 35 : 0);

        // Calculate lower section
        for (let i = 8; i < rows.length - 1; i++) {
            const input = rows[i].querySelectorAll('input')[player - 1];
            if (input && input.value) {
                totalSum += parseInt(input.value);
            }
        }

        // Update total score
        const totalRow = rows[rows.length - 1].querySelectorAll('td')[player];
        totalRow.textContent = totalSum;
    }
}

function saveScores() {
    // TODO: Add save functionality
    console.log('Saving Maxi Yatzy scores...');
    alert('Scores saved!');
}