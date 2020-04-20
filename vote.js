let activePoll = null

const isPollActive = () => activePoll

const vote = (user, msg) => {
  const option = msg.split(' ')[2]
  if(activePoll) {
    if(voted.find(user.id))
      return ('You can\'t vote twice!')
    const index = activePoll.options.indexOf(el => el.option === option)
    if(index) {
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
    return('There is no poll active at the moment! Type bnn poll *option1* *option2*... to create a poll. Max 20 options.')
}

const poll = (msg) => {
  const options = msg.split(' ').splice(0, 2)

  return new Promise((accepted, rejected) => {
    if(options.length < 2)
      rejected('You have to give at least 2 options for the poll! Type bnn poll *option1* *option2* ... to create a poll. Max 20 options.')
    if(options.length > 20)
      rejected('Max 20 options!')
    if(activePoll) 
      rejected(`A poll is already carried out, wait your turn!`)
   
    activePoll = {
      options: options.map(option => {return {option: option, votes: 0}}),
      voted: []
    }

    accepted('Poll created! Type bnn vote *option* or bnn vote *number* in order to vote. For example *bnn vote ducks*, *bnn vote 2*')

    setTimeout(() => {
      accepted(endPoll())
    }, 5000)
  })
}

const endPoll = () => {
  const max = 0
  const option = 0
  for(let i = 0; i < activePoll.options.length; i++) {
    if(activePoll.options[i].votes > max) {
      max = activePoll.options[i].votes
      option = activePoll.options[i].option
    }
  }
  activePoll = null
  return (`Poll closed! Option: ${option} won with ${max} votes!`)
}

module.exports = { poll, vote }