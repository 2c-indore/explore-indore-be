const MailFlier = require('../lib/mailflier.js');

module.exports = {

	send: function(req, res, next) {

		if (!req.mail) return next();
		MailFlier.send({
			template: `${req.mail.template}`,
			subject: `${req.mail.subject}`,
			maildata: req.mail.maildata,
			receivers: req.mail.receivers
		})
		.then(function(mailsent) {
			return next();
		})
		.catch(function(err) {
			console.log(err)
			return next(err);
		})
	}
}