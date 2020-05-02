const { fight, fightAction, displayClassStats } = require('./src/fight/fighting.js')
const { showHelp, showInfo, top10Money } = require('./src/help/help.js')
const { updateUser } = require('./src/database/userlist.js')
const { getImage } = require('./src/utility/images.js')
const { animalList } = require('./src/utility/animals.js')
const { rollDice } = require('./src/utility/random.js')
const { vote, poll } = require('./src/poll/vote.js')
const { showBalance, collectMoney, donate } = require('./src/gambling/money.js')
const { coinFlip } = require('./src/gambling/coinFlip')
const { jackpot } = require('./src/gambling/jackpot')
const { heist } = require('./src/gambling/heist')
const { higherLower, continueHigherLower } = require('./src/gambling/higherLower')
const { getRedditImage } = require('./src/utility/reddit.js')

const functions = [
  fight,
  fightAction,
  displayClassStats,
  showHelp,
  showInfo,
  top10Money,
  updateUser,
  getImage,
  animalList,
  rollDice,
  vote,
  poll,
  showBalance,
  collectMoney,
  donate,
  coinFlip,
  jackpot,
  heist,
  higherLower,
  continueHigherLower,
  getRedditImage,
]

module.exports = { functions }