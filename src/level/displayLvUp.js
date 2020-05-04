const Discord = require('discord.js')

const displayLvUp = (msg, level) => {
  const user = msg.author
  const display = new Discord.MessageEmbed()
    .setAuthor(user.username, user.displayAvatarURL())
    .setColor([128, 0, 128])
    .setTitle('Level up!')
    .setDescription(`You've just reached level ${level}!\nYou can now collect ${1 * level}-${15 * level} cans instead of ${1 * (level - 1)}-${15 * (level - 1)}!\nWhat are you waiting for?! Go and collect some cans!`)
  msg.channel.send(display)
}

module.exports = { displayLvUp }