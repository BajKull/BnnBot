const users = []

const addUser = (user, userClass) => {
  const player = {
    id: user.id,
    name: user.username,
    class: userClass,
    level: 0,
    wins: 0,
    losses: 0,
    winstreak: 0
  }
  users.push(player)
}

const updateUser = (user, userClass) => {
  if(userClass === 'warrior' || userClass === 'rogue' || userClass === 'druid' || userClass === 'mage'){
    const u = users.find(player => player.id === user.id)
    const index = users.indexOf(u)


    if(index !== -1) {
      users[index].class = userClass
      return(`${user} has changed his class, now fighting as a ${userClass}`)
    }
    else {
      addUser(user, userClass)
      return(`${user} has joined the fighting club as a ${userClass}. Type *bnn fight @user* to fight someone!`)
    }
  }
  else
    return(`${user}, you idiot... There are only classes such as: *warrior*, *mage*, *druid*, *rogue*, no other options!`)
}

const getUser = (id) => {
  return users.find(user => user.id === id)
}

const afterFightUpdate = (winner, loser) => {
  const index1 = users.findIndex(el => el.id === winner)
  const index2 = users.findIndex(el => el.id === loser)
  users[index1].wins ++
  users[index1].winstreak ++
  users[index2].losses ++
  users[index2].winstreak = 0

  return users[index1].winstreak
}

module.exports = { updateUser, getUser, afterFightUpdate }