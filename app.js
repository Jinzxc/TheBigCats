// Listener for when the document is loaded.
document.addEventListener('DOMContentLoaded', () =>  {
    // Chain of const to get DOM elements.
    const gridDisplay = document.querySelector('.grid');
    const scoreDisplay = document.getElementById('score');
    const resultDisplay = document.getElementById('result');
    const restartButton = document.getElementById('restart');
    const bgm = document.getElementById("bgm");

    // If restart button is clicked recreate the board
    restartButton.onclick = function() {createBoard()};

    const cats = createCats();
    const sounds = getCatNoise();
    const temp = resultDisplay.innerHTML;
    const width = 4;

    let squares = [];       // Holds the value for each square
    let score = 0;          // Total score
    let playing = true;     // Allows for movement control
    let spaces = 16;        // Number of spaces left to fill
    let playSound = 4;   // Space each sound out

    // Function to initialize and restart the gameboard
    function createBoard() {
        clearAll(gridDisplay);
        restartButton.style.display = "none";
        resultDisplay.innerHTML = temp;
        playing = true;
        squares.length = 0;
        spaces = 16;
        score = 0;
        scoreDisplay.innerHTML = score;

        for(let i = 0; i < width * width; i++) {
            let square = document.createElement('div');
            square.innerHTML = 0;
            gridDisplay.appendChild(square);
            squares.push(square);
        }
        generate(0); generate(0);
    }

    createBoard();

    // Add a cat to a DOM element
    function add_cat(value) {
        var img = document.createElement("img");
        img.src = cats[value].source;
        img.style.width = 60 + "px";
        return img;
    }

    // Generate a 2-cat in a random empty square.
    // Will try 100 times randomly then check if there is
    // an empty space.
    function generate(count) {
        bgm.play();
        let randomNumber = Math.floor(Math.random() * squares.length);
        if(count < 100) {
            if(squares[randomNumber].innerHTML == 0) {
                squares[randomNumber].innerHTML = 2;
                let cat = add_cat(0);
                cat.style.animation = "fade-in 1s";
                squares[randomNumber].appendChild(cat);
                spaces--;
            } else generate(count + 1);
        } else if(checkForSpace){
            generate(0);
        }
    }

    // Function to move the squares left or right.
    // direction = 1 is right and 0 is left.
    function moveLeftRight(direction) {
        let changed = false;
        for(let i = 0; i < 16; i++) {
            if(i % 4 == 0) {
                let totalOne = squares[i].firstChild.data;
                let totalTwo = squares[i + 1].firstChild.data;
                let totalThree = squares[i + 2].firstChild.data;
                let totalFour = squares[i + 3].firstChild.data;
                let line = [parseInt(totalOne), 
                            parseInt(totalTwo), 
                            parseInt(totalThree),
                            parseInt(totalFour)];

                // Filters the line and puts non-zeros to one side.
                let filteredLine = line.filter(num => num);
                let zeros = Array(4 - filteredLine.length).fill(0);
                let newLine = [];

                if(direction == 1) {
                    newLine = zeros.concat(filteredLine);
                } else if(direction == 0) {
                    newLine = filteredLine.concat(zeros);
                }

                // Check if the state of the board has changed.
                // Used later for adding cats.
                if(!compare(newLine, line))
                    changed = true;

                for(let j = 0; j < 4; j++) {
                    squares[i + j].innerHTML = newLine[j];
                    if(newLine[j] > 0) {
                        let cat = add_cat(Math.log2(newLine[j]) - 1);
                        squares[i + j].appendChild(cat);
                    }
                }
            }
        }

        return changed;
    }

    // Very similar function to moveLeftRight().
    // direction = 2 is up and 3 is down
    // Copied over instead of combined with moveLeftRight()
    // so that direction are clearer during the coding process.
    function moveUpDown(direction) {
        let changed = false;
        for(let i = 0; i < 4; i++) {
            let totalOne = squares[i].firstChild.data;
            let totalTwo = squares[i + width].firstChild.data;
            let totalThree = squares[i + 2*width].firstChild.data;
            let totalFour = squares[i + 3*width].firstChild.data;
            let line = [parseInt(totalOne), 
                        parseInt(totalTwo), 
                        parseInt(totalThree),
                        parseInt(totalFour)];
        
            let filteredLine = line.filter(num => num);
            let missing = 4 - filteredLine.length;
            let zeros = Array(missing).fill(0);
            let newLine = [];

            if(direction == 3) {
                newLine = zeros.concat(filteredLine);
            } else if(direction == 2){
                newLine = filteredLine.concat(zeros);
            }

            if(!compare(newLine, line))
                changed = true;

            for(let j = 0; j < 4; j++) {
                squares[i + j * 4].innerHTML = newLine[j];
                if(newLine[j] > 0) {
                    let cat = add_cat(Math.log2(newLine[j]) - 1);
                    squares[i + j * 4].appendChild(cat);
                }
            }
        }

        return changed;
    }

    // Helper function to check if a row is locked;
    function checkRow() {
        let locked = true;
        for(let i = 0; i < 15; i += 4) {
            for(let j = 0; j < 3; j++) {
                let a = squares[i+j].firstChild.data;
                let b = squares[i+j+1].firstChild.data;
                if(a == b) {
                    locked = false;
                }
            }
        }
        return locked;
    }
    
    // Combines rows where adjacent elements that are the
    // same is combined. Goes from left to right.
    function combineRow(direction) {
        let locked = true;
        for(let i = 0; i < 15; i += 4) {
            for(let j = 0; j < 3; j++) {
                let a = squares[i+j].firstChild.data;
                let b = squares[i+j+1].firstChild.data;
                if(a == b) {
                    locked = false;
                    let combinedTotal = parseInt(a) + parseInt(b);
                    squares[i+j].innerHTML = combinedTotal;
                    squares[i+j+1].innerHTML = 0;
                    score += combinedTotal;
                    scoreDisplay.innerHTML = score;

                    // Reach here if you can :)
                    if(combinedTotal > 2047)
                        return victory();

                    if(combinedTotal > 0)
                        spaces++;
                }
            }
        }

        // Check is both the columns and rows are locked
        // If so the game is over.
        if (spaces < 1 && locked) {
            if(checkColumn()) {
                resultDisplay.innerHTML = 'Oh no, the cats got stuck!';
                playing = false;
                restartButton.style.display = "inline";
            }
        }

        return locked;
    }
    
    // Helper function to check if columns are locked.
    function checkColumn() {
        let locked = true;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 12; j += 4) {
                let a = squares[i+j].firstChild.data;
                let b = squares[i+j+4].firstChild.data;
                if (a == b) {
                    locked = false;
                }
            }
        }
        return locked;
    }

    // Similar to combineRow but from top to down.
    // Separate due to readbility purposes.
    function combineColumn() {
        let locked = true;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 12; j += 4) {
                let a = squares[i+j].firstChild.data;
                let b = squares[i+j+4].firstChild.data;
                if (a == b) {
                    locked = false;
                    let combinedTotal = parseInt(a) + parseInt(b);
                    squares[i+j].innerHTML = combinedTotal;
                    squares[i+j+4].innerHTML = 0;
                    score += combinedTotal;
                    scoreDisplay.innerHTML = score;

                    // :)
                    if(combinedTotal > 2047)
                        return victory();

                    if(combinedTotal > 0)
                        spaces++;
                }
            }
        }

        if (spaces < 1 && locked) {
            if(checkRow()) {
                resultDisplay.innerHTML = 'Oh no, the cats got stuck!';
                playing = false;
                restartButton.style.display = "inline";
            }
        }
        return locked;
    }

    // Code for the keyboard control
    // 39 is left arrow.
    // 37 is right arrow.
    // 40 is down arrow.
    // 38 is up arrow.
    function control(e) {
        kCode = e.keyCode;
        if(playing) {
            if(kCode == 39) {
                keyMoveLeftRight(1);
            } else if(kCode == 37) {
                keyMoveLeftRight(0);
            } else if(kCode == 40) {
                keyMoveUpDown(3);
            } else if(kCode == 38) {
                keyMoveUpDown(2);
            }

            // Play a sound every 5 movements
            playSound %= 5;
            if(playSound >= 4)
                playRandomSound(sounds);
            playSound++;
        }
    }
    document.addEventListener('keyup', control);

    // Movement is a combination of move, combine, move.
    // If no movements are found, do not add a cat.
    function keyMoveLeftRight(direction) {
        const moved = moveLeftRight(direction);
        const locked = combineRow();
        moveLeftRight(direction);

        if(moved || !locked)
            generate(0);
    }

    // Duplicate function of keyMoveLeftRight for reability.
    function keyMoveUpDown(direction) {
        const moved = moveUpDown(direction);
        const locked = combineColumn();
        moveUpDown(direction);

        if(moved || !locked)
            generate(0);
    }

    // Helper function to check forr an empty space in the grid.
    function checkForSpace() {
        let zeros = 0;
        for(let i = 0; i < squares.length; i++) {
          if (parseInt(squares[i].firstChild.data) == 0)
            zeros++;
        }

        if (zeros === 0)
            return false;

        return true;
    }

    // Set up victory screen.
    function victory() {
        playing = false;
        for(let i = 0; i < squares.length; i++) {
            setTimeout(() => {  
                clearAll(squares[i]);
                let cat = add_cat(10);
                cat.style.animation = "pulse 1s";
                squares[i].appendChild(cat);
            }, 200);
        }
        bgm.pause();
        resultDisplay.innerHTML = "You won and got the <b>tiger</b> cat!"
        const vMusic = document.getElementById('victory');
        vMusic.play();
        restartButton.style.display = "inline";
    }
})

// Cat object maker
function Cat(value, source) {
    this.value = value;
    this.source = source;
}

// Get all of the cats and store them in an array.
function createCats() {
    let cats = [];
    for(let i = 1; i < 12; i++) {
        let cat = new Cat(2 ** i, "./cats/cat_" + i + ".png");
        cats.push(cat);
    }
    return cats;
}

// Store all of the cat sounds in an array.
function getCatNoise() {
    const sounds = [
        "a", "b", "c", "d"
    ];

    return sounds;
}

// Play a random cat sound.
function playRandomSound(sounds) {
    var soundFile = sounds[Math.floor(Math.random()*sounds.length)];
    var audio = document.getElementById(soundFile);
    audio.volume = 0.3;
    audio.play();
}

// Clear every child of a DOM node.
function clearAll(node) {
    while(node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

// Compare two arrays of integers.
function compare(a, b) {
    for(let i = 0; i < a.length; a++) {
        if(parseInt(a[i]) != parseInt(b[i])) {
            return false;
        }
    }

    return true;
}