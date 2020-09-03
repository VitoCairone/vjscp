var dealer = require('./index.js');

console.log('start test.js')

tests = [
  () => {
    var cardStrs = ['4h', '3s', '2d', '9c', '5h', '6h', '9s']
    var cards = cardStrs.map(x => dealer.cardStrToN(x))
    var handR = dealer.rankBestHand(cards)
    if (handR != dealer.STRAIGHT) {
      return console.log('Test failed: Did not detect STRAIGHT')
    }
    return console.log('Test passed for STRAIGHT')
  },
  () => {
    var cardStrs = ['4h', '3s', '2d', '9c', '9h', '6h', '9s']
    var cards = cardStrs.map(x => dealer.cardStrToN(x))
    var handR = dealer.rankBestHand(cards)

    if (handR != dealer.TRIPS) {
      return console.log('Test failed: Did not detect TRIPS')
    }
    return console.log('Test passed for TRIPS')
  },
  () => {
    var cardStrs = ['4h', '4s', '2d', '2c', '9h', '6h', 'Ks']
    var cards = cardStrs.map(x => dealer.cardStrToN(x))
    var handR = dealer.rankBestHand(cards)
    if (handR != dealer.TWO_PAIR) {
      return console.log('Test failed: Did not detect TWO_PAIR')
    }
    return console.log('Test passed for TWO_PAIR')
  },
  () => {
    var cardStrs = ['4h', '4s', '2h', '2c', '9h', '6h', 'Kh']
    var cards = cardStrs.map(x => dealer.cardStrToN(x))
    var handR = dealer.rankBestHand(cards)
    if (handR != dealer.FLUSH) {
      return console.log('Test failed: Did not detect FLUSH')
    }
    return console.log('Test passed for FLUSH')
  },
  () => {
    var cardStrs = ['4h', '6s', '2d', '9c', '9h', '6h', '9s']
    var cards = cardStrs.map(x => dealer.cardStrToN(x))
    var handR = dealer.rankBestHand(cards)

    if (handR != dealer.FULL_HOUSE) {
      return console.log('Test failed: Did not detect FULL_HOUSE')
    }
    return console.log('Test passed for FULL_HOUSE')
  },
]

tests.forEach(test => test())

console.log('end test')