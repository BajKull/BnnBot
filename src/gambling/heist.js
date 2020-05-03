const { prefix } = require('../../config.json')
const { getUser, addBalance } = require('../database/userlist.js')
const { activeGamblers, isGambling, alreadyGamblingMsg } = require('./activeGamblers.js')

const heist = (msg) => {
  if(msg.content.toLowerCase().startsWith(`${prefix} heist`)) {
    const user = msg.author
    const amount = parseInt(msg.content.split(' ')[2])
  
    const gambler = isGambling(user)
    if(gambler)
      msg.channel.send(alreadyGamblingMsg(gambler))
    else {
      new Promise((accepted, rejected) => {
        if(isNaN(amount) || amount <= 0)
          rejected(`You need to commit with some of your money! Type *bnn help heist* for more info.`)
        else {
          getUser(user).then(gambler => {
            if(gambler.money < amount)
              rejected(`You don\'t have that much money! Your current **balance: ${gambler.money}$**`)
            else {
              const creator = activeGamblers.find(gambler => gambler.game === 'heist') ? false : true
              const player = {
                id: user.id,
                game: 'heist',
                startingAmount: amount,
              }
              activeGamblers.push(player)
              if(creator)
                accepted([`Okay you're in! You attempt a heist investing **${amount}$** in it. Tell others to help you by typing *bnn heist amount* ! Be carefull, if you attempt a heist alone, the police is always going to catch you, and you'll loose your money!`, creator])
              else
                accepted([`Okay you're in! You help in a heist investing **${amount}$** in it. Tell others to help you by typing *bnn heist amount* !`, creator])
            }
          })
        }
      }).then(accepted => {
        msg.channel.send(accepted[0])
        if(accepted[1]) {
          new Promise((accepted, rejected) => {
            setTimeout(() => {
              const players = activeGamblers.filter(gambler => gambler.game === 'heist')
              if(players.length === 1) {
                addBalance(players[0], players[0].startingAmount * -1).then(balance => {
                  accepted(`I told you not to attempt a heist alone! You stole the money but the police caught you without much effort. You **lost** your money. Your new **balance** is **${balance}$**`)
                }).catch(error => {
                  rejected(error)
                })
                activeGamblers.splice(activeGamblers.indexOf(players[0]), 1) 
              }
              else {
                const outcome = Math.floor(Math.random() * 100 + 1)
                let prize = 0
                if(outcome > 95)
                  prize = 5
                else if(outcome > 85)
                  prize = 3
                else if(outcome > 55)
                  prize = 2
                for(let i = 0; i < players.length; i++) {
                  addBalance(players[i], players[i].startingAmount * prize - players[i].startingAmount).catch(error => rejected(error))
                  activeGamblers.splice(activeGamblers.indexOf(players[i]), 1) 
                }
                
                if(prize === 0)
                  accepted(`You find a suitable place for a robbery, you pull out your guns and rob it. Wait what's that?! It's the sound of the police! You try to run but they're too fast. Everyone that attempted this heist **looses** their **money** invested in this heist.`)
                else if(prize === 2)
                  accepted(`You find a suitable place for a robbery, you pull out your guns and rob it. Wait what's that?! It's the sound of the police! You run like you've never run before. You got out, nice! Unfortunetaly you lost most of the money while escaping, however seems like everyone **doubled** their **money** invested in this heist.`)
                else if(prize === 3)
                  accepted(`You find a suitable place for a robbery, you pull out your guns and rob it. Wait what's that?! It's the sound of the police! You run like you've never run before. You got out, nice! Unfortunetaly you lost some of the money while escaping, however seems like everyone **tripled** their **money** invested in this heist.`)
                else if(prize === 5)
                  accepted(`You find a suitable place for a robbery, you pull out your guns and rob it. Wait what's that?! It's the sound of the police! You run like you've never run before. You got out, nice! Seems like you held your bags tight, no money lost!. Everyone **quintupled** their **money** invested in this heist. *(quintuple = x5)*`)
              }
            }, 30000)
          }).then(accepted => {
            msg.channel.send(accepted)
          }).catch(rejected => {
            for(let i = 0; i < players.length; i++)
              activeGamblers.splice(activeGamblers.indexOf(players[i]), 1)
            msg.channel.send(rejected)
          })
        }
    
      }).catch(rejected => {
        msg.channel.send(rejected)
      })
    }
  }
}

module.exports = { heist }