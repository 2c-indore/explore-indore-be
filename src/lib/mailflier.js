const config = require('../secret_config');
const request = require('request');
const nodemailer = require('nodemailer');

const emailTemplate = require('template-notify')({
email: config.email,
	sender: config.email.sender
},  config.template);


module.exports = {

	send: function(options) {

		return new Promise(function(resolve, reject) {
			emailTemplate.email.send(options.receivers, options, function(err, response) {
				if (err) reject(err);
				resolve(response);
			});
		})
	}


}