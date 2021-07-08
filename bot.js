require('dotenv').config();
const tmi = require('tmi.js');
const fetch = require('node-fetch');

const username = process.env.TWITCH_USERNAME
const password = process.env.TWITCH_PASSWORD
const streamer = process.env.TWITCH_STREAMER

const command = '!command'


const client = new tmi.Client({
   options: {
      debug: true
   },
   identity: {
      username: username,
      password: password
   },
   channels: [streamer]
});

client.connect();

client.on('message', (channel, tags, message, self) => {
   if (self) return;

   const isMod = tags.mod || tags['user-type'] === 'mod'
   const isBroadcaster = channel.slice(1) === tags.username
   const isModUp = isMod || isBroadcaster
   
   const userMsg = message.toLowerCase()
   const words = userMsg.split(' ')
   const userCommand = words[0]
   let userAction
   let filterAction
   let userData
   let timeoutTime
   if (words[1] === '/timeout') {
      userAction = words[1]
      timeoutTime = words[2]
      filterAction = words[3]
      userData = words[4]
   } else {
      userAction = words[1]
      filterAction = words[2]
      userData = words[3]
   }

   
   if (isModUp && userCommand === command) {
      const url = `https://tmi.twitch.tv/group/user/${streamer}/chatters`

      const fetchChatters = async () => {
         const resp = await fetch(url)
         const data = await resp.json()

         if (data.chatters.viewers.length !== 0) {
            filterChatters(data.chatters.viewers)
         }

      }

      function filterChatters(data) {
         if(filterAction === 'prefix'){
            const prefix = data.filter(user => user.startsWith(userData))
            banChatters(prefix)
         }else if(filterAction === 'suffix'){
            const suffix = data.filter(user => user.endsWith(userData))
            banChatters(suffix)
         }else if(filterAction === 'string'){
            const includes = data.filter(user => user.includes(userData))
            banChatters(includes)
         }

      }
      
      function banChatters(data) {
         let random = 0
         data.forEach(e => {
            
            setTimeout(() => {
               if (userAction === '/timeout') {
                  client.say(channel, `${userAction} ${e} ${timeoutTime}`)
               } else {
                  client.say(channel, `${userAction} ${e}`)
               }
            }, random)
            
            const delayNum = Math.round(Math.random() * 10)
            if (delayNum === 5) {
               random += 5000
            } else {
               random += Math.floor(Math.random() * 1500)
            }
            
         })
      }

      fetchChatters()
   }

})
