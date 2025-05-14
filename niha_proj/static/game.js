const size = 60;
const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const cols = 40;
const rows = 40;
const cellSize = canvas.width / cols;

let mazeGrid = [];
let stack = [];
let player = { x: 0, y: 0 };
let gameWon = false;

let wallBreakAnimations = [];  // For animating wall breaks

// Cell class for maze generation
class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.visited = false;
    this.walls = [true, true, true, true]; // Top, Right, Bottom, Left
  }

  getIndex(x, y) {
    if (x < 0 || y < 0 || x >= cols || y >= rows) return -1;
    return x + y * cols;
  }

  checkNeighbors() {
    const neighbors = [];
    const directions = [
      [this.x, this.y - 1], // Up
      [this.x + 1, this.y], // Right
      [this.x, this.y + 1], // Down
      [this.x - 1, this.y]  // Left
    ];

    directions.forEach(([nx, ny]) => {
      const neighbor = mazeGrid[this.getIndex(nx, ny)];
      if (neighbor && !neighbor.visited) neighbors.push(neighbor);
    });

    return neighbors.length > 0
      ? neighbors[Math.floor(Math.random() * neighbors.length)]
      : undefined;
  }

  draw() {
    const x = this.x * cellSize;
    const y = this.y * cellSize;
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 2;

    if (this.walls[0]) drawLine(x, y, x + cellSize, y); // Top wall
    if (this.walls[1]) drawLine(x + cellSize, y, x + cellSize, y + cellSize); // Right wall
    if (this.walls[2]) drawLine(x + cellSize, y + cellSize, x, y + cellSize); // Bottom wall
    if (this.walls[3]) drawLine(x, y + cellSize, x, y); // Left wall
  }
}

function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function removeWalls(a, b) {
  const x = a.x - b.x;
  const y = a.y - b.y;

  if (x === 1) {
    a.walls[3] = false;
    b.walls[1] = false;
  } else if (x === -1) {
    a.walls[1] = false;
    b.walls[3] = false;
  }
  if (y === 1) {
    a.walls[0] = false;
    b.walls[2] = false;
  } else if (y === -1) {
    a.walls[2] = false;
    b.walls[0] = false;
  }
}
function animateWallBreak(cellA, cellB, wallIndex, duration = 60) {
    wallBreakAnimations.push({ cellA, cellB, wallIndex, frame: 0, duration });
  }
  
// Maze generation
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    mazeGrid.push(new Cell(x, y));
  }
}

let current = mazeGrid[0];

function generateMazeStep() {
  current.visited = true;
  const next = current.checkNeighbors();
  if (next) {
    next.visited = true;
    stack.push(current);
    removeWalls(current, next);
    current = next;
  } else if (stack.length > 0) {
    current = stack.pop();
  }
}

function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  mazeGrid.forEach(cell => cell.draw());
}

function buildMaze(callback) {
  function loop() {
    for (let i = 0; i < 10; i++) generateMazeStep();
    drawMaze();
    if (stack.length > 0) requestAnimationFrame(loop);
    else callback();
  }
  loop();
}

function drawEndPoint() {
  const x = (cols - 1) * cellSize;
  const y = (rows - 1) * cellSize;
  ctx.fillStyle = "#00ff00";
  ctx.fillRect(x + cellSize / 4, y + cellSize / 4, cellSize / 2, cellSize / 2);
}

function checkWin() {
    if (!gameWon && player.x === cols - 1 && player.y === rows - 1) {
      gameWon = true;
      alert("You Win!");
    }
  }
  
function showQuestionModal(question, wallIndex, currentIdx, nextIdx, newX, newY)
{
    const modal = document.getElementById("questionModal");
    const questionText = document.getElementById("questionText");
    const optionsDiv = document.getElementById("options");
  
    questionText.textContent = question.question;
    optionsDiv.innerHTML = '';
  
    for (let opt in question.options) {
      const btn = document.createElement("button");
      btn.textContent = `${opt}: ${question.options[opt]}`;
      btn.style.margin = "10px";
      btn.style.padding = "10px 20px";
      btn.style.background = "#0ff2";
      btn.style.border = "2px solid #0ff";
      btn.style.color = "#0ff";
      btn.style.borderRadius = "10px";
      btn.style.cursor = "pointer";
      btn.style.font = "1rem Orbitron";
  
      btn.onclick = () => {
        const answerData = { id: question.id, answer: opt };
  
        fetch('/validate_answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answerData)
        })
        .then(res => res.json())
        .then(data => {
          if (data.correct) {
            
            animateWallBreak(mazeGrid[currentIdx], mazeGrid[nextIdx], wallIndex);

            setTimeout(() => {
              removeWalls(mazeGrid[currentIdx], mazeGrid[nextIdx]);
              player.x = newX;
              player.y = newY;
            }, 300);
            alert('Correct! You can go through!');
          } else {
            alert('Incorrect. No shortcut.');
          }
          modal.style.display = "none";
        });
      };
      optionsDiv.appendChild(btn);
    }
  
    modal.style.display = "flex";
  }
  
