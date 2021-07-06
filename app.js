const tmi = require('tmi.js');
const fetch = require('node-fetch');

const username = ''
const password = ''
//Generate this with https://twitchapps.com/tmi/ 

const streamer = ''

const banCommand = '!banall '

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
   const userMsg = message.toLowerCase()
   
   const isMod = tags.mod || tags['tags-type'] === 'mod'
   const isBroadcaster = channel.slice(1) === tags.username
   const isModUp = isMod || isBroadcaster

   if (isModUp && userMsg.startsWith(banCommand)) {
      
      const url = `https://tmi.twitch.tv/group/user/${streamer}/chatters`

      const fetchChatters = async () => {
         const resp = await fetch(url)
         const data = await resp.json()
         if (data.chatters.viewers.length !== 0) {
            filterChatters(data.chatters.viewers)
         }

      }

      function filterChatters(data) {
         const filterData = data.filter(user => user.startsWith(userMsg.slice(banCommand.length, userMsg.length)))
         
         banChatters(filterData)
      }
      
      function banChatters(data) {
         
         let random = Math.floor(Math.random() * 1000)
         data.forEach(e => {
            
            setTimeout(() => {
               client.say(channel, `/ban ${e}`)
            }, random)
            
            random += Math.floor(Math.random() * 1000)
            
         })
      }

      fetchChatters()
   }

});
