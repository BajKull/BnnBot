const Discord = require('discord.js')
const { prefix, token } = require('./config.json')
const client = new Discord.Client()

const { changeClass, showInfo, fight, isInFight, getClassNames, fightAction, displayClassStats } = require('./users.js')

client.once('ready', () => {
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
    if (uClass === 'warrior')
      changeClass(message.author, 'warrior', message.channel)
    else if(uClass === 'mage')
      changeClass(message.author, 'mage', message.channel)
    else if(uClass === 'druid')
      changeClass(message.author, 'druid', message.channel)
    else if(uClass === 'rogue')
      changeClass(message.author, 'rogue', message.channel)
    else
      message.channel.send(`${message.author}, you idiot... There is no class such as ${uClass}. Available classes: ${getClassNames()}"`)
  }
  

})

client.login(token)