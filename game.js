var dealer = require('./dealer.js');

// setup and run a game with 1 human player and 9 auto players

console.log("Running game.js");

var deck = dealer.deck;
var players = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
var bigBlindSeatN = 0;
var sharedCards = [];
var ante = 50;
var betToMatch = 0;
var shouldAdvancePhase = false;
var phaseIdx = -1;
var gameInterval;

function getSmallBlindSeatN() {
  if (bigBlindSeatN == 0) return 9;
  return bigBlindSeatN - 1;
}

function setupPhase() {
  players.forEach((p, idx) => {
    p.seatN = idx;
    p.chips = 1000;
    p.currentBetThisRound = 0;
    p.betInPot = 0;
    p.isAllIn = false;
  });
}

function betTo(seatN, amount) {
  // console.log(players.map(x => {
  //   return (x.isFolded ? 'F_' : '') + x.currentBetThisRound;
  // }));
  var p = players[seatN];
  if (p.chips > (amount - p.currentBetThisRound)) {
    var betToAdd = amount - p.currentBetThisRound;
    p.chips -= betToAdd;
    p.currentBetThisRound = amount;
  } else {
    var betToAdd = p.chips;
    p.chips = 0;
    p.currentBetThisRound += betToAdd;
    p.isAllIn = true;
    console.log(getPlayerName(p) + " is all-in.");
  }
}

function antePhase() {
  sharedCards.length = 0;
  bigBlindSeatN = (bigBlindSeatN + 1) % 10;
  var bb = bigBlindSeatN;
  var sb = getSmallBlindSeatN();
  dealer.shuffleInPlace(deck);
  players.forEach((p, idx) => {
    p.currentBetThisRound = 0;
    p.holdCards = [deck[idx * 2], deck[idx * 2 + 1]];
  });
  betTo(sb, Math.round(ante / 2, 0));
  console.log("Player " + sb + " antes (small blind).");
  betTo(bb, ante);
  console.log("Player " + bb + " antes.");
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

function actCheck(player) {
  console.log(getPlayerName(player) + " checks.");
}

function actCall(player) {
  console.log(getPlayerName(player) + " calls.");
  betTo(player.seatN, betToMatch);
}

function actFold(player) {
  player.isFolded = true;
  console.log(getPlayerName(player) + " folds.");
}

function actRaise(player) {
  var verb = betToMatch > 0 ? "raises" : "bets";
  var name = getPlayerName(player);
  var requiredAdd = betToMatch - player.currentBetThisRound;
  var surplus = player.chips - requiredAdd;
  if (Math.random() > 0.99) {
    raiseAmount = surplus;
  } else {
    raiseAmount = Math.floor(Math.random() * surplus);
  }
  betToMatch += raiseAmount;
  var sentence1 = name + " " + verb + " " + raiseAmount + " chips."
  var sentence2 = "Bet is now " + betToMatch + " chips."
  console.log(sentence1 + " " + sentence2);
  betTo(player.seatN, betToMatch);
}

function decisionRound() {
  var firstN = (bigBlindSeatN + 1) % 10;
  for (var i = firstN, count = 0; count < 10; i = (i + 1) % 10, count++) {
    var player = players[i];
    if (player.isAllIn || player.isFolded) continue;
    if (betToMatch === 0 || player.currentBetThisRound === betToMatch) {
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
    return x.isAllIn || x.isFolded || x.currentBetThisRound === betToMatch;
  });
}

function collectPots() {
  players.forEach(p => {
    p.betInPot += p.currentBetThisRound;
    p.currentBetThisRound = 0;
  });
}

function betRound(isAnteRound = false) {
  if (isAnteRound) {
    players.forEach(x => x.isFolded = false);
    betToMatch = ante;
  } else {
    players.forEach(x => x.currentBetThisRound = 0);
    betToMatch = 0;
  }
  decisionRound();
  while (betToMatch !== 0 && !allPlayersCalled()) {
    decisionRound();
  }
  collectPots();
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

function findWinners(eligibles) {
  var maxScore = 0;
  eligibles.forEach(x => {
    // TODO: move this so every hand is scored just once for any
    // number of side-pots
    x.score = dealer.scoreBestHand(x.holdCards.concat(sharedCards));
    if (x.score > maxScore) maxScore = x.score;
  });
  return eligibles.filter(x => x.score === maxScore);
}

function awardWithSidePots() {
  var betsToPlayers = {};
  players.filter(p => !p.isFolded).forEach(x => {
    betsToPlayers[x.betInPot] = betsToPlayers[x.betInPot] || {};
    betsToPlayers[x.betInPot].push(x);
  });
  var potBets = Object.keys(betsToPlayers);
  potBets.sort((a, b) => a - b);
  
  var sidePotBetSum = 0; // rename this - what is already taken out, per player
  var eligibles = [];
  var mainPotIdx = potBets.length - 1;
  potBets.forEach((potBet, idx) => {
    var pot = 0;
    var thisBet = potBet - sidePotBetSum;
    eligibles.length = 0;
    players.forEach(p => {
      if (p.betInPot < thisBet) {
        if (!p.isFolded) {
          console.log("ERROR: player is not folded but does not meet bet");
        }
        pot += p.betInPot;
        p.betInPot = 0;
      } else if (p.betInPot === thisBet) {
        if (p.isAllIn || (!p.isFolded && idx === mainPotIdx)) {
          eligibles.push(p);
        } else if (!p.isFolded && idx !== mainPotIdx) {
          console.log("ERROR: player is not folded but does not meet bet");
        }
        pot += p.betInPot;
        p.betInPot = 0;
      } else {
        pot += thisBet;
        p.betInPot -= thisBet;
        if (!p.isFolded) {
          eligibles.push(p);
        }
      }
    });
    sidePotBetSum += thisBet;

    var winners = findWinners(eligibles);
    awardToWinners(winners, pot, idx + 1)
  });
}

function awardToWinners(winners, pot, sidePotIdx = 0) {
  let award = pot / winners.length;
  if (sidePotIdx) {
    console.log("(Side Pot #" + sidePotIdx + ")");
  }
  winners.forEach(x => {
    let name = getPlayerName(x);
    let scoreName = dealer.getScoreName(x.score, true);
    console.log(name + " wins " + award + " chips with " + scoreName);
    x.chips += award;
  });
}

function awardWithoutSidePots() {
  var eligibles = players.filter(x => !x.isFolded);
  var winners = findWinners(eligibles);
  var pot = players.reduce((sum, p) => sum + p.betInPot, 0);
  players.forEach(p => p.betInPot = 0);
  awardToWinners(winners, pot);
}

function showdown() {
  if (players.some(x => x.isAllIn)) return awardWithSidePots();
  return awardWithoutSidePots();
}

function endGame() {
  console.log("Game ended.");
  clearInterval(gameInterval);
}

var phases = [
  setupPhase,
  antePhase,
  betRound.bind(null, true),
  flopPhaseStart,
  betRound,
  turnPhaseStart,
  betRound,
  riverPhaseStart,
  betRound,
  showdown,
  endGame
]

shouldAdvancePhase = true;
gameInterval = setInterval(() => {
  if (shouldAdvancePhase) {
    shouldAdvancePhase = false;
    phaseIdx++;
    if (phaseIdx == phases.length) {
      // setupPhase runs only once, restart at antePhase
      phaseIdx = 1;
    }
    phases[phaseIdx]();
    shouldAdvancePhase = true;
  }
}, 200);