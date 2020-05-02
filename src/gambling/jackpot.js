const { prefix } = require('../../config.json')
const { getUser, addBalance } = require('../database/userlist.js')
const { activeGamblers, isGambling, alreadyGamblingMsg } = require('./activeGamblers.js')

const jackpot = (msg) => {
  if(msg.content.startsWith(`${prefix} jackpot`)) {
    const user = msg.author
    const amount = parseInt(msg.content.split(' ')[2])
    const gambler = isGambling(user)
    if(gambler && gambler.game !== 'jackpot')
      msg.channel.send(alreadyGamblingMsg(gambler))
    else {
      new Promise((accepted, rejected) => {
        if(isNaN(amount))
          rejected(`${user}, that's not how you enter a jackpot! Type *bnn jackpot amount* to join! More info under bnn help jackpot.`)
        else if(amount <= 0)
          rejected(`${user}, you have to enter with at least 1$`)
        else {
          getUser(user).then(gambler => {
            if(gambler.money < amount)
              rejected(`${user}, you don't have that much money! Your balance is **${gambler.money}$**`)
            else {
              addBalance(user, amount * -1).then(() => {
                const jackpotPlayers = activeGamblers.filter(gambler => gambler.game === 'jackpot')
                if(jackpotPlayers.length === 0) {
                  const player = {
                    id: user.id,
                    game: 'jackpot',
                    currentStake: amount
                  }
                  activeGamblers.push(player)
                  accepted([`You created a new jackpot! Tell others to join you by typing *bnn jackpot amount*! Remember, there's only one winner that takes all the money in the jackpot! There's **${amount}$ in the jackpot** in total!`, true])
                }
                else {
                  const sum = jackpotPlayers.reduce((acc, p) => { return acc + p.currentStake }, 0) + amount
                  const alreadyPlayer = jackpotPlayers.find(el => el.id === user.id)
                  if(alreadyPlayer) {
                    const index = activeGamblers.indexOf(alreadyPlayer)
                    const contribution = activeGamblers[index].currentStake + amount
                    activeGamblers[index].currentStake = contribution
                    accepted([`You throw in additional ${amount}$. Your contribution to the jackpot: ${contribution}$. There's **${sum}$ in the jackpot** in total!`, false])
                  }
                  else {
                    const player = {
                      id: user.id,
                      game: 'jackpot',
                      currentStake: amount
                    }
                    activeGamblers.push(player)
                    accepted([`You join the jackpot with ${amount}$ There's **${sum}$ in the jackpot** in total!`, false])
                  }
                }
    
              }).catch(error => rejected(error))
            }
          })
        }
      }).then(accepted => {
        msg.channel.send(accepted[0])
        if(accepted[1]) {
          new Promise((accepted, rejected) => {
            setTimeout(() => {
              const jackpotPlayers = activeGamblers.filter(gambler => gambler.game === 'jackpot')
              const entries = jackpotPlayers.reduce((acc, p) => { return acc + p.currentStake }, 0)
              const winningTicket = Math.floor(Math.random() * entries) + 1
              let currentTicket = 0
              let winner = null
              for(const player of jackpotPlayers) {
                if(winner === null)
                  currentTicket += player.currentStake
                if(currentTicket >= winningTicket) {
                  winner = player
                  currentTicket = 0
                  addBalance(player, entries).catch(error => rejected(error))
                }
                activeGamblers.splice(activeGamblers.indexOf(player), 1)
              }
              const winningUser = msg.client.users.resolve(winner.id)
              accepted(`Jackpot ended! The winner is ${winningUser}! Money in the pool: **${entries}$**`)
            }, 30000)
          }).then(accepted => {
            msg.channel.send(accepted)
          }).catch(rejected => {
            msg.channel.send(rejected)
          })
        }
      }).catch(rejected => {
        msg.channel.send(rejected)
      })
    }
  }
}

module.exports = { jackpot }