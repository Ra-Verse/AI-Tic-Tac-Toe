// Select all cells, message element, and restart button from the DOM
const cells = document.querySelectorAll(".cell");
const message = document.querySelector("#message");
const restartBtn = document.querySelector("#restart");

// Define player markers
const human = 'O';
const ai = 'X';

// Winning conditions for the game
const winCondition = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Initialize game variables
let currBoard = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = human;
let humanTurn = false;
let running = false;

initializeGame(); // Start the game

// Initialize the game: set event listeners and update the status message
function initializeGame() {
    running = true;
    humanTurn = true;
    cells.forEach((cell) => cell.addEventListener("click", cellClicked));
    restartBtn.addEventListener("click", restart);
    typeWriter(message, `Your turn`, 50);
}

// Handle cell clicks during the human player's turn
function cellClicked() {
    if (humanTurn) {
        const cellIndex = this.getAttribute("cellIndex");
        // Ignore clicks on already filled cells or if the game isn't running
        if (currBoard[cellIndex] != "" || !running) {
            return;
        }
        updateCell(this, cellIndex); // Update cell with the player's move
        checkWinner(); // Check if the game is over
    }
}

// Update the clicked cell on the board and in the UI
function updateCell(cell, cellIndex) {
    currBoard[cellIndex] = currentPlayer;
    cell.textContent = currentPlayer;
}

// Switch the current player and update the status message
function changePlayer() {
    currentPlayer = currentPlayer === human ? ai : human;
    if (currentPlayer == human) {
        typeWriter(message, `Your turn`, 50);
        humanTurn = true;
    } else {
        humanTurn = false;
    }
}

// Highlight the winning cells with a visual cue
function highlightWinningCells(condition) {
    condition.forEach((index) => {
        cells[index].classList.add("winning");
    });
}

// Check if the game has been won, drawn, or should continue
function checkWinner() {
    let roundWon = false;

    // Check all win conditions
    for (let i = 0; i < winCondition.length; i++) {
        const condition = winCondition[i];
        const cellA = currBoard[condition[0]];
        const cellB = currBoard[condition[1]];
        const cellC = currBoard[condition[2]];

        // Skip if any cell in the condition is empty
        if (cellA === "" || cellB === "" || cellC === "") {
            continue;
        }
        // Check if all cells in the condition match
        if (cellA === cellB && cellB === cellC) {
            highlightWinningCells(condition); // Highlight the winning cells
            roundWon = true;
            running = false; // Stop the game
            break;
        }
    }

    // Display appropriate message based on the game result
    if (roundWon && currentPlayer === human) {
        typeWriter(message, `You win!!!! you beat the unbeatable AI. :)`, 40);
    } else if (roundWon && currentPlayer === ai) {
        typeWriter(message, `I win!! Woohooo!! I am really am good at this game. But then again it is the sole purpose of my existence. :(`, 20);
    } else if (!currBoard.includes("")) {
        typeWriter(message, `Draw! Doesn't mean you beat me, fancy another round? :/`, 40);
        running = false; // Stop the game
    } else {
        changePlayer(); // Switch to the next player
        if (currentPlayer === ai && running) {
            typeWriter(message, `I am thinking...`, 50);
            setTimeout(() => {
                aiMove(); // Let the AI make its move
                checkWinner(); // Check the game result after the AI's move
            }, 1000); // Simulate AI thinking time
        }
    }
}

// Restart the game and reset the board
function restart() {
    currBoard = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = human;
    cells.forEach((cell) => {
        cell.textContent = ""; // Clear cell text
        cell.classList.remove("winning"); // Remove winning highlights
    });
    typeWriter(message, `Your turn`, 50); // Reset the status message
    running = true; // Restart the game
    humanTurn = true; // Allow the human to play first
}

// Minimax algorithm for AI to find the best move
function minimax(board, player) {
    // Check for a terminal state (win/loss/draw)
    if (checkWinnerStatic(board)) {
        return { score: getScore(board) };
    }
    if (!board.includes("")) {
        return { score: 0 }; // Draw
    }

    let bestScore = player === ai ? -Infinity : Infinity;
    let bestMove = -1;

    // Iterate through all empty cells
    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            board[i] = player; // Simulate the move
            let score = minimax(board, player === ai ? human : ai).score; // Recursively call minimax
            board[i] = ""; // Undo the move

            // Update the best score and move based on the player
            if (player === ai) {
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            } else {
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
    }

    return { score: bestScore, move: bestMove };
}

// Make the AI's move based on the best result from minimax
function aiMove() {
    const result = minimax(currBoard, ai);
    const bestMove = result.move;

    if (bestMove !== undefined) {
        currBoard[bestMove] = ai; // Update the board
        cells[bestMove].textContent = ai; // Update the UI
        humanTurn = true; // Allow the human to play next
    }
}

// Check if the board has a winner (used by minimax)
function checkWinnerStatic(board) {
    for (let condition of winCondition) {
        const [a, b, c] = condition;
        if (board[a] !== "" && board[a] === board[b] && board[b] === board[c]) {
            return true;
        }
    }
    return false;
}

// Calculate the score for the current board state
function getScore(board) {
    for (let condition of winCondition) {
        const [a, b, c] = condition;
        if (board[a] !== "" && board[a] === board[b] && board[b] === board[c]) {
            return board[a] === ai ? 10 : -10; // AI win: 10, Human win: -10
        }
    }
    return 0; // Draw
}

// Simulate typing effect for the status message
function typeWriter(element, text, speed = 100) {
    element.textContent = ""; // Clear existing text
    let i = 0;
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i); // Add one character at a time
            i++;
            setTimeout(type, speed); // Delay for typing effect
        }
    }
    type();
}