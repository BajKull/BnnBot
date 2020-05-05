const { getClassStats } = require('./displayClassStats.js')
const { activeFights } = require('./activeFights.js')

const setStats = (fightIndex) => {
  const p1 = activeFights[fightIndex][0]
  const stats1 = getClassStats(p1.class)
  stats1.attack = stats1.attack + p1.weapon.attack + p1.necklace.attack
  stats1.armor = stats1.armor + p1.shield.armor + p1.necklace.armor
  stats1.health = stats1.health + p1.shield.health + p1.necklace.health
  activeFights[fightIndex][0].stats = stats1

  
  const p2 = activeFights[fightIndex][1]
  const stats2 = getClassStats(p2.class)
  stats2.attack = stats2.attack + p2.weapon.attack + p2.necklace.attack
  stats2.armor = stats2.armor + p2.shield.armor + p2.necklace.armor
  stats2.health = stats2.health + p2.shield.health + p2.necklace.health
  activeFights[fightIndex][1].stats = stats2
}

module.exports = { setStats }