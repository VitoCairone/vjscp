var dealer = require('./dealer.js');

// setup and run a game with 1 human player and 9 auto players

console.log("Running game.js");

var deck = dealer.deck;
var players = new Array(10).fill({})
var bigBlindSeatN = 0;
var sharedCards = [];
var ante = 50;
var betToMatch = 0;
var shouldAdvancePhase = false;
var phaseIdx = 0;
var shouldQuit = false;
var pot = 0;

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
  });
  shouldAdvancePhase = true;
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
  sharedCards.length = 0;
  bigBlindSeatN = (bigBlindSeatN + 1) % 10;
  var bb = bigBlindSeatN;
  var sb = getSmallBlindSeatN();
  dealer.shuffleInPlace(deck);
  players.forEach((p, idx) => {
    p.currentBet = 0;
    p.holdCards = [deck[idx * 2], deck[idx * 2 + 1]];
  })
  betTo(bb, ante)
  console.log("Player " + bb + " antes.")
  betTo(sb, Math.round(ante / 2, 0))
  console.log("Player " + sb + " antes (small blind).")
  shouldAdvancePhase = true;
}

function flopPhaseStart() {
  sharedCards.push(deck[47]);
  sharedCards.push(deck[48]);
  sharedCards.push(deck[49]);
  sharedCardsStr = dealer.makeCardsStr(sharedCards);
  console.log("Shared cards at Flop: ", sharedCardsStr);
  shouldAdvancePhase = true;
}

function turnPhaseStart() {
  sharedCards.push(deck[50]);
  sharedCardsStr = dealer.makeCardsStr(sharedCards);
  console.log("Shared cards at Turn: ", sharedCardsStr);
  shouldAdvancePhase = true;
}

function riverPhaseStart() {
  sharedCards.push(deck[51]);
  sharedCardsStr = dealer.makeCardsStr(sharedCards);
  console.log("Shared cards at River: ", sharedCardsStr);
  shouldAdvancePhase = true;
}

function actCheck(player) {
  console.log(getPlayerName(player) + " checks.");
}

function actCall(player) {
  betTo(player.seatN, betToMatch);
  console.log(getPlayerName(player) + " calls.");
}

function actFold(player) {
  player.isFolded = true;
  console.log(getPlayerName(player) + " folds.");
}

function actRaise(player) {
  var verb = betToMatch > 0 ? "raises" : "bets";
  var name = getPlayerName(player);
  if (Math.random() > 0.99) {
    amount = player.chips;
  } else {
    amount = Math.floor(Math.random() * player.chips);
  } 
  betToMatch += amount;
  betTo(player.seatN, betToMatch);
  var sentence1 = name + " " + verb + " " + amount + " chips."
  var sentence2 = "Bet is now " + betToMatch + " chips."
  console.log(sentence1 + " " + sentence2);
}

function decisionRound() {
  var firstN = (bigBlindSeatN + 1) % 10;
  for (var i = firstN, count = 0; count < 10; i = (i + 1) % 10, count++) {
    var player = players[i];
    if (player.isAllIn || player.isFolded) continue;
    if (betToMatch === 0 || player.currentBet === betToMatch) {
      if (Math.random() < 0.8) {
        actCheck(player);
      } else {
        actRaise(player);
      }
    } else {
      if (Math.random() < 0.5) {
        actCall(player);
      } else if (Math.random() < 0.5) {
        actFold(player);
      } else {
        actRaise(player);
      }
    }
  }
}

function allPlayersCalled() {
  return players.every(x => {
    return x.isAllIn || x.isFolded || x.currentBet === betToMatch;
  });
}

function betRound(isAnteRound = false) {
  if (isAnteRound) {
    players.forEach(x => x.isFolded = false);
    betToMatch = ante;
  } else {
    players.forEach(x => x.currentBet = 0);
    betToMatch = 0;
  }
  decisionRound();
  while (betToMatch !== 0 && !allPlayersCalled()) {
    decisionRound();
  }
  shouldAdvancePhase = true;
}

function conjunct(items) {
  if (items.length < 2) {
    return items;
  } else if (items.length === 2) {
    return items[0] + " and " + items[1];
  }
  var len = items.length;
  return items.slice(len - 1).join(", ") + " and " + items[len - 1];
}

function getPlayerName(player) {
  return "Player " + player.seatN;
}

function showdown() {
  contestants = players.filter(x => !x.isFolded);
  maxScore = 0;
  winners = [];
  contestants.forEach(x => {
    x.score = dealer.scoreBestHand(x.holdCards.concat(sharedCards));
    if (x.score > maxScore) maxScore = x.score;
  });
  winners = contestens.filter(x => x.score === maxScore);
  // TODO: handle side pots correctly
  let award = pot / winners.length;
  winners.forEach(x => {
    let name = getPlayerName(x);
    let scoreName = dealer.getScoreName(x.score);
    console.log(name + " wins " + award + " chips with " + scoreName);
    x.chips += award;
  });
}

var phases = [
  setupPhase,
  antePhase,
  betRound.bind(true),
  flopPhaseStart,
  betRound,
  turnPhaseStart,
  betRound,
  riverPhaseStart,
  betRound,
  showdown
]

shouldAdvancePhase = true;
setInterval(() => {
  if (shouldAdvancePhase) {
    shouldAdvancePhase = false;
    phaseIdx++;
    if (phaseIdx == phases.length) {
      // setupPhase runs only once, restart at antePhase
      phaseIdx = 1;
    }
    phases[phaseIdx]();
  }
}, 200)