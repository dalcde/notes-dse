const LOG2 = Math.log(2);
const MAP_LIST = ["Michael See",
		  "2009001",
		  "2009011",
		  "2009012",
		  "2009023",
		  "2009037",
		  "2009044",
		  "2009048",
		  "2009050",
		  "2009064",
		  "2009076",
		  "2009081",
		  "2009086",
		  "2009089",
		  "2009104",
		  "2009105",
		  "2009107",
		  "2008119"];

function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
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

HTMLActuator.prototype.addTile = function (tile) {
    var self = this;

    var wrapper   = document.createElement("div");
    var position  = tile.previousPosition || { x: tile.x, y: tile.y };
    var positionClass = this.positionClass(position);

    this.setClass(wrapper, positionClass, MAP_LIST[Math.log(tile.value)/LOG2]);

    if (tile.previousPosition) {
	// Make sure that the tile gets rendered in the previous position first
	window.requestAnimationFrame(function () {
	    self.setClass(wrapper, self.positionClass({ x: tile.x, y: tile.y }), MAP_LIST[Math.log(tile.value)/LOG2]);
	});
    } else if (tile.mergedFrom) {
	this.setClass(wrapper, positionClass, MAP_LIST[Math.log(tile.value)/LOG2], "tile-merged");
	
	// Render the tiles that merged
	tile.mergedFrom.forEach(function (merged) {
	    self.addTile(merged);
	});
    } else {
	this.setClass(wrapper, positionClass, MAP_LIST[Math.log(tile.value)/LOG2], "tile-new");
    }
    
    // Put the tile on the board
    this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.setClass = function (element, positionClass, number, extra) {
    if (!extra) extra = "";
    element.setAttribute("class", "tile " + positionClass + " " + extra);
    element.style.backgroundImage = "url('http://s07.ssc.edu.hk/Pages/DownloadUserHeader.aspx?sno=" + number + "')";
    element.style.backgroundSize = "contain";
    element.style.backgroundRepeat = "no-repeat";
    element.style.backgroundPosition = "center";
};

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
