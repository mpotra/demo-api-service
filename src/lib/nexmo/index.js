//import Nexmo from 'nexmo';
import https from 'https';
import * as uuid from 'uuid';
import statusCodes from './codes';

const defaultNexmoOptions = {
  apiKey: process.env.NEXMO_API_KEY,
  apiSecret: process.env.NEXMO_API_SECRET,
  applicationId: process.env.NEXMO_APP_ID,
  privateKey: process.env.NEXMO_PRIVATE_KEY_PATH
};

export default function createNexmo(options = {}) {
  const nexmoOptions = Object.assign({}, defaultNexmoOptions, options);
  
  //const nexmo = new Nexmo(nexmoOptions);
  const {apiKey, apiSecret} = nexmoOptions;
  
  const nexmo = {};
  
  nexmo.sms = {
    send({to, from, message, ref} = {}) {

      const messageData = {to, from, text: message, ['client-ref']: ref || uuid.v4()};
      const apiData = {api_key: apiKey, api_secret: apiSecret};
      const transmissionData = JSON.stringify(Object.assign({}, apiData, messageData));
      
      const options = {
        host: 'rest.nexmo.com',
        path: '/sms/json',
        port: 443,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(transmissionData)
        }
      };

      const req = https.request(options);

      req.write(transmissionData);
      req.end();

      return new Promise((resolve, reject) => {
        req.once('error', reject);
        
        req.on('response', function(res) {
          let responseData = '';
          
          res.on('data', function(chunk) {
            responseData += chunk;
          });

          res.on('end', function() {
            const response = {receivedText: responseData, sent: messageData};
            let reply;
            
            try {
              reply = response.reply = JSON.parse(responseData);
            } catch (e) {
              return reject(e);
            }
            
            if (reply && Number(reply['message-count']) > 0 && Array.isArray(reply.messages)) {
              const message = reply.messages[0];
              
              const status = statusCodes[message.status];
              if (status && status.code === 0) {
                resolve(message);
              } else {
                reject(Object.assign({}, message, {status}));
              }
            } else {
              const err = new TypeError('Invalid SMS response');
              err.response = response;
              reject(err);
            }
          });
        });
      });
    }
  };
  
  return nexmo;
}
