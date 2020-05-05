const { activeFights } = require('./activeFights.js')
const { afterFightUpdate, addExperience } = require('../database/userlist.js')

const finishFight = (fightIndex, playerIndex, winner, room) => {
  const opPlayerIndex = (playerIndex === 0) ? 1 : 0
  const fighter1 = activeFights[fightIndex][playerIndex]
  const fighter2 = activeFights[fightIndex][opPlayerIndex]

  clearTimeout(activeFights[fightIndex][2].timer)
  clearTimeout(activeFights[fightIndex][2].battleTimer)
  activeFights.splice(fightIndex, 1)

  const prize = Math.floor(Math.random() * 30)
  const xp = Math.floor(Math.random() * 50) * fighter1.level

  afterFightUpdate(fighter1.id, fighter2.id, prize).then((winstreak) => {
    room.send(`Fight finished! ${winner} won with ${fighter1.stats.health} health left! He is on a **${winstreak} winstreak**, **earned ${prize}$** and **gained ${xp} xp**!`)
  }).catch((error) => {
    room.send(error)
  })

  addExperience(winner, xp, false).catch(rejected => room.send(rejected))
}

module.exports = { finishFight }