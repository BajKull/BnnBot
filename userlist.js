const mysql = require('mysql')
const { dblogin, dbpassword } = require('./config.json')

let pool = mysql.createPool({
  connectionLimit: 10,
  host: 'remotemysql.com',
  user: `${dblogin}`,
  password: `${dbpassword}`,
  database: `${dblogin}`,
  multipleStatements: true,
})


// if connection ends, reconnect
// connection.on('error', (error) => {
//   console.log(error)
//   connection = mysql.createConnection({
//     host: 'remotemysql.com',
//     user: `${dblogin}`,
//     password: `${dbpassword}`,
//     database: `${dblogin}`,
//   })
// })

const updateUser = (user, msg) => {
  const userClass = msg.split(' ')[2]
  if(userClass === 'warrior' || userClass === 'rogue' || userClass === 'druid' || userClass === 'mage'){
    return new Promise((accepted, rejected) => {
      pool.query(`INSERT INTO users VALUES(\'${user.id}\', \'${user.username}\', \'${userClass}\', 0, 0, 0, 0, 0, 0) ON DUPLICATE KEY UPDATE class = \'${userClass}\'`, (error) => {
        if(error) {
          console.log(error)
          rejected('Couldn\'t connect to the database, try again later')
        }
        else
          accepted(`${user} has changed his class, now fighting as a ${userClass}`)
      })
    })
  }
  else
    return new Promise((error) => {
      error(`${user}, you idiot... Available classes are *warrior*, *mage*, *druid*, *rogue*, no other options! Type bnn class *classname*. If you want to find out what classes do type *bnn classinfo*`)
    })
}

const getUser = (id) => {
  return new Promise((user, error) => {
    pool.query(`SELECT * FROM users WHERE id = ${id}`, (errorMsg, results) => {
      if(errorMsg) {
        console.log(errorMsg)
        error('Couldn\'t connect to the database, try again later')
      }
      else {
        if(results[0]) {
          user(results[0])
        }
        else
          user(null)
      }
    })
  })
}

const afterFightUpdate = (winner, loser) => {
  return new Promise((accepted, rejected) => {
    const up1 = `UPDATE users SET wins = wins + 1, winstreak = winstreak + 1 WHERE id = \'${winner}\';`
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

module.exports = { updateUser, getUser, afterFightUpdate, addBalance }