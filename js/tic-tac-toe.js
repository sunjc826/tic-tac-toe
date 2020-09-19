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
    const players = [null, null];    

    let gameStart = false;
    const board = [];
    let currentPlayerIndex; // current player index
    let turn;
    let gamemode;

    const cpuData = {
        board: board,
        turn: () => turn, // so that turn is dynamically updated
        empty: EMPTY,
        boardSize: BOARD_SIZE,
        players: players,
        checkWin: checkWin,
        win: STATE.WIN,
        draw: STATE.DRAW,
        ongoing: STATE.ONGOING,
        currentPlayerIndex: () => currentPlayerIndex,
    }

    /*** public fields***/
    const data = {
        "Player One": () => player1, // since player1 is dynamic due to Player() factory call
        "Player Two": () => player2, // since player2 is dynamic due to Player()/Computer() factory call
        "Empty" : EMPTY,
        "Win" : STATE.WIN,
        "Draw" : STATE.DRAW,
        "Ongoing" : STATE.ONGOING,
        "One Player" : GAMEMODE.ONE_PLAYER,
        "Two Player" : GAMEMODE.TWO_PLAYER,
    }


    /*** private methods***/
    function nextPlayerIndex(x) {
        return (x + 1) % 2;
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
            player1 = Player(playerOneName, CROSS);
            player2 = Player(playerTwoName, CIRCLE);
        } else {
            player1 = Player(playerOneName, CROSS);
            player2 = Computer(CIRCLE);
        }
        players[0] = player1;
        players[1] = player2;
    }

    /**
     * Checks whether the game is already won by either player.
     * If game is won, returns the integer corresponding to the winning player,
     * otherwise, returns a boolean variable (true/false) indicating whether the board is filled.
     * Refactored to include more arguments so that Computer class can use this method as well.
     */
    function checkWin(board, player, turn) {
        let result = false;
        const winCondition = Math.pow(player.getSymbol(), board.length);
        // console.log(winCondition);
        for (let i = 0; i < board.length; i++) {
            result = rowBingo(board, i, winCondition) || columnBingo(board, i, winCondition);
            if (result) {
                break;
            }
        }

        result = result || diagonalBingo(winCondition);

        if (result) {
            return STATE.WIN;
        } else if (boardFilled(turn, board.length)) {
            return STATE.DRAW;
        } else {
            return STATE.ONGOING;
        }
    }

    function boardFilled(turn, boardSize) {
        return turn === boardSize * boardSize;
    }

    function rowBingo(board, row, winCondition) {
        let product = 1;
        for (let i = 0; i < board.length; i++) {
            product *= board[row][i];
            
        }
        return product === winCondition;
    }

    function columnBingo(board, col, winCondition) {
        let product = 1;
        for (let i = 0; i < board.length; i++) {
            product *= board[i][col];
        }
        
        return product === winCondition;
    }

    function diagonalBingo(board, winCondition) {
        let product = 1;
        for (let i = 0; i < board.length; i++) {
            product *= board[i][i];
        }

        if (product === winCondition) {
            return true;
        }

        // check the other diagonal

        product = 1;

        for (let i = 0; i < board.length; i++) {
            product *= board[i][board.length - i - 1];
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
        currentPlayerIndex = 0;
        turn = 0;
    }

    function cpuMove() {
        return player2.generateMove(cpuData);
    }


    function updateCell(i, j) {
        turn++;
        console.log("curplayer " + currentPlayerIndex);
        board[i][j] = players[currentPlayerIndex].getSymbol();
        
        const result = checkWin(board, players[currentPlayerIndex], turn);
        currentPlayerIndex = nextPlayerIndex(currentPlayerIndex);

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

    function getCurrentPlayerIndex() {
        return currentPlayerIndex;
    }

    function getCurrentPlayer() {
        return players[currentPlayerIndex];
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
        let currentPlayer = gameBoard.getCurrentPlayer();
        const status = gameBoard.getCellStatus(i, j);
        let result;
        if (gameBoard.data["Empty"] === status) { // make changes
            if (currentPlayer === gameBoard.data["Player One"]()) {
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
        console.log("cpumove " + i + " " + j);
        currentPlayer = gameBoard.getCurrentPlayer();
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

            if (currentPlayer === gameBoard.data["Player One"]()) {
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
            statDisplay.textContent = `${winner.getName()} wins!`;
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

const Player = function(playerName, playerSymbol) {
    const name = playerName;
    const symbol = playerSymbol;
    
    function getName() {
        return name;
    }

    function getSymbol() {
        return symbol;
    }

    return {
        getName, getSymbol,
    }
}


const Computer = function(playerSymbol) {
    const name = "CPU";
    const symbol = playerSymbol;
    
    const randomAI = (function() {
        function generateMove(cpuData) {
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

    const minimaxAI = (function() {
        function generateMove(cpuData) {
            const board = cpuData.board;
            const boardSize = cpuData.boardSize;
            const turn = cpuData.turn();
            const empty = cpuData.empty;
            const checkWin = cpuData.checkWin;
            const win = cpuData.win;
            const draw = cpuData.draw;
            const players = cpuData.players;
            const aiPlayerIndex = cpuData.currentPlayerIndex(); // which player is the computer


            function searchCell(board, i, j, currentPlayerIndex, turn) {
                turn++;
                const newBoard = copyBoard(board);
                newBoard[i][j] = players[currentPlayerIndex].getSymbol();
                let score = 0;
                let result = checkWin(board, players[currentPlayerIndex], turn);
                if (result === win) {
                    if (currentPlayerIndex === aiPlayerIndex) { // winner is AI
                        score++;
                    } else { // winner is human
                        score--;
                    }
                } else if (result === draw) {
                    // netural, no change to score
                } else { // game still ongoing
                    currentPlayerIndex = (currentPlayerIndex + 1) % 2;
                    score = search(newBoard, currentPlayerIndex, turn)[1];
                }
                return score;
            }

            function search(board, currentPlayerIndex, turn) {
                let bestScore = -100000;
                let bestChoice = [null, null];
                for (let i = 0; i < boardSize; i++) {
                    for (let j = 0; j < boardSize; j++) {
                        if (board[i][j] === empty) {
                            let score = searchCell(board, i, j, currentPlayerIndex, turn);
                            //console.log(turn);
                            if (score > bestScore) {
                                bestChoice[0] = i;
                                bestChoice[1] = j;
                                bestScore = score;
                            }
                        }
                    }
                }
                return [bestChoice, bestScore];    
            }

            function copyBoard(board) {
                const newBoard = [];
                for (let i = 0; i < boardSize; i++) {
                    const row = [];
                    for (let j = 0; j < boardSize; j++) {
                        row.push(board[i][j]);
                    }
                    newBoard.push(row);
                }
                return newBoard;
            }

            return search(board, aiPlayerIndex, turn)[0];
        }

        

        return {
            generateMove, 
        }
    })();

    function getName() {
        return name;
    }

    function getSymbol() {
        return symbol;
    }

    function generateMove(cpuData) {
        return minimaxAI.generateMove(cpuData);
    }

    return {
        getName, getSymbol, generateMove,
    }
}
