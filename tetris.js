const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const ROWS = 20;
const COLUMNS = 10;
const BLOCK_SIZE = 30;
const FPS =10;

canvas.width = COLUMNS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

const board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));

const playButton = document.getElementById('play-button');
const pauseButton = document.getElementById('pause-button');
const restartButton = document.getElementById('restart-button'); // Botão de reinício

// Obtenha uma referência ao elemento de áudio
const backgroundMusic = document.getElementById('background-music');

// Função para iniciar a música
function playBackgroundMusic() {
  backgroundMusic.play();
}

// Função para pausar a música
function pauseBackgroundMusic() {
  backgroundMusic.pause();
}

// Função para reiniciar o jogo
function restartGame() {
    // Coloque aqui qualquer lógica necessária para reiniciar o jogo
    // Por exemplo, redefina o tabuleiro, pare a música, etc.
    board.forEach(row => row.fill(0)); // Isso redefine o tabuleiro para vazio
    playBackgroundMusic(); // Reinicia a música de fundo, se necessário
    spawnShape(); // Gere uma nova forma para começar o jogo novamente
    // Você pode adicionar mais ações de reinicialização conforme necessário

    // Redesenhe o tabuleiro
    draw();
}

// Adicione um manipulador de eventos para o botão de reinício
restartButton.addEventListener('click', restartGame);

// Chame playBackgroundMusic() quando desejar iniciar a música, por exemplo, no início do jogo
// Chame pauseBackgroundMusic() quando desejar parar a música, por exemplo, ao encerrar o jogo
playButton.addEventListener('click', playBackgroundMusic);
pauseButton.addEventListener('click', pauseBackgroundMusic);

const volumeControl = document.getElementById('volume');
volumeControl.addEventListener('input', () => {
    const volume = volumeControl.value / 100; // Converter de 0 a 100 para 0 a 1
    backgroundMusic.volume = volume;
});

// Definir o volume inicial
backgroundMusic.volume = volumeControl.value / 100;

const tetrisShapes = [
    [[1, 1, 1, 1]], // Peça I
    [[1, 1], [1, 1]], // Peça O
    [[1, 1, 1], [0, 1, 0]], // Peça T
    [[1, 1, 1], [0, 0, 1]], // Peça L
    [[1, 1, 1], [1, 0, 0]], // Peça J
    [[1, 1, 0], [0, 1, 1]], // Peça S
    [[0, 1, 1], [1, 1, 0]], // Peça Z
];

function drawBlock(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawBoard() {
    board.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                drawBlock(x, y, 'blue');
            }
        });
    });
}

function collide(board, shape, offsetX, offsetY) {
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const boardY = y + offsetY;
                const boardX = x + offsetX;
                if (
                    boardY >= ROWS ||
                    boardX < 0 ||
                    boardX >= COLUMNS ||
                    board[boardY][boardX]
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

let currentShape, currentShapeX, currentShapeY;
let leftPressed = false;
let rightPressed = false;
let downPressed = false;

let lastTime = 0;

function spawnShape() {
    const shape = tetrisShapes[Math.floor(Math.random() * tetrisShapes.length)];
    currentShape = shape;
    currentShapeX = Math.floor((COLUMNS - shape[0].length) / 2);
    currentShapeY = 0;
}

function clearRows() {
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLUMNS).fill(0));
        }
    }
}

function rotate(shape) {
    const size = shape.length;
    const rotatedShape = [];
    for (let y = 0; y < size; y++) {
        rotatedShape.push([]);
        for (let x = 0; x < size; x++) {
            rotatedShape[y][x] = shape[size - 1 - x][y];
        }
    }
    return rotatedShape;
}

function moveDown() {
    const newShapeY = currentShapeY + 1;
    if (!collide(board, currentShape, currentShapeX, newShapeY)) {
        currentShapeY = newShapeY;
    } else {
        currentShape.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    board[y + currentShapeY][x + currentShapeX] = cell;
                }
            });
        });

        clearRows();

        spawnShape();
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();

    if (leftPressed) {
        const newShapeX = currentShapeX - 1;
        if (!collide(board, currentShape, newShapeX, currentShapeY)) {
            currentShapeX = newShapeX;
        }
    } else if (rightPressed) {
        const newShapeX = currentShapeX + 1;
        if (!collide(board, currentShape, newShapeX, currentShapeY)) {
            currentShapeX = newShapeX;
        }
    } else if (downPressed) {
        const newShapeY = currentShapeY + 1;
        while (!collide(board, currentShape, currentShapeX, newShapeY)) {
            currentShapeY = newShapeY;
            newShapeY++;
        }
    }

    currentShape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                drawBlock(currentShapeX + x, currentShapeY + y, 'blue');
            }
        });
    });
}


   
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            leftPressed = true;
        } else if (event.key === 'ArrowRight') {
            rightPressed = true;
        } else if (event.key === 'ArrowDown') {
            downPressed = true;
        } else if (event.key === 'ArrowUp') {
            const rotatedShape = rotate(currentShape);
            if (!collide(board, rotatedShape, currentShapeX, currentShapeY)) {
                currentShape = rotatedShape;
            }
        }
    });
    
    document.addEventListener('keyup', (event) => {
        if (event.key === 'ArrowLeft') {
            leftPressed = false;
        } else if (event.key === 'ArrowRight') {
            rightPressed = false;
        } else if (event.key === 'ArrowDown') {
            downPressed = false;
        }
    });
    
    function gameLoop(timestamp) {
        const deltaTime = timestamp - lastTime;
    
        if (deltaTime > 1000 / FPS) {
            lastTime = timestamp;
            moveDown();
            draw();
        }
    
        requestAnimationFrame(gameLoop);
    }
    
    // Inicie o loop de jogo
    spawnShape();
    setInterval(gameLoop, 1000); // Atualize a cada 1 segundo
    