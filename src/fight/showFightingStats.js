const Discord = require('discord.js')
const { activeFights } = require('./activeFights.js')

const showFightingStats = (fightIndex, room, text = '') => {

  const nick1 = activeFights[fightIndex][0].name
  const nick2 = activeFights[fightIndex][1].name
  const class1 = activeFights[fightIndex][0].class
  const class2 = activeFights[fightIndex][1].class
  const at1 = `⚔️ ${activeFights[fightIndex][0].stats.attack}-${activeFights[fightIndex][0].stats.attack + 50}`
  const ar1 = `🛡️ ${activeFights[fightIndex][0].stats.armor}`
  const hp1 = `❤️ ${activeFights[fightIndex][0].stats.health}`
  const at2 = `⚔️ ${activeFights[fightIndex][1].stats.attack}-${activeFights[fightIndex][1].stats.attack + 50}`
  const ar2 = `🛡️ ${activeFights[fightIndex][1].stats.armor}`
  const hp2 = `❤️ ${activeFights[fightIndex][1].stats.health}`

  //u2003 = unicode for 1em width space
  const msg = new Discord.MessageEmbed()
    .setTitle(`${nick1}   |   ${nick2}`)
    .setDescription(`${at1} \u2003 \u2003 ${at2}\n${ar1} \u2006\u2003 \u2003 \u2003 ${ar2}\n${hp1} \u2006\u2003 \u2003 \u2003 ${hp2}`)
    .setColor([128, 0, 128])
    .setFooter(`${class1} VS ${class2}`)

  room.send(text, msg)
}

module.exports = { showFightingStats }