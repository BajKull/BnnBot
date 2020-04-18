const mysql = require('mysql')
const { dblogin, dbpassword } = require('./config.json')

let connection 

connection = mysql.createConnection({
  host: 'remotemysql.com',
  user: `${dblogin}`,
  password: `${dbpassword}`,
  database: `${dblogin}`,
})


// if connection ends, reconnect
connection.on('error', (error) => {
  console.log(error)
})

const updateUser = (user, msg) => {
  const userClass = msg.split(' ')[2]
  if(userClass === 'warrior' || userClass === 'rogue' || userClass === 'druid' || userClass === 'mage'){
    return new Promise((accepted, rejected) => {
      connection.connect()
      connection.query(`SELECT * FROM users WHERE id = ${user.id}`, (error, results) => {
        if(error) {
          console.log(error)
          rejected('Couldn\'t connect to the database, try again later')
        }
        // if user exists change his class
        if(results[0]) {
          connection.query(`UPDATE users SET class = \'${userClass}\' WHERE id = ${user.id}`, (error) => {
            if(error) {
              console.log(error)
              rejected('Couldn\'t connect to the database, try again later')
            }
            else
              accepted(`${user} has changed his class, now fighting as a ${userClass}`)
          })
        }
        // if user doesnt exist, create him
        else {
          connection.query(`INSERT INTO users VALUES (\'${user.id}\', \'${user.username}\', \'${userClass}\', 0, 0, 0, 0, 0)`, (error) => {
            if(error) {
              console.log(error)
              rejected('Couldn\'t connect to the database, try again later')
            }
            else
              accepted(`${user} has joined the fighting club as a ${userClass}. Type bnn fight @user to fight someone!`)
          })
        }
      })
      connection.end()
  })
  }
  else
    return new Promise((error) => {
      error(`${user}, you idiot... There are only classes such as: *warrior*, *mage*, *druid*, *rogue*, no other options! If you want to find out what classes do type *bnn classinfo*`)
    })
}

const getUser = (id) => {
  return new Promise((user, error) => {
    connection.connect()
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
    connection.end()
  })
}

const afterFightUpdate = (winner, loser) => {
  connection.connect()
  connection.query(`UPDATE users SET wins = wins + 1, winstreak = winstreak + 1 WHERE id = ${winner}`, (error) => {
    if(error)
      console.log(error)
  })
  connection.query(`UPDATE users SET losses = losses + 1, winstreak = 0 WHERE id = ${loser}`, (error) => {
    if(error)
      console.log(error)
  })
  connection.end()
  return new Promise((winstreak, error) => {
    getUser(winner).then((user) => {
      winstreak(user.winstreak)
    }).catch((errorMsg) => {
      console.log(errorMsg)
      error('Couldn\'t connect to the database, try again later')
    })
  })
  
}

module.exports = { updateUser, getUser, afterFightUpdate }