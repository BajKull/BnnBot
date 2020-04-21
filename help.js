const Discord = require('discord.js')
const { getUser } = require('./userlist.js')

const showHelp = (user) => {
  const list = new Discord.MessageEmbed()
    .setAuthor('HELP', user.displayAvatarURL())
    .setColor([128, 0, 128])
    .setTitle('Available commands:')
    .setDescription('bnn help \nbnn balance \nbnn class \nbnn classinfo \nbnn fight \nbnn info \nbnn pic \nbnn roll \nbnn poll \nbnn vote \nbnn collect \nbnn highlow')
  return(list)
}

const showInfo = (user) => {
  return new Promise((accepted, error) => {
    getUser(user.id).then((player) => {
      if(player) { 
        const stats = new Discord.MessageEmbed()
          .setAuthor(user.username, user.displayAvatarURL())
          .setColor([128, 0, 128])
          .setTitle('Stats')
          .setDescription(`level: ${player.level} \nwins: ${player.wins} \nlosses: ${player.losses} \nwinstreak: ${player.winstreak} \nmoney: ${player.money}$`)
          accepted(stats) 
      }
      else 
        error(`${user} you must first choose your class to join the fighting game. To do so type *bnn class ...*. Available classess are: *${getClassNames()}*`)
    }).catch((errorMsg) => {
      console.log(errorMsg)
      error(`Couldn\'t connect to the database, try again later`)
    })
  })
}

module.exports = { showHelp, showInfo }