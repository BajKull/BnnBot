const rollNumber = (n) => {
  return Math.floor(Math.random() * n) + 1
}

const rollDice = (msg) => {
  const message = msg.split(' ')
  let amount = null
  let size = null
  if(message[2])
    amount = parseInt(message[2])
  if(message[3])
    size = parseInt(message[3])

  if(isNaN(amount) || isNaN(size))
    return('That\'s not how you roll! Type **bnn roll *number*** *die_size(optional)*. For example: bnn roll 6, bnn roll 3 20 *(rolls 3 d20)*')
  if(amount) {
    if(size) {
      if(amount > 30)
        return ('Can\'t roll more than 30 dice')
      if(size > 1000)
        return ('Die too heavy. Try rolling smaller die with less numbers, max 1000')
      
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
      return (`${text}${sum}`)
    }
    else 
      return(rollNumber(amount))
  }
  else
    return('That\'s not how you roll! Type bnn roll **number** *(optional) die size*. For example: bnn roll 6, bnn roll 3 20 *(rolls 3 d20)*')
  
}

module.exports = { rollDice }