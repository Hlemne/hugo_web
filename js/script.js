document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn');
    const container = document.querySelector('.container');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const color = button.textContent.toLowerCase();
            container.style.backgroundColor = `rgba(${getColorValues(color)}, 0.7)`;
            setTimeout(() => {
                container.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
            }, 1000);
        });
    });
});

function getColorValues(color) {
    switch(color) {
        case 'red': return '255, 0, 0';
        case 'blue': return '0, 0, 255';
        case 'green': return '0, 255, 0';
        default: return '0, 0, 0';
    }
}