'use strict';

const fetch = require('node-fetch');
const config = require('config');
const cheerio = require('cheerio');
const moment = require('moment');

const low = require('lowdb');
const storage = require('lowdb/file-sync');
const db = low('db.json', { storage });

const app = require('http').createServer(httpHandler);
const io = require('socket.io')(app);

app.listen(8080);

function httpHandler(req, res){
  res.end(db('lastOnlineTime').join('\n'));
}

let i = 0;

setInterval(getData, 30000);
getData();

function getData() {
  console.log(`fetching ${++i} times`);
  fetch(`http://steamcommunity.com/profiles/${config['steam_id']}`)
    .then( res => {
      return res.text();
    })
    .then( body => {
      const $ = cheerio.load(body);
      const onlineStats = $('.profile_in_game_name').text();
      let hrs = 0, mins = 0, days = 0;
      if (/hrs/.test(onlineStats)) {
        hrs = onlineStats.match(/(\d+?)\shrs/)[1];
      }
      if (/mins/.test(onlineStats)) {
        mins = onlineStats.match(/(\d+?)\smins/)[1];
      }
      if (/days/.test(onlineStats)) {
        days = onlineStats.match(/(\d+)\sdays/)[1]
      }

      let time = moment();
      time = time.subtract(days, 'days');
      time = time.subtract(hrs, 'hours');
      time = time.subtract(mins, 'minutes');

      console.log(time.format('YYYY-MM-DD HH:mm'));

      let last = db('lastOnlineTime').last();

      if (last !== null) {
        last = moment(last, 'YYYY-MM-DD HH:mm');
        console.log(last.diff(time, 'minutes'))
        if (Math.abs(time.diff(last, 'minutes')) <= 5) {
          return;
        }
      }
      time = time.format('YYYY-MM-DD HH:mm');
      db('lastOnlineTime').push(time);

      if (time.diff(moment, 'mins') <= 5) {
        sendMessage('IS ONLINE!!!!!!!!!!!!!!!!');
      }
    });
}

function sendMessage(msg) {
  io.of('/').emit('msg', msg);
}
