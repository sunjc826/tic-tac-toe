
const gameBoard = (function() {
    /*** private fields***/
    const BOARD_SIZE = 3;
    const EMPTY = 0;
    const CROSS = 1; // player 1
    const CIRCLE = 2; // player 2
    const STATE = {
        WIN : 3,
        DRAW : 4,
        ONGOING : 5,
    }
    const GAMEMODE = {
        ONE_PLAYER : "1",
        TWO_PLAYER : "2",
    }
    

    let gameStart = false;
    let board;
    let currentPlayer;
    let turn;
    let gamemode;

    /*** public fields***/
    const data = {
        "Player One": CROSS,
        "Player Two": CIRCLE,
        "Empty" : EMPTY,
        "Win" : STATE.WIN,
        "Draw" : STATE.DRAW,
        "Ongoing" : STATE.ONGOING,
        "One Player" : GAMEMODE.ONE_PLAYER,
        "Two Player" : GAMEMODE.TWO_PLAYER,
    }


    /*** private methods***/
    function nextPlayer(x) {
        return x === CROSS? CIRCLE : CROSS;
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
        let result = false;
        const winCondition = Math.pow(currentPlayer, BOARD_SIZE);
        // console.log(winCondition);
        for (let i = 0; i < BOARD_SIZE; i++) {
            result = rowBingo(i, winCondition) || columnBingo(i, winCondition);
            if (result) {
                break;
            }
        }

        result = result || diagonalBingo(winCondition);

        if (result) {
            return STATE.WIN;
        } else if (boardFilled()) {
            return STATE.DRAW;
        } else {
            return STATE.ONGOING;
        }
    }

    function boardFilled() {
        return turn === BOARD_SIZE * BOARD_SIZE;
    }

    function rowBingo(row, winCondition) {
        let product = 1;
        for (let i = 0; i < BOARD_SIZE; i++) {
            product *= board[row][i];
            
        }
        return product === winCondition;
    }

    function columnBingo(col, winCondition) {
        let product = 1;
        for (let i = 0; i < BOARD_SIZE; i++) {
            product *= board[i][col];
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
            product *= board[i][BOARD_SIZE - i - 1];
        }

        return product === winCondition;
    }

    // public methods
    function printBoard() {
        console.table(board);
    }

    function initGame() {
        gameStart = true;
        initBoard();
        currentPlayer = CROSS;
        turn = 0;
    }

    function updateCell(i, j) {
        turn++;
        board[i][j] = currentPlayer;
        
        const result = checkWin();
        currentPlayer = nextPlayer(currentPlayer);
        // if draw or someone has won
        if (result !== STATE.ONGOING) {
            gameStart = false;
        }
        return result;
    }

    function setGameMode(mode) {
        gamemode = mode;
    }

    function getGameMode() {
        console.log(gamemode);
        return gamemode;
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

    return {
        data,
        initGame, updateCell, printBoard,
        setGameMode,
        getGameMode, getGameStart, getCurrentPlayer, getCellStatus,
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

    const overlayPanel = controls.querySelector("#overlay");
    const player = overlayPanel.querySelector("#player");
    const player1 = overlayPanel.querySelector("#player1");
    const player2 = overlayPanel.querySelector("#player2");
    const confirmBtn = overlayPanel.querySelector("#confirm");

    const statDisplay = gameDisplay.querySelector("#stat-display");

    // add event listeners
    boardCells.forEach(cell => {
        cell.addEventListener("click", cellListener);
    });

    resetBtn.addEventListener("click", resetBtnListener);
    startBtn.addEventListener("click", startBtnListener);
    cpuBtn.addEventListener("click", cpuBtnListener);
    twoPlayBtn.addEventListener("click", twoPlayBtnListener);
    cancelBtn.addEventListener("click", cancelBtnListener);
    confirmBtn.addEventListener("click", confirmBtnListener)

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
        if (gameBoard.data["Empty"] === status) { // make changes
            /*
             * Here, I choose to update the board display first before updating the underlying 
             * implementation. Because I want to draw first, then check if the game has been won.
             */

            if (currentPlayer === gameBoard.data["Player One"]) {
                this.setAttribute("style", "background-color: green;");
            } else {
                this.setAttribute("style", "background-color: blue;");
            }
            const result = gameBoard.updateCell(i, j);
            if (result === gameBoard.data["Win"]) {
                updateStatDisplay(currentPlayer);
            } else if (result === gameBoard.data["Draw"]) {
                updateStatDisplay();
            }
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
        gameBoard.setGameMode(gameBoard.data["One Player"]);
        overlayPanel.setAttribute("style", "display: block;");
        player.setAttribute("style", "display: block;");
    }

    function twoPlayBtnListener() {
        reset();
        gameBoard.setGameMode(gameBoard.data["Two Player"]);
        overlayPanel.setAttribute("style", "display: block;");
        player1.setAttribute("style", "display: block;");
        player2.setAttribute("style", "display: block;");
    }

    function cancelBtnListener() {
        hidePlayerSelect();
    }

    function confirmBtnListener() {
        const inputs = overlayPanel.querySelectorAll("input");
        for (let i = 0; i < inputs.length; i++) {
            let input = inputs[i];
            if (input.classList.contains(gameBoard.getGameMode())) {
                if (input.value === undefined || input.value.length === 0) {
                    alert("Please input all values");
                    return;
                }
            }
        }
        // create players
        

        hideOverlay();
        hidePlayerSelect();
        gameBoard.initGame();
    }


    function updateStatDisplay(winner=null) {
        if (winner === null) {
            statDisplay.textContent = "Players draw!";
        } else {
            statDisplay.textContent = `${winner} wins!`;
        }
    }


    function reset() {
        boardCells.forEach(cell => cell.setAttribute("style", "background-color : white"));
        statDisplay.textContent = "";
        hidePlayerSelect();
    }

    function show() {
        modeSelectPanel.setAttribute("style", "visibility: visible;");
    }

    function hideOverlay() {
        overlayPanel.setAttribute("style", "display: none;");
        player.setAttribute("style", "display: none;");
        player1.setAttribute("style", "display: none;");
        player2.setAttribute("style", "display: none;");
    }

    function hidePlayerSelect() {
        modeSelectPanel.setAttribute("style", "visibility: hidden");
    }


})();

const Player = function(playerName) {
    const name = playerName;
    
}

