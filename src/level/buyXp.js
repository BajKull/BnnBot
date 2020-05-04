const { addExperience, getUser, levelUp } = require('../database/userlist.js')
const { prefix } = require('../../config.json')
const { checkIfLvUp } = require('./checkIfLvUp')
const { displayLvUp } = require('./displayLvUp')

const buyXp = (msg) => {
  if(msg.content.toLowerCase().startsWith(`${prefix} xp`)) {
    const u = msg.author
    const amount = parseInt(msg.content.split(' ')[2])
    if(isNaN(amount))
      msg.channel.send(`That's not how you buy xp! Type *bnn xp amount* in order to buy xp. Type *bnn help xp* for more info!`)
    else if(amount <= 0)
      msg.channel.send(`You have to buy at least 1 experience point!`)
    else {
      getUser(u).then(user => {
        if(amount > user.money)
          msg.channel.send(`${u}, you don't have that much money! Your current **balance** is **${user.money}$**`)
        else {
          addExperience(user, amount).then(userNewXp => {
            const check = checkIfLvUp(userNewXp.level, userNewXp.xp)
            if(check)
              levelUp(user, check).then(accepted => {
                displayLvUp(msg, accepted.level)
              }).catch(rejected => {
                msg.channel.send(rejected)
              })
            msg.channel.send(`${u}, you bought ${amount} xp! Type *bnn level* to see your level progress!`)
          }).catch(rejected => {
            msg.channel.send(rejected)
          })
        }
      })
    }
  }
}

module.exports = { buyXp }