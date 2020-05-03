const Discord = require('discord.js')
const collectedCD = []
const { getUser, addBalance } = require('../database/userlist.js')
const { prefix } = require('../../config.json')

const showBalance = (msg) => {
  if(msg.content.startsWith(`${prefix} balance`))  {
    const user = msg.author
    new Promise(accepted => {
      getUser(user).then(account => {
        const stats = new Discord.MessageEmbed()
          .setAuthor(user.username, user.displayAvatarURL())
          .setTitle('Balance')
          .setColor([128, 0, 128])
          .setDescription(`Money: ${account.money}$`)
          accepted(stats)
      }).catch(rejected => {
        msg.channel.send(rejected)
      })
    }).then(accepted => {
      msg.channel.send(accepted)
    })
  }
}

const collectMoney = (msg) => {
  if(msg.content.startsWith(`${prefix} collect`)) {
    const user = msg.author
    const lastCollected = collectedCD.find(el => el.id === user.id)
    const amount = Math.floor(Math.random() * 15)
    if(lastCollected) {
      const date = new Date()
      const diff = Math.floor((lastCollected.time - date) / 1000 * -1)
      if(diff >= 3600) {
        const index = collectedCD.indexOf(lastCollected)
        collectedCD[index].time = new Date()
        addBalance(user, amount).then(balance => {
          msg.channel.send(`You collected ${amount} cans. Your new balance is ${balance}$`)
        }).catch(rejected => {
          msg.channel.send(rejected)
        })
      }
      else {
        let minutes = 59 - Math.floor(diff / 60)
        let plural = ''
        if(minutes > 0) 
          plural = minutes > 1 ? ' minutes ' : ' minute '
        else
          minutes = ''
        const minutesDisplay = minutes + plural
        plural = ''
        let seconds = (3600 - (minutes * 60)) - diff
        if(seconds > 0) 
          plural = seconds > 1 ? ' seconds ' : ' second '
        else
          seconds = ''
        const secondsDisplay = seconds + plural
        msg.channel.send(`There are no cans left! **Wait** ${minutesDisplay}${secondsDisplay}more, so the cans respawn, you metal scrapper!`)
      }
    }
    else {
      getUser(user).then(accepted => {
        const collector = {
          id: user.id,
          time: new Date(),
        }
        collectedCD.push(collector)
        addBalance(user, amount).then(balance => {
          msg.channel.send(`You collected ${amount} cans. Your new balance is ${balance}$`)
        }).catch(rejected => {
          msg.channel.send(rejected)
        })
      }).catch(rejected => {
        msg.channel.send(rejected)
      })
    }    
  }
}

const donate = (msg) => {
  if(msg.content.startsWith(`${prefix} donate`)) {
    const user = msg.author
    const user2 = msg.mentions.users.first()
    const amount = parseInt(msg.content.split(' ')[2])
  
    if(!user2)
      msg.channel.send(`Who do you want to donate to? Tag someone, by typing *bnn donate amount @nickname* !`)
    else {
      if(isNaN(amount))
        msg.channel.send(`You have to type how much you want to donate! Type *bnn donate amount @nickname* to donate!`)
      else if(amount <= 0)
        msg.channel.send(`You have to donate at least 1$!`)
      else {
        getUser(user).then(donator => {
          if(donator.money < amount)
            msg.channel.send(`${user}, you don't have that much money! Your current **balance: ${donator.money}$**`)
          else {
            getUser(user2).then(accepted => {
              addBalance(user, amount * -1).catch(error => { msg.channel.send(error) })
              addBalance(user2, amount).catch(error => { msg.channel.send(error) })
              msg.channel.send(`Donation successful! To check your new balance type *bnn balance*`)
            }).catch(error => {
              msg.channel.send(error)
            })
          }
        })
      }
    }
  }
}

// ruletka

// invest

// stonks?

module.exports = { showBalance, collectMoney, donate }