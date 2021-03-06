const { activeFights } = require('./activeFights.js')

const { getUser } = require('../database/userlist.js')
const { prefix } = require('../../config.json')
const { createReward } = require('./showItemStats.js')
const { showFightingStats } = require('./showFightingStats.js')
const { finishFight } = require('./finishFight.js')
const { setStats } = require('./setStats.js')
const { getClassNames } = require('./getClassNames')

const Fetch = require('node-fetch')

const isInFight = (player) => activeFights.find(fight => (fight[0].id === player.id || fight[1].id === player.id))

const isDead = (player) => player.stats.health <= 0

const fight = (msg) => {
  if(msg.content.toLowerCase().startsWith(`${prefix} fight`)) {
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
              level: fighter1.level,
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
            }
  
            const user2 = Object.assign({}, user1)
            user2.id = fighter2.id
            user2.name = fighter2.name
            user2.class = fighter2.class
            user2.phase = 'opponent'
            user2.level = fighter2.level
  
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

const fightAction = (msg) => {
  const user = msg.author
  const message = msg.content.toLowerCase()
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
      let feedback = ''
      if(message === 'attack' || message === 'defend' || message === 'rest') {
        if(message === 'attack') {
          const opponent = msg.channel.client.users.resolve(activeFights[fightIndex][opIndex].id)
          if(activeFights[fightIndex][opIndex].class === 'rogue' && Math.floor(Math.random() * 100) < activeFights[fightIndex][playerIndex].stats.special + Math.floor(Math.random() * 20)) {
            feedback += `${user} swings his sword but he's too slow for ${opponent} which **dodges** the attack`
            fightOn = false
            changePlayer(fightIndex, playerIndex, msg.channel, false, feedback)
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
    
            feedback += `${user} swings his sword at ${opponent} dealing **${damage} damage**! He's left with **${health} health**.`
            if(isDead(activeFights[fightIndex][opIndex])) {
              finishFight(fightIndex, playerIndex, user, msg.channel, feedback)
              fightOn = false
            }
          } 
        }
        else if(message === 'defend') {
          if(activeFights[fightIndex][playerIndex].defends > 1) {
            feedback += `${user}, stop being a coward... take your sword and start attacking! Defend limit reached. You **loose** your **turn**.`
            fightOn = false
            changePlayer(fightIndex, playerIndex, msg.channel, false, feedback)
          }
          else {
            activeFights[fightIndex][playerIndex].defends ++
            const armorUp = Math.floor(Math.random() * 35)
            activeFights[fightIndex][playerIndex].stats.armor += armorUp
            const armor = activeFights[fightIndex][playerIndex].stats.armor
            feedback += `${user} takes a defensive approach, raising his shield. His **armor increases** by **${armorUp}** which gives him a total of **${armor} armor**`
          }
        }
        else {
          const healthUp = Math.floor(Math.random() * 50)
          activeFights[fightIndex][playerIndex].stats.health += healthUp
          const health = activeFights[fightIndex][playerIndex].stats.health
          feedback += `${user} takes a deep breath and refocuses. His **health increases** by **${healthUp}** which gives him a total of **${health} health**`
          if(health > 500) {
            finishFight(fightIndex, playerIndex, user, msg.channel, feedback)
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
              feedback += `\nIn addition ${user}, scratches opponents **armor** and **reduces** it by **${armor}**, which leaves his opponent at **${armorAmount} armor**!`
            }
            else if(activeFights[fightIndex][playerIndex].class === 'mage') {
              const damage = 30 + Math.floor(Math.random() * 40)
              activeFights[fightIndex][opIndex].stats.health -= damage
              let healthAmount = activeFights[fightIndex][opIndex].stats.health
              if(healthAmount < 0) {
                activeFights[fightIndex][opIndex].stats.health = 0
                healthAmount = 0
              }
              feedback += `\nIn addition ${user}, cast a fireball **dealing ${damage}** piercing **damage**, which leaves his opponent at **${healthAmount} health**!`
              if(isDead(activeFights[fightIndex][opIndex])) {
                finishFight(fightIndex, playerIndex, user, msg.channel, feedback)
                fightOn = false
              }
            }
            else if(activeFights[fightIndex][playerIndex].class === 'druid') {
              const heal = 25 + Math.floor(Math.random() * 40)
              activeFights[fightIndex][playerIndex].stats.health += heal
              const health = activeFights[fightIndex][playerIndex].stats.health
              feedback += `\nIn addition ${user}, summoned a duck which **healed** him for **${heal}**, which gives him **${health} health** in total!`
              if(health > 500) {
                finishFight(fightIndex, playerIndex, user, msg.channel, feedback)
                fightOn = false
              }
            }
          }
          if(fightOn)
            changePlayer(fightIndex, playerIndex, msg.channel, false, feedback)
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

const changePlayer = (fightIndex, playerIndex, room, afk, text = '') => {
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
      const displayText = `${text}\n${nextPlayer}, it's your turn to act! Type **attack** to attack, **defend** to raise your shield or **rest** to gain some hp, be quick you have only 30 seconds!`
      showFightingStats(fightIndex, room, displayText)
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
          showFightingStats(fightIndex, room)
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

module.exports = { fight, isInFight, fightAction }

