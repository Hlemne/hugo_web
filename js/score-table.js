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
                input.max = '50';
                input.onchange = calculateScores;
                td.appendChild(input);
            } else {
                td.textContent = '0';
            }
            row.appendChild(td);
        });
    }
});

function calculateScores() {
    // Add score calculation logic here
    // This is a placeholder for the scoring logic
    console.log('Calculating scores...');
}

function saveScores() {
    // Add save functionality here
    console.log('Saving scores...');
}