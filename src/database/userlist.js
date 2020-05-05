const mysql = require('mysql')
const { prefix, dblogin, dbpassword } = require('../../config.json')

let pool = mysql.createPool({
  connectionLimit: 10,
  host: 'remotemysql.com',
  user: `${dblogin}`,
  password: `${dbpassword}`,
  database: `${dblogin}`,
  multipleStatements: true,
})

const updateUser = (msg) => {
  if(msg.content.toLowerCase().startsWith(`${prefix} class`) && msg.content.split(' ')[1] === 'class') {
    const user = msg.author
    const userClass = msg.content.split(' ')[2]
    if(userClass === 'warrior' || userClass === 'rogue' || userClass === 'druid' || userClass === 'mage'){
      new Promise((accepted, rejected) => {
        pool.query(`INSERT INTO users VALUES(\'${user.id}\', \'${user.username}\', \'${userClass}\', 0, 0, 0, 0, 0, 0) ON DUPLICATE KEY UPDATE class = \'${userClass}\'`, (error) => {
          if(error) {
            console.log(error)
            rejected('Couldn\'t connect to the database, try again later')
          }
          else
            accepted(`${user} has changed his class, now fighting as a ${userClass}`)
        })
      }).then(accepted => {
        msg.channel.send(accepted)
      }).catch(rejected => {
        msg.channel.send(rejected)
      })
    }
    else
      msg.channel.send(`${user}, you idiot... Available classes are *warrior*, *mage*, *druid*, *rogue*, no other options! Type *bnn class classname*. If you want to find out what classes do type *bnn classinfo*`)
  }
}

const getUser = (user) => {
  return new Promise((accepted, rejected) => {
    pool.query(`SELECT * FROM users WHERE id = ${user.id}`, (error, results) => {
      if(error) {
        console.log(error)
        rejected('Couldn\'t connect to the database, try again later')
      }
      else {
        if(results[0]) {
          accepted(results[0])
        }
        else 
          rejected(`${user} is not a member of the fighting club! Tell this idiot to join by typing *bnn class classname* If you want to find out what classes do type *bnn classinfo*`)
      }
    })
  })
}

const afterFightUpdate = (winner, loser, prize) => {
  return new Promise((accepted, rejected) => {
    const up1 = `UPDATE users SET wins = wins + 1, winstreak = winstreak + 1, money = money + ${prize} WHERE id = \'${winner}\';`
    const up2 = `UPDATE users SET losses = losses + 1, winstreak = 0 WHERE id = \'${loser}\';`
    const sel = `SELECT winstreak FROM users WHERE id = \'${winner}\'`

    pool.query(up1 + up2 + sel, (error, results) => {
        if(error){
          console.log(error)
          rejected('Couldn\'t connect to the database, try again later')
        }
        else 
          accepted(results[2][0].winstreak)
    })
  })
}

const addBalance = (user, amount) => {
  return new Promise((accepted, rejected) => {
    const update = `UPDATE users SET money = money + ${amount} WHERE id = \'${user.id}\';`
    const select = `SELECT money FROM users WHERE id = \'${user.id}\';`
    pool.query(update + select, (error, results) => {
      if(error) {
        console.log(error)
        rejected('Couldn\'t connect to the database, try again later')
      }
      else {
        if(results[1][0])
          accepted(results[1][0].money)
        else
          rejected(`${user} you idiot, how do you want to earn money if you're not a member of the fighting club?! To join the club type *bnn class ...*. Available classess are *warrior*, *mage*, *druid*, *rogue*.`)
      } 
    })
  })
}

const addExperience = (user, amount, bought) => {
  return new Promise((accepted, rejected) => {
    let update = ''
    if(bought)
      update = `UPDATE users SET money = money - ${amount}, xp = xp + ${amount} WHERE id = \'${user.id}\';`
    else
      update = `UPDATE users SET xp = xp + ${amount} WHERE id = \'${user.id}\';`
    const select = `SELECT level, xp FROM users WHERE id = \'${user.id}\';`
    pool.query(update + select, (error, results) => {
      if(error) {
        console.log(error)
        rejected('Couldn\'t connect to the database, try again later')
      }
      else {
        if(results[1][0])
          accepted(results[1][0])
        else
          rejected(`${user} you idiot, how do you want to earn experience if you're not a member of the fighting club?! To join the club type *bnn class ...*. Available classess are *warrior*, *mage*, *druid*, *rogue*.`)
      } 
    })
  })
}

const levelUp = (user, newXp) => {
  return new Promise((accepted, rejected) => {
    const update = `UPDATE users SET level = level + 1, xp = ${newXp} WHERE id = \'${user.id}\';`
    const select = `SELECT level, xp FROM users WHERE id = \'${user.id}\';`
    pool.query(update + select, (error, results) => {
      if(error) {
        console.log(error)
        rejected('Couldn\'t connect to the database, try again later')
      }
      else {
        if(results[1][0])
          accepted(results[1][0])
        else
          rejected(`${user} you idiot, how do you want to earn experience if you're not a member of the fighting club?! To join the club type *bnn class ...*. Available classess are *warrior*, *mage*, *druid*, *rogue*.`)
      } 
    })
  })
}

const getTopTenList = (order) => {
  return new Promise((accepted, rejected) => {
    pool.query(`SELECT * FROM users ORDER BY ${order} DESC LIMIT 10`, (error, results) => {
      if(error) 
        rejected('Couldn\'t connect to the database, try again later')
      else if(results.length === 0)
        rejected('There are no fighters on this server yet! To join the club type *bnn class ...* To see what classes do type *bnn classinfo*')
      else 
        accepted(results)
    })
  })
}

module.exports = { updateUser, getUser, afterFightUpdate, addBalance, getTopTenList, addExperience, levelUp }