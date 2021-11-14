document.addEventListener('DOMContentLoaded', () =>  {
    const gridDisplay = document.querySelector('.grid');
    const scoreDisplay = document.getElementById('score');
    const resultDisplay = document.getElementById('result');
    const restartButton = document.getElementById('restart');
    const bgm = document.getElementById("bgm");

    restartButton.onclick = function() {createBoard()};

    const cats = createCats();
    const sounds = getCatNoise();
    const temp = resultDisplay.innerHTML;
    const width = 4;

    let squares = [];
    let score = 0;
    let playing = true;
    let spaces = 16;

    function createBoard() {
        bgm.play();
        clearAll(gridDisplay);
        restartButton.style.display = "none";
        resultDisplay.innerHTML = temp;
        playing = true;
        squares.length = 0;
        spaces = 16;
        score = 0;
        for(let i = 0; i < width * width; i++) {
            let square = document.createElement('div');
            square.innerHTML = 0;
            gridDisplay.appendChild(square);
            squares.push(square);
        }
        generate(0); generate(0);
    }

    createBoard();

    function add_cat(value) {
        var img = document.createElement("img");
        img.src = cats[value].source;
        img.style.width = 60 + "px";
        return img;
    }

    function generate(count) {
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

    function moveLeftRight(direction) {
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
                let filteredLine = line.filter(num => num);
                let zeros = Array(4 - filteredLine.length).fill(0);
                let newLine = [];

                if(direction == 1) {
                    newLine = zeros.concat(filteredLine);
                } else if(direction == 0) {
                    newLine = filteredLine.concat(zeros);
                }

                for(let j = 0; j < 4; j++) {
                    squares[i + j].innerHTML = newLine[j];
                    if(newLine[j] > 0) {
                        let cat = add_cat(Math.log2(newLine[j]) - 1);
                        squares[i + j].appendChild(cat);
                    }
                }
            }
        }
    }

    function moveUpDown(direction) {
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

            for(let j = 0; j < 4; j++) {
                squares[i + j * 4].innerHTML = newLine[j];
                if(newLine[j] > 0) {
                    let cat = add_cat(Math.log2(newLine[j]) - 1);
                    squares[i + j * 4].appendChild(cat);
                }
            }
        }
    }
    
    function combineRow(direction) {
        for(let i = 0; i < 15; i += 4) {
            for(let j = 0; j < 3; j++) {
                let a = squares[i+j].firstChild.data;
                let b = squares[i+j+1].firstChild.data;
                if(a == b) {
                    let combinedTotal = parseInt(a) + parseInt(b);
                    squares[i+j].innerHTML = combinedTotal;
                    squares[i+j+1].innerHTML = 0;
                    score += combinedTotal;
                    scoreDisplay.innerHTML = score;
                    if(combinedTotal > 0)
                        spaces++;
                }
            }
        }

        if (spaces < 1) {
            resultDisplay.innerHTML = 'Oh no, the cats got stuck!';
            playing = false;
            restartButton.style.display = "inline";
        }
    }
    
    function combineColumn() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 12; j += 4) {
                let a = squares[i+j].firstChild.data;
                let b = squares[i+j+4].firstChild.data;
                if (a == b) {
                    let combinedTotal = parseInt(a) + parseInt(b);
                    squares[i+j].innerHTML = combinedTotal;
                    squares[i+j+4].innerHTML = 0;
                    score += combinedTotal;
                    scoreDisplay.innerHTML = score;
                    if(combinedTotal > 0)
                        spaces++;
                }
            }
        }

        if (spaces < 1) {
            resultDisplay.innerHTML = 'Oh no, the cats got stuck!';
            playing = false;
            restartButton.style.display = "inline";
        }
    }

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
            playRandomSound(sounds);
        }
    }
    document.addEventListener('keyup', control);

    function keyMoveLeftRight(direction) {
        moveLeftRight(direction);
        combineRow();
        moveLeftRight(direction);
        generate(0);
    }

    function keyMoveUpDown(direction) {
        moveUpDown(direction);
        combineColumn();
        moveUpDown(direction);
        generate(0);
    }

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
})

function Cat(value, source) {
    this.value = value;
    this.source = source;
}

function createCats() {
    let cats = [];
    for(let i = 1; i < 12; i++) {
        let cat = new Cat(2 ** i, "./cats/cat_" + i + ".png");
        cats.push(cat);
    }
    return cats;
}

function getCatNoise() {
    const sounds = [
        "a", "b", "c", "d"
    ];

    return sounds;
}

function playRandomSound(sounds) {
    var soundFile = sounds[Math.floor(Math.random()*sounds.length)];
    var audio = document.getElementById(soundFile);
    audio.volume = 0.3;
    audio.play();
}

function clearAll(node) {
    while(node.firstChild) {
        node.removeChild(node.firstChild);
    }
}