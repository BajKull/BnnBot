const Discord = require('discord.js')
const Fetch = require('node-fetch')
const { prefix } = require('../../config.json')

const getRedditImage = (msg) => {
  if(msg.content.toLowerCase().startsWith(`${prefix} porn`)) {
    const subreddits = ['foodporn', 'food', 'pizza', 'baking']
    const index = Math.floor(Math.random() * subreddits.length)
    const url = `https://www.reddit.com/r/${subreddits[index]}.json?sort=top&t=day&limit=75`
  
    new Promise((accepted, rejected) => {
        Fetch(url).then(results => results.json()).then(body => {
          const links = body.data.children.filter(post => {
            if(post.data.url.endsWith('.jpg') || post.data.url.endsWith('.png') || post.data.url.endsWith('.gif') || post.data.url.endsWith('.bmp') || post.data.url.endsWith('.jpeg'))
              return true
            else
              return false
          })
          const index = Math.floor(Math.random() * links.length)
          const image = links[index].data.url
          const title = links[index].data.title
          const output = new Discord.MessageEmbed()
            .setColor([128, 0, 128])
            .setAuthor(msg.author.username, msg.author.displayAvatarURL())
            .setImage(image)
            .setTitle(title)
          accepted(output)
        }).catch(error => {
          rejected(`Couldn\'t connect to the database, try again later`)
        })
      }).then(accepted => {
        msg.channel.send(accepted)
      }).catch(rejected => {
        msg.channel.send(rejected)
      })
  }
}

module.exports = { getRedditImage }