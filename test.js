var dealer = require('./dealer.js');

console.log('start test.js')

function handClass(handScore) {
  return Math.floor(handScore / 1000000) * 1000000;
}

tests = [
  () => {
    var cardStrs = ['4h', '3s', '2d', '9c', '5h', '6h', '9s'];
    var cards = cardStrs.map(x => dealer.cardStrToN(x));
    var handC = handClass(dealer.rankBestHand(cards));
    if (handC != dealer.STRAIGHT) {
      return console.log('Test failed: Did not detect STRAIGHT');
    }
    return console.log('Test passed for STRAIGHT');
  },
  () => {
    var cardStrs = ['4h', '3s', '2d', '9c', '9h', '6h', '9s'];
    var cards = cardStrs.map(x => dealer.cardStrToN(x));
    var handC = handClass(dealer.rankBestHand(cards));

    if (handC != dealer.TRIPS) {
      return console.log('Test failed: Did not detect TRIPS');
    }
    return console.log('Test passed for TRIPS');
  },
  () => {
    var cardStrs = ['4h', '4s', '2d', '2c', '9h', '6h', 'Ks'];
    var cards = cardStrs.map(x => dealer.cardStrToN(x));
    var handC = handClass(dealer.rankBestHand(cards));
    if (handC != dealer.TWO_PAIR) {
      return console.log('Test failed: Did not detect TWO_PAIR');
    }
    return console.log('Test passed for TWO_PAIR');
  },
  () => {
    var cardStrs = ['4h', '4s', '2h', '2c', '9h', '6h', 'Kh'];
    var cards = cardStrs.map(x => dealer.cardStrToN(x));
    var handC = handClass(dealer.rankBestHand(cards));
    if (handC != dealer.FLUSH) {
      return console.log('Test failed: Did not detect FLUSH');
    }
    return console.log('Test passed for FLUSH');
  },
  () => {
    var cardStrs = ['4h', '6s', '2d', '9c', '9h', '6h', '9s'];
    var cards = cardStrs.map(x => dealer.cardStrToN(x));
    var handC = handClass(dealer.rankBestHand(cards));

    if (handC != dealer.FULL_HOUSE) {
      return console.log('Test failed: Did not detect FULL_HOUSE');
    }
    return console.log('Test passed for FULL_HOUSE');
  },
]

tests.forEach(test => test());

console.log('end test');