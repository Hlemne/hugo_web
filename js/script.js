
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const color = button.textContent.toLowerCase();
            document.body.style.backgroundColor = color;
            setTimeout(() => {
                document.body.style.backgroundColor = 'white';
            }, 1000);
        });
    });
});