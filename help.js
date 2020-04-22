const Discord = require('discord.js')
const { getUser } = require('./userlist.js')

const showHelp = (msg) => {
  const command = msg.content.split(' ')[2]
  const list = new Discord.MessageEmbed()
    .setAuthor('HELP', msg.author.displayAvatarURL())
    .setColor([128, 0, 128])
    .setTitle(command)
    
  if(command === 'help') 
    list.setDescription('Displays list of available commands')
  else if(command === 'balance') 
    list.setDescription('Displays balance of your account if you\'re a member of the fighting club. To join the fighting club type bnn class. Available classes and their stats under bnn classinfo.')
  else if(command === 'class') {
    list.setDescription('Allows you to join the fighting club or change your class if you\'re already a member.')
    list.setFooter('Example use: bnn class rogue')
  }
  else if(command === 'classinfo') {
    list.setDescription('Displays available classes and their stats. Type *bnn classinfo all* if you want to see all classes at once.')
    list.setFooter('Example use: bnn classinfo rogue')
  }
  else if(command === 'fight') {
    list.setDescription('Allows you to fight other members of the fighting club. It consists of two phases. First you get 3 trivia questions per player, which if you answer correctly you will be awarded with items boosting your stats. Then you fight. Winner gets some money. Results are recorded. Fight ends after 15 minutes if you can\'t finish it earlier, your turn is skipped if you afk for 30 seconds.')
    list.setFooter('Example use: bnn fight @nickname')
  }
  else if(command === 'info')
    list.setDescription('Displays all of your stats if you\'re a member of the fighting club. To join the fighting club type bnn class. Available classes and their stats under bnn classinfo.')
  else if(command === 'pic') {
    list.setDescription('Sends you a picture of an animal. To see list of available animals type bnn piclist')
    list.setFooter('Example use: bnn pic duck')
  }
  else if(command === 'piclist')
    list.setDescription('Sends you a list of animals the bot can send. It\'ll be a private message in order not to make too much mess in the server chat.')
  else if(command === 'roll') {
    list.setDescription('Allows you to roll a number or roll dice.')
    list.setFooter('Example use: bnn roll 3 20')
  }
  else if(command === 'poll') {
    list.setDescription('Allows you to create a poll. It will automatically end after 30 seconds. In order to vote type *bnn vote 2* or check *bnn help vote* for more info.')
    list.setFooter('Example use: bnn poll Do you like ducks ? yes no')
  }
  else if(command === 'vote') {
    list.setDescription('Allows you to vote in a poll. You can vote either by typing *option number* or *option message*. You can\'t vote twice in a single poll so choose wisely!')
    list.setFooter('Let\'s say someone created poll such as bnn poll do you like ducks ? absolutely yes no \nYou can vote either by typing: *bnn vote 1* or *bnn vote absolutely*')
  }
  else if(command === 'collect') 
    list.setDescription('Allows you to earn money which is used to gamble or level up your profile!')
  else if(command === 'highlow') {
    list.setDescription('Allows you to play high low with your money. Numbers range between 0-99. How to play: bot rolls a number, let\'s say it rolled 27, your task is to guess if the next number it\'s gonna roll is going to be higher than 27 or lower. Let\'s say you typed higher. Bot rolls 90. You get to guess again, if the next number will be higher or lower than 90, and so on.')
    list.setFooter('Example use: bnn highlow 10')
  }
  else if(command === 'flip') {
    list.setDescription('Allows you to play heads or tails with your money. Bot is going to flip a coin and your task is to guess which side will it land on, heads or tails.')
    list.setFooter('Example use: bnn flip heads 10')
  }
  else {
    list.setTitle('Available commands:')
    .setDescription('bnn help \nbnn balance \nbnn class \nbnn classinfo \nbnn fight \nbnn info \nbnn pic \nbnn piclist \nbnn roll \nbnn poll \nbnn vote \nbnn collect \nbnn highlow \nbnn flip')
  }
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