// Player rendering
function renderPlayer() {
  const playerX = player.x * cellSize + cellSize / 2;
  const playerY = player.y * cellSize + cellSize / 2;
  ctx.fillStyle = "#ff0000";
  ctx.beginPath();
  ctx.arc(playerX, playerY, cellSize / 4, 0, 2 * Math.PI);
  ctx.fill();
}
document.addEventListener('keydown', e => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();  // prevent scroll
  
      const dx = { ArrowRight: 1, ArrowLeft: -1, ArrowUp: 0, ArrowDown: 0 };
      const dy = { ArrowRight: 0, ArrowLeft: 0, ArrowUp: -1, ArrowDown: 1 };
      const wallIdx = {
        ArrowUp: 0,
        ArrowRight: 1,
        ArrowDown: 2,
        ArrowLeft: 3
      };
  
      const newX = player.x + dx[e.key];
      const newY = player.y + dy[e.key];
  
      if (newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
        const currentIdx = player.y * cols + player.x;
        const nextIdx = newY * cols + newX;
  
        // Check current cell wall in movement direction
        if (mazeGrid[currentIdx].walls[wallIdx[e.key]]) {
          // Wall exists: block movement, show question
          fetch('/get_question')
            .then(response => response.json())
            .then(data => {
              if (data.error) {
                alert('No question available!');
                return;
              }
  
            const question = data;
            const wallIndex = wallIdx[e.key];
            showQuestionModal(question, wallIndex, currentIdx, nextIdx, newX, newY);

            })
            .catch(error => console.error('Error fetching question:', error));
        } else {
          // No wall, move freely
          player.x = newX;
          player.y = newY;
        }
      }
    }
  });
  
// Game loop
buildMaze(() => {
  drawMaze();
  gameLoop();
});

function gameLoop() {
    requestAnimationFrame(gameLoop);
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate center offset
    const offsetX = canvas.width / 2 - (player.x * cellSize + cellSize / 2);
    const offsetY = canvas.height / 2 - (player.y * cellSize + cellSize / 2);

    // Translate canvas to center the player
    ctx.translate(offsetX, offsetY);

    drawMaze();
  
    //  Draw wall break animation
    wallBreakAnimations = wallBreakAnimations.filter(anim => {
      const progress = anim.frame / anim.duration;
      const x1 = anim.cellA.x * cellSize;
      const y1 = anim.cellA.y * cellSize;
  
      ctx.strokeStyle = `rgba(255, 255, 0, ${1 - progress})`;
      ctx.lineWidth = 3;
  
      ctx.beginPath();
switch (anim.wallIndex) {
  case 0: // Top
    ctx.moveTo(x1 + cellSize * progress, y1);
    ctx.lineTo(x1 + cellSize * (1 - progress), y1);
    break;
  case 1: // Right
    ctx.moveTo(x1 + cellSize, y1 + cellSize * progress);
    ctx.lineTo(x1 + cellSize, y1 + cellSize * (1 - progress));
    break;
  case 2: // Bottom
    ctx.moveTo(x1 + cellSize * progress, y1 + cellSize);
    ctx.lineTo(x1 + cellSize * (1 - progress), y1 + cellSize);
    break;
  case 3: // Left
    ctx.moveTo(x1, y1 + cellSize * progress);
    ctx.lineTo(x1, y1 + cellSize * (1 - progress));
    break;
}
ctx.stroke();

//  Crackle/spark effect
ctx.strokeStyle = `rgba(255, 255, 0, ${Math.random() * 0.5 + 0.5})`;
ctx.lineWidth = 1;
ctx.beginPath();
for (let i = 0; i < 3; i++) {
  const jitter = (Math.random() - 0.5) * cellSize * 0.3;
  switch (anim.wallIndex) {
    case 0: case 2: {
      const y = anim.wallIndex === 0 ? y1 : y1 + cellSize;
      const xStart = x1 + Math.random() * cellSize * 0.9;
      ctx.moveTo(xStart, y);
      ctx.lineTo(xStart + jitter, y + jitter);
      break;
    }
    case 1: case 3: {
      const x = anim.wallIndex === 1 ? x1 + cellSize : x1;
      const yStart = y1 + Math.random() * cellSize * 0.9;
      ctx.moveTo(x, yStart);
      ctx.lineTo(x + jitter, yStart + jitter);
      break;
    }
  }
}
ctx.stroke();

      anim.frame++;
      return anim.frame <= anim.duration;
    });
  
    drawEndPoint();
    checkWin();
    renderPlayer();
  }
  
