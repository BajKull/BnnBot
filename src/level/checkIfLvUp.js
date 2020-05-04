const xpGoalPerLv = [500, 2500, 7000, 20000, 50000, 100000, 250000, 500000, 1000000, 2500000, 5000000, 10000000]

const checkIfLvUp = (level, xp) => {
  if(xpGoalPerLv[level - 1] < xp)
    return(xp - xpGoalPerLv[level - 1])
  else
    return null
}

module.exports = { checkIfLvUp, xpGoalPerLv }
