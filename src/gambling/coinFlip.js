const { prefix } = require('../../config.json')
const { getUser, addBalance } = require('../database/userlist.js')
const { isGambling, alreadyGamblingMsg } = require('./activeGamblers.js')

const coinFlip = (msg) => {
  if(msg.content.startsWith(`${prefix} flip`)) {
    const user = msg.author
    const side = msg.content.split(' ')[2]
    const amount = parseInt(msg.content.split(' ')[3])
  
    const gambler = isGambling(user)
    if(gambler)
      msg.channel.send(alreadyGamblingMsg(gambler))
    else {
      new Promise((accepted, rejected) => {
        if(side !== 'heads' || side !== 'tails') {
          if(isNaN(amount))
            rejected(`${user}, that's not how you flip! Type bnn flip *side* *amount* to play, for example bnn flip heads 10.`)
          else if(amount <= 0)
            rejected(`${user}, you bastard, bet some money on it! Type bnn flip *side* *amount* to play, for example bnn flip heads 10.`)
          else {
            getUser(user).then(gambler => {
              if(gambler.money < amount)
                rejected(`${user} ,you don't have enough money in your account! Go collect some cans! Your current balance is **${gambler.money}$**`)
              else {
                const number = Math.floor(Math.random() * 2)
                const roll = number === 0 ? 'tails' : 'heads'
                if(side === roll) {
                  addBalance(user, amount).then(balance => {
                    accepted(`${user}, I flipped **${roll}**, you won! Your new balance is ${balance}$`)
                  }).catch(error => {
                    rejected(error)
                  })
                }
                else {
                  addBalance(user, amount * -1).then(balance => {
                    accepted(`${user}, I flipped **${roll}**, you lost! Your new balance is ${balance}$`)
                  }).catch(error => {
                    rejected(error)
                  })
                }
              }
            }).catch(error => {
              rejected(error)
            })
          }
        }
        else
          rejected(`${user}, that's not how you flip! Type bnn flip *side* *amount* to play, for example bnn flip heads 10.`)
      }).then(accepted => {
        msg.channel.send(accepted)
      }).catch(rejected => {
        msg.channel.send(rejected)
      })
    }
  }
}

module.exports = { coinFlip }