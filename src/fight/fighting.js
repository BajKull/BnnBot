const activeFights = []
const classes = ['warrior', 'mage', 'druid', 'rogue']

const { getUser, afterFightUpdate } = require('../database/userlist.js')
const { prefix } = require('../../config.json')

const Fetch = require('node-fetch')
// const Canvas = require('canvas')
const Discord = require('discord.js')

const fight = (msg) => {
  if(msg.content.startsWith(`${prefix} fight`)) {
    const player1 = msg.author
    const player2 = msg.mentions.users.first()
    if(isInFight(player1))
      msg.channel.send(`${player1}, you are already in a fight!`)
    else if(isInFight(player2))
      msg.channel.send(`${player2} is already in a fight, wait your turn or fight someone else!`)
    else if(player1 === player2)
      msg.channel.send(`You idiot! How do you want to fight yourself?`)
    else if(!player2)
      msg.channel.send('You must choose a player you want to fight. To do so type bnn fight @player')
    else {
      getUser(player1).then((fighter1) => {
        getUser(player2).then((fighter2) => {
          if(!fighter2)
            msg.channel.send(`${player2} is not a member of this fighting community. Tell this idiot to choose his class. To do so type *bnn class ...*. Available classess are *${getClassNames()}*.`)
          else {
            const user1 = {
              id: fighter1.id,
              name: fighter1.name,
              class: fighter1.class,
              phase: 'difficulty',
              difficulty: '',
              correctAnswer: '',
              defends: 0,
              stats: {
                attack: 0,
                armor: 0,
                health: 0,
                special: 0,
              },
              weapon: {
                name: 'null',
                attack: 0,
              },
              shield: {
                name: 'null',
                armor: 0,
                health: 0,
              },
              necklace: {
                name: 'null',
                attack: 0,
                armor: 0,
                health: 0,
              },
              avatar: null,
            }
  
            const user2 = Object.assign({}, user1)
            user2.id = fighter2.id
            user2.name = fighter2.name
            user2.class = fighter2.class
            user2.phase = 'opponent'
  
            const info = {
              reward: {
                weapon: null,
                shield: null,
                necklace: null,
              },
              round: 1,
              errors: 0,
              afkActions: 0,
              timer: setTimeout(() => abortFight(activeFights.length - 1, msg.channel, 2), 30000),
              battleTimer: null,
            }
  
            activeFights.push([user1, user2, info])
            loadAvatars(player1, player2, activeFights.length - 1)
            msg.channel.send(`${player1}, ${player2} prepare for your fight!. \nTrivia time! Answer your questions correctly and you will be awarded! \n${player1}, choose the difficulty level of question by typing: **easy**, **medium** or **hard**. The harder the question, the better the reward`)
          }
        }).catch(rejected => {
          msg.channel.send(rejected)
        })
      }).catch(rejected => {
        msg.channel.send(rejected)
      })
    }
  }
}

const isInFight = (player) => activeFights.find(fight => (fight[0].id === player.id || fight[1].id === player.id))

const getClassNames = () => classes.reduce((acc, name) =>  acc.concat(', ' + name))

