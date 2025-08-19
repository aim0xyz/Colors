// game.js

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');

let score = 0;
let level = 1;
let orbs = [];
let harmonics = [];
let obstacles = [];
let powerUps = [];
let gameIsRunning = false;

// Initialize player object with dynamic size based on canvas
const player = {
    x: 0,
    y: 0,
    radius: 20,
    color: 'blue',
    speed: 5,
    invincible: false,
    attractor: false
};

// Levels configuration
const levels = [
    { harmonicCount: 10, obstacleCount: 5, powerUpCount: 2 },
    { harmonicCount: 20, obstacleCount: 10, powerUpCount: 3 },
    // You can add more levels here
];

// Resize canvas to fit window
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.9;
    // Center player
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // initial sizing

// Start game
function startGame() {
    score = 0;
    level = 1;
    orbs = [player]; // Player is the main orb
    harmonics = [];
    obstacles = [];
    powerUps = [];
    gameIsRunning = true;
    updateUI();
    generateLevel();
    gameLoop();
}

// Update UI display
function updateUI() {
    scoreDisplay.textContent = `Score: ${score}`;
    levelDisplay.textContent = `Level: ${level}`;
}

// Main game loop
function gameLoop() {
    if (!gameIsRunning) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw and update player (main orb)
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw harmonics
    harmonics = harmonics.filter((harmonic) => {
        if (checkCollision(player, harmonic)) {
            score += 10;
            updateUI();
            return false;
        }
        ctx.fillStyle = harmonic.color;
        ctx.fillRect(harmonic.x, harmonic.y, harmonic.size, harmonic.size);
        return true;
    });

    // Draw obstacles
    obstacles.forEach((obstacle) => {
        if (checkCollision(player, obstacle) && !player.invincible) {
            gameOver();
        }
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.size, obstacle.size);
    });

    // Draw and handle power-ups
    powerUps = powerUps.filter((powerUp) => {
        if (checkCollision(player, powerUp)) {
            applyPowerUp(powerUp.type);
            return false;
        }
        ctx.fillStyle = powerUp.color;
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.size, powerUp.size);
        return true;
    });

    // Check level completion
    if (harmonics.length === 0) {
        level++;
        if (level > levels.length) {
            gameIsRunning = false;
            alert('Congratulations! You completed all levels!');
            startBtn.style.display = 'block';
            return;
        }
        generateLevel();
    }

    requestAnimationFrame(gameLoop);
}

// Collision detection
function checkCollision(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < a.radius + (b.size ? b.size / 2 : 0);
}

// Apply power-up effects
function applyPowerUp(type) {
    switch (type) {
        case 'speed':
            player.speed *= 1.5;
            setTimeout(() => { player.speed /= 1.5; }, 5000);
            break;
        case 'invincible':
            player.invincible = true;
            setTimeout(() => { player.invincible = false; }, 5000);
            break;
        case 'attractor':
            player.attractor = true;
            setTimeout(() => { player.attractor = false; }, 5000);
            break;
    }
}

// Generate level objects
function generateLevel() {
    harmonics = [];
    obstacles = [];
    powerUps = [];

    const currentLevel = levels[level - 1];

    for (let i = 0; i < currentLevel.harmonicCount; i++) {
        harmonics.push({
            x: Math.random() * (canvas.width - 10),
            y: Math.random() * (canvas.height - 10),
            size: 10,
            color: 'yellow'
        });
    }

    for (let i = 0; i < currentLevel.obstacleCount; i++) {
        obstacles.push({
            x: Math.random() * (canvas.width - 20),
            y: Math.random() * (canvas.height - 20),
            size: 20,
            color: 'red'
        });
    }

    for (let i = 0; i < currentLevel.powerUpCount; i++) {
        const types = ['speed', 'invincible', 'attractor'];
        powerUps.push({
            x: Math.random() * (canvas.width - 15),
            y: Math.random() * (canvas.height - 15),
            size: 15,
            color: 'cyan',
            type: types[Math.floor(Math.random() * types.length)]
        });
    }
}

// Mouse movement for desktop
canvas.addEventListener('mousemove', (e) => {
    if (!gameIsRunning) return;
    player.x = e.clientX - canvas.offsetLeft;
    player.y = e.clientY - canvas.offsetTop;
});

// Touch movement for mobile
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // prevent scrolling
    if (!gameIsRunning) return;
    const touch = e.touches[0];
    player.x = touch.clientX - canvas.offsetLeft;
    player.y = touch.clientY - canvas.offsetTop;
}, { passive: false });

// Start button
startBtn.addEventListener('click', () => {
    startBtn.style.display = 'none';
    startGame();
});