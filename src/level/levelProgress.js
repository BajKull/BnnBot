const Discord = require('discord.js')
const { prefix } = require('../../config.json')
const { xpGoalPerLv } = require('./checkIfLvUp.js')
const { getUser } = require('../database/userlist.js')

const levelProgress = (msg) => {
  if(msg.content.toLowerCase().startsWith(`${prefix} level`)) {
    const u = msg.author
    getUser(u).then(user => {
      const display = new Discord.MessageEmbed()
      .setAuthor(u.username, u.displayAvatarURL())
      .setColor([128, 0, 128])
      .setTitle('Level progress')
      .setDescription(`level: ${user.level}\nxp: ${user.xp}/${xpGoalPerLv[user.level - 1]}`)
      msg.channel.send(display)
    }).catch(rejected => {
      console.log(rejected)
      msg.channel.send(rejected)
    })

  }
}

module.exports = { levelProgress }