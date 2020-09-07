var dealer = require('./dealer.js');

console.log('start test.js')

function handClass(handScore) {
  return Math.floor(handScore / 1000000) * 1000000;
}

const base = 15;
const red = "\x1b[31m";
const green = "\x1b[32m";
const resetColor = "\x1b[0m";

tests = [
  () => {
    var cardStrs = ['4h', '3s', '2d', '9c', '5h', '6h', '9s'];
    var cards = cardStrs.map(x => dealer.cardStrToN(x));
    var handC = handClass(dealer.scoreBestHand(cards));
    if (handC != dealer.STRAIGHT) {
      return console.log(red, 'Test failed: Did not detect STRAIGHT');
    }
    return console.log(green, 'Test passed for STRAIGHT');
  },
  () => {
    var cardStrs = ['4h', '3s', '2d', '9c', '9h', '6h', '9s'];
    var cards = cardStrs.map(x => dealer.cardStrToN(x));
    var handC = handClass(dealer.scoreBestHand(cards));

    if (handC != dealer.TRIPS) {
      return console.log(red, 'Test failed: Did not detect TRIPS');
    }
    return console.log(green, 'Test passed for TRIPS');
  },
  () => {
    var cardStrs = ['4h', '4s', '2d', '2c', '9h', '6h', 'Ks'];
    var cards = cardStrs.map(x => dealer.cardStrToN(x));
    var handC = handClass(dealer.scoreBestHand(cards));
    if (handC != dealer.TWO_PAIR) {
      return console.log(red, 'Test failed: Did not detect TWO_PAIR');
    }
    return console.log(green, 'Test passed for TWO_PAIR');
  },
  () => {
    var cardStrs = ['4h', '4s', '2h', '2c', '9h', '6h', 'Kh'];
    var cards = cardStrs.map(x => dealer.cardStrToN(x));
    var handC = handClass(dealer.scoreBestHand(cards));
    if (handC != dealer.FLUSH) {
      return console.log(red, 'Test failed: Did not detect FLUSH');
    }
    return console.log(green, 'Test passed for FLUSH');
  },
  () => {
    var cardStrs = ['4h', '6s', '2d', '9c', '9h', '6h', '9s'];
    var cards = cardStrs.map(x => dealer.cardStrToN(x));
    var handC = handClass(dealer.scoreBestHand(cards));

    if (handC != dealer.FULL_HOUSE) {
      return console.log(red, 'Test failed: Did not detect FULL_HOUSE');
    }
    return console.log(green, 'Test passed for FULL_HOUSE');
  },
  () => {
    var score = dealer.TRIPS + 11 * base * base + 7 * base + 3;
    var scoreName = dealer.getScoreName(score, true);
    if (scoreName !== "Trips J 7 3") {
      return console.log(red, "Test failed for scoreName Trips J 7 3: Got " + scoreName);
    }
    return console.log(green, "Test passed: got scoreName Trips J 7 3");
  },
  () => {
    var score = dealer.FOUR_OF_A_KIND + 14 * base + 6;
    var scoreName = dealer.getScoreName(score, true);
    if (scoreName !== "Four of a Kind A 6") {
      return console.log(red, "Test failed for scoreName Four of a Kind A 6: Got " + scoreName);
    }
    return console.log(green, "Test passed: got scoreName Four of a Kind A 6")
  }
]


tests.forEach(test => test());
console.log(resetColor);
console.log('end test');