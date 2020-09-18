
const gameBoard = (function() {
    /*** private fields***/
    const BOARD_SIZE = 3;
    const EMPTY = 0;
    const CROSS = 1; // player 1
    const CIRCLE = 2; // player 2

    let gameStart = false;
    let board;
    let currentPlayer;
    let turn;

    /*** public fields***/
    const data = {
        "Player One": CROSS,
        "PLayer Two": CIRCLE,
    }

    /*** private methods***/
    function nextPlayer(x) {
        return (x + 1) % 2;
    }


    /**
     * Create empty board.
     */
    function initBoard() {
        board = [];
        for (let i = 0; i < BOARD_SIZE; i++) {
            const row = [];
            for (let j = 0; j < BOARD_SIZE; j++) {
                row.push(EMPTY);
            }
            board.push(row);
        }
    }

    /**
     * Checks whether the game is already won by either player.
     * If game is won, returns the integer corresponding to the winning player,
     * otherwise, returns a boolean variable (true/false) indicating whether the board is filled.
     */
    function checkWin() {
        let result;
        const winCondition = Math.pow(currentPlayer, BOARD_SIZE);
        for (let i = 0; i < BOARD_SIZE; i++) {
            result = rowBingo(i, winCondition);
            if (result !== EMPTY) {
                return result; 
            }

            result = columnBingo(i, winCondition);
            if (result !== EMPTY) {
                return result;
            }
        }

        result = diagonalBingo(winCondition);
        if (result !== EMPTY) {
            return result;
        }

        return boardFilled();
    }

    function boardFilled() {
        return turn = BOARD_SIZE * BOARD_SIZE;
    }

    function rowBingo(row, winCondition) {
        let product = 1;
        for (let i = 0; i < BOARD_SIZE; i++) {
            product *= (board[row][i] + 1);
        }
        
        return product === winCondition;
    }

    function columnBingo(col, winCondition) {
        let product = 1;
        for (let i = 0; i < BOARD_SIZE; i++) {
            product *= (board[i][col] + 1);
        }
        
        return product === winCondition;
    }

    function diagonalBingo(winCondition) {
        let product = 1;
        for (let i = 0; i < BOARD_SIZE; i++) {
            product *= board[i][i];
        }

        if (product === winCondition) {
            return true;
        }

        // check the other diagonal
        
        product = 1;

        for (let i = 0; i < BOARD_SIZE; i++) {
            product *= (board[i][BOARD_SIZE - i - 1]);
        }

        return product === winCondition;
    }

    // public methods
    function initGame() {
        gameStart = true;
        initBoard();
        currentPlayer = CROSS;
        turn = 0;
    }

    function updateCell(i, j) {
        turn++;
        board[i][j] = currentPlayer;
        currentPlayer = nextPlayer(currentPlayer);
        const result = checkWin();

        // if draw or someone has won
        if (result !== false) {
            console.log(result);
            gameStart = false;
        }
        return result;
    }

    function getGameStart() {
        return gameStart;
    }

    function getCurrentPlayer() {
        return currentPlayer;
    }

    function getCellStatus(i, j) {
        return board[i][j];
    }

    function isEmpty(x) {
        return x === EMPTY;
    }

    function isPlayerOne(x) {
        return x === CROSS;
    }

    function isPlayerTwo(x) {
        return x === CIRCLE;
    }

    return {
        data,
        initGame, updateCell,
        getGameStart, getCurrentPlayer, getCellStatus, isEmpty
    };

})();

const displayController = (function() {
    const gameDisplay = document.querySelector("#game-display");
    
    const boardDisplay = gameDisplay.querySelector("#board-display");
    const boardCells = boardDisplay.querySelectorAll(".board-cell")

    const controls = gameDisplay.querySelector("#controls");
    const resetBtn = controls.querySelector("#reset");
    const startBtn = controls.querySelector("#start-game");
    const modeSelectPanel = controls.querySelector("#mode-select");
    const cpuBtn = modeSelectPanel.querySelector("#cpu");
    const twoPlayBtn = modeSelectPanel.querySelector("#two-play");
    const cancelBtn = modeSelectPanel.querySelector("#cancel");

    const statDisplay = gameDisplay.querySelector("stat-display");

    // add event listeners
    boardCells.forEach(cell => {
        cell.addEventListener("click", cellListener);
    });

    resetBtn.addEventListener("click", resetBtnListener);
    startBtn.addEventListener("click", startBtnListener);
    cpuBtn.addEventListener("click", cpuBtnListener);
    twoPlayBtn.addEventListener("click", twoPlayBtnListener);
    cancelBtn.addEventListener("click", cancelBtnListener);

    function cellListener() {
        if (!gameBoard.getGameStart()) {
            return;
        }

        const id = this.getAttribute("id");
        const i = parseInt(id.charAt(0));
        const j = parseInt(id.charAt(2));

        console.log(i + " row " + j + " column");

        const currentPlayer = gameBoard.getCurrentPlayer();
        const status = gameBoard.getCellStatus(i, j);
        if (gameBoard.isEmpty(status)) { // make changes
            /*
             * Here, I choose to update the board display first before updating the underlying 
             * implementation. Because I want to draw first, then check if the game has been won.
             */

            if (currentPlayer === gameBoard.data["Player One"]) {
                this.setAttribute("style", "background-color: green;");
            } else {
                this.setAttribute("style", "background-color: blue;");
            }
            gameBoard.updateCell(i, j);
        } else { // do nothing; warn illegal move
            alert("Cell is occupied");
        }
    }

    function resetBtnListener() {
        reset();
    }

    function startBtnListener() {
        show();
    }

    function cpuBtnListener() {
        reset();
        hide();
    }

    function twoPlayBtnListener() {
        reset();
        hide();
        gameBoard.initGame();
    }

    function cancelBtnListener() {
        hide();
    }


    function updateGameDisplay() {
    }

    function updateStat() {

    }

    function reset() {
        boardCells.forEach(cell => cell.setAttribute("style", "background-color : white"));
        hide();
    }

    function show() {
        modeSelectPanel.setAttribute("style", "visibility: visible;");
    }

    function hide() {
        modeSelectPanel.setAttribute("style", "visibility: hidden");
    }


})();

const Player = function(name) {

}

