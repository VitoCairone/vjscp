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

function rankBestHand(cardsArr) {
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
  var reverseRankHist = new Array(5).fill([])
  rankHist.forEach((val, idx) => {
    reverseRankHist[val].push(idx);
  });
  reverseRankHist = reverseRankHist.map(xs => xs.reverse());
  var suitHistMax = Math.max(...suitHist);
  var hasFlush = (suitHistMax >= 5);
  var rankHistMax = Math.max(...rankHist);

  if (rankHistMax == 4) {
    ret.score = FOUR_OF_A_KIND
  } else {
    var hasTrips = rankHist.includes(3)
    var hasPair = rankHist.includes(2)
    if (hasTrips && hasPair) {
      ret.score = FULL_HOUSE
    } else if (hasTrips) {
      ret.score = TRIPS
    } else if (hasPair) {
      var hasTwoPair = (rankHist.filter(x => x == 2).length >= 2);
      ret.score = hasTwoPair ? TWO_PAIR : PAIR;
    } else {
      ret.score = HIGH_CARD;
    }
  }

  var hasStraight = false;
  var straightLowRank = 0;
  for (var i = 2, consec = 0; i < 15; i++) {
    if (rankHist[i] > 0) {
      consec++;
    } else {
      consec = 0
    }
    if (consec == 5) {
      hasStraight = true;
      straightLowRank = i;
      break;
    }
  }

  if (hasStraight && ret.score < STRAIGHT) {
    ret.score = STRAIGHT;
  }
  if (hasFlush && ret.score < FLUSH) {
    ret.score = FLUSH;
  }

  var sfHighRank = 0;
  if (hasStraight && hasFlush) {
    var flushSuitN = suitHist.findIndex(x => x >= 5)
    var flushCards = cards.filter(x => getSuitN(x) == flushSuitN)
    var hasStraightFlush = false;
    flushCards.sort((a, b) => b - a);
    var prevRank = -1;
    var consec = 0;
    flushCards.forEach(x => {
      var rank = getRankN(x)
      if (prevRank - rank == 1) {
        consec++;
        if (consec == 4) {
          hasStraightFlush = true;
        }
      } else {
        sfHighRank = rank;
        consec = 0;
      }
      prevRank = rank;
    });
    if (hasStraightFlush) {
      ret.score = STRAIGHT_FLUSH;
    }
  }

  // now that the type of hand is set, add on the ranks of cards in the hand
  const base = 15;
  switch (ret.score) {
    case STRAIGHT_FLUSH:
      ret.score += sfHighRank;
      break;
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
    case FLUSH:
      var flushSuitN = suitHist.findIndex(x => x >= 5);
      var flushCards = cards.filter(x => getSuitN(x) == flushSuitN);
      flushCards.length = 5;
      var ranksVal = 0;
      flushCards.forEach(x => ranksVal = ranksVal * base + getRankN(x));
      ret.score += ranksVal;
      break;
    case STRAIGHT:
      ret.score += straightLowRank + 4;
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
      var otherRanks = reverseRankHist[1].slice(4);
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

// need a better way of doing this
exports.STRAIGHT_FLUSH = STRAIGHT_FLUSH;
exports.FOUR_OF_A_KIND = FOUR_OF_A_KIND;
exports.FULL_HOUSE = FULL_HOUSE;
exports.FLUSH = FLUSH;
exports.STRAIGHT = STRAIGHT;
exports.TRIPS = TRIPS;
exports.TWO_PAIR = TWO_PAIR;
exports.PAIR = PAIR;
exports.HIGH_CARD = HIGH_CARD;


exports.deck = deck
exports.shuffleInPlace = shuffleInPlace
exports.makeCardsStr = makeCardsStr
exports.printDeck = printDeck
exports.rankBestHand = rankBestHand
exports.cardStrToN = cardStrToN
exports.getRankN = getRankN
exports.getSuitN = getSuitN