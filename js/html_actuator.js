const LOG2 = Math.log(2);
const S07 = "http://s07.ssc.edu.hk/Pages/DownloadUserHeader.aspx?sno=";
const IGR = "https://i.imgur.com/";
var active = 0;
const SMILEY = "http://upload.wikimedia.org/wikipedia/commons/8/85/Smiley.svg";
var hidden = [];
const MAP_LIST = [["Michael See",
                   S07 + "2009001",
                   S07 + "2009011",
                   S07 + "2009012",
                   IGR + "AQXJY9Y.jpg",
                   S07 + "2009037",
                   S07 + "2009044",
                   S07 + "2009048",
                   S07 + "2009050",
                   S07 + "2009064",
                   S07 + "2009076",
                   S07 + "2009081",
                   S07 + "2009086",
                   S07 + "2009089",
                   S07 + "2009104",
                   S07 + "2009105",
                   S07 + "2009107",
                   S07 + "2008119"],
                  ["Jeffrey Yip",
                   S07 + "2009194",
                   S07 + "2009178",
                   S07 + "2009168",
                   S07 + "2009167",
                   S07 + "2009160",
                   S07 + "2009151",
                   S07 + "2009146",
                   S07 + "2009136",
                   S07 + "2009134",
                   S07 + "2009114",
                   S07 + "2009113",
                   S07 + "2008119",
                   S07 + "2009107",
                   S07 + "2009105",
                   S07 + "2009104",
                   S07 + "2009089"]];
;

function HTMLActuator() {
    this.tileContainer    = document.querySelector(".tile-container");
    this.scoreContainer   = document.querySelector(".score-container");
    this.bestContainer    = document.querySelector(".best-container");
    this.messageContainer = document.querySelector(".game-message");

    this.score = 0;
    this.parent;

    var reverse_button = document.querySelector(".reverse-button");
    reverse_button.addEventListener("click", function() {
	active = (active + 1) % 2;
	this.parent.actuate(true);
    }.bind(this));
    
    var stealth_button = document.querySelector(".stealth-button");
    stealth_button.addEventListener("click", function() {
	if (hidden.length == 0) {
            while (hidden.length < 3) {
		var random = Math.ceil(Math.random()*11);
		if (hidden.indexOf(random) == -1) {
                    hidden.push(random);
		}
            }
	} else {
            hidden = [];
	}
	this.parent.actuate(true);
    }.bind(this));
}

HTMLActuator.prototype.actuate = function (grid, metadata, suppressAnimation) {
    var self = this;

    window.requestAnimationFrame(function () {
        self.clearContainer(self.tileContainer);

        grid.cells.forEach(function (column) {
            column.forEach(function (cell) {
                if (cell) {
                    self.addTile(cell, suppressAnimation);
                }
            });
        });

        self.updateScore(metadata.score);
        self.updateBestScore(metadata.bestScore);

        if (metadata.terminated) {
            if (metadata.over) {
                self.message(false); // You lose
            } else if (metadata.won) {
                self.message(true); // You win!
            }
        }

    });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
    this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};

HTMLActuator.prototype.addTile = function (tile, suppressAnimation) {
    var self = this;

    var wrapper   = document.createElement("div");
    var inner     = document.createElement("div");
    var position  = tile.previousPosition || { x: tile.x, y: tile.y };
    var positionClass = this.positionClass(position);

    inner.classList.add("tile-inner");

    this.setClass(wrapper, inner, positionClass, Math.log(tile.value)/LOG2);
    if (tile.previousPosition && !suppressAnimation) {
        // Make sure that the tile gets rendered in the previous position first
        window.requestAnimationFrame(function () {
            self.setClass(wrapper, inner, self.positionClass({ x: tile.x, y: tile.y }), Math.log(tile.value)/LOG2);
        });
    } else if (tile.mergedFrom && !suppressAnimation) {
        this.setClass(wrapper, inner, positionClass, Math.log(tile.value)/LOG2, "tile-merged");

        // Render the tiles that merged
        tile.mergedFrom.forEach(function (merged) {
            self.addTile(merged);
        });
    } else {
        this.setClass(wrapper, inner, positionClass, Math.log(tile.value)/LOG2, "tile-new");
    }

    // Add the inner part of the tile to the wrapper
    wrapper.appendChild(inner);

    // Put the tile on the board
    this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.setClass = function (wrapper, inner, positionClass, number, extra) {
    if (!extra) extra = "";

    var url = MAP_LIST[active][number];
    if (hidden.indexOf(number) != -1) 
        url = SMILEY;

    wrapper.setAttribute("class", "tile " + positionClass + " " + extra);
    inner.style.backgroundImage = "url('" + url + "')";
    inner.style.backgroundSize = "contain";
    inner.style.backgroundRepeat = "no-repeat";
    inner.style.backgroundPosition = "center";
}

HTMLActuator.prototype.normalizePosition = function (position) {
    return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
    position = this.normalizePosition(position);
    return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
    this.clearContainer(this.scoreContainer);

    var difference = score - this.score;
    this.score = score;

    this.scoreContainer.textContent = this.score;

    if (difference > 0) {
        var addition = document.createElement("div");
        addition.classList.add("score-addition");
        addition.textContent = "+" + difference;

        this.scoreContainer.appendChild(addition);
    }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
    this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
    var type    = won ? "game-won" : "game-over";
    var message = won ? "You win!" : "Game over!";

    this.messageContainer.classList.add(type);
    this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
    // IE only takes one value to remove at a time.
    this.messageContainer.classList.remove("game-won");
    this.messageContainer.classList.remove("game-over");
};

