const Discord = require('discord.js')
const { activeFights } = require('./activeFights.js')

const showItemsStats = (prevWeapon, prevShield, prevNecklace, weapon, shield, necklace, room) => {

  const at1 = `⚔️ ${prevWeapon.attack} => ${weapon.attack} ${(prevWeapon.attack > weapon.attack) ? '⚠️' : '✅'}`
  const at3 = `⚔️ ${prevNecklace.attack} => ${necklace.attack} ${(prevNecklace.attack > necklace.attack) ? '⚠️' : '✅'}`

  const ar2 = `🛡️ ${prevShield.armor} => ${shield.armor} ${(prevShield.armor > shield.armor) ? '⚠️' : '✅'}`
  const ar3 = `🛡️ ${prevNecklace.armor} => ${necklace.armor} ${(prevNecklace.armor > necklace.armor) ? '⚠️' : '✅'}`

  const hp2 = `❤️ ${prevShield.health} => ${shield.health} ${(prevShield.health > shield.health) ? '⚠️' : '✅'}`
  const hp3 = `❤️ ${prevNecklace.health} => ${necklace.health} ${(prevNecklace.health > necklace.health) ? '⚠️' : '✅'}`
  
  const msg = new Discord.MessageEmbed()
    .setColor([128, 0, 128])
    .setTitle(`SWORD                     SHIELD                      NECKLACE`)
    .setDescription(`${at1} \u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003 ${at3}\n\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003${ar2} \u2003\u2003\u2003 ${ar3}\n\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003${hp2} \u2003\u2003\u2003 ${hp3}`)
    .setFooter(`Type 1 to claim sword, type 2 to claim shield, type 3 to claim necklace`)

  room.send(msg)
}

const createReward = (user, room, fightIndex) => {
  let rewardGrade
  if(user.difficulty === 'easy') rewardGrade = 5 
  if(user.difficulty === 'medium') rewardGrade = 10
  if(user.difficulty === 'hard') rewardGrade = 15 


  const weapon = {
    name: "BF Sword",
    attack: rewardGrade * Math.floor(Math.random() * 6) + Math.floor(Math.random() * rewardGrade),
  }
  if(weapon.attack > 99)
    weapon.attack = 99
  const shield = {
    name: "Three ton tunic",
    armor: rewardGrade * Math.floor(Math.random() * 4) + Math.floor(Math.random() * rewardGrade),
    health: rewardGrade * Math.floor(Math.random() * 8) + Math.floor(Math.random() * rewardGrade),
  }
  if(shield.health > 99)
    shield.health = 99
  const necklace = {
    name: "Jade amulet",
    attack: rewardGrade * Math.floor(Math.random() * 2) + Math.floor(Math.random() * rewardGrade),
    armor: rewardGrade * Math.floor(Math.random() * 3) + Math.floor(Math.random() * rewardGrade),
    health: rewardGrade * Math.floor(Math.random() * 5) + Math.floor(Math.random() * rewardGrade),
  }
  activeFights[fightIndex][2].reward.weapon = weapon
  activeFights[fightIndex][2].reward.shield = shield
  activeFights[fightIndex][2].reward.necklace = necklace

  showItemsStats(user.weapon, user.shield, user.necklace, weapon, shield, necklace, room)
}

module.exports = { createReward }