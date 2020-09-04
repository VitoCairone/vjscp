var dealer = require('./index.js');

// setup and run a game with 1 human player and 9 auto players

console.log("Running game.js");

var deck = dealer.deck;
var players = new Array(10).fill({})
var bigBlindSeatN = 0;
var sharedCards = [];
var ante = 50;
var betToMatch = 0;

function getSmallBlindSeatN() {
  if (bigBlindSeatN == 0) return 9;
  return bigBlindSeatN - 1;
}

function setupPhase() {
  players.forEach((p, idx) => {
    p.seatN = idx;
    p.chips = 1000;
    p.currentBet = 0;
    p.isAllIn = false;
  })
}

function betTo(seatN, amount) {
  var p = players[seatN];
  if ((p.chips - p.currentBet) > amount) {
    var betToAdd = amount - p.currentBet;
    p.chips -= betToAdd;
    p.currentBet = amount;
  } else {
    var betToAdd = p.chips;
    p.chips = 0;
    p.currentBet += betToAdd;
    p.isAllIn = true;
  }
}

function antePhase() {
  betToMatch = ante
  sharedCards.length = 0;
  bigBlindSeatN = (bigBlindSeatN + 1) % 10;
  var bb = bigBlindSeatN;
  var sb = getSmallBlindSeatN();
  dealer.shuffleInPlace(deck);
  betTo(bb, ante)
  console.log("Player " + bb + " antes.")
  betTo(sb, Math.round(ante / 2, 0))
  console.log("Player " + sb + " antes (small blind).")
  players.forEach((p, idx) => {
    p.holdCards = [deck[idx * 2], deck[idx * 2 + 1]]
  })
}

function flopPhaseStart() {
  sharedCards.push(deck[47]);
  sharedCards.push(deck[48]);
  sharedCards.push(deck[49]);
  sharedCardsStr = dealer.makeCardsStr(sharedCards);
  console.log("Shared cards at Flop: ", sharedCardsStr);
}

function turnPhaseStart() {
  sharedCards.push(deck[50]);
  sharedCardsStr = dealer.makeCardsStr(sharedCards);
  console.log("Shared cards at Turn: ", sharedCardsStr);
}

function riverPhaseStart() {
  sharedCards.push(deck[51]);
  sharedCardsStr = dealer.makeCardsStr(sharedCards);
  console.log("Shared cards at River: ", sharedCardsStr);
}

function betRound(isAnteRound = false) {
  var firstN = (bigBlindSeatN + 1) % 10
  var firstChoice = true;
  for (var i = firstN; firstChoice || i != firstN; i = (i + 1) % 10) {
    firstChoice = false;

    // need decision-making logic here
    
    console.log("NYI: first round choice for player " + i)
  }
}

// no actions yet
setupPhase()
setTimeout(antePhase, 2000)
setTimeout(betRound.bind(true), 2200)
setTimeout(flopPhaseStart, 4000)
setTimeout(betRound, 4200)
setTimeout(turnPhaseStart, 6000)
setTimeout(betRound, 6200)
setTimeout(riverPhaseStart, 8000)
setTimeout(betRound, 8200)