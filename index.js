const Discord = require('discord.js')
const { token } = require('./config.json')
// const { functions } = require('./functions.js')

const client = new Discord.Client()

client.once('ready', () => {
  client.user.setActivity("bnn help")
  console.log("ready")
})

// client.on('message', message => {
//   functions.forEach(fun => fun(message))
// })

client.login(token)