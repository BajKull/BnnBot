const Discord = require('discord.js')
let activePoll = null

const isPollActive = () => activePoll

const vote = (user, msg) => {
  const option = msg.split(' ')[2]
  if(activePoll) {
    if(activePoll.voted.indexOf(user.id) >= 0)
      return ('You can\'t vote twice!')
    const choice = activePoll.options.find(el => el.option === option)
    const index = activePoll.options.indexOf(choice)
    if(index >= 0) {
      activePoll.voted.push(user.id)
      activePoll.options[index].votes ++
    }
    else if(parseInt(option) > 0 && parseInt(option) <= activePoll.options.length) {
      activePoll.voted.push(user.id)
      activePoll.options[option - 1].votes ++
    }
    else
      return('That\'s not how you vote! Type bnn vote *option* or bnn vote *number* in order to vote. For example *bnn vote ducks*, *bnn vote 2*')
  }
  else
    return('There is no poll active at the moment! Type bnn poll *question* ? *option1* *option2* ... to create a poll. Max 20 options.')
}

const poll = (msg) => {
  const options = msg.content.split(' ').splice(2)
  const index = options.indexOf('?')
  if(index === -1)
    return('You have to end your question with **?**, for example *bnn poll do you like ducks ? yes no* *(space before question mark)*')
  const question = options.splice(0, index + 1).join(' ')
  
    if(options.length < 2)
      return('You have to give at least 2 options for the poll! Type bnn poll *question* ? *option1* *option2* ... to create a poll. Max 20 options.')
    if(options.length > 20)
      return('Max 20 options!')
    if(activePoll) 
      return(`A poll is already carried out, wait your turn!`)
   
    activePoll = {
      question: question.slice(0, question.length - 2) + '?',
      options: options.map(option => {return {option: option, votes: 0}}),
      voted: [],
      justCreated: true
    }

    const review = new Discord.MessageEmbed()
      .setAuthor(msg.author.username, msg.author.displayAvatarURL())
      .setTitle(activePoll.question)
      .setColor([128, 0, 128])
      .setDescription(options.map((x, i) => `${i+1}) ${x}\n`))
      .setFooter('Poll created! Type bnn vote *option* or bnn vote *number* in order to vote. For example *bnn vote ducks*, *bnn vote 2*')
      
    return(review)
  
}

const pollTimer = () => {
  if(activePoll)
    if(activePoll.justCreated) {
      return new Promise((accepted, rejected) => {
        if(activePoll) {
          setTimeout(() => {
            accepted(endPoll())
          }, 30000)
          activePoll.justCreated = false
        }
        else
          rejected(null)
      })
    }
    else
      return new Promise((accepted, rejected) => rejected(null))
  
  else
    return new Promise((accepted, rejected) => rejected(null))
}

const endPoll = () => {
  let max = 0
  let option = 0
  for(let i = 0; i < activePoll.options.length; i++) {
    if(activePoll.options[i].votes > max) {
      max = activePoll.options[i].votes
      option = activePoll.options[i].option
    }
  }
  return (`Poll closed! *${activePoll.question}*  **${option}** won with ${max} votes!`)
  activePoll = null
}

module.exports = { poll, vote, pollTimer }