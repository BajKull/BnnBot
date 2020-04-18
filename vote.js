let activePoll = null

const isPollActive = () => activePoll

const vote = (user) => {

}

const createPoll = (option1, option2) => {
  if(activePoll)
    return (`There's already a poll created, wait your turn!`)
  
    activePoll = {
    option1: option1,
    option2: option2,
    o1score: 0,
    o2score: 0,
    timer: setTimeout(() => endPoll(activePoll)),
    voted: []
  }
}

const endPoll = (poll) => {

}