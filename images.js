const Fetch = require('node-fetch')
const Discord = require('discord.js')
const Canvas = require('canvas')

const { flickrapi } = require('./config.json')

const getImage = (msg) => {
  let image = msg.split(' ')[2]
  
  return new Promise((accept, error) => {
    searchLink(image).then(link => {
      if(link) {
        // const canvas = Canvas.createCanvas(600, 600)
        // const context = canvas.getContext('2d')
        // const picture = Canvas.loadImage(link)
        // picture.then(response => {
        //   context.drawImage(response, 0, 0, 600, 600)
        //   accept(canvas.toBuffer())
        // })
        // console.log(link)
        const picture = new Discord.MessageEmbed()
          .setImage(link)
        accept(picture)
      }
      else {
        error(`Couldn\'t connect to the database, try again later`)
      }
    })
  })

}

const searchLink = (image) => {
  const amount = 300
  const url = 'https://www.flickr.com/services/rest/?method=flickr.photos.search&'
  const params = `api_key=${flickrapi}&text=${image}&sort=relevance&content_type=1&accuracy=1&media=photos&format=json&nojsoncallback=1&per_page=${amount}`
  const link = url + params
  const imageIndex = Math.floor(Math.random() * amount)

  return new Promise ((accept, error) => {
    Fetch(link).then(result => result.json()).then(body => {
      const photo = body.photos.photo[imageIndex]
      const link = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`
      if(photo)
        accept(link)
      else
        error(null)
    })
  })
}

module.exports = { getImage }