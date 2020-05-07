const { prefix } = require('../../config.json')
const { getClassNames } = require('./getClassNames.js')

const getClassStats = (str) => {
  if(str === 'warrior')
    return {health: 190, attack: 20, armor: 20, special: 20}
  else if(str === 'rogue')
    return {health: 140, attack: 25, armor: 15, special: 15}
  else if(str === 'druid')
    return {health: 215, attack: 15, armor: 25, special: 20}
  else if(str === 'mage')
    return {health: 170, attack: 20, armor: 10, special: 25}
  else
    return null
}

const displayClassStats = (msg) => {
  if(msg.content.toLowerCase().startsWith(`${prefix} classinfo`)) {
    const name = msg.content.split(' ')[2]
    const classStats = getClassStats(name)
    if(name === 'warrior')
      msg.channel.send(`Warrior, attack: ${classStats.attack}-${classStats.attack + 50}, armor: ${classStats.armor}, health: ${classStats.armor}, special: ${classStats.special}-${classStats.special + 20}% to break 10-30 opponent's armor.`)
    else if(name === 'rogue')
      msg.channel.send(`Rogue, attack: ${classStats.attack}-${classStats.attack + 50}, armor: ${classStats.armor}, health: ${classStats.armor}, special: ${classStats.special}-${classStats.special + 20}% to dodge opponent's attack.`)
    else if(name === 'mage')
      msg.channel.send(`Mage, attack: ${classStats.attack}-${classStats.attack + 50}, armor: ${classStats.armor}, health: ${classStats.armor}, special: ${classStats.special}-${classStats.special + 20}% to cast a fireball, dealing 30-70 opponent's piercing damage.`)
    else if(name === 'druid')
      msg.channel.send(`Druid, attack: ${classStats.attack}-${classStats.attack + 50}, armor: ${classStats.armor}, health: ${classStats.armor}, special: ${classStats.special}-${classStats.special + 20}% to heal for 25-65.`)
    else if(name === 'all') {
      const warrior = getClassStats('warrior')
      const mage = getClassStats('mage')
      const druid = getClassStats('druid')
      const rogue = getClassStats('rogue')
      msg.channel.send(`\`\`\`
              warrior      mage      druid      rogue
  attack        ${warrior.attack}          ${mage.attack}        ${druid.attack}         ${rogue.attack}
  armor         ${warrior.armor}          ${mage.armor}        ${druid.armor}         ${rogue.armor}
  health        ${warrior.health}          ${mage.health}        ${druid.health}         ${rogue.health}
  
  special      ${warrior.special}-${warrior.special+20}%      ${mage.special}-${mage.special + 20}%    ${druid.special}-${druid.special + 20}%     ${rogue.special}-${rogue.special + 20}%
               reduce      deal      heal       dodge
               armor       dmg       up         attack
  \`\`\``)
    }
    else
      msg.channel.send(`Invalid classname. Type bnn classinfo class. Available classes: *${getClassNames()}* or **all**`)
  }
}

module.exports = { displayClassStats, getClassStats }