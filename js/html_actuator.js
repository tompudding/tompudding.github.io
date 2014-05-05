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

        if (metadata.over) {
            self.message(false,metadata.fail,metadata.brains); // You lose
        } else if (metadata.chosen) {
            self.message(true,metadata.fail,metadata.brains); // You win!
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
    var inner     = document.createElement("div");
    var position  = tile.previousPosition || { x: tile.x, y: tile.y };
    var positionClass = this.positionClass(position);

    // We can't use classlist because it somehow glitches when replacing classes
    var classes = ["tile", "tile-" + tile.value, positionClass];

    if (tile.value > 2048) classes.push("tile-super");

    this.applyClasses(wrapper, classes);

    inner.classList.add("tile-inner");
    inner.textContent = tile.value;

    if (tile.previousPosition) {
        // Make sure that the tile gets rendered in the previous position first
        window.requestAnimationFrame(function () {
            classes[2] = self.positionClass({ x: tile.x, y: tile.y });
            self.applyClasses(wrapper, classes); // Update the position
        });
    } else if (tile.mergedFrom) {
        classes.push("tile-merged");
        this.applyClasses(wrapper, classes);

        // Render the tiles that merged
        tile.mergedFrom.forEach(function (merged) {
            self.addTile(merged);
        });
    } else {
        classes.push("tile-new");
        this.applyClasses(wrapper, classes);
    }

    // Add the inner part of the tile to the wrapper
    wrapper.appendChild(inner);

    // Put the tile on the board
    this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
    element.setAttribute("class", classes.join(" "));
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

HTMLActuator.prototype.message = function (won,fail,brains) {
    var type    = won ? "game-won-continue" : "game-over";
    var message = won ? "You win!" : "Game over!";
    var tag = this.messageContainer.getElementsByTagName("p");

    
    if(won) {
        var action = "STOP";
        if(brains >= 0) {
            action = "PLAY ON";
            this.messageContainer.classList.add('game-won-continue');
        }
        else {
            this.messageContainer.classList.add('game-won-stop');
        }
        tag[0].textContent = "Bust chance : " + (fail*100).toFixed(2) + "%";
        tag[1].textContent = "Expected Brains : " + brains.toFixed(2);
        tag[2].textContent = "Recommended action : " + action;
    }
    else {
        this.messageContainer.classList.add(type);
        tag[0].textContent = "You Bust!";
        tag[1].textContent = "";
        tag[2].textContent = "";
    }
};

HTMLActuator.prototype.clearMessage = function () {
    // IE only takes one value to remove at a time.
    this.messageContainer.classList.remove("game-won-continue");
    this.messageContainer.classList.remove("game-won-stop");
    this.messageContainer.classList.remove("game-over");
};
