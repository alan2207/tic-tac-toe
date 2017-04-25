var player, AI;
var currentPlayer;
var menu = document.getElementById('menu');
var playerMenu = document.querySelectorAll('.playerMenu');
var fields = document.querySelectorAll('.field');
var board = document.querySelector('.board');
var multiplayerButton = document.getElementById('multiplayer');
var game = true;

// array representation of the board
var gameState = [0, 1, 2, 3, 4, 5, 6, 7, 8];

var multiplayer = false;

// switching between single player vs AI and multiplayer
multiplayerButton.addEventListener('click', function() {
    multiplayer = !multiplayer;
    multiplayerButton.textContent = multiplayer ? 'Multiplayer' : 'Single Player (vs AI)';
    resetScores();
    updatePlayersNames();
    updateScores();
})



var player1Name, player2Name;
var player1NameText = document.getElementById('player1');
var player2NameText = document.getElementById('player2');


function updatePlayersNames() {
    if(!multiplayer) {
        player1NameText.textContent = 'Me: ';
        player2NameText.textContent = 'Computer: ';
    } else {
        player1NameText.textContent = 'Player 1: ';
        player2NameText.textContent = 'Player 2: ';
    }
}


function resetScores() {
  playerScore = drawScore = AIScore = 0;
}


// tracks total score of the game between players
var playerScore = 0, drawScore = 0, AIScore = 0;
var playerScoreText = document.getElementById('playerScore');
var drawScoreText = document.getElementById('drawScore');
var AIScoreText = document.getElementById('aiScore');

function updateScores() {
    playerScoreText.textContent = playerScore;
    drawScoreText.textContent = drawScore;
    AIScoreText.textContent = AIScore;
}





// restarts board and state of the game
function restart() {
    for(var i = 0; i < fields.length; i++) {
        fields[i].textContent = '';
    }
    gameState = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    game = true;
    init();
}




// 1. initializes board
function init() {
    menu.style.display = 'block';
    board.style.display = 'none';
    for(var i = 0; i < fields.length; i++) {
        fields[i].classList.add('available');
    }
    updateScores();
    for(var i = 0; i < playerMenu.length; i++) {
        playerMenu[i].addEventListener('click', selectPlayer);
    }
}

// 2. player selection
function selectPlayer(e) {
  player = e.target.textContent;
	AI = player === 'X' ? 'O' : 'X';
  currentPlayer = player === 'X' ? player : AI;
	menu.style.display = 'none';
	board.style.display = 'block';
	if(!multiplayer && AI === 'X') {
    	AIplay();
    }
    play();
}

// 3. manages clicked field
function play() {
    for(var i = 0; i < fields.length; i++) {
        if(typeof gameState[i] === 'number') {
            fields[i].addEventListener('click', move);
        }
    }
}


// 4. changes gamestate, and swapping turn of players
function move() {
    if (!game) return;
    for(var i = 0; i < fields.length; i++) {
        if(fields[i] === this && typeof gameState[i] === 'number' ) {
            makeMove(i);
            if(!multiplayer) {
                AIplay();
            }
        }
    }
}

// making changes on the board and state
function makeMove(index) {
  fields[index].textContent = currentPlayer;
  fields[index].classList.remove('available');
  gameState[index] = currentPlayer;
  switchTurn();
}


// called when AI's turn for AI's move
function AIplay() {
	if(!game) return;
	var index = minimax(gameState, 0, AI).index;
	makeMove(index);
}

// swithces turn with other player
function switchTurn() {
    if(checkWin(gameState, currentPlayer)) {
        game = false;
        currentPlayer === player ? playerScore++ : AIScore++;
        setTimeout(function() {
            restart();
        }, 2000)
    }

    if(checkFull(gameState)) {
        game = false;
        drawScore++;
         setTimeout(function() {
            restart();
        }, 2000)
    }
    currentPlayer = currentPlayer === player ? AI : player;
}


// 5. checking if anyone won the game
function checkWin(board, player) {
    if (
    (board[0] == player && board[1] == player && board[2] == player) ||
    (board[3] == player && board[4] == player && board[5] == player) ||
    (board[6] == player && board[7] == player && board[8] == player) ||
    (board[0] == player && board[3] == player && board[6] == player) ||
    (board[1] == player && board[4] == player && board[7] == player) ||
    (board[2] == player && board[5] == player && board[8] == player) ||
    (board[0] == player && board[4] == player && board[8] == player) ||
    (board[2] == player && board[4] == player && board[6] == player)
  ) {
    return true;
  } else {
    return false;
  }
}


// 6. checking if the board is full
function checkFull(board) {
    for(var i = 0; i < gameState.length; i++) {
        if(typeof board[i] === 'number') {
            return false;
        }
    }
    return true;
}


// getting array with empty fields
function availableMoves(board) {
    return board.filter(field => field !== player && field !== AI);
}

// implementation of the minimax algorithm for unbeatable AI
function minimax(board, depth, cplayer) {
    // finding all empty fields in the given board
    var emptyFields = availableMoves(board);

    // setting terminating state
    if(checkWin(board, player)) {
        return {score: depth - 10};
    } else if(checkWin(board, AI)) {
        return {score: 10 - depth};
    } else if(emptyFields.length === 0){
        return {score: 0};
    }

    // increase depth if terminal state is not called
    depth++;

    // array of moves
    var moves = [];


    // loop through empty fields and find most desireable field for player
    for(var i = 0; i < emptyFields.length; i++) {
        var move = {};

        // set the index of move to emptyFields ith index
        move.index = board[emptyFields[i]];

        // set the empty field to the current player
        board[emptyFields[i]] = cplayer;

        // if current player is AI, call recursevly minimax as human player
        if(cplayer === AI) {
            var next = minimax(board, depth, player);
            move.score = next.score;
          // otherwise call it as AI
        } else {
            var next = minimax(board, depth, AI);
            move.score = next.score;
        }

        // reset the field to empty again
        board[emptyFields[i]] = move.index;

        // push it to the moves array
        moves.push(move);
    }
    // here are we going to store index of the bestMove
    var bestMove;

    // if the player is AI, find move with highest possible score and set bestMove to index of hihgest score move
    if(cplayer === AI) {
        var bestScore = -10000;
        for(var i = 0; i < moves.length; i++) {
            if(moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
        // otherwise find lowest possible score , and set i as bestMove
    } else if(cplayer === player){
        var bestScore = 10000;
        for(var i = 0; i < moves.length; i++) {
            if(moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    // return object with best possible move
    return moves[bestMove];
}



// initialize the game when page is loaded
window.onload = init;