const fightAction = (msg) => {
  const user = msg.author
  const message = msg.content
  if(isInFight(user)) {
    const fight = activeFights.find(fight => (fight[0].id === user.id || fight[1].id === user.id))
    const fightIndex = activeFights.indexOf(fight)
    const p = activeFights[fightIndex].find(fighter => fighter.id === user.id)
    const playerIndex = activeFights[fightIndex].indexOf(p)
    const opIndex = (playerIndex === 0) ? 1 : 0
  
    if(activeFights[fightIndex][playerIndex].phase === 'opponent')
      msg.channel.send(`${user} you idiot, wait your turn!`)
    else if(activeFights[fightIndex][playerIndex].phase === 'difficulty') {
      if(message === 'easy' || message === 'medium' || message === 'hard') {
        activeFights[fightIndex][playerIndex].difficulty = message
  
        Fetch(`https://opentdb.com/api.php?amount=1&difficulty=${message}&type=multiple`).then(res => res.json()).then(body => {
          const answers = [body.results[0].correct_answer, body.results[0].incorrect_answers[0], body.results[0].incorrect_answers[1], body.results[0].incorrect_answers[2]].sort(() => { return 0.5 - Math.random() })
          let correct = answers.indexOf(body.results[0].correct_answer)
          const showAnswers = answers.map((x, i) => {
            if(i === 0) return `**A**: ${x}`
            if(i === 1) return `**B**: ${x}`
            if(i === 2) return `**C**: ${x}`
            if(i === 3) return `**D**: ${x}`
          })
          if(correct === 0) correct = 'a'
          if(correct === 1) correct = 'b'
          if(correct === 2) correct = 'c'
          if(correct === 3) correct = 'd'
          clearTimeout(activeFights[fightIndex][2].timer)
          activeFights[fightIndex][2].timer = setTimeout(() => abortFight(activeFights.length - 1, room, 2), 60000)
          activeFights[fightIndex][playerIndex].phase = 'answer'
          activeFights[fightIndex][playerIndex].correctAnswer = correct
          msg.channel.send(`${user}, ${body.results[0].question.replace(/&quot;/gi, '')} \n${showAnswers.reduce((acc = '', ans) => { return acc.concat('\n' + ans)})}`)
        })
        .catch((error) => {
          console.log(error)
          if(activeFights[fightIndex][2].errors > 2)
            abortFight(fightIndex, msg.channel, errorCode = 1)
          else {
            msg.channel.send(`There was an error, trying to get your question, sorry, try again by typing **easy**, **medium** or **hard**`)
            activeFights[fightIndex][2].errors ++
          }
        })
      }
      else {
        msg.channel.send(`${user}, type **easy**, **medium** or **hard**. There are no other difficulty levels`)
        clearTimeout(activeFights[fightIndex][2].timer)
        activeFights[fightIndex][2].timer = setTimeout(() => abortFight(activeFights.length - 1, room, 2), 45000)
      }
    }
  
    else if(activeFights[fightIndex][playerIndex].phase === 'answer') {
      if(message === 'a' || message === 'b' || message === 'c' || message === 'd') {
        if(activeFights[fightIndex][playerIndex].correctAnswer === message) {
          activeFights[fightIndex][playerIndex].phase = 'reward'
          msg.channel.send(`Correct! You get to choose your reward! Type **1**, **2** or **3**`)
          createReward(activeFights[fightIndex][playerIndex], msg.channel, fightIndex)
        }
        else {
          msg.channel.send(`Incorrect! Correct answer: ${activeFights[fightIndex][playerIndex].correctAnswer.toUpperCase()}`) 
          activeFights[fightIndex][playerIndex].phase = 'opponent'
          changePlayer(fightIndex, playerIndex, msg.channel, false)
        }
      }
      else 
      msg.channel.send(`${user}, little brain freeze? Type **a**, **b**, **c** or **d**. There are no other answers`)
      
      clearTimeout(activeFights[fightIndex][2].timer)
      if(activeFights[fightIndex][2].round < 4)
        activeFights[fightIndex][2].timer = setTimeout(() => abortFight(activeFights.length - 1, msg.channel, 2), 60000)
      else
        activeFights[fightIndex][2].timer = setTimeout(() => changePlayer(fightIndex, playerIndex, msg.channel, true), 30000)
    }
  
    else if(activeFights[fightIndex][playerIndex].phase === 'reward') {
      if(message === '1' || message === '2' || message === '3') {
        if(message === '1') {
          msg.channel.send(`You chose ${activeFights[fightIndex][2].reward.weapon.name}`)
          activeFights[fightIndex][playerIndex].weapon = activeFights[fightIndex][2].reward.weapon
        }
        if(message === '2') {
          msg.channel.send(`You chose ${activeFights[fightIndex][2].reward.shield.name}`)
          activeFights[fightIndex][playerIndex].shield = activeFights[fightIndex][2].reward.shield
        }
        if(message === '3') {
          msg.channel.send(`You chose ${activeFights[fightIndex][2].reward.necklace.name}`)
          activeFights[fightIndex][playerIndex].necklace = activeFights[fightIndex][2].reward.necklace
        }
        activeFights[fightIndex][playerIndex].phase = 'opponent'
        changePlayer(fightIndex, playerIndex, msg.channel, false)
      }
      else
      msg.channel.send(`${user}, don't be too greedy... choose your reward by typing **1**, **2** or **3**`)
      
      clearTimeout(activeFights[fightIndex][2].timer)
      activeFights[fightIndex][2].timer = setTimeout(() => abortFight(activeFights.length - 1, msg.channel, 2), 60000)
    }
  
    else if(activeFights[fightIndex][playerIndex].phase === 'fight') {
      let fightOn = true
      if(message === 'attack' || message === 'defend' || message === 'rest') {
        if(message === 'attack') {
          const opponent = msg.channel.client.users.resolve(activeFights[fightIndex][opIndex].id)
          if(activeFights[fightIndex][opIndex].class === 'rogue' && Math.floor(Math.random() * 100) < activeFights[fightIndex][playerIndex].stats.special + Math.floor(Math.random() * 20)) {
            msg.channel.send(`${user} swings his sword but he's too slow for ${opponent} which **dodges** the attack`)
            fightOn = false
            changePlayer(fightIndex, playerIndex, msg.channel, false)
          }
          else {
            const attack = activeFights[fightIndex][playerIndex].stats.attack
            const defend = activeFights[fightIndex][opIndex].stats.armor
            let damage = attack - defend + Math.floor(Math.random() * 50);
            if(damage < 0)
              damage = 0  
            activeFights[fightIndex][opIndex].stats.health = activeFights[fightIndex][opIndex].stats.health - damage
            let health = activeFights[fightIndex][opIndex].stats.health
            if(health < 0)
              health = 0
    
            msg.channel.send(`${user} swings his sword at ${opponent} dealing **${damage} damage**! He's left with **${health} health**.`)
            if(isDead(activeFights[fightIndex][opIndex])) {
              finishFight(fightIndex, playerIndex, user, msg.channel)
              fightOn = false
            }
          } 
        }
        else if(message === 'defend') {
          if(activeFights[fightIndex][playerIndex].defends > 1) {
            msg.channel.send(`${user}, stop being a coward... take your sword and start attacking! Defend limit reached. You **loose** your **turn**.`)
            fightOn = false
            changePlayer(fightIndex, playerIndex, msg.channel, false)
          }
          else {
            activeFights[fightIndex][playerIndex].defends ++
            const armorUp = Math.floor(Math.random() * 35)
            activeFights[fightIndex][playerIndex].stats.armor += armorUp
            const armor = activeFights[fightIndex][playerIndex].stats.armor
            msg.channel.send(`${user} takes a defensive approach, raising his shield. His **armor increases** by **${armorUp}** which gives him a total of **${armor} armor**`)
          }
        }
        else {
          const healthUp = Math.floor(Math.random() * 50)
          activeFights[fightIndex][playerIndex].stats.health += healthUp
          const health = activeFights[fightIndex][playerIndex].stats.health
          msg.channel.send(`${user} takes a deep breath and refocuses. His **health increases** by **${healthUp}** which gives him a total of **${health} health**`)
          if(health > 500) {
            finishFight(fightIndex, playerIndex, user, msg.channel)
            fightOn = false
          }
        }
        if(fightOn) {
          if(Math.floor(Math.random() * 100) < activeFights[fightIndex][playerIndex].stats.special + Math.floor(Math.random() * 20)) {
            if(activeFights[fightIndex][playerIndex].class === 'warrior') {
              const armor = 10 + Math.floor(Math.random() * 20)
              activeFights[fightIndex][opIndex].stats.armor -= armor
              let armorAmount = activeFights[fightIndex][opIndex].stats.armor
              if(armorAmount < 0) {
                activeFights[fightIndex][opIndex].stats.armor = 0
                armorAmount = 0
              }
              msg.channel.send(`In addition ${user}, scratches opponents **armor** and **reduces** it by **${armor}**, which leaves his opponent at **${armorAmount} armor**!`)
            }
            else if(activeFights[fightIndex][playerIndex].class === 'mage') {
              const damage = 30 + Math.floor(Math.random() * 40)
              activeFights[fightIndex][opIndex].stats.health -= damage
              let healthAmount = activeFights[fightIndex][opIndex].stats.health
              if(healthAmount < 0) {
                activeFights[fightIndex][opIndex].stats.health = 0
                healthAmount = 0
              }
              msg.channel.send(`In addition ${user}, cast a fireball **dealing ${damage}** piercing **damage**, which leaves his opponent at **${healthAmount} health**!`)
              if(isDead(activeFights[fightIndex][opIndex])) {
                finishFight(fightIndex, playerIndex, user, msg.channel)
                fightOn = false
              }
            }
            else if(activeFights[fightIndex][playerIndex].class === 'druid') {
              const heal = 25 + Math.floor(Math.random() * 40)
              activeFights[fightIndex][playerIndex].stats.health += heal
              const health = activeFights[fightIndex][playerIndex].stats.health
              msg.channel.send(`In addition ${user}, summoned a duck which **healed** him for **${heal}**, which gives him **${health} health** in total!`)
              if(health > 500) {
                finishFight(fightIndex, playerIndex, user, msg.channel)
                fightOn = false
              }
            }
          }
          if(fightOn)
            changePlayer(fightIndex, playerIndex, msg.channel, false)
        }
  
      }
      else {
        msg.channel.send(`${user}, didn't anyone teach you how to fight? Type **attack**, **defend** or **rest**.`)
        clearTimeout(activeFights[fightIndex][2].timer)
        activeFights[fightIndex][2].timer = setTimeout(() => changePlayer(fightIndex, opIndex, room, true), 30000)
      }
    }
  }
}

