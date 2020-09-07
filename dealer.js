// TODO: move all of this into an object or function in order to namespace
// properly, then export the object
// instead of all the vars/functions separately

console.log('start index.js')

var deck = [];

for (var i = 0; i < 52; i++) {
  deck.push(i);
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function getRankN(card) {
  return Math.floor(card / 4) + 2;
}

function getSuitN(card) {
  return card%4;
}

const rankChArr = ['_', '_', '2', '3', '4', '5', '6', '7', '8',
'9', 'T', 'J', 'Q', 'K', 'A'];

const suitChArr = ['s', 'h', 'd', 'c'];

function rankCh(rankN) {
  return rankChArr[rankN];
}

function suitCh(suitN) {
  return suitChArr[suitN];
}

function makeCardsStr(cards) {
  cardStrs = cards.map(x => rankCh(getRankN(x)) + suitCh(getSuitN(x)))
  return cardStrs.join(", ") 
}

function printDeck() {
  console.log(makeCardsStr(deck))
}

function cardStrToN(cardStr) {
  var rankN = rankChArr.indexOf(cardStr[0])
  var suitN = suitChArr.indexOf(cardStr[1])
  return (rankN - 2) * 4 + suitN
}

const STRAIGHT_FLUSH = 9000000
const FOUR_OF_A_KIND = 8000000
const FULL_HOUSE     = 7000000
const FLUSH          = 6000000
const STRAIGHT       = 5000000
const TRIPS          = 4000000
const TWO_PAIR       = 3000000
const PAIR           = 2000000
const HIGH_CARD      = 1000000

function scoreFlushHand(flushCards) {
  var count = flushCards.length;

  var hasStraightFlush = false;
  var sfRank = 0;
  for (var i = 0; i + 4 < count; i++) {
    if (getRankN(flushCards[i]) - 4 === getRankN(flushCards[i + 4])) {
      hasStraightFlush = true;
      sfRank = getRankN(flushCards[i]);
      break;
    }
  }
  if (!hasStraightFlush && getRankN(flushCards[0]) === 14
  && getRankN(flushCards[count - 4] === 5)) {
    hasStraightFlush = true;
    sfRank = 5;
  }

  if (hasStraightFlush) {
    return STRAIGHT_FLUSH + sfRank;
  } else {
    const base = 15;
    flushCards.length = 5;
    var ranksVal = 0;
    flushCards.forEach(x => ranksVal = ranksVal * base + getRankN(x));
    return FLUSH + ranksVal;
  }
}

function scoreBestHand(cardsArr) {
  // work on a copy so we can sort it without modifying the input
  cards = cardsArr.slice().sort((a, b) => b - a)

  var ret = {
    score: 0,
    useCards: []
  }

  var suitHist = [0, 0, 0, 0]
  var rankHist = new Array(15).fill(0)
  cards.forEach(x => {
    rankHist[getRankN(x)]++;
    suitHist[getSuitN(x)]++;
  })

  // a 7-card hand cannot contain both a Flush
  // and a Full House or Four of a Kind, so if there is a Flush,
  // we need only check for a Straight Flush.
  if (Math.max(...suitHist) >= 5) {
    var flushSuitN = suitHist.findIndex(x => x >= 5);
    return scoreFlushHand(cards.filter(x => getSuitN(x) === flushSuitN));
  }

  var reverseRankHist = [[], [], [], [], []];
  rankHist.forEach((val, idx) => {
    if (val != 0) reverseRankHist[val].push(idx);
  });
  reverseRankHist = reverseRankHist.map(xs => xs.reverse());

  // cards are in descending rank order, because we sorted them at the top.
  // Example cards: [Kd 9d 9h 9s 7c 4c 2c]
  // rankHist: [0, 0, 1, 0, 1, 0, 0, 1, 0, 3, 0, 0, 0, 1, 0]
  // reverseRankHist: [[], [13, 7, 4, 2], [], [9], []]

  var rankHistMax = Math.max(...rankHist);
  if (rankHistMax == 4) {
    ret.score = FOUR_OF_A_KIND;
  } else {
    var hasTrips = reverseRankHist[3].length > 0;
    var hasPair = reverseRankHist[2].length > 0;
    if (hasTrips && (hasPair || reverseRankHist[3].length > 1)) {
      ret.score = FULL_HOUSE
    } else if (hasTrips) {
      ret.score = TRIPS
    } else if (hasPair) {
      var hasTwoPair = reverseRankHist[2].length > 1;
      ret.score = hasTwoPair ? TWO_PAIR : PAIR;
    } else {
      ret.score = HIGH_CARD;
    }
  }

  var straightRank = 0;
  // this loop goes over 13 items for a 7-hard cand;
  // it works, but there's probably a faster way to do this...
  for (var i = 2, consec = 0; i < 15; i++) {
    if (rankHist[i] > 0) {
      consec++;
    } else {
      consec = 0
    }
    if (consec == 5) {
      ret.score = STRAIGHT;
      straightRank = i;
    }
  }

  // now that the type of hand is set, add on the ranks of cards in the hand
  const base = 15;
  switch (ret.score) {
    case FOUR_OF_A_KIND:
      var highVal = reverseRankHist[4][0];
      var kicker = cards.find(dealer.getRankN(card) != highVal);
      ret.score += base * highVal + kicker;
      break;
    case FULL_HOUSE:
      var highVal = reverseRankHist[3][0];
      var secondTripsVal = 0;
      var kicker = 0;
      if (reverseRankHist[3].length > 1) {
        secondTripsVal = reverseRankHist[3][1];
      }
      if (reverseRankHist[2].length >= 1) {
        kicker = reverseRankHist[2][0];
      }
      kicker = Math.max(kicker, secondTripsVal);
      ret.score += base * highVal + kicker;
      break;
    case STRAIGHT:
      ret.score += straightRank;
      break;
    case TRIPS:
      var highVal = reverseRankHist[3][0];
      var kicker1 = reverseRankHist[1][0];
      var kicker2 = reverseRankHist[1][1];
      ret.score += base * base * highVal + base * kicker1 + kicker2;
      break;
    case TWO_PAIR:
      var highVal = reverseRankHist[2][0];
      var kicker1 = reverseRankHist[2][1];
      var kicker2 = 0;
      if (reverseRankHist[2].length > 2) {
        kicker2 = reverseRankHist[2][2];
      }
      kicker2 = Math.max(kicker2, reverseRankHist[1][0]);
      ret.score += base * base * highVal + base * kicker1 + kicker2;
      break;
    case PAIR:
      var highVal = reverseRankHist[2][0];
      var otherRanks = reverseRankHist[1].slice(3);
      var ranksVal = highVal;
      otherRanks.forEach(x => ranksVal = ranksVal * base + x);
      ret.score += ranksVal;
    case HIGH_CARD:
      var highRanks = reverseRankHist[1].slice(5);
      var ranksVal = 0;
      highRanks.forEach(x => ranksVal = ranksVal * base + x);
      ret.score += ranksVal;
  }

  return ret.score
}

function getScoreName(score, doShowRanks = false) {
  let classVal = Math.floor(score / 1000000);
  const classStrs = [
    "",
    "High Card",
    "Pair",
    "Two Pair",
    "Trips",
    "Straight",
    "Flush",
    "Full House",
    "Four of a Kind",
    "Straight Flush"
  ]
  let ret = classStrs[classVal];

  if (!doShowRanks && classVal != 1) return ret;

  const base = 15;
  const base2 = base * base;
  const base3 = base * base * base;
  const base4 = base * base * base * base;
  var ranksStr = "";
  var thisRankN = 0;
  var rem = score - classVal * 1000000;

  [base4, base3, base2, base, 0].forEach(baseX => {
    if (rem > baseX) {
      thisRankN = baseX ? Math.floor(rem / baseX) : rem;
      ranksStr += " " + rankCh(thisRankN);
      rem -= thisRankN * baseX;
    }
  });

  return ret + ranksStr;
}

// TODO: move everything into one object or function, so we don't
// need to export all the things individually
exports.STRAIGHT_FLUSH = STRAIGHT_FLUSH;
exports.FOUR_OF_A_KIND = FOUR_OF_A_KIND;
exports.FULL_HOUSE = FULL_HOUSE;
exports.FLUSH = FLUSH;
exports.STRAIGHT = STRAIGHT;
exports.TRIPS = TRIPS;
exports.TWO_PAIR = TWO_PAIR;
exports.PAIR = PAIR;
exports.HIGH_CARD = HIGH_CARD;

exports.deck = deck;
exports.shuffleInPlace = shuffleInPlace;
exports.makeCardsStr = makeCardsStr;
exports.printDeck = printDeck;
exports.scoreBestHand = scoreBestHand;
exports.cardStrToN = cardStrToN;
exports.getRankN = getRankN;
exports.getSuitN = getSuitN;
exports.getScoreName = getScoreName;