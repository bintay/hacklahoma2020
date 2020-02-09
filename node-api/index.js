const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const express = require('express')
const app = express();
const nodemailer = require('nodemailer');

const ACCELERATION_THRESHOLD = 3;

const sys = require('sys')
const exec = require('child_process').exec;

//*
// Serial setup
//*

const PATH = '/dev/cu.usbmodem14601'
const port = new SerialPort(PATH, { baudRate: 96000 })
const parser = new Readline()
port.pipe(parser)
// port.write('ROBOT POWER ON\n')

//*
// Logic
//*

const gpsLookup = () => {
   return "110 W Boyd St in Norman, Oklahoma"
}

const sendMail = (to, subject, body) => {
   nodemailer.createTestAccount((err, account) => {
      let transporter = nodemailer.createTransport({
         host: 'smtp.googlemail.com', // Gmail Host
         port: 465, // Port
         secure: true, // this is true as port is 465
         auth: {
            user: 'smart.cane.2020', //Gmail username
            pass: 'Password4312!' // Gmail password
         }
      });
   
      let mailOptions = {
         from: '"Smart Cane" <smart.cane.2020@gmail.com>',
         to: to, // Recepient email address. Multiple emails can send separated by commas
         subject: subject,
         text: body
      };
   
      transporter.sendMail(mailOptions, (error, info) => {
         if (error) {
            return console.log(error);
         }
         console.log('Message sent: %s', info.messageId);
      });
  });
}

let fallDetectTimeout = 0;

const fallWasDetected = () => {
   port.write('e');
   fallDetectTimeout = setTimeout(() => {
      exec('say "oh shit"');
      port.write('o');
      // sendMail('6822131240@txt.att.net', 'Jon has fallen!', `Jon has fallen! He's near ${gpsLookup()}. Emergency services have been notified.`);
   }, 7000);
}

//*
// Triggers
//*

app.get('/fall', (req, res) => {
   fallWasDetected();
   res.end();
})

app.listen(3000, () => console.log('Listening on 3000'));

port.write('o');

let lastTouchedCane = new Date();

parser.on('data', line => {
   console.log(`> ${line}`);

   const data = line.split(' ')
   const cmd = data[0];
   const parameters = data.slice(1).map(v => parseFloat(v));
   if (cmd == 'A') {
      const [ax, ay, az] = parameters.slice(0, 3);
      const a2 = ax * ax + ay * ay + az * az;
      console.log(ax, ay, az);
      console.log('acceleration = ', a2);
      if (a2 >= ACCELERATION_THRESHOLD && (new Date() - lastTouchedCane) < 2000) {
         fallWasDetected();
      }
   } else if (cmd == 'T') {
      if (parameters[0] == 1) {
         lastTouchedCane = new Date();
      }
   } else if (cmd == 'B') {
      if (parameters[0] == 1) {
         clearTimeout(fallDetectTimeout);
         port.write('o');
      }
   }
})
