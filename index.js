//push
var express = require('express')
    var bodyParser = require('body-parser')
    var request = require('request')
    var app = express()

    app.set('port', (process.env.PORT || 5000))

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({extended: false}))

    // parse application/json
    app.use(bodyParser.json())

    // index
    app.get('/', function (req, res) {
	    res.send('hello world i am a secret bot')
	})
    //add a hashtable to easy communciate
    // for facebook verification
    app.get('/webhook/', function (req, res) {
	    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		res.send(req.query['hub.challenge'])
	    }
	    res.send('Error, wrong token')
	})

    // to post data
    app.post('/webhook/', function (req, res) {
	        messaging_events = req.body.entry[0].messaging
		for (i = 0; i < messaging_events.length; i++) {
		    event = req.body.entry[0].messaging[i]
		    sender = event.sender.id
		    if (event.message && event.message.text) {
			    text = event.message.text
			    if (text === 'Generic') {
				sendGenericMessage(sender)
				continue
			    }
			    else if(text == 'whats up'|| text== "what is this app"){
				sendHiMessage(sender)
				continue
			    }
			    else if(text == "when is the train"){
				sendTrainMessage(sender)
				continue
			    }
          else if (text == "bus map") {
        sendMap(sender)
        continue
          }
			    sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
		    }
		    if (event.postback) {
			text = JSON.stringify(event.postback)
			sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
			    continue
		    }
		}
		res.sendStatus(200)
	})

const token = "EAAEPlSBXUQkBAEkoHGy7w4x2AMWV0HfyYDi44T7U3V3mJUxkYN0hv74LZBZC2thnRZAZB9oalCg9unbCWXNvn4c2hzjKEvRAwC6VZBczEkOBbE3uorV6iPIZABRBuE8Q0UDr5UXmLWstoNriFS5QXKCXe4fbVXQn6y026IuKoQBwZDZD"


    function sendTextMessage(sender, text) {
    messageData = {
	text:text
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
    function sendHiMessage(sender){
	messageData={
	    text:"Stamford Chat Bot let's you now what's going on around you, when your next bus is, and local job openings."
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
      function sendMap(sender) {
      let messageData = {
    "attachment": {
        "type": "template",
        "payload": {
      "template_type": "generic",
      "elements": [{
        "title": "First card",
        "subtitle": "Stamford Bus Map",
        "image_url": "https://www.cttransit.com/sites/default/files/maps/division/stamford_local_8-16.pdf",
        "buttons": [{
          "type": "web_url",
          "url": "https://www.cttransit.com/sites/default/files/maps/division/stamford_local_8-16.pdf",
          "title": "Stamford Bus Map"
            }, {
          "type": "postback",
          "title": "Postback",
          "payload": "Payload for first element in a generic bubble",
            }],
          }],
        }
    }
      }
    }
function sendGenericMessage(sender) {
    messageData = {
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

function sendTrainMessage(sender) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                        "title": "First card",
                        "subtitle": "Transit Tracker - CT",
                        "image_url": "http://a4.mzstatic.com/us/r30/P\
urple60/v4/b6/d4/89/b6d48953-3f9b-b8e2-91c4-9d745451c738/icon175x175.\
png",
                        "buttons": [{
                                "type": "web_url",
                                "url": "https://itunes.apple.com/us/a\
pp/id909177532",
                                "title": "Transit Tracker - CT"
                            }, {
                                "type": "postback",
                                "title": "Postback",
                                "payload": "Payload for first element\
 in a generic bubble",
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

/*
function sendTrainMessage(sender) {
    let messageData = {
	"attachment": {
	    "type": "template",
	    "payload": {
		"template_type": "generic",
		"elements": [{
			"title": "First card",
			"subtitle": "Transit Tracker - CT",
			"image_url": "http://a4.mzstatic.com/us/r30/Purple60/v4/b6/d4/89/b6d48953-3f9b-b8e2-91c4-9d745451c738/icon175x175.png",
			"buttons": [{
				"type": "web_url",
				"url": "https://itunes.apple.com/us/app/id909177532",
				"title": "Transit Tracker - CT"
			    }, {
				"type": "postback",
				"title": "Postback",
				"payload": "Payload for first element in a generic bubble",
			    }],
                    }]
            }
        }
    }
    request({
            url: 'https://graph.facebook.com/v2.6/me/messages\
',
                qs: {access_token:token},
                method: 'POST',
                json: {
                recipient: {id:sender},
                    message: messageData,
                    }
        }, function(error, response, body) {
            if (error) {
                console.log('Error sending messages: ', error\
			    )
                    } else if (response.body.error) {
                console.log('Error: ', response.body.error)
                    }
        })
	}
*/
// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
	    })
