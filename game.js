// game.js

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const hintBtn = document.getElementById('hint-btn');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');

let score = 0;
let level = 1;
let grid = [];
let nodes = []; // {x, y, color, id}
let paths = []; // {color, path: [{x,y}, {x,y}, ...]}
let selectedColor = null;
let isDrawing = false;
let currentPath = [];
let gameIsRunning = false;

// Constants
const NODE_SIZE = 20;
const GRID_SIZE = 8; // Adjust for level design
const colors = ['red', 'green', 'blue', 'orange', 'purple']; // More colors later
const levels = [
    { gridSize: 8, colors: 2, nodePairs: 2 }, // Example level 1
    { gridSize: 10, colors: 3, nodePairs: 3 }, // Example level 2
];

// Utility function: Random Integer
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// Resize Canvas for mobile
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.9;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Start Game
function startGame() {
    score = 0;
    level = 1;
    gameIsRunning = true;
    paths = []; // Reset paths
    updateUI();
    generateLevel();
    startBtn.style.display = 'none'; // Hide start button
}

// Update UI
function updateUI() {
    scoreDisplay.textContent = `Score: ${score}`;
    levelDisplay.textContent = `Level: ${level}`;
}

// Generate the grid
function generateGrid() {
    grid = [];
    const gridSize = levels[level - 1].gridSize;
    for (let row = 0; row < gridSize; row++) {
        grid[row] = [];
        for (let col = 0; col < gridSize; col++) {
            grid[row][col] = {
                x: col * (canvas.width / gridSize) + (canvas.width / gridSize - NODE_SIZE) / 2,
                y: row * (canvas.height / gridSize) + (canvas.height / gridSize - NODE_SIZE) / 2,
                occupied: false // Initially no cells are occupied
            };
        }
    }
}

// Generate level
function generateLevel() {
    generateGrid();
    nodes = [];
    const levelData = levels[level - 1];
    const gridSize = levelData.gridSize;
    const colorsCount = levelData.colors;
    const nodePairs = levelData.nodePairs;

    let availableColors = [...colors].slice(0, colorsCount);

    for (let i = 0; i < nodePairs; i++) {
        availableColors.forEach(color => {
            // Function to find an available position
            function getRandomAvailablePosition() {
                let row, col;
                do {
                    row = getRandomInt(gridSize);
                    col = getRandomInt(gridSize);
                } while (grid[row][col].occupied);
                return { row, col };
            }

            // Get the first node
            let { row: row1, col: col1 } = getRandomAvailablePosition();
            grid[row1][col1].occupied = true; // Mark it occupied

            nodes.push({
                x: grid[row1][col1].x,
                y: grid[row1][col1].y,
                color: color,
                id: `${color}-${i}-1`  // Unique IDs
            });

            // Get the second node of the same color
            let { row: row2, col: col2 } = getRandomAvailablePosition();
            grid[row2][col2].occupied = true; // Mark it occupied

            nodes.push({
                x: grid[row2][col2].x,
                y: grid[row2][col2].y,
                color: color,
                id: `${color}-${i}-2`  // Unique IDs
            });
        });
    }
}

// Draw the game elements
function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid (optional for visual aid)
    const gridSize = levels[level - 1].gridSize;
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * canvas.height / gridSize);
        ctx.lineTo(canvas.width, i * canvas.height / gridSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(i * canvas.width / gridSize, 0);
        ctx.lineTo(i * canvas.width / gridSize, canvas.height);
        ctx.stroke();
    }

    // Draw Nodes
    nodes.forEach(node => {
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw Paths
    paths.forEach(pathData => {
        ctx.strokeStyle = pathData.color;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        pathData.path.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();
    });

    // Draw Current Path (While drawing)
    if (isDrawing && currentPath.length > 0) {
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        currentPath.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();
    }
}

// Handle user input to draw
function handleMouseDown(e) {
    if (!gameIsRunning) return;
    const mouseX = e.clientX - canvas.offsetLeft;
    const mouseY = e.clientY - canvas.offsetTop;

    for (const node of nodes) {
        const distance = Math.sqrt((mouseX - node.x) ** 2 + (mouseY - node.y) ** 2);
        if (distance < NODE_SIZE / 2) {
            selectedColor = node.color;
            isDrawing = true;
            currentPath = [{ x: node.x, y: node.y }]; // Start the path
            return;
        }
    }
}

function handleMouseMove(e) {
    if (!isDrawing || !gameIsRunning) return;

    const mouseX = e.clientX - canvas.offsetLeft;
    const mouseY = e.clientY - canvas.offsetTop;
    currentPath.push({ x: mouseX, y: mouseY });
    draw(); // Redraw with the current path
}

function handleMouseUp() {
    if (!isDrawing || !gameIsRunning) return;
    isDrawing = false;

    if (currentPath.length > 1) {
        paths.push({ color: selectedColor, path: currentPath });
    }

    // Reset
    selectedColor = null;
    currentPath = [];
    draw();  // Redraw without the current path
    checkSolution();
}

// Check if a point is inside another node
function isPointInsideNode(x, y, node) {
    const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
    return distance < NODE_SIZE / 2;
}

function checkSolution() {
    if (!gameIsRunning) return;

    // Check if all node pairs are connected and no paths intersect
    const levelData = levels[level - 1];
    let allPairsConnected = true;
    let intersecting = false;

    for (let i = 0; i < levelData.nodePairs; i++) {
        const color = colors[i];
        const node1 = nodes.find(node => node.color === color && node.id.endsWith('1'));
        const node2 = nodes.find(node => node.color === color && node.id.endsWith('2'));
        const pathData = paths.find(path => path.color === color);

        if (!node1 || !node2 || !pathData) {
            allPairsConnected = false;
            break; // One pair isn't connected
        }

        // Validate that the path starts and ends on the nodes
        const firstPointMatches = isPointInsideNode(pathData.path[0].x, pathData.path[0].y, node1) || isPointInsideNode(pathData.path[0].x, pathData.path[0].y, node2);
        const lastPointMatches = isPointInsideNode(pathData.path[pathData.path.length - 1].x, pathData.path[pathData.path.length - 1].y, node1) || isPointInsideNode(pathData.path[pathData.path.length - 1].x, pathData.path[pathData.path.length - 1].y, node2);

        if (!firstPointMatches || !lastPointMatches) {
            allPairsConnected = false;
            break;
        }

        // Check for intersections (simplified - can be more robust)
        for (const otherPathData of paths) {
            if (otherPathData.color !== color) {
                // Simple Check:  if any point on the path is too close to another path, assume they intersect
                for (const point of pathData.path) {
                    for (const otherPoint of otherPathData.path) {
                        const distance = Math.sqrt((point.x - otherPoint.x) ** 2 + (point.y - otherPoint.y) ** 2);
                        if (distance < 10) { // Check for proximity (adjust as needed)
                            intersecting = true;
                            break;
                        }
                    }
                    if (intersecting) break;
                }
            }
        }
        if (intersecting) break;
    }

    if (allPairsConnected && !intersecting) {
        score += 100; // Award score
        updateUI();
        level++;
        if (level > levels.length) {
            gameIsRunning = false;
            alert("Congratulations! You've completed all levels!");
            startBtn.style.display = 'block';
        } else {
            generateLevel();
            paths = [];
            draw();
        }
    }
}

// Event Listeners
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mouseout', handleMouseUp); // End drawing if mouse leaves
startBtn.addEventListener('click', startGame);
hintBtn.addEventListener('click', () => {
    // Add Hint logic
    alert("Hint feature not implemented yet."); // placeholder
});

// Touch events
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleMouseUp();
});

// Initial draw
draw(); // Initial render