const Discord = require('discord.js')
const { prefix, token } = require('./config.json')
const client = new Discord.Client()

const { fight, isInFight, fightAction, displayClassStats } = require('./fighting.js')
const { showHelp, showInfo } = require('./help.js')
const { updateUser } = require('./userlist.js')
const { getImage } = require('./images.js')
const { isAnimal, animalList } = require('./animals.js')
const { rollDice } = require('./random.js')
const { vote, poll, pollTimer } = require('./vote.js')
const { showBalance, collectMoney, isGambling, gamble, higherLower, coinFlip, heist, heistEnd, jackpot } = require('./money.js')
const { getRedditImage } = require('./reddit.js')

client.once('ready', () => {
  client.user.setActivity("bnn help")
  console.log("ready")
})

client.on('message', message => {
  if(isInFight(message.author)) {
    const ans = message.content.toLowerCase()
    fightAction(ans, message.author, message.channel)
  }

  else if(isGambling(message.author)) {
    const msg = gamble(message)
    if(msg)
      message.channel.send(msg)
  }

  else if(message.content.startsWith(`${prefix} help`))
    message.channel.send(showHelp(message))
    
  else if(message.content.startsWith(`${prefix} classinfo`))
    displayClassStats(message.content, message.channel)

  else if(message.content.startsWith(`${prefix} roll`)) 
    message.channel.send(rollDice(message.content))

  else if(message.content.startsWith(`${prefix} piclist`)) {
    message.author.send(animalList())
    message.react('🦆')
  }
    
  else if(message.content.startsWith(`${prefix} porn`)) 
    getRedditImage(message).then(accepted => {
      message.channel.send(accepted)
    }).catch(rejected => {
      message.channel.send(rejected)
    })

  else if(message.content.startsWith(`${prefix} flip`)) 
    coinFlip(message).then(accepted => {
      message.channel.send(accepted)
    }).catch(rejected=> {
      message.channel.send(rejected)
    })

  else if(message.content.startsWith(`${prefix} balance`)) 
    showBalance(message.author).then(accepted => {
      message.channel.send(accepted)
    }).catch(rejected => {
      message.channel.send(rejected)
    })

    else if(message.content.startsWith(`${prefix} collect`))
      collectMoney(message.author).then(accepted => {
        message.channel.send(accepted)
      }).catch(rejected => {
        message.channel.send(rejected)
      })

  else if(message.content.startsWith(`${prefix} info`)) 
    showInfo(message.author).then(accepted => {
      message.channel.send(accepted)
    }).catch(rejected => {
      message.channel.send(rejected)
    })

  else if(message.content.startsWith(`${prefix} class`)) 
    updateUser(message.author, message.content).then(accepted => {
      message.channel.send(accepted)
    }).catch(rejected => {
      message.channel.send(rejected)
    })
 
  else if(message.content.startsWith(`${prefix} fight`)) {
    const opponent = message.mentions.users.first()
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

  else if(message.content.startsWith(`${prefix} pic`)) {
    if(isAnimal(message.content)) {
      getImage(message.content).then(image => {
        message.channel.send(image).then(message.react('🦆'))
      })
    }
    else 
      message.channel.send(`Not on list :duck:. Type **bnn pic *animal***. Not every animal is listed though. Type bnn piclist to see available animals. Example: bnn pic duck`)
  }

  else if(message.content.startsWith(`${prefix} vote`)) {
    const msg = vote(message.author, message.content)
    if(msg)
      message.channel.send(msg)
    else
      message.react('👌')
  }
  
  else if(message.content.startsWith(`${prefix} poll`)) {
    message.channel.send(poll(message))
    pollTimer().then(accepted => {
      if(accepted)
        message.channel.send(accepted)
    }).catch(rejected => {
      rejected = null
    })
  }

  else if(message.content.startsWith(`${prefix} highlow`)) {
    higherLower(message).then(accepted => {
      message.channel.send(accepted)
    }).catch(rejected => {
      message.channel.send(rejected)
    })
  }

  else if(message.content.startsWith(`${prefix} heist`)) {
    heist(message).then(accepted => {
      message.channel.send(accepted[0])
      if(accepted[1])
        heistEnd().then(accepted => {
          message.channel.send(accepted)
        }).catch(rejected => {
          message.channel.send(rejected)
        })
    }).catch(rejected => {
      message.channel.send(rejected)
    })
  }

  else if(message.content.startsWith(`${prefix} jackpot`))
    jackpot(message)

  else if(message.content.startsWith(`${prefix}`))
    message.channel.send('Invalid command. To see the list of commands type *bnn help*')

})

client.login(token)