
function Die(n) {
    this.green  = '#a5df00';
    this.yellow = '#ffff00';
    this.red    = '#ff0000';
    this.grey   = '#e0e0e0';
    this.states = { CHOOSE_DIE  : 0,
                    CHOOSE_FACE : 1,
                    CHOSEN_ALL  : 2};
    this.state  = this.states.CHOOSE_DIE;
    this.colour = null;
    this.images = ['brain','feet','shot'];
    this.colours = [this.green,this.yellow,this.red];
                    
    this.clickHandler = function(obj,index) {
        return function(button, event) {
            if(obj.state == obj.states.CHOOSE_DIE) {
                colour = obj.colours[index];
                obj.setColour(colour);
                obj.state = obj.states.CHOOSE_FACE;
                console.log('set colour ' + colour);
            }
            else if(obj.state == obj.states.CHOOSE_FACE) {
                obj.state = obj.states.CHOSEN_ALL;
                for(var i = 0; i < 3; i++) {
                    if(i != index) {
                        obj.cells[i].style.backgroundImage = '';
                        obj.cells[i].style.backgroundColor = obj.grey;
                    }
                }
            }
        }
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
        this.cells[i].style.backgroundColor = this.colours[i];
    }
}

function Dice(num) {
    this.num = num;
    this.dice = [];
    for(var i = 0; i < this.num; i++) {
        this.dice.push(new Die(i));
    }
}
