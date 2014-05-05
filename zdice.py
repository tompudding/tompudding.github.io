import math
from operator import mul

class InvalidInput(Exception):
    pass

def nChoosek(n,k):
    total = 1
    for i in xrange(k):
        total *= (n-i)
    total /= math.factorial(k)
    return total

class Tube(object):
    def __init__(self,green=6,yellow=4,red=3):
        self.green  = green
        self.yellow = yellow
        self.red    = red

    def total_ways(self):
        return nChoosek(self.green + self.yellow + self.red,3)

    def Print(self):
        print 'tube has g:r:y of %d:%d:%d left' % (self.green,self.yellow,self.red)
        
    def Remove(self,die):
        if die == RedDie:
            self.red -= 1
        elif die == GreenDie:
            self.green -= 1
        elif die == YellowDie:
            self.yellow -= 1
        if any(colour < 0 for colour in (self.red,self.green,self.yellow)):
            raise InvalidInput('Rolled dice that weren\'t there')

    def IsEmpty(self):
        return self.red + self.green + self.yellow < 3

class Face(object):
    brains = 0
    feet = 1
    shot = 2

class DieProbabilities(object):
    num_sides = 6.0
    def __init__(self):
        self.face = Face.brains

    def Increment(self):
        self.face += 1
        if self.face > Face.shot:
            self.face = Face.brains
            return True
        return False

    def prob(self):
        return float((self.brains,self.feet,self.shots)[self.face])/self.num_sides

class GreenDie(DieProbabilities):
    brains = 3
    feet   = 2
    shots  = 1

class YellowDie(DieProbabilities):
    brains = 2
    feet   = 2
    shots  = 2

class RedDie(DieProbabilities):
    brains = 1
    feet   = 2
    shots  = 3

def get_shot_chance(r,y,g,num_shot):
    dice = []
    for i in xrange(r):
        dice.append(RedDie())
    for i in xrange(y):
        dice.append(YellowDie())
    for i in xrange(g):
        dice.append(GreenDie())

    total_match = 0
    while True:
        shot_count = sum(1 if die.face == Face.shot else 0 for die in dice)
        if shot_count >= num_shot:
            total_match += reduce(mul, [die.prob() for die in dice], 1)
            
        for die in dice:
            if not die.Increment():
                break
        else:
            break
    return total_match

def get_expected_brains(r,y,g):
    t = 0
    for n,die in zip( (r,y,g),(RedDie,YellowDie,GreenDie) ):
        t += n*die.brains/die.num_sides
    return t

def Parse(input):
    out = []
    if len(input) != 2:
        raise InvalidInput('malformed result')
    try:
        out.append((RedDie,YellowDie,GreenDie)['ryg'.index(input[0])])
    except ValueError:
        raise InvalidInput('invalid die name')
    try:
        out.append((Face.brains,Face.feet,Face.shot)['bfs'.index(input[1])])
    except ValueError:
        raise InvalidInput('invalid face')
    return out

def ParseInput(input):
    out = [Parse(item) for item in input.strip().split()]
    if len(out) != 3:
        raise InvalidInput('incorrect number of dice')
    return out

def get_chances(tube,fail_shots):
    fail_total = 0
    total_brains = 0
    for r in 0,1,2,3:
        if tube.red < r:
            continue
        red_ways = nChoosek(tube.red,r)
        for y in 0,1,2,3:
            if tube.yellow < y:
                continue
            yellow_ways = nChoosek(tube.yellow,y)
            for g in 0,1,2,3:
                if tube.green < g:
                    continue
                if r + g + y != 3:
                    #extremely inefficient, but the correct way with combinations-with-replacements is a headache
                    #Not a big deal for only 3 types of dice
                    continue
                green_ways = nChoosek(tube.green,g)
                p_dice = float(green_ways*yellow_ways*red_ways)/tube.total_ways()
                p_fail = get_shot_chance(r,y,g,fail_shots)
                expected_brains = get_expected_brains(r,y,g)
                print g,y,r,p_fail,p_dice
                fail_total += p_fail*p_dice
                total_brains += expected_brains*p_dice
                #print r,y,g,p_dice,p_fail,p_dice*p_fail
    return fail_total,total_brains

def process_next_roll(in_tube,score_brains,score_shots,in_last_feet):
    tube = Tube(in_tube.green,in_tube.yellow,in_tube.red)
    last_feet = in_last_feet[::]
    print 'Enter roll:'
    rolls = ParseInput(raw_input())

    for die,result in rolls:
        if die in last_feet:
            del last_feet[last_feet.index(die)]
        else:
            tube.Remove(die)
        if result == Face.brains:
            score_brains += 1
        elif result == Face.shot:
            score_shots += 1
    if last_feet:
        raise InvalidInput('Didn\'t reroll all the feet')
    last_feet = [die for die,result in rolls if result == Face.feet]
    return tube,score_brains,score_shots,last_feet
        

tube = Tube()

score_brains = 0
score_shots  = 0
last_feet = []

while True:
    print 
    print '*'*80
    tube.Print()
    print 'Brains : %d , Shots : %d, Rerolling : %d' % (score_brains, score_shots, len(last_feet))
    print '*'*80
    print
    fail_shots = 3-score_shots

    p,expected_brains = get_chances(tube,fail_shots)

    print 'Probability of getting %d or more shots if %f, expected brains (%f-%f=%f)' %(fail_shots,p,expected_brains,p*score_brains,expected_brains-p*score_brains)
    expected_brains -= p*score_brains
    print 'Recommended action: %s!!!' % ('ROLL' if expected_brains > 0 else 'STAY')
    while True:
        try:
            results = process_next_roll(tube,score_brains,score_shots,last_feet)
            tube,score_brains,score_shots,last_feet = results
        except InvalidInput as e:
            print 'Invalid input : %s' % e
            continue
        
        break

    if tube.IsEmpty():
        #refill the tube if the dice have ran out
        tube = Tube()

    if score_shots >= 3:
        print 'You Lose!'
        break

    if score_brains >= 13:
        print 'Winning Condition met!!'
