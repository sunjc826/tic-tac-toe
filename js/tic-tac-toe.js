
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

    let player1;
    let player2;
    

    let gameStart = false;
    const board = [];
    let currentPlayer;
    let turn;
    let gamemode;

    const cpuData = {
        board: board,
        turn: () => turn, // so that turn is dynamically updated
        empty: EMPTY,
        boardSize: BOARD_SIZE,
    }

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
        board.length = 0;
        for (let i = 0; i < BOARD_SIZE; i++) {
            const row = [];
            for (let j = 0; j < BOARD_SIZE; j++) {
                row.push(EMPTY);
            }
            board.push(row);
        }
    }

    function initPlayer(playerOneName, playerTwoName) {
        if (gamemode === GAMEMODE.TWO_PLAYER) {
            player1 = Player(playerOneName);
            player2 = Player(playerTwoName);
        } else {
            player1 = Player(playerOneName);
            player2 = Computer();
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

    /*** public methods***/
    function printBoard() {
        console.table(board);
    }

    function initGame(playerData) {
        gameStart = true;
        initBoard();
        initPlayer(...playerData);
        currentPlayer = CROSS;
        turn = 0;
    }

    function cpuMove() {
        return player2.generateMove(cpuData);
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

    return {
        data,
        initGame, updateCell, printBoard, cpuMove,
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

    const onePlayerLogic = function(cell, i, j) {
        const currentPlayer = gameBoard.getCurrentPlayer();
        const status = gameBoard.getCellStatus(i, j);
        let result;
        if (gameBoard.data["Empty"] === status) { // make changes
            

            if (currentPlayer === gameBoard.data["Player One"]) {
                cell.setAttribute("style", "background-color: green;");
            } else {
                alert("Awaiting CPU move");
                return;
            }
            result = gameBoard.updateCell(i, j);

            if (result === gameBoard.data["Win"]) {
                updateStatDisplay(currentPlayer);
                return;
            } else if (result === gameBoard.data["Draw"]) {
                updateStatDisplay();
                return;
            }
        } else { // do nothing; warn illegal move
            alert("Cell is occupied");
            return;
        }
        
        // CPU move
        [i, j] = gameBoard.cpuMove();
        result = gameBoard.updateCell(i, j);
        boardDisplay.querySelector(`#\\3${i} \\,${j}`).setAttribute("style", "background-color: blue;");
        if (result === gameBoard.data["Win"]) {
            updateStatDisplay(currentPlayer);
        } else if (result === gameBoard.data["Draw"]) {
            updateStatDisplay();
        }
    }

    const twoPlayerLogic = function(cell, i, j) {
        const currentPlayer = gameBoard.getCurrentPlayer();
        const status = gameBoard.getCellStatus(i, j);
        if (gameBoard.data["Empty"] === status) { // make changes
            /*
             * Here, I choose to update the board display first before updating the underlying 
             * implementation. I want to draw first, then check if the game has been won.
             */

            if (currentPlayer === gameBoard.data["Player One"]) {
                cell.setAttribute("style", "background-color: green;");
            } else {
                cell.setAttribute("style", "background-color: blue;");
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

    function cellListener() {
        if (!gameBoard.getGameStart()) {
            return;
        }

        const id = this.getAttribute("id");
        const i = parseInt(id.charAt(0));
        const j = parseInt(id.charAt(2));

        console.log(i + " row " + j + " column");
        const gamemode = gameBoard.getGameMode();
        if (gamemode === gameBoard.data["One Player"]) {
            onePlayerLogic(this, i, j);
        } else {
            twoPlayerLogic(this, i, j);
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
        const playerData = [];
        for (let i = 0; i < inputs.length; i++) {
            let input = inputs[i];
            if (input.classList.contains(gameBoard.getGameMode())) {
                if (input.value === undefined || input.value.length === 0) {
                    alert("Please input all values");
                    return;
                } else {
                    playerData.push(input.value);
                }
            }
        }
        // create players

        hideOverlay();
        hidePlayerSelect();
        gameBoard.initGame(playerData);
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
    
    function getName() {
        return this.name;
    }

    return {
        getName,
    }
}


const Computer = function() {
    const name = "CPU";
    
    const randomAI = (function() {
        function generateMove(cpuData) {
            console.log(cpuData);
            const board = cpuData.board;
            const boardSize = cpuData.boardSize;
            const turn = cpuData.turn();
            const empty = cpuData.empty;
            const randomCell = randomInt(0, boardSize * boardSize - turn);
            let count = 0;
            for (let i = 0; i < boardSize; i++) {
                for (let j = 0; j < boardSize; j++) {
                    // do not count occupied cells
                    if (board[i][j] !== empty) {
                        continue;
                    }
                    if (count === randomCell) {
                        console.log("cell " + i + " " + j);
                        return [i, j];
                    }
                    count++;
                }
            }
            
        }

        function randomInt(low, high) {
            return low + Math.floor(Math.random() * (high - low));
        }

        return {
            generateMove,
        }
    })();

    const MinimaxAI = (function() {
        function generateMove(cpuData) {

        }

        return {
            generateMove, 
        }
    })

    function getName() {
        return this.name;
    }

    function generateMove(cpuData) {
        return randomAI.generateMove(cpuData);
    }

    return {
        getName, generateMove,
    }
}
