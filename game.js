var dealer = require('./index.js');

// setup and run a game with 1 human player and 9 auto players

console.log("Running game.js");

var deck = dealer.deck;
var players = new Array(10).fill({})
var bigBlindSeatN = 0;
var sharedCards = [];

function getBigBlindSeatN() {
  return bigBlindSeatN;
}

function getSmallBlindSeatN() {
  if (bigBlindSeatN = 0) return 9;
  return bigBlindSeatN - 1;
}

function setupPhase() {
  players.forEach((p, idx) => {
    p.seatN = idx;
    p.chips = 1000;
    p.currentBet = 0;
  })
}

function antePhase() {
  sharedCards.length = 0;
  bigBlindSeatN = (bigBlindSeatN + 1) % 10;
  dealer.shuffleInPlace(deck);
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

// no actions yet
setupPhase()
setTimeout(antePhase, 2000)
setTimeout(flopPhaseStart, 4000)
setTimeout(turnPhaseStart, 6000)
setTimeout(riverPhaseStart, 8000)