const changePlayer = (fightIndex, playerIndex, room, afk) => {
  if(afk){
    activeFights[fightIndex][2].afkActions ++
    room.send(`Too slow! Skipping turn.`)
  }
  else
    activeFights[fightIndex][2].afkActions = 0
  if(activeFights[fightIndex][2].afkActions > 2)
    abortFight(fightIndex, room, 3)
  else {
    const round = activeFights[fightIndex][2].round
    const opIndex = (playerIndex === 0) ? 1 : 0
    let nextPlayer = room.client.users.resolve(activeFights[fightIndex][opIndex].id)

    if(round > 3) {
      activeFights[fightIndex][opIndex].phase = 'fight'
      activeFights[fightIndex][playerIndex].phase = 'opponent'
      room.send(`${nextPlayer}, it's your turn to act! Type **attack** to attack, **defend** to raise your shield or **rest** to gain some hp, be quick you have only 30 seconds!`)
      createCanvas(fightIndex, room)
      clearTimeout(activeFights[fightIndex][2].timer)
      activeFights[fightIndex][2].timer = setTimeout(() => changePlayer(fightIndex, opIndex, room, true), 30000)
    }
    else {
      if(opIndex === 1) {
        activeFights[fightIndex][opIndex].phase = 'difficulty'
        room.send(`${nextPlayer}, choose the difficulty level of question by typing: **easy**, **medium** or **hard**. The harder the question, the better the reward`)
      }
      else {
        activeFights[fightIndex][opIndex].phase = 'difficulty'
        activeFights[fightIndex][2].round ++
        if(activeFights[fightIndex][2].round > 3) {
          setStats(fightIndex)
          const startingPlayer = Math.floor(Math.random() * 2)
          if(startingPlayer === 0) {
            room.send(`Get ready maggots, it's fighting time!\n${nextPlayer} you get to go first! Type **attack** to attack, **defend** to raise your shield or **rest** to gain some hp, be quick you have only 30 seconds! **Kill** your opponent or get yourself up to **500 health** in order to **win**!`)
            activeFights[fightIndex][0].phase = 'fight'
            activeFights[fightIndex][1].phase = 'opponent'
          }
          else {
            nextPlayer = room.client.users.resolve(activeFights[fightIndex][playerIndex].id)
            room.send(`Get ready maggots, it's fighting time!\n${nextPlayer} you get to go first! Type **attack** to attack, **defend** to raise your shield or **rest** to gain some hp, be quick you have only 30 seconds! **Kill** your opponent or get yourself up to **500 health** in order to **win**!`)
            activeFights[fightIndex][0].phase = 'opponent'
            activeFights[fightIndex][1].phase = 'fight'
          }
          createCanvas(fightIndex, room)
          clearTimeout(activeFights[fightIndex][2].timer)
          activeFights[fightIndex][2].timer = setTimeout(() => changePlayer(fightIndex, playerIndex, room, true), 30000)
          activeFights[fightIndex][2].battleTimer = setTimeout(() => abortFight(fightIndex, room, errorCode = 3), 900000)
        }
        else
          room.send(`${nextPlayer}, choose the difficulty level of question by typing: **easy**, **medium** or **hard**. The harder the question, the better the reward`)
      }
    }
  }
}

