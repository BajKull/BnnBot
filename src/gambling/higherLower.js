const { prefix } = require('../../config.json')
const { getUser, addBalance } = require('../database/userlist.js')
const { activeGamblers, isGambling, alreadyGamblingMsg } = require('./activeGamblers.js')

const higherLower = (msg) => {
  if(msg.content.toLowerCase().startsWith(`${prefix} highlow`)) {
    const user = msg.author
    const amount = parseInt(msg.content.split(' ')[2])
    const gambler = isGambling(user)
    if(gambler)
      msg.channel.send(alreadyGamblingMsg(gambler))
    else {
      new Promise((accepted, rejected) => {
        if(isNaN(amount))
          rejected('That\'s not how you play! To start the game type *bnn highlow amount*, for example *bnn highlow 15*')
        else if(amount < 4)
          rejected('You have to play with at least 4$')
        else {
          getUser(user).then(gambler => {
            if(gambler.money < amount)
              rejected(`${user}, you idiot... you can\'t take loans! You only have ${gambler.money}$, go and earn some or lower your stakes!`)
            else {
              const player = {
                id: user.id,
                game: 'highlow',
                startingAmount: amount,
                currentStake: 0,
                number: Math.floor(Math.random() * 100)
              }
              activeGamblers.push(player)
              accepted(`Okay ${user}, let\'s give you a number. Hmm... It\'ll be **${player.number}** this time. Will the next number be **higher** or **lower**, what do you think? Type **higher**, **lower** to continue the game or **finish** to take your money. Current stake: **${player.currentStake}$**`)
            }
          }).catch(error => {
            rejected(error)
          })
        }
      }).then(accepted => {
        msg.channel.send(accepted)
      }).catch(rejected => {
        msg.channel.send(rejected)
      })
    }
  }
}

const continueHigherLower = (msg) => {
  const user = msg.author
  const gambler = isGambling(user)
  if(gambler && gambler.game === 'highlow') {
    const action = msg.content.toLowerCase()
    const index = activeGamblers.indexOf(gambler)
    const newNumber = Math.floor(Math.random() * 100)
    const currentNumber = gambler.number
    const currentStake = gambler.currentStake
    const startingAmount = gambler.startingAmount
  
    const prize = () => {
      if(currentStake === 0) 
        activeGamblers[index].currentStake += Math.floor(startingAmount / 2)
      else if(currentStake === Math.floor(startingAmount / 2))
        activeGamblers[index].currentStake = startingAmount
      else
        activeGamblers[index].currentStake += startingAmount
    }
  
    if(action === 'higher') {
      if(newNumber >= currentNumber) {
        prize()
        activeGamblers[index].number = newNumber
        msg.channel.send(`Good job! I rolled **${newNumber}**. Type **higher**, **lower** to continue the game or **finish** to take your money. Current stake: **${activeGamblers[index].currentStake}$**`)
      }
      else {
        addBalance(user, startingAmount * -1)
        activeGamblers.splice(index, 1)
        msg.channel.send(`Hihi, you lost! I rolled **${newNumber}**. Good luck next time!`)
      }
    }
    else if(action === 'lower') {
      if(newNumber <= currentNumber) {
        prize()      
        activeGamblers[index].number = newNumber
        msg.channel.send(`Good job! I rolled **${newNumber}**. Type **higher**, **lower** to continue the game or **finish** to take your money. Current stake: **${activeGamblers[index].currentStake}$**`)
      }
      else {
        addBalance(user, startingAmount * -1)
        activeGamblers.splice(index, 1)
        msg.channel.send(`Hihi, you lost! I rolled **${newNumber}**. Good luck next time!`)
      }
    }
    else if(action === 'finish') {
      addBalance(user, currentStake - startingAmount)
      activeGamblers.splice(index, 1)
      msg.channel.send(`Game finished! You leave with ${currentStake}$. Type *bnn balance* to see your new balance!`)
    }
  }
}

module.exports = { higherLower, continueHigherLower }