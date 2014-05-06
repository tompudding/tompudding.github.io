
function Die(parent,n) {
    this.green  = '#a5df00';
    this.yellow = '#ffff00';
    this.red    = '#ff0000';
    this.grey   = '#e0e0e0';
    this.parent = parent;
    this.states = { CHOOSE_DIE  : 0,
                    CHOOSE_FACE : 1,
                    CHOSEN_ALL  : 2};
    this.state  = this.states.CHOOSE_DIE;
    this.colour = null;
    this.images = ['brain','feet','shot'];
    this.colours = [this.green,this.yellow,this.red];
    this.die_index = n;
    this.face = null;
    this.reroll = false;
                    
    this.clickHandler = function(obj,index) {
        return function(button, event) {
            if(obj.state == obj.states.CHOOSE_DIE) {
                if(obj.parent.tube.getColour(index) <= 0) {
                    return;
                }
                colour = obj.colours[index];
                obj.setColour(colour);
                obj.state = obj.states.CHOOSE_FACE;
                obj.parent.colourChosen(obj.colour,obj.reroll);
            }
            else if(obj.state == obj.states.CHOOSE_FACE) {
                obj.state = obj.states.CHOSEN_ALL;
                obj.face = index;
                for(var i = 0; i < 3; i++) {
                    if(i != index) {
                        obj.cells[i].style.backgroundImage = '';
                        obj.cells[i].style.backgroundColor = obj.grey;
                    }
                }
                obj.parent.DieChosen(obj.die_index,obj.colour,index);
            }
        }
    }

    this.reRoll = function() {
        if(this.state != this.states.CHOSEN_ALL) {
            return;
        }
        this.state = this.states.CHOOSE_FACE;
        this.setColour(this.colour);
        this.face = null;
        this.reroll = true;
    }

    this.setColour = function(colour) {
        this.colour = colour;
        for(var i=0;i<this.cells.length;i++) {
            this.cells[i].style.backgroundColor = this.colour;
            this.cells[i].style.backgroundImage = 'url(images/' + this.images[i] + '.png)';
            this.cells[i].style.backgroundSize = '100%';
        }
    }
    
    elements = document.getElementsByClassName('grid-cell');

    this.cells = [];
    for(var i=n;i<elements.length;i+=3) {
        this.cells.push(elements.item(i));
    }

    for(var i=0;i<3;i++) {
        this.cells[i].onclick = this.clickHandler(this,i);
        this.cells[i].addEventListener('touchstart',this.clickHandler(this,i));
    }
    
    this.updateColours = function() {
        if(this.state != this.states.CHOOSE_DIE) {
            return;
        }
        for(var i=0;i<3;i++) {
            this.cells[i].style.backgroundImage = '';
            if(this.parent.tube.getColour(i) > 0) {
                this.cells[i].style.backgroundColor = this.colours[i];
            }
            else {
                this.cells[i].style.backgroundColor = this.grey;
            }
        }
    }
    this.updateColours();
}

var fact_f = [];
function factorial (n) {
  if (n == 0 || n == 1)
    return 1;
  if (fact_f[n] > 0)
    return fact_f[n];
  return fact_f[n] = factorial(n-1) * n;
} 

function nChoosek(n,k) {
    var total = 1;
    for(var i = 0; i < k; i++) {
        total *= (n-i);
    }
    total /= factorial(k);
    return total;
}

function Tube(green, yellow, red) {
    this.green  = green;
    this.yellow = yellow;
    this.red    = red;
    
    this.green_element  = document.getElementsByClassName('tube-green-container')[0];
    this.yellow_element = document.getElementsByClassName('tube-yellow-container')[0];
    this.red_element    = document.getElementsByClassName('tube-red-container')[0];

    this.total_ways = function(num_chosen) {
        return nChoosek(this.green + this.yellow + this.red,3-num_chosen);
    }

    this.remove = function(die) {
        if(die == 0) {
            this.setGreen(this.green-1);
        }
        if(die == 1) {
            this.setYellow(this.yellow-1);
        }
        if(die == 2) {
            this.setRed(this.red-1);
        }
    }

    this.setGreen = function(value) {
        this.green = value;
        this.green_element.innerHTML = this.green;
    }
    this.setYellow = function(value) {
        this.yellow = value;
        this.yellow_element.innerHTML = this.yellow;
    }
    this.setRed = function(value) {
        this.red = value;
        this.red_element.innerHTML = this.red;
    }

    this.getColour = function(i) {
        if(0 == i) {
            return this.green;
        }
        if(1 == i) {
            return this.yellow;
        }
        if(2 == i) {
            return this.red;
        }
    }

    this.isEmpty = function() {
        if (this.red + this.green + this.yellow < 3) {
            return true;
        }
        return false;
    }

    this.setGreen(this.green);
    this.setYellow(this.yellow);
    this.setRed(this.red);
}

var Face = {
    BRAINS : 0,
    FEET : 1,
    SHOT : 2
};

function DieProbabilities(brains,feet,shots) {
    this.face = Face.BRAINS;
    this.num_sides = 6.0;
    this.brains = brains;
    this.feet = feet;
    this.shots = shots;

    this.increment = function() {
        this.face += 1;
        if(this.face > Face.SHOT) {
            this.face = Face.BRAINS;
            return true;
        }
        return false;
    }
    
    this.prob = function() {
        return [this.brains,this.feet,this.shots][this.face]/this.num_sides;
    }
}

function GreenDie() {
    return new DieProbabilities(3,2,1);
}

function YellowDie() {
    return new DieProbabilities(2,2,2);
}

function RedDie() {
    return new DieProbabilities(1,2,3);
}

function getShotChance(r,y,g,num_shot) {
    var dice = [];
    for(var i=0;i<r;i++) {
        dice.push(RedDie());
    }
    for(var i=0;i<y;i++) {
        dice.push(YellowDie());
    }
    for(var i=0;i<g;i++) {
        dice.push(GreenDie());
    }

    var total_match = 0;
    var done = false;
    while(done == false) {
        var shot_count = 0;
        for(var i=0;i<dice.length;i++) {
            if(dice[i].face == Face.SHOT) {
                shot_count += 1;
            }
        }
        if(shot_count >= num_shot) {
            var prob = 1.0;
            for(var i=0;i<dice.length;i++) {
                prob *= dice[i].prob();
            }
            total_match += prob;
        }
        done = true;
        for(var i=0;i<dice.length;i++) {
            if(dice[i].increment() == false) {
                done = false;
                break;
            }
        }
    }
    return total_match;
}

function getExpectedBrains(r,y,g) {
    var t = 0;
    for(var i=0;i<3;i++) {
        var n = [r,y,g][i];
        //[1,2,3] is the number of brains in a red,yellow,green dice
        var die = [1,2,3][i];
        t += n*(die/6.0);
    }
    return t;
}

function getChances(tube,fail_shots,g_rerolls,y_rerolls,r_rerolls) {
    var fail_total = 0;
    var total_brains = 0;
    for(var r=0;r<4;r++) {
        if(tube.red < r) {
            continue;
        }
        var red_ways = nChoosek(tube.red,r);
        for(var y=0;y<4;y++) {
            if(tube.yellow < y) {
                continue;
            }
            var yellow_ways = nChoosek(tube.yellow,y)
            for(var g=0;g<4;g++) {
                if(tube.green < g) {
                    continue;
                }
                if(r + g + y + r_rerolls + y_rerolls + g_rerolls != 3) {
                    //extremely inefficient, but the correct way with combinations-with-replacements is a headache
                    //Not a big deal for only 3 types of dice
                    continue;
                }
                console.log((r + g + y) + " " + (r_rerolls + y_rerolls + g_rerolls))
                var green_ways = nChoosek(tube.green,g);
                var p_dice = (green_ways*yellow_ways*red_ways)/tube.total_ways(r_rerolls + y_rerolls + g_rerolls)
                var p_fail = getShotChance(r+r_rerolls,y+y_rerolls,g+g_rerolls,fail_shots);
                var expected_brains = getExpectedBrains(r+r_rerolls,y+y_rerolls,g+g_rerolls);
                fail_total += p_fail*p_dice;
                total_brains += expected_brains*p_dice;
            }
        }
    }
    return {fail : fail_total, brains : total_brains};
}

function Scores(brains,shots) {
    this.brains = brains;
    this.shots = shots;

    this.brains_element = document.getElementsByClassName('score-container')[0];
    this.shots_element = document.getElementsByClassName('best-container')[0];

    this.adjustBrains = function(value) {
        this.brains += value;
        this.brains_element.innerHTML = this.brains;
    }

    this.adjustShots = function(value) {
        this.shots += value;
        this.shots_element.innerHTML = this.shots;
    }

    this.adjustShots(0);
    this.adjustBrains(0);
}

function Dice(parent,num) {
    this.num = num;
    this.parent = parent;
    this.tube = new Tube(6,4,3);
    this.scores = new Scores(0,0);
    this.dice = [];

    this.nextRoll = function() {
        //reset the dice status, but keep the tube count
        var new_dice = [];
        this.chosen_map = 0;
        for(var i = 0; i < this.num; i++) {
            if(i < this.dice.length && this.dice[i].face == Face.FEET) {
                new_dice.push(this.dice[i]);
                this.dice[i].reRoll();
            }
            else {
                new_dice.push(new Die(this,i));
            }
        }
        this.dice = new_dice;
        
    }
    this.nextRoll();
    
    //hack
    this.colours = this.dice[0].colours;

    this.colourChosen = function(colour,reroll) {
        if(reroll == false) {
            var colour_index = this.colours.indexOf(colour);
            this.tube.remove(colour_index);
            for(var i=0;i<this.dice.length;i++) {
                this.dice[i].updateColours();
            }
        }
    }
    
    this.DieChosen = function(die_index,colour,face) {
        this.chosen_map |= (1<<die_index);
        if(face == Face.BRAINS) {
            this.scores.adjustBrains(1);
        }
        else if(face == Face.SHOT) {
            this.scores.adjustShots(1);
        }
        
        if(this.chosen_map == 7) {
            var g_rerolls = 0;
            var y_rerolls = 0;
            var r_rerolls = 0;
            for(var i=0;i<this.dice.length;i++) {
                if(this.dice[i].face == Face.FEET) {
                    if(this.dice[i].colour == this.dice[i].green) {
                        g_rerolls += 1;
                    }
                    else if(this.dice[i].colour == this.dice[i].yellow) {
                        y_rerolls += 1;
                    }
                    else if(this.dice[i].colour == this.dice[i].red) {
                        r_rerolls += 1;
                    }
                }
            }
            var results = getChances(this.tube,3-this.scores.shots,g_rerolls,y_rerolls,r_rerolls);
            var brain_diff = results.brains - results.fail*this.scores.brains;
            if(this.scores.shots >= 3) {
                this.parent.DiceChosen(true,0,0);
            }
            else {
                this.parent.DiceChosen(false,results.fail,brain_diff);
            }

            if(this.tube.isEmpty()) {
                this.tube = new Tube(6,4,3);
            }
        }
        else {
            if(this.scores.shots >= 3) {
                this.parent.DiceChosen(true,0,0);
            }
        }

    }   
}
