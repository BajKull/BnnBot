const Discord = require('discord.js')
const { prefix } = require('../../config.json')
let activePoll = null

const vote = (msg) => {
  if(msg.content.toLowerCase().startsWith(`${prefix} vote`)) {
    const user = msg.author
    const option = msg.content.split(' ')[2]
    if(activePoll) {
      if(activePoll.voted.indexOf(user.id) >= 0)
        msg.channel.send('You can\'t vote twice!')
      else {
        const choice = activePoll.options.find(el => el.option === option)
        const index = activePoll.options.indexOf(choice)
        if(index >= 0) {
          activePoll.voted.push(user.id)
          activePoll.options[index].votes ++
          msg.react('👌')
        }
        else if(parseInt(option) > 0 && parseInt(option) <= activePoll.options.length) {
          activePoll.voted.push(user.id)
          activePoll.options[option - 1].votes ++
          msg.react('👌')
        }
        else
          msg.channel.send('That\'s not how you vote! Type bnn vote *option* or bnn vote *number* in order to vote. For example *bnn vote ducks*, *bnn vote 2*')
      }
    }
    else
      msg.channel.send('There is no poll active at the moment! Type bnn poll *question* ? *option1* *option2* ... to create a poll.')
  }
}

const poll = (msg) => {
  if(msg.content.toLowerCase().startsWith(`${prefix} poll`)) {
    const options = msg.content.split(' ').splice(2)
    const index = options.indexOf('?')
    if(index === -1)
      msg.channel.send('You have to end your question with **?**, for example *bnn poll do you like ducks ? yes no* *(space before question mark)*')
    
    else {
      const question = options.splice(0, index + 1).join(' ')
      
      if(options.length < 2)
        msg.channel.send('You have to give at least 2 options for the poll! Type bnn poll *question* ? *option1* *option2* ... to create a poll. Max 20 options.')
      else if(options.length > 20)
        msg.channel.send('Max 20 options!')
      else if(activePoll) 
        msg.channel.send(`A poll is already carried out, wait your turn!`)
      else {
        activePoll = {
          question: question.slice(0, question.length - 2) + '?',
          options: options.map(option => {return {option: option, votes: 0}}),
          voted: [],
        }
        const review = new Discord.MessageEmbed()
          .setAuthor(msg.author.username, msg.author.displayAvatarURL())
          .setTitle(activePoll.question)
          .setColor([128, 0, 128])
          .setDescription(options.map((x, i) => `${i+1}) ${x}\n`))
          .setFooter('Poll created! Type bnn vote *option* or bnn vote *number* in order to vote. For example *bnn vote ducks*, *bnn vote 2*')
          
        msg.channel.send(review)
  
        new Promise(accepted => {
          setTimeout(() => { accepted(endPoll()); activePoll = null }, 30000)
        }).then(accepted => {
          msg.channel.send(accepted)
        }).catch(rejected => {
          msg.channel.send(rejected)
        })
      }
    }
  }
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
}

module.exports = { poll, vote }