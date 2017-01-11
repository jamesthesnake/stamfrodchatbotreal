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
          
          console.log(event.message.attachments[0].payload)
          
      }
      }
//      let att=  event.message.attachments[0]
   /*   
    if( event.message.attachments[0].type=="audio"){
          sendMovieMessage(sender)
          sendAudioMessage(sender,event)
          continue
      } 
      if( event.message.attachments[0].type=="location"){
         var lat = event.message.attachments[0].payload.coordinates.lat
          var lng = event.message.attachments[0].payload.coordinates.long
          console.log(lat,lng)
         sendLocationMessage(sender,event)
         continue
         
     }
/*
      if(event.message.attachments[0].type=="video") {
	  sendVideoMessage(sender)
	  continue
	  } */
      if (event.message && event.message.text) {
        let text =  event.message.text.toLowerCase()
        if (text === 'generic') {
            sendGenericMessage(sender)
            continue
        }
    
        else  if(text=="where am i"){
              sendLocationPlaceMessage(sender)
              continue 
          }
              
         else if(text=="movie"){
            sendMovieMessage(sender)
            continue
        }
	 else if (text=="avon"){
	     sendVideoMessage(sender)
	     continue
	 }
         else if(text=="restaurant"){
              sendResturantMessage(sender)
              continue
          }

        sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
      }
                        //  receivedPostback(event)
  
      if (event.postback) {
        let text = JSON.stringify(event.postback)
        sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
        continue
      }
    }
    res.sendStatus(200)
  })

const token ="EAAEPlSBXUQkBAAHTkk711owZA1ZBZBBLXuTSHL0IXDZAO9BhHqnmWO4qw1DfT7BzRCDOToVUku3Lmp472PGZBeFxCL200wUaIBDq3NC2GLTitqbqcUR7ZBBhmwKx9YLSils8fZBfnp4VV16XNvQCP3ZAZCHYGEoyoduZC82aq5Tx9TzAZDZD"
function sendTextMessage(sender, text) {
    let messageData = { text:text,
                     "quick_replies":[
      {
        "content_type":"location",
         }
                         ]
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
function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;
  console.log("bery")
  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.message.attachments.payload;

  console.log("Received postback for user %d and page %d with payload '%s'  " + 
    "at %d", senderID, recipientID,payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sende to 
  // let them know it was successful
  sendTextMessage(senderID, "Postback called");
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
function sendResturantMessage(sender){
    let messageData= {
     "attachment": {
            "type": "image",
            "payload": {
                url:"http://fairfieldmirror.com/wp-content/uploads/2014/06/colony-grill-300x200.jpg"
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
function sendVideoMessage(sender){
    let messageData={
	attachment: {
            "type": "video",
            "payload": {
		url: "https://lit-anchorage-71051.herokuapp.com/Thefile.mp4"
	    }    }
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
function sendLocationPlaceMessage(sender){
    let messageData = { text:"where are you?",
                     "quick_replies":[
      {
        "content_type":"location",
         }
                         ]
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
   request({url: "https://graph.facebook.com/v2.6/" +sender +"?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token="+token
     ,
    qs:{access_token:token},
    method: 'GET'
           })
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
function sendAudioMessage(sender,event){

    let messageData={
attachment: {
            "type": "audio",
            "payload": {
               url: event.message.attachments[0].payload.url
	}    }
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
function sendLocationMessage(sender,event){



  let messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": 'Location Shared By Bot',
          "subtitle": "Location Subtitle",
          "image_url": "https://maps.googleapis.com/maps/api/staticmap?key=" + "  AIzaSyBFwMNFL402Cy0KUwaSdxw1oXtCAo03MSs" +
          "&markers=color:red|label:B|" + event.message.attachments[0].payload.coordinates.lat + "," + event.message.attachments[0].payload.coordinates.long + "&size=360x360&zoom=13"
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