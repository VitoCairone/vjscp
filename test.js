var index = require('./index.js');

console.log('start test')

index.shuffleInPlace(index.deck)
index.printDeck()

tests = [
  () => {
    var cardStrs = ['4h', '3s', '2d', '9c', '5h', '6h', '9s']
    var cards = cardStrs.map(x => index.cardStrToN(x))
    var handR = index.rankBestHand(cards)
    console.log("handR = ", handR)
    if (handR != index.STRAIGHT) {
      return console.log('Test failed: Did not detect STRAIGHT')
    }
    return console.log('Test passed for STRAIGHT')
  },
  () => {
    var cardStrs = ['4h', '3s', '2d', '9c', '9h', '6h', '9s']
    var cards = cardStrs.map(x => index.cardStrToN(x))
    var handR = index.rankBestHand(cards)
    console.log("handR = ", handR);
    if (handR != index.TRIPS) {
      return console.log('Test failed: Did not detect TRIPS')
    }
    return console.log('Test passed for TRIPS')
  },
]

tests.forEach(test => test())

console.log('end test')