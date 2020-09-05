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

function rankBestHand(cards) {
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
  var suitHistMax = Math.max(...suitHist);
  var hasFlush = (suitHistMax >= 5);
  var rankHistMax = Math.max(...rankHist);

  // FUTURE: consider building reverse histograms here
  // for possible better performance

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
  for (var i = 2, consec = 0; i < 15; i++) {
    if (rankHist[i] > 0) {
      consec++;
    } else {
      consec = 0
    }
    if (consec == 5) {
      hasStraight = true;
      break;
    }
  }

  if (hasStraight && ret.score < STRAIGHT) {
    ret.score = STRAIGHT;
  }
  if (hasFlush && ret.score < FLUSH) {
    ret.score = FLUSH;
  }

  if (hasStraight && hasFlush) {
    var flushSuitN = suitHist.findIndex(x => x >= 5)
    var flushCards = cards.filter(x => getSuitN(x) == flushSuitN)
    var hasStraightFlush = false;
    flushCards.sort((a, b) => a - b);
    var prevRank = -1;
    var consec = 0;
    flushCards.forEach(x => {
      var rank = getRankN(x)
      if (rank - prevRank == 1) {
        consec++;
        if (consec == 4) {
          hasStraightFlush = true;
        }
      } else {
        consec = 0;
      }
      prevRank = rank;
    });
    if (hasStraightFlush) {
      ret.score = STRAIGHT_FLUSH;
    }
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