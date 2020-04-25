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
      accepted(`You collected ${amount} cans. Your new balance is ${balance}$`)
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
  if(msg.content.startsWith('bnn highlow') || msg.content.startsWith('bnn heist') || msg.content.startsWith('bnn jackpot')) {
    if(whichGame === 'highlow')
      return(`${msg.author}, you are already playing ${whichGame}! Your current number is **${activeGamblers[index].number}** and your stake is **${activeGamblers[index].currentStake}**. Type **higher**, **lower** to continue the game or **finish** to take your money.`)
    else if(whichGame === 'heist')
      return(`${msg.author}, you are already attempting a heist! Prepare your gun instead of trying to gamble!`)
    else if(whichGame === 'jackpot')
      jackpot(msg)
  }
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

const heist = (msg) => {
  const user = msg.author
  const amount = parseInt(msg.content.split(' ')[2])

  return new Promise((accepted, rejected) => {
    if(isNaN(amount))
      rejected(`You need to commit with some of your money! Type *bnn help heist* for more info.`)
    else if(amount <= 0)
      rejected(`You need to commit with some of your money! Type *bnn help heist* for more info.`)
    else {
      getUser(user.id).then(gambler => {
        if(gambler.money < amount)
          rejected(`You don\'t have that much money! Your current **balance: ${gambler.money}$**`)
        else {
          const creator = activeGamblers.find(gambler => gambler.game === 'heist') ? false : true
          const player = {
            id: user.id,
            game: 'heist',
            startingAmount: amount,
          }
          activeGamblers.push(player)
          if(creator)
            accepted([`Okay you're in! You attempt a heist investing **${amount}$** in it. Tell others to help you by typing *bnn heist amount* ! Be carefull, if you attempt a heist alone, the police is always going to catch you, and you'll loose your money!`, creator])
          else
            accepted([`Okay you're in! You help in a heist investing **${amount}$** in it. Tell others to help you by typing *bnn heist amount* !`, creator])
        }
      })
    }
  })
}

const heistEnd = () => {
  return new Promise((accepted, rejected) => {
    setTimeout(() => {
      const players = activeGamblers.filter(gambler => gambler.game === 'heist')
      if(players.length === 1) {
        addBalance(players[0], players[0].startingAmount * -1).then(balance => {
          accepted(`I told you not to attempt a heist alone! You stole the money but the police caught you without much effort. You **lost** your money. Your new **balance** is **${balance}$**`)
        }).catch(error => {
          rejected(error)
        })
      }
      else {
        const outcome = Math.floor(Math.random() * 100 + 1)
        let prize = 0
        if(outcome > 95)
          prize = 5
        else if(outcome > 85)
          prize = 3
        else if(outcome > 55)
          prize = 2
        for(let i = 0; i < players.length; i++) {
          addBalance(players[i], players[i].startingAmount * prize - players[i].startingAmount).catch(error => rejected(error))
          activeGamblers.splice(activeGamblers.indexOf(players[i]), 1) 
        }
        
        if(prize === 0)
          accepted(`You find a suitable place for a robbery, you pull out your guns and rob it. Wait what's that?! It's the sound of the police! You try to run but they're too fast. Everyone that attempted this heist **looses** their **money** invested in this heist.`)
        else if(prize === 2)
          accepted(`You find a suitable place for a robbery, you pull out your guns and rob it. Wait what's that?! It's the sound of the police! You run like you've never run before. You got out, nice! Unfortunetaly you lost most of the money while escaping, however seems like everyone **doubled** their **money** invested in this heist.`)
        else if(prize === 3)
          accepted(`You find a suitable place for a robbery, you pull out your guns and rob it. Wait what's that?! It's the sound of the police! You run like you've never run before. You got out, nice! Unfortunetaly you lost some of the money while escaping, however seems like everyone **tripled** their **money** invested in this heist.`)
        else if(prize === 5)
          accepted(`You find a suitable place for a robbery, you pull out your guns and rob it. Wait what's that?! It's the sound of the police! You run like you've never run before. You got out, nice! Seems like you held your bags tight, no money lost!. Everyone **quintupled** their **money** invested in this heist. *(quintuple = x5)*`)
  
        
      }
    }, 30000)
  })

}

const jackpot = (msg) => {
  const user = msg.author
  const amount = parseInt(msg.content.split(' ')[2])

  new Promise((accepted, rejected) => {
    if(isNaN(amount))
      rejected(`${user}, that's not how you enter a jackpot! Type *bnn jackpot amount* to join! More info under bnn help jackpot.`)
    else if(amount <= 0)
      rejected(`${user}, you have to enter with at least 1$`)
    else {
      getUser(user.id).then(gambler => {
        if(gambler.money < amount)
          rejected(`${user}, you don't have that much money! Your balance is **${gambler.money}$**`)
        else {
          addBalance(user, amount * -1).then(() => {
            console.log("asd")
            const jackpotPlayers = activeGamblers.filter(gambler => gambler.game === 'jackpot')
            if(jackpotPlayers.length === 0) {
              const player = {
                id: user.id,
                game: 'jackpot',
                currentStake: amount
              }
              activeGamblers.push(player)
              accepted([`You created a new jackpot! Tell others to join you by typing *bnn jackpot amount*! Remember, there's only one winner that takes all the money in the jackpot! There's **${amount}$ in the jackpot** in total!`, true])
            }
            else {
              const sum = jackpotPlayers.reduce((acc, p) => { return acc + p.currentStake }, 0) + amount
              const alreadyPlayer = jackpotPlayers.find(el => el.id === user.id)
              if(alreadyPlayer) {
                const index = activeGamblers.indexOf(alreadyPlayer)
                const contribution = activeGamblers[index].currentStake + amount
                activeGamblers[index].currentStake = contribution
                accepted([`You throw in additional ${amount}$. Your contribution to the jackpot: ${contribution}$. There's **${sum}$ in the jackpot** in total!`, false])
              }
              else {
                const player = {
                  id: user.id,
                  game: 'jackpot',
                  currentStake: amount
                }
                activeGamblers.push(player)
                accepted([`You join the jackpot with ${amount}$ There's **${sum}$ in the jackpot** in total!`, false])
              }
            }

          }).catch(error => rejected(error))
        }
      })
    }
  }).then(accepted => {
    msg.channel.send(accepted[0])
    if(accepted[1]) {
      new Promise((accepted, rejected) => {
        setTimeout(() => {
          const jackpotPlayers = activeGamblers.filter(gambler => gambler.game === 'jackpot')
          const entries = jackpotPlayers.reduce((acc, p) => { return acc + p.currentStake }, 0)
          const winningTicket = Math.floor(Math.random() * entries) + 1
          let currentTicket = 0
          let winner = null
          for(const player of jackpotPlayers) {
            if(winner === null)
              currentTicket += player.currentStake
            if(currentTicket >= winningTicket) {
              winner = player
              currentTicket = 0
              addBalance(player, entries).catch(error => rejected(error))
            }
            activeGamblers.splice(activeGamblers.indexOf(player), 1)
          }
          const winningUser = msg.client.users.resolve(winner.id)
          accepted(`Jackpot ended! The winner is ${winningUser}! Money in the pool: **${entries}$**`)
        }, 30000)
      }).then(accepted => {
        msg.channel.send(accepted)
      }).catch(rejected => {
        msg.channel.send(rejected)
      })
    }
  }).catch(rejected => {
    msg.channel.send(rejected)
  })

}

// ruletka

// invest

// stonks?

module.exports = { showBalance, collectMoney, isGambling, gamble, higherLower, coinFlip, heist, heistEnd, jackpot }