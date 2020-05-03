const Fetch = require('node-fetch')
const Discord = require('discord.js')

const { flickrapi } = require('../../config.json')
const { isAnimal } = require('./animals.js')
const { prefix } = require('../../config.json')

const getImage = (msg) => {
  if(msg.content.startsWith(`${prefix} pic`) && msg.content.split(' ')[1] !== 'piclist') {
    const animal = msg.content.split(' ')[2]
    if(isAnimal(animal)) {    
      new Promise(accepted => {
        searchLink(animal).then(link => {
          if(link) {
            const picture = new Discord.MessageEmbed()
              .setImage(link)
              .setColor([128, 0, 128])
              accepted(picture)
          }
        }).catch(error => {
          msg.channel.send(error)
        })
      }).then(accepted => {
        msg.react('🦆')
        msg.channel.send(accepted)
      }).catch(rejected => {
        msg.channel.send(rejected)
      })
    }
    else
      msg.channel.send(`Not on list :duck:. Type **bnn pic *animal***. Not every animal is listed though. Type *bnn piclist* to see available animals.`)
  }
}

const searchLink = (image) => {
  const amount = 300
  const url = 'https://www.flickr.com/services/rest/?method=flickr.photos.search&'
  const params = `api_key=${flickrapi}&text=${image}&sort=relevance&content_type=1&accuracy=1&media=photos&format=json&nojsoncallback=1&per_page=${amount}`
  const link = url + params
  const imageIndex = Math.floor(Math.random() * amount)

  return new Promise ((accepted, rejected) => {
    Fetch(link).then(result => result.json()).then(body => {
      const photo = body.photos.photo[imageIndex]
      const link = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`
      if(photo)
        accepted(link)
      else
        rejected(`Couldn\'t connect to the database, try again later`)
    })
  })
}

module.exports = { getImage }