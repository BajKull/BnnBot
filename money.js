const Discord = require('discord.js')
const collectedCD = []
const { getUser, addBalance } = require('./userlist.js')
const { getClassNames } = require('./fighting.js')

const showBalance = (user) => {
  return new Promise((accepted, rejected) => {
    getUser(user.id).then(account => {
      if(!account)
        rejected(`${user} you idiot, how do you want to look at your balance if you're not a member of the fighting club?! To join the club type *bnn class ...*. Available classess are *${getClassNames()}*.`)
      else {
        const msg = new Discord.MessageEmbed()
          .setAuthor(user.username, user.displayAvatarURL())
          .setTitle('Balance')
          .setColor([128, 0, 128])
          .setDescription(`Money: ${account.money}$`)
          accepted(msg)
      }
    }).catch(error => {
      console.log(error)
      rejected('Couldn\'t connect to the database, try again later')
    })
  })
}

const addMoney = (user) => {
  const amount = Math.floor(Math.random() * 15)
  return new Promise((accepted, rejected) => {
    addBalance(user, amount).then(balance => {
      accepted(`You collected ${amount} cans which gives you ${balance}$ in total`)
    }).catch(error => {
      rejected(error)
    })
  })
}

const collectMoney = (user) => {
  const lastCollected = collectedCD.find(el => el.id === user.id)
  if(lastCollected) {
    const date = new Date()
    const diff = Math.floor((lastCollected.time - date) / 1000 * -1)
    console.log(diff)
    if(diff >= 3600) {
      const index = collectedCD.indexOf(lastCollected)
      collectedCD[index].time = new Date()
      return(addMoney(user))
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
      return new Promise(rejected => rejected(`There are no cans left! **Wait** ${minutesDisplay}${secondsDisplay}more, so the cans respawn, you metal scrapper!`))
    }
  }
  else {
    const collector = {
      id: user.id,
      time: new Date(),
    }
    collectedCD.push(collector)
    return(addMoney(user))
  }
    
  
}

module.exports = { showBalance, collectMoney }