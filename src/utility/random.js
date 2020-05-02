const { prefix } = require('../../config.json')

const rollNumber = (n) => {
  return Math.floor(Math.random() * n) + 1
}

const rollDice = (msg) => {
  if(msg.content.startsWith(`${prefix} roll`)) {
    const amount = parseInt(msg.content.split(' ')[2])
    const size = parseInt(msg.content.split(' ')[3])
  
    if(isNaN(amount))
      msg.channel.send('That\'s not how you roll! Type **bnn roll *number*** *die_size(optional)*. For example: bnn roll 6, bnn roll 3 20 *(rolls 3 d20)*')
    else if(amount) {
      if(!isNaN(size)) {
        if(amount > 30)
          msg.channel.send('Can\'t roll more than 30 dice')
        else if(amount <= 0)
          msg.channel.send(`You have to roll at least 1 die!`)
        else if(size > 1000)
          msg.channel.send('Die too heavy. Try rolling smaller die with less numbers, max 1000')
        else {
          let sum = 0
          let text = ''
          for(let i = 0; i < amount; i++) {
            const die = Math.floor(Math.random() * size) + 1
            sum += die
            if(i !== amount - 1)
              text = text.concat(die + ' + ')
            else
              text = text.concat(die + ' = ')
          }
          msg.channel.send(`${text}${sum}`)
        }
      }
      else
        msg.channel.send(rollNumber(amount))
    }
    else
      msg.channel.send('That\'s not how you roll! Type bnn roll **number** *(optional) die size*. For example: bnn roll 6, bnn roll 3 20 *(rolls 3 d20)*')
  }
}

module.exports = { rollDice }