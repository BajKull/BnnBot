const Discord = require('discord.js')
const collectedCD = []
const { getUser, addBalance } = require('./userlist.js')
const { getClassNames } = require('./fighting.js')

const activeGamblers = []

const isGambling = (user) => { return activeGamblers.find(gambler => gambler.id === user.id) }

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

const gamble = (msg) => {
  const user = msg.author
  const action = msg.content
  const gambler = activeGamblers.find(gambler => gambler.id === user.id)
  const index = activeGamblers.indexOf(gambler)
  const whichGame = gambler.game
  if(msg.content.startsWith('bnn highlow'))
    return(`${msg.author}, you are already playing ${whichGame}! Your current number is **${activeGamblers[index].number}** and your stake is **${activeGamblers[index].currentStake}**. Type **higher**, **lower** to continue the game or **finish** to take your money.`)

  if(whichGame === 'highlow')
    return(continueHigherLower(action, user, index))
}

const higherLower = (msg) => {
  const user = msg.author
  const amount = parseInt(msg.content.split(' ')[2])
  return new Promise((accepted, rejected) => {
    if(isNaN(amount))
      rejected('That\'s not how you play! To start the game type *bnn highlow amount*, for example *bnn highlow 15*')
    else if(amount < 4)
      rejected('You have to play with at least 4$')
    else {
      getUser(user.id).then(gambler => {
        if(!gambler)
          rejected(`${user} you idiot, how do you want to gamble without an account? Join the fighting club and we''l give you one for free! To join the club type *bnn class ...*. Available classess are *${getClassNames()}*.`)
        else {
          if(gambler.money < amount)
            rejected(`${user}, you idiot... you can\'t take loans! You only have ${gambler.money}$, go and earn some or lower your stakes!`)
          else {
            const player = {
              id: user.id,
              game: 'highlow',
              startingAmount: amount,
              currentStake: 0,
              number: Math.floor(Math.random() * 100)
            }
  
            activeGamblers.push(player)
            accepted(`Okay ${user}, let\'s give you a number. Hmm... It\'ll be **${player.number}** this time. Will the next number be **higher** or **lower**, what do you think? Type **higher**, **lower** to continue the game or **finish** to take your money. Current stake: **${player.currentStake}$**`)
          }
        }
      })
    }
  })
}

const continueHigherLower = (action, user, index) => {
  const newNumber = Math.floor(Math.random() * 100)
  const currentNumber = activeGamblers[index].number
  const currentStake = activeGamblers[index].currentStake
  const startingAmount = activeGamblers[index].startingAmount

  const prize = () => {
    if(currentStake === 0) 
      activeGamblers[index].currentStake += Math.floor(startingAmount / 4)
    else if(currentStake < Math.floor(startingAmount / 2))
      activeGamblers[index].currentStake = Math.floor(startingAmount / 2)
    else if(currentStake === Math.floor(startingAmount / 2))
      activeGamblers[index].currentStake = startingAmount
    else
      activeGamblers[index].currentStake *= 2
  }

  if(action === 'higher') {
    if(newNumber >= currentNumber) {
      prize()
      activeGamblers[index].number = newNumber
      return(`Good job! I rolled **${newNumber}**. Type **higher**, **lower** to continue the game or **finish** to take your money. Current stake: **${activeGamblers[index].currentStake}$**`)
    }
    else {
      addBalance(user, startingAmount * -1)
      activeGamblers.splice(index, 1)
      return(`Hihi, you lost! I rolled **${newNumber}**. Good luck next time!`)
    }
  }
  else if(action === 'lower') {
    if(newNumber <= currentNumber) {
      prize()      
      activeGamblers[index].number = newNumber
      return(`Good job! I rolled **${newNumber}**. Type **higher**, **lower** to continue the game or **finish** to take your money. Current stake: **${activeGamblers[index].currentStake}$**`)
    }
    else {
      addBalance(user, startingAmount * -1)
      activeGamblers.splice(index, 1)
      return(`Hihi, you lost! I rolled **${newNumber}**. Good luck next time!`)
    }
  }
  else if(action === 'finish') {
    addBalance(user, currentStake - startingAmount)
    activeGamblers.splice(index, 1)
    return(`Game finished! You leave with ${currentStake}$. Type *bnn balance* to see your new balance!`)
  }
}

const coinFlip = (msg) => {
  const user = msg.author
  const side = msg.content.split(' ')[2]
  const amount = parseInt(msg.content.split(' ')[3])
  return new Promise((accepted, rejected) => {
    if(side !== 'heads' || side !== 'tails') {
      if(isNaN(amount))
        rejected(`${user}, that's not how you flip! Type bnn flip *side* *amount* to play, for example bnn flip heads 10.`)
      else if(amount <= 0)
        rejected(`${user}, you bastard, bet some money on it! Type bnn flip *side* *amount* to play, for example bnn flip heads 10.`)
      else {
        getUser(user.id).then(gambler => {
          if(gambler.money < amount)
            rejected(`${user} ,you don't have enough money in your account! Go collect some cans! Your current balance is **${gambler.money}$**`)
          else {
            const number = Math.floor(Math.random() * 2)
            const roll = number === 0 ? 'tails' : 'heads'
            if(side === roll) {
              addBalance(user, amount).then(balance => {
                accepted(`${user}, I flipped **${roll}**, you won! Your new balance is ${balance}$`)
              }).catch(error => {
                rejected(error)
              })
            }
            else {
              addBalance(user, amount * -1).then(balance => {
                accepted(`${user}, I flipped **${roll}**, you lost! Your new balance is ${balance}$`)
              }).catch(error => {
                rejected(error)
              })
            }
          }
        }).catch(error => {
          rejected(error)
        })
      }
    }
    else
      rejected(`${user}, that's not how you flip! Type bnn flip *side* *amount* to play, for example bnn flip heads 10.`)
  })
}

// jednoreki bandyta, const gamble = (user, amount)

// heist, kilka osob wchodzi np za 300, 300, 300, 300, pula rosnie x2, albo zeruje sie, i hajs rozdzielany randomowo

// coin flip

// ruletka

// invest

// stonks?

// foodporn

module.exports = { showBalance, collectMoney, isGambling, gamble, higherLower, coinFlip }