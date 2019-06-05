const mongoose = require("mongoose");
const Timestamps = require("mongoose-timestamp");
const bcrypt = require("bcrypt");

const saltRounds = 10;

const usersSchema = mongoose.Schema({
	name : String,
	email : String,
	password : String,
	role: {
		type: String,
		default: "general"
	},
	verification_code: Number,
	is_verified: {
		type: Boolean,
		default: false
	},
	is_deleted: {
		type: Boolean,
		default: false
	}
});

usersSchema.pre("save",function(next){
	let user = this;
	bcrypt.hash(user.password, saltRounds, function(err, hash) {
		if(err) console.log(err);
		user.password = hash;
		return next();
	});
});

usersSchema.methods.comparePassword = function(candidatePassword) {
	let user = this;
	return new Promise(function(resolve,reject){
		bcrypt.compare(candidatePassword, user.password, function(err, isMatch) {
			if (err) reject(err);
			resolve(isMatch);
		});
	});
};

usersSchema.plugin(Timestamps);

module.exports = mongoose.model("Users",usersSchema);
