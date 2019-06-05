import config from "../config.json";
import secretConfig from "../secret_config.json";
import proc from "proc-utils";
import { sanitize } from "google-caja";
import generatePassword from "generate-password";
import { Users } from "../mongomodels";
import jwt from "jsonwebtoken";

let fields = ["email", "password", "verificationCode", "name", "newpassword", "oldpassword"];

export default {

	collect(req, res, next) {
		req.collects = {};
		fields.forEach((field) => {
			if (typeof req.body[field] !== "undefined" || typeof req.query[field] !== "undefined" || typeof req.params[field] !== "undefined") {
				req.collects[field] = JSON.parse(sanitize(JSON.stringify(req.body[field] || req.query[field] || req.params[field] ? req.body[field] || req.query[field] || req.params[field] : "")));
			}
		});
		return next();
	},

	verifyAdmin(req,res,next){
		Users.findOne({
			_id: req.user.idn.split("_")[1]
		})
		.then((user)=>{
			if(user.role !== "admin"){
				throw({
					success: 0,
					message: "Unauthorized access!",
				})
			}
			return next();
		})
		.catch((err)=>{
			return next(err);
		})

	},

	signup(req, res, next) {
		const err = proc.utils.required(req.collects, ["email", "password"]);
		if (err) return next(err);
		let authenticatedUser = {};
		Users.findOne({
				email: req.collects.email
			})
			.then((user) => {
				if (user) throw ({
					success: 0,
					message: "The user already exists!",
				});
				let newUser = new Users({
					email: req.collects.email,
					password: req.collects.password,
					verification_code: Math.floor(1000 + Math.random() * 9000)
				})
				return newUser.save();
			})
			.then((user) => {
				req.cdata = {
					success: 1,
					message: "User created!"
				};
				req.mail = {
					from: '"Explore Indore"<jaibikmap1@gmail.com>',
					template: `accountregistered`,
					subject: `Account Registered`,
					maildata: {
						receiver: user.email,
						verificationCode: user.verification_code
					},
					receivers: user.email
				};
				return next();
			})
			.catch((err) => {
				console.log(err)
				return next(err);
			});
	},

	create(req,res,next){
		const err = proc.utils.required(req.collects, ["email", "name"]);
		if (err) return next(err);
		let authenticatedUser = {};
		let generatedPassword;
		Users.findOne({
				email: req.collects.email
			})
			.then((user) => {
				if (user) throw ({
					success: 0,
					message: "The user already exists!",
				});
				generatedPassword = generatePassword.generate({
				    length: 10,
				    numbers: true
				});
				let newUser = new Users({
					email: req.collects.email,
					name: req.collects.name,
					password: generatedPassword,
					is_verified: true
				})
				return newUser.save();
			})
			.then((user) => {
				req.cdata = {
					success: 1,
					message: "User created!"
				};
				req.mail = {
					from: '"Explore Indore"<jaibikmap1@gmail.com>',
					template: `accountcreated`,
					subject: `Account Created`,
					maildata: {
						receiver: user.email,
						receiverName: user.name,
						generatedPassword: generatedPassword
					},
					receivers: user.email
				};
				return next();
			})
			.catch((err) => {
				console.log(err)
				return next(err);
			});

	},

	verify(req, res, next) {
		const err = proc.utils.required(req.collects, ["email", "verificationCode"]);
		if (err) return next(err);
		Users.findOne({
				email: req.collects.email
			})
			.then((user) => {
				if (user.verification_code != req.collects.verificationCode) throw ({
					success: 0,
					message: "The code does not match!",
				});
				return Users.update({
					email: req.collects.email
				}, {
					is_verified: true
				});
			})
			.then((user) => {
				req.cdata = {
					success: 1,
					message: "User verified!"
				}
				return next();
			})
			.catch((err) => {
				console.log(err)
				return next(err);
			});
	},

	authenticate(req, res, next){
		const err = proc.utils.required(req.collects, ["email", "password"]);
		if (err) return next(err);

		let authenticatedUser = {};
		Users.findOne({
				email: req.collects.email
			})
			.then((user) => {
				if(!user) throw ({
					success: 0,
					message: "The user does not exists.",
				});
				if(!user.is_verified) throw ({
					success: 0,
					message: "The user is not verified.",
				});
				authenticatedUser = user;
				return user.comparePassword(req.collects.password);
			})
			.then((isMatched) => {
				if (!isMatched) throw ({
					success: 0,
					message: "Email/Password do not match",
				});
				req.authenticatedUser = authenticatedUser;
				return next();
			})
			.catch((err) => {
				return next(err);
			});
	},

	generateToken (req, res, next){
		const token = jwt.sign({
			idn: Date.now() + "_" + (req.authenticatedUser._id) + "_" + Math.random() * 1000
		}, secretConfig.jwt.secret, {
			expiresIn: config.jwt.expiresIn
		});
		req.cdata = {
			success: 1,
			message: "Login successful",
			token,
			role: req.authenticatedUser.role,
			username: req.authenticatedUser.username
		};
		return next();
	},

	getProfile (req,res,next){
		const userId = req.user.idn.split("_")[1];
		Users.findOne({
			_id: userId
		})
		.select("_id email name role")
		.then((user)=>{
			req.cdata = {
				success:1,
				data:user
			};
			return next();
		})
		.catch((err)=>{
			return next(err);
		})

	}



}