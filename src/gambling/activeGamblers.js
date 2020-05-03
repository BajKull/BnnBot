const activeGamblers = []

const isGambling = (user) => activeGamblers.find(gambler => gambler.id === user.id)

const alreadyGamblingMsg = (gambler) => {
  const userGame = gambler.game
  const game = {
    'highlow': `You are already playing highlow! Your current number is **${gambler.number}** and your stake is **${gambler.currentStake}**. Type **higher**, **lower** to continue the game or **finish** to take your money.`,
    'heist': `You are already attempting a heist! Prepare your gun instead of trying to gamble!`,
    'jackpot': `You are already participating in a jackpot, wait for it to end before gambling more!`
  }
  return game[userGame]
}

module.exports = { activeGamblers, isGambling, alreadyGamblingMsg }