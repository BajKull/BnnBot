const Discord = require('discord.js')
const { getUser, getTopTenList } = require('../database/userlist.js')
const { prefix } = require('../../config.json')

const showHelp = (msg) => {
  if(msg.content.startsWith(`${prefix} help`)) {
    const command = msg.content.split(' ')[2]
    const list = new Discord.MessageEmbed()
      .setAuthor('HELP', msg.author.displayAvatarURL())
      .setColor([128, 0, 128])
      .setTitle(command)
      
    const commandList = ['balance', 'class', 'classinfo', 'collect', 'donate', 'fight', 'flip', 'highlow', 'heist', 'help', 'info', 'jackpot', 'pic', 'piclist', 'porn', 'poll', 'roll', 'top10', 'vote']
    if(command === 'balance') 
      list.setDescription('Displays balance of your account if you\'re a member of the fighting club. To join the fighting club type bnn class. Available classes and their stats under bnn classinfo.')
    else if(command === 'class') {
      list.setDescription('Allows you to join the fighting club or change your class if you\'re already a member.')
      list.setFooter('Example use: bnn class rogue')
    }
  
    else if(command === 'classinfo') {
      list.setDescription('Displays available classes and their stats. Type *bnn classinfo all* if you want to see all classes at once.')
      list.setFooter('Example use: bnn classinfo rogue')
    }
  
    else if(command === 'collect') 
      list.setDescription('Allows you to earn money which is used to gamble or level up your profile!')
    
    else if(command === 'donate') {
      list.setDescription('Allows you to transfer money to someone else!')
      list.setFooter('Example use: bnn donate 10 @nickname')
    }
  
    else if(command === 'fight') {
      list.setDescription('Allows you to fight other members of the fighting club. It consists of two phases. First you get 3 trivia questions per player, which if you answer correctly you will be awarded with items boosting your stats. Then you fight. Winner gets some money. Results are recorded. Fight ends after 15 minutes if you can\'t finish it earlier, your turn is skipped if you afk for 30 seconds.')
      list.setFooter('Example use: bnn fight @nickname')
    }
    
    else if(command === 'flip') {
      list.setDescription('Allows you to play heads or tails with your money. Bot is going to flip a coin and your task is to guess which side will it land on, heads or tails.')
      list.setFooter('Example use: bnn flip heads 10')
    }
    
    else if(command === 'highlow') {
      list.setDescription('Allows you to play high low with your money. Numbers range between 0-99. How to play: bot rolls a number, let\'s say it rolled 27, your task is to guess if the next number it\'s gonna roll is going to be higher than 27 or lower. Let\'s say you typed higher. Bot rolls 90. You get to guess again, if the next number will be higher or lower than 90, and so on.')
      list.setFooter('Example use: bnn highlow 10')
    }
  
    else if(command === 'heist') {
      list.setDescription(`Allows you to attempt a heist. Whoever goes first, starts a 60 seconds timer. While the timer is running any member of the fighting club can join the heist in order to earn money! If only one person is attempting a heist, it's an automatical loose, otherwise you get a chance to win 2x, 3x, 5x the money you put in after the timer goes out!`)
      list.setFooter('Example use: bnn heist 50')
    }
  
    else if(command === 'help') 
      list.setDescription('Displays list of available commands')
  
    else if(command === 'info')
      list.setDescription('Displays all of your stats if you\'re a member of the fighting club. To join the fighting club type bnn class. Available classes and their stats under bnn classinfo.')
  
    else if(command === 'jackpot') {
      list.setDescription('Allows you to play jackpot with your friends! First person that types *bnn jackpot amount*, creates a jackpot which everyone can join. The more money you join with, the higher your chances of winning are. One person gathers all the money everyone entered with, everyone else looses! For example: if person X joins with 70$, person Y joins with 20$, person Z joins with 10$, their chances of winning are respectively: 70%, 20%, 10%.')
      list.setFooter('Example use: bnn jackpot 20')
    }
  
    else if(command === 'pic') {
      list.setDescription('Sends you a picture of an animal. To see list of available animals type bnn piclist')
      list.setFooter('Example use: bnn pic duck')
    }
    
    else if(command === 'piclist')
      list.setDescription('Sends you a list of animals the bot can send. It\'ll be a private message in order not to make too much mess in the server chat.')
  
    else if(command === 'porn')
      list.setDescription('Sends you naughty pictures.')
  
    else if(command === 'poll') {
      list.setDescription('Allows you to create a poll. It will automatically end after 30 seconds. In order to vote type *bnn vote 2* or check *bnn help vote* for more info.')
      list.setFooter('Example use: bnn poll Do you like ducks ? yes no')
    }
  
    else if(command === 'roll') {
      list.setDescription('Allows you to roll a number or roll dice.')
      list.setFooter('Example use: bnn roll 3 20')
    }
  
    else if(command === 'top10')
      list.setDescription('Shows you top 10 list of the richest fighters!')
    
    else if(command === 'vote') {
      list.setDescription('Allows you to vote in a poll. You can vote either by typing *option number* or *option message*. You can\'t vote twice in a single poll so choose wisely!')
      list.setFooter('Let\'s say someone created poll such as bnn poll do you like ducks ? absolutely yes no \nYou can vote either by typing: *bnn vote 1* or *bnn vote absolutely*')
    }
  
    else {
      list.setTitle('Available commands:')
      .setDescription(commandList.map(x => `bnn ${x}\n`).join(''))
      .setFooter('You can also check what specific commands do! \nExample use: bnn help vote')
    }
    msg.channel.send(list)
  }
}

const showInfo = (msg) => {
  if(msg.content.startsWith(`${prefix} info`)) {
    const user = msg.author
    new Promise(accepted => {
      getUser(user).then(player => {
        const stats = new Discord.MessageEmbed()
          .setAuthor(user.username, user.displayAvatarURL())
          .setColor([128, 0, 128])
          .setTitle('Stats')
          .setDescription(`level: ${player.level} \nwins: ${player.wins} \nlosses: ${player.losses} \nwinstreak: ${player.winstreak} \nmoney: ${player.money}$`)
          accepted(stats) 
      }).catch(error => {
        rejected(error)
      })
    }).then(accepted => {
      msg.channel.send(accepted)
    }).catch(rejected => {
      msg.channel.send(rejected)
    })
  }
}

const top10Money = (msg) => {
  if(msg.content.startsWith(`${prefix} top10`)) {
    const user = msg.author
    getTopTenList('money').then(moneyList => {
      const list = moneyList.map(x => x.name + ': ' + x.money + '$').join('\n')
      const stats = new Discord.MessageEmbed()
        .setAuthor(user.username, user.displayAvatarURL())
        .setColor([128, 0, 128])
        .setTitle('Top 10 money list')
        .setDescription(list)
      msg.channel.send(stats)
    }).catch(error => {
      msg.channel.send(error)
    })
  }
}

module.exports = { showHelp, showInfo, top10Money }