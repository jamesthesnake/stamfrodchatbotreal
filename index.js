'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
    const crypto = require('crypto')

const ACR_ACCESS_KEY = "745d60c0b2946484f815a7607e08274b"
const ACR_ACCESS_SECRET = 'xUzTAn4AlZq6WPS8fdnKP3aLIYvLH1U2KqFXKYrR'
const ACR_HOST = 'ap-southeast-1.api.acrcloud.com'
class Bot {
    
  getProfile (id, cb) {
    return request({
      method: 'GET',
      uri: `https://graph.facebook.com/v2.6/${id}`,
      qs: this._getQs({fields: 'first_name,last_name,profile_pic,locale,timezone,gender'}),
      json: true
    })
    .then(body => {
      if (body.error) return Promise.reject(body.error)
      if (!cb) return body
      cb(null, body)
    })
    .catch(err => {
      if (!cb) return Promise.reject(err)
      cb(err)
    })
  }
    
}
app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})
  

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i]
      let sender = event.sender.id
     console.log("plus")
      if(event.message){
      console.log("tim")
      console.log(event)
      if(event.message.attachments){
          console.log("jenny")
          console.log(event)
          
          console.log(event.message.attachments[0].type)
          
      }
      }
//      let att=  event.message.attachments[0]

      /*if(event.message.attachhments && event.message.attachments[0].type=="audio"){
          sendMovieMessage(sender)
          sendAudioMessage(sender,att)
          continue
      } 
     else if(event.message.attachments && event.message.attachments[0].type=="location"){
         var lat = event.message.attachments[0].payload.coordinates.lat
          var lng = event.message.attachments[0].payload.coordinates.long
          console.log(lat,lng)
         sendLocationMessage(sender)
         continue
         
     } */
      if (event.message && event.message.text) {
        let text = event.message.text
        if (text === 'Generic') {
            sendGenericMessage(sender)
            sendNameMessage(sender)
            continue
        }
          if(text=="movie"){
            sendMovieMessage(sender)
            continue
        }
        sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
      }
        
      if (event.postback) {
        let text = JSON.stringify(event.postback)
        sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
        continue
      }
    }
    res.sendStatus(200)
  })

const token = "EAAEPlSBXUQkBAMhn8Xlp5sg7RWP4DpCNIqy9ZCbZA6MS3e5Ay5c7cfqBlDO3kTsl3ahZAVZArJ3a77izmA2HyhNocEXA9SDuvcKki1JySIitu2AGyXAoLbCpodCWInYZBE7owDl46jODbhrV064myHZBQKVki1AmYunuYZAqNIDEQZDZD"
function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
function recognizeSong (opts, cb) {
  let attachment = opts.message.attachments[0]

  request({
	  uri: attachment.payload.url,
	  method: 'GET',
	  encoding: null
      }, (err, res, audio) => {
	  if (err) return cb(err)

		       let timestamp = Date.now()
		       let signingString = `POST\n/v1/identify\n${opts.key}\naudio\n1\n${timestamp}`
	  let signature = crypto.createHmac('sha1', opts.secret).update(new Buffer(signingString, 'utf-8')).digest('base64')
	  request({
		  uri: `http://${opts.host}/v1/identify`,
		  method: 'POST',
		  formData: {
		      access_key: opts.key,
		      data_type: 'audio',
		      sample_bytes: audio.length,
		      sample: audio,
		      signature_version: 1,
		      signature: signature,
		      timestamp: timestamp
		  },
		  json: true
	      }, (err, res, body) => {
		  if (err) return cb(err)

			       if (body.status.code !== 0) {
				   return cb({message: 'NO_MATCH'})
			       }

      let song = body.metadata.music[0]
		  if (song.external_metadata && song.external_metadata.spotify) {
		      request({
			      uri: `https://api.spotify.com/v1/tracks/${song.external_metadata.spotify.track.id}`,
			      method: 'GET',
			      json: true
			  }, (err, res, body) => {
			      if (err) return cb(err)

					   return cb(null, {
						   title: song.title,
						   artist: song.artists[0].name,
						   album_art: body.album.images[0].url,
						   spotify: body.external_urls.spotify,
						   youtube: (song.external_metadata.youtube ? `https://www.youtube.com/watch?v=${song.external_metadata.youtube.vid}` : null)
							     })
					       })
			  } else {
			  return cb(null, {
				  title: song.title,
				  artist: song.artists[0].name
			      })
		      }
		  })
	      })
      }

function sendSICMessage(sender) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                        "title": "Stamford Innovation Center",
                        "subtitle": "The place to be",
                        "image_url": "http://www.greenwichypg.com/wp-content/uploads/2016/01/Stamford-Innovation-Center.png",
                        "buttons": [{
                                "type": "web_url",
                                "url": "http://stamfordicenter.com/",
                                "title": "stamford innovation center"
                            }, {
                                "type": "postback",
                                "title": "Postback",
                                "payload": "Payload for first element\
 in a generic bubble",
                            }],
                    }, {
                        "title": "Contact info",
"subtitle": "203-226-8701 is the phone number",
    "image_url": "http://imgur.com/erlRUPO.png",
    "buttons": [{
	"type": "postback",
	    "title": "Postback",
	    "payload": "Payload for second elemen\
t in a generic bubble",
	    }],
    }]
	}
}
}


request({
	url: 'https://graph.facebook.com/v2.6/me/messages',
	    qs: {access_token:token},
	    method: 'POST',
	    json: {
	    recipient: {id:sender},
		message: messageData,
		}
    }, function(error, response, body) {
	if (error) {
	    console.log('Error sending messages: ', error)
		} else if (response.body.error) {
	    console.log('Error: ', response.body.error)
		}
    })
    } 
function sendGenericMessage(sender) {
    console.log("yolo")
    console.log("https://graph.facebook.com/v2.6/" +sender +"?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token="+token)
 
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "First card",
                    "subtitle": "Element #1 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.messenger.com",
                        "title": "web url"
                    }, {
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for first element in a generic bubble",
                    }],
                }, {
                    "title": "Second card",
                    "subtitle": "Element #2 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
                    "buttons": [{
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for second element in a generic bubble",
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
function sendNameMessage(sender){
   let pares=  app.get( "https://graph.facebook.com/v2.6/" +sender +"?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token="+token
     ,function(response){response.setEncoding('utf8')  
  response.on('data', console.log)  
  response.on('error', console.error)  })
   let messageData={text:pares.gender}
   request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
    
}
function sendAudioMessage(sender,att){

    let messageData={
        text:"you sent audio "
    }
     request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
function sendLocationMessage(sender){

    let messageData={
        text:"you sent location "
    }
    
     request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
    
function sendMovieMessage(sender){
    let messageData={
        text:"The movie theater is at Landmark Square, Stamford, CT 06901, 118 Summer St, Stamford, CT 06901, and at 272 Bedford St, Stamford, CT 06901 ."
    }
    request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {access_token:token},
                method: 'POST',
                json: {
                recipient: {id:sender},
                    message: messageData,
                    }
        }, function(error, response, body) {
            if (error) {
                console.log('Error sending messages: ', error)
                    } else if (response.body.error) {
                console.log('Error: ', response.body.error)
                    }
        })

        }