"use strict";

var util = require("util");

var responseMessages = require("./responses");

function matchesRoute(originalUrl,originalMethod){
	var matched = null;
	for(var i=0; i<responseMessages.length; i++){
		if(originalUrl.match(responseMessages[i].url) !== null && responseMessages[i].method === originalMethod){
			matched = i;
			break;
		}
	}
	return matched;
}

var mw = {

	respond: function respondfn(req, res, next) {
		if (req.cdata) {
			if(req.ctoken) req.cdata.newToken = req.ctoken;
			var matchingUrlResponse = matchesRoute(req.originalUrl,req.method);
			if(matchingUrlResponse !== null){
				if(typeof responseMessages[matchingUrlResponse].message !== "object"){
					req.cdata.message = responseMessages[matchingUrlResponse].message;	
				}else{
					req.cdata.message = `${responseMessages[matchingUrlResponse].message.params[0].message} ${responseMessages[matchingUrlResponse].message.data[req.collects[responseMessages[matchingUrlResponse].message.params[0].param]]}`;
				}
			}
			res.json(req.cdata);
		} else {
			res.json({
				result: "failure",
				success: 0,
				error: 1,
				error_msg: "something goes wrong",
				statusCode: 500
			});
		}
	},

	error: function errorfn(err, req, res, next) {

		if (!err) {
			err = new Error("an error has occurred");
		}

		var code = err.status || 500;

		util.log(util.format("Error [%s]: %s", req.url, err.message));

		if (code !== 404 && code !== 403) {
      // not logging traces for 404 and 403 errors
			util.log(util.inspect(err.stack));
		}

		if ("ETIMEDOUT" === err.code || "ENOTFOUND" === err.code) {
			err.message =
        "Error connecting upstream servers, please try again later.";
		}

		if ("POST" === req.method) {
			if (err.status === 403) {
				err.message =
          "Session expired, please refresh the page to continue.";
			}
		}
		if (code == 401) {
			var errObj = {
				success: 0,
				error_msg: err.message,
				message : err.message
			};
			if(err.errorMessageCode) errObj.errorMessageCode = err.errorMessageCode;
			res.status(401).json(errObj);
		} else {
			var errObj = {
				result: "failure",
				success: 0,
				error: 1,
				message : err.message,
				error_msg: err.message,
				statusCode: code
			};
			if(err.errorMessageCode) errObj.errorMessageCode = err.errorMessageCode;
			res.json(errObj);
		}
	}
};
module.exports = mw;
