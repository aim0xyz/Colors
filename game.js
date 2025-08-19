const maze = document.getElementById('maze');
const character = document.getElementById('character');
const coinCount = document.getElementById('coin-count');
let score = 0;

// Generate random coins in the maze
function generateCoins() {
  for (let i = 0; i < 10; i++) {
    const coin = document.createElement('div');
    coin.classList.add('coin');
    coin.style.left = `${Math.random() * 70 + 5}%`;
    coin.style.top = `${Math.random() * 70 + 5}%`;
    maze.appendChild(coin);
    coin.addEventListener('click', () => {
      maze.removeChild(coin);
      score++;
      coinCount.textContent = score;
    });
  }
}

// Character movement with swipe/tap controls
let isDragging = false;
let startX, startY;

character.addEventListener('mousedown', (e) => {
  isDragging = true;
  startX = e.clientX - character.offsetLeft;
  startY = e.clientY - character.offsetTop;
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const x = e.clientX - startX;
    const y = e.clientY - startY;
    character.style.left = `${x}px`;
    character.style.top = `${y}px`;
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

// Initialize game
generateCoins();