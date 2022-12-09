// send sms 
const springedge = require('springedge');

let params = {
  'apikey': '', // API Key 
  'sender': 'ajalantbrown@gmail.com', // Sender Name 
  'to': [
    '3107705607'  //Moblie Number 
  ],
  'message': 'test'
};

springedge.messages.send(params, 5000, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});