const isDead = (player) => {
  return player.stats.health <= 0
}

const finishFight = (fightIndex, playerIndex, winner, room) => {
  const opPlayerIndex = (playerIndex === 0) ? 1 : 0
  const fighter1 = activeFights[fightIndex][playerIndex]
  const fighter2 = activeFights[fightIndex][opPlayerIndex]

  clearTimeout(activeFights[fightIndex][2].timer)
  clearTimeout(activeFights[fightIndex][2].battleTimer)
  activeFights.splice(fightIndex, 1)

  const prize = Math.floor(Math.random() * 30)

  afterFightUpdate(fighter1.id, fighter2.id, prize).then((winstreak) => {
    room.send(`Fight finished! ${winner} won with ${fighter1.stats.health} health left! He is on a **${winstreak} winstreak** and **earned ${prize}$**.`)
  }).catch((error) => {
    room.send(error)
  })
  
}

const abortFight = (fightIndex, room, errorCode) => {
  clearTimeout(activeFights[fightIndex][2].timer)
  clearTimeout(activeFights[fightIndex][2].battleTimer)
  activeFights.splice(fightIndex, 1)
  if(errorCode === 1)
    room.send(`Sorry, but the fight was interrupted by a filfthy gnmoe. That bastard stole your questions and ran away. Try starting another fight or wait untill the gnome is gone.`)
  else if (errorCode === 2)
    room.send(`Sorry, but you gotta act faster. My time is precious and limited. Fight over due to your reflexes.`)
  else if (errorCode === 3)
    room.send(`Okay, I'm done with you. Fight over due to your fighting speed. Next time act faster.`)
}

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

const displayClassStats = (msg) => {
  if(msg.content.startsWith(`${prefix} classinfo`)) {
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

const createCanvas = (fightIndex, room) => {
//   const canvas = Canvas.createCanvas(600, 400)
//   const context = canvas.getContext('2d')

//   const av1 = activeFights[fightIndex][0].avatar
//   const av2 = activeFights[fightIndex][1].avatar
//   context.drawImage(av1, 100, 20, 100, 100)
//   context.drawImage(av2, 400, 20, 100, 100)

//   context.font = '40px sans-serif';
//   context.fillStyle = '#ffffff'
//   context.fillText
//   (`
//   ⚔️  ${activeFights[fightIndex][0].stats.attack}-${activeFights[fightIndex][0].stats.attack + 50}
//   🛡️  ${activeFights[fightIndex][0].stats.armor}
//   ❤️  ${activeFights[fightIndex][0].stats.health}
//  `, 25, 150)

//   context.font = '40px sans-serif';
//   context.fillStyle = '#ffffff'
//   context.fillText
//   (`
//   ⚔️  ${activeFights[fightIndex][1].stats.attack}-${activeFights[fightIndex][1].stats.attack + 50}
//   🛡️  ${activeFights[fightIndex][1].stats.armor}
//   ❤️  ${activeFights[fightIndex][1].stats.health}
//  `, 325, 150) 

//   const attachment = new Discord.MessageAttachment(canvas.toBuffer())

//   room.send('', attachment)
}

const createCanvasItem = (prevWeapon, prevShield, prevNecklace, weapon, shield, necklace, room) => {
  // const canvas = Canvas.createCanvas(700, 300)
  // const context = canvas.getContext('2d')

  // context.font = '30px sans-serif'
  // context.fillStyle = '#ffffff'
  // context.fillText(`SWORD`, 30, 100)

  // context.font = '25px sans-serif'
  // context.fillText(`⚔️ ${prevWeapon.attack} => `, 15, 150)
  // context.fillStyle = (prevWeapon.attack > weapon.attack) ? '#e32b2b' : '#2be35c'
  // context.fillText(`${weapon.attack}`, 135, 150)

  // context.font = '30px sans-serif'
  // context.fillStyle = '#ffffff'
  // context.fillText(`SHIELD`, 230, 100)

  // context.font = '25px sans-serif'
  // context.fillText(`🛡️ ${prevShield.armor} => `, 215, 150)
  // context.fillStyle = (prevShield.armor > shield.armor) ? '#e32b2b' : '#2be35c'
  // context.fillText(`${shield.armor}`, 335, 150)
  // context.fillStyle = '#ffffff'
  // context.fillText(`❤️ ${prevShield.health} => `, 215, 200)
  // context.fillStyle = (prevShield.health > shield.health) ? '#e32b2b' : '#2be35c'
  // context.fillText(`${shield.health}`, 335, 200)

  // context.font = '30px sans-serif'
  // context.fillStyle = '#ffffff'
  // context.fillText(`NECKLACE`, 415, 100)

  // context.font = '25px sans-serif'
  // context.fillText(`⚔️ ${prevNecklace.attack} => `, 415, 150)
  // context.fillStyle = (prevNecklace.attack > necklace.attack) ? '#e32b2b' : '#2be35c'
  // context.fillText(`${necklace.attack}`, 535, 150)
  // context.fillStyle = '#ffffff'
  // context.fillText(`🛡️ ${prevNecklace.armor} => `, 415, 200)
  // context.fillStyle = (prevNecklace.armor > necklace.armor) ? '#e32b2b' : '#2be35c'
  // context.fillText(`${necklace.armor}`, 535, 200)
  // context.fillStyle = '#ffffff'
  // context.fillText(`❤️ ${prevNecklace.health} => `, 415, 250)
  // context.fillStyle = (prevNecklace.health > necklace.health) ? '#e32b2b' : '#2be35c'
  // context.fillText(`${necklace.health}`, 535, 250)

  // const attachment = new Discord.MessageAttachment(canvas.toBuffer())

  // room.send('', attachment)
}

async function loadAvatars(user1, user2, fightIndex) {
  // activeFights[fightIndex][0].avatar = await Canvas.loadImage(user1.client.users.resolve(user1.id).displayAvatarURL({ format: 'jpg' }))
  // activeFights[fightIndex][1].avatar = await Canvas.loadImage(user2.client.users.resolve(user2.id).displayAvatarURL({ format: 'jpg' }))
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

  createCanvasItem(user.weapon, user.shield, user.necklace, weapon, shield, necklace, room)
}

module.exports = { fight, isInFight, getClassNames, fightAction, displayClassStats }

