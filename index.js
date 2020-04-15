// var express = require('express');
// var app = express();

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Our app is running on port ${ PORT }`);
// });

const Discord = require('discord.js')
const { prefix, token } = require('./config.json')
const client = new Discord.Client()

const { showInfo, fight, isInFight, fightAction, displayClassStats, showHelp } = require('./fighting.js')
const { updateUser } = require('./userlist.js')

client.once('ready', () => {
  client.user.setActivity("bnn help")
  console.log("ready")
})

client.on('message', message => {
  if(isInFight(message.author)) {
    const ans = message.content.toLowerCase()
    fightAction(ans, message.author, message.channel)
  }
  
  else if(message.content.startsWith(`${prefix} info`))
    showInfo(message.author, message.channel)
 
  else if(message.content.startsWith(`${prefix} fight`)) {
    const opponent = message.mentions.members.first()
    if(isInFight(opponent))
      message.channel.send(`${opponent} is already in fight, wait your turn or fight someone else!`)
    else if(message.author === opponent)
      message.channel.send(`You idiot! How do you want to fight yourself?`)
    else {
      if(opponent) 
        fight(message.author, opponent, message.channel)
      else
        message.channel.send('You must choose a player you want to fight. To do so type bnn fight @player')
    }
  }

  else if(message.content.startsWith(`${prefix} classinfo`)) {
    displayClassStats(message.content, message.channel)
  }

  else if(message.content.startsWith(`${prefix} class`)) {
    const uClass = message.content.split(' ')[2]
    message.channel.send(updateUser(message.author, uClass))
  }

  else if(message.content.startsWith(`${prefix} help`)) {
    showHelp(message.channel)
  }
  

})

client.login(token)