const mysql = require('mysql')
const { dblogin, dbpassword } = require('./config.json')

let connection = mysql.createConnection({
  host: 'remotemysql.com',
  user: `${dblogin}`,
  password: `${dbpassword}`,
  database: `${dblogin}`,
  multipleStatements: true,
})


// if connection ends, reconnect
connection.on('error', (error) => {
  console.log(error)
  connection = mysql.createConnection({
    host: 'remotemysql.com',
    user: `${dblogin}`,
    password: `${dbpassword}`,
    database: `${dblogin}`,
  })
})

const updateUser = (user, msg) => {
  const userClass = msg.split(' ')[2]
  if(userClass === 'warrior' || userClass === 'rogue' || userClass === 'druid' || userClass === 'mage'){
    return new Promise((accepted, rejected) => {
      connection.query(`INSERT INTO users VALUES(\'${user.id}\', \'${user.username}\', \'${userClass}\', 0, 0, 0, 0, 0) ON DUPLICATE KEY UPDATE class = \'${userClass}\'`, (error) => {
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
    connection.query(`SELECT * FROM users WHERE id = ${id}`, (errorMsg, results) => {
      if(errorMsg) {
        console.log(errorMsg)
        return error('Couldn\'t connect to the database, try again later')
      }
      else {
        if(results[0]) {
          return user(results[0])
        }
        else
          return user(null)
      }
    })
  })
}

const afterFightUpdate = (winner, loser) => {
  return new Promise((accepted, rejected) => {
    const up1 = `UPDATE users SET wins = wins + 1, winstreak = winstreak + 1 WHERE id = \'${winner}\';`
    const up2 = `UPDATE users SET losses = losses + 1, winstreak = 0 WHERE id = \'${loser}\';`
    const sel = `SELECT winstreak FROM users WHERE id = \'${winner}\'`

    connection.query(up1 + up2 + sel, (error, results) => {
        if(error){
          console.log(error)
          rejected('Couldn\'t connect to the database, try again later')
        }
        else 
          accepted(results[2][0].winstreak)
    })
  })
  
}

module.exports = { updateUser, getUser, afterFightUpdate }