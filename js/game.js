// Version 1.0 - 21.11.2019 - Author: Nino Righi
// Notes:
// This code routine is basically coded from bottom to top
// Don't exactly know why I did that ¯\_(ツ)_/¯
//
// Optimization idea: Array of mole objects and
// keep track of the current states they are in
// (State machine solution by FrontendMasters)

// -------------------------------------------------
// Global Attributes

let score = 0;      // If score hits 20, Player wins the game
const FINISH_SCORE = 20;
let finishState = false; // If player wins the game it equals true

const startButton = document.querySelector('.start-button');
const rulesScreen = document.querySelector('.rules');
const worm = document.querySelector('.worm-box');
const moleObjects = document.querySelectorAll('.mole');
const background = document.querySelector('.background');
const winScreen = document.querySelector('.win-state');

// -------------------------------------------------
// Place for all Event Listeners

startButton.addEventListener('click', () => {
    init();
});

// Event bubbling moles (from background)
background.addEventListener('click', (e) => {
    // if mole shows up it's hungry and hungry is a class which should be only on the mole image tags to achieve event bubbling
    if (e.target.classList.contains('hungry')) {
        e.target.classList.add('fed');
        pointsAndWorm(e.target);
    }
});

// -------------------------------------------------
// finishState stops running the randomizer function, so nothing should run after the player wins the game
// if adding a "new game" function, remember to set finishState to false and after that run the init function again
function winningScreen() {
    finishState = true;
    background.classList.add('hidden');
    winScreen.classList.remove('hidden');
}

// -------------------------------------------------
// Check which kind of mole got clicked in time and update score
// Update the length of the worm to represent the points
// After score >= FINISH_SCORE go to winningScreen
function pointsAndWorm(mole) {
    if (mole.src.includes("king")) {
        score += 2;
        worm.style.width = `${(score / FINISH_SCORE) * 100}%`;
        if (score >= FINISH_SCORE) {
            winningScreen();
        }
    } else {
        score++;
        worm.style.width = `${(score / FINISH_SCORE) * 100}%`;
        if (score >= FINISH_SCORE) {
            winningScreen();
        }
    }
}

// -------------------------------------------------
// The logic of this routine got explained over the gameplay function (Gameplay idea)
function showUpRoutine(mole) {
    const SHOW_UP_TIME = 1.5;   // 1.5 seconds after mole "escapes"
    // Tipp: With Math.random you could give a number range

    mole.classList.remove('hidden');
    mole.classList.add('hungry'); // change cursor

    // The system behind raf is explained inside randomizer func
    let secondsPassed = 0;
    let runAgainAt = Date.now();

    function rafCounter() {
        const now = Date.now();
        if (now >= runAgainAt) {
            secondsPassed += 0.5;
            runAgainAt = now + 500; // Updated every 500 ms
        }
        // if player wasn't fast enough to feed the mole
        if (SHOW_UP_TIME === secondsPassed) {

            mole.classList.remove('hungry');

            if (mole.src.includes("king")) {
                mole.src = "./images/king-mole-sad.png";
            } else {
                mole.src = "./images/mole-sad.png";
            }
            setTimeout(() => {
                if (mole.src.includes("king")) {
                    mole.src = "./images/king-mole-leaving.png";
                } else {
                    mole.src = "./images/mole-leaving.png";
                }
                setTimeout(() => {
                    mole.classList.add('hidden');
                    randomizer(mole);
                }, 500);
            }, 500);
        } else {
            // check if mole got the worm by the player in time
            if (mole.classList.contains('fed')) {

                mole.classList.remove('fed');
                mole.classList.remove('hungry');

                if (mole.src.includes("king")) {
                    mole.src = "./images/king-mole-fed.png";
                } else {
                    mole.src = "./images/mole-fed.png";
                }
                setTimeout(() => {
                    if (mole.src.includes("king")) {
                        mole.src = "./images/king-mole-leaving.png";
                    } else {
                        mole.src = "./images/mole-leaving.png";
                    }
                    setTimeout(() => {
                        mole.classList.add('hidden');
                        randomizer(mole);
                    }, 500);
                }, 500);
            } else {
                requestAnimationFrame(rafCounter);
            }
        }
    }
    // Initial function call
    rafCounter();
}

// -------------------------------------------------
// Every mole gets individually randomized

function randomizer(mole) {
    // Always check if player has won the game, to stop running this function for each mole (there might be a better performance solution)
    // If true, it immediately returns for all moles, because js is a single threaded language and all I've done so far is to use the ability of js being asynchronus (atleast I hope my answer is right)
    if (finishState === true) {
        return;
    }
    
    /*  Probabilities:
    *   Normal mole:    90% from 0.00 - 0.89999..
    *   King mole:      10% from 0.90 - 0.99999..
    */
    if (!(Math.random() >= 0.9)) {
        mole.src = "./images/mole-hungry.png";
    } else {
        mole.src = "./images/king-mole-hungry.png";
    }

    // Show up state: Random number between 2 (included) and 15 (included)
    let appearanceNumber = Math.floor(Math.random() * 14 + 2);
 
    /*  So this is the most complicated part of the project:
    *   -   raf is more performance friendly than setInterval
    *       Look it up on MDN if that is not clear to you.
    *  
    *   -   secondsPassed gets incremented (roughly) every second
    *   -   runAgainAt gets the number of milliseconds currently 
    *       passed since 01.01.1970
    *   -   The first if statement is needed because you want that
    *       the function only runs the body every 1000 milliseconds
    *       (The counter for seconds)
    *   -   The second if statement checks if the show up state 
    *       number equals the secondsPassed value
    *       a -  if true, run the showUpRoutine
    *       b -  if false, run the raf again
    *   -   Do this individually for each mole, just like they are
    *       different threads (I know js is a single threaded lang)
    *   -   For learning purposes I did not do this with an Event
    *       tick style, for example just one raf which runs 
    *       every 10 ms and constantly updates the game, which maybe
    *       is performance friendlier than one raf for each mole
    */
    
    let secondsPassed = 0;
    let runAgainAt = Date.now();

    function rafCounter() {
        const now = Date.now();
        // Counts in seconds
        if (now >= runAgainAt) {
            secondsPassed++;
            runAgainAt = now + 1000;
        }
        // Checks if mole should show up
        if (secondsPassed === appearanceNumber) {
            showUpRoutine(mole);
        } else {
            requestAnimationFrame(rafCounter);
        }
    }
    // Initial function call
    rafCounter();
}

// -------------------------------------------------
// Gameplay idea:

// START POINT
// - Every mole gets a chance to become king-mole or normal-mole

// - Every mole gets a Number between 2 and 15. These are the seconds which determine the "show up" state of each mole individually

// - The mole shows up for 1.5 seconds in hungry mode, when player hovers over hungry-mole, cursor changes

//      a - mole gets the worm from the player -> player points +1 or +2 -> points fill up the worm -> check if 20 points or above reached -> if game continues 0.5 sec mole-fed -> 0.5 sec mole dissappear -> START POINT

//      b - mole doesn't get worm -> 0.5 sec sad-mole -> 0.5 sec dissappear -> START POINT

function gameplay() {
    for (let i = 0; i < moleObjects.length; i++) {
        randomizer(moleObjects[i]);
    }
}

// -------------------------------------------------
// After clicking start button the moles start to disappear step by step. After 1.5 seconds they are completely hidden and the gameplay function starts running

function startGame() {
    rulesScreen.classList.add('hidden');
    setTimeout(() => {
        moleObjects.forEach(mole => {
            if (mole.src.includes("king")) {
                mole.src = "./images/king-mole-sad.png";
            } else {
                mole.src = "./images/mole-sad.png";
            }
        });
        setTimeout(() => {
            moleObjects.forEach(mole => {
                if (mole.src.includes("king")) {
                    mole.src = "./images/king-mole-leaving.png";
                } else {
                    mole.src = "./images/mole-leaving.png";
                }
            });
            setTimeout(() => {
                moleObjects.forEach(mole => {
                    mole.classList.add('hidden');
                });
                gameplay();
            }, 500);
        }, 500);
    }, 500);
}

// -------------------------------------------------
// Gets called after Player clicks on START button

function init() {
    startGame();
}