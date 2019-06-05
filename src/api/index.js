import config from "../config.json";
import secretConfig from "../secret_config.json";
import expressJwt from "express-jwt";
import { version } from '../../package.json';
import { Router } from 'express';
import amenities from './amenities';

import Mailer from "./mailer";
import mw from "../lib/middleware";
import UsersController from "./users";

export default ({ config, db }) => {
	let api = Router();

	/**
     * @api {post} /api/users/signup  Signup user
     * @apiName Signup user
     * @apiGroup User

     * @apiSuccess {Integer} success Success status
     * @apiSuccess {string} message Success message

     * @apiSuccessExample {json} Body Parameters Format
     *  {
     *      "email" : "email@email.com",
     *      "username" : "username",
     *		"password" : "password"
     *  }
     *
     * @apiSuccessExample {json} Success-Response:
     *
     *  {
        *       "success": 1,
        *       "message" :"Signupsuccessful"
        *   }
     *
     *
     *
     * @apiDescription API to authenticate user
     * @apiVersion 1.0.0
     */

	api.post("/users/signup", UsersController.collect, UsersController.signup, Mailer.send, mw.respond, mw.error);

	api.post("/admin/users/create", expressJwt({secret: secretConfig.jwt.secret}), UsersController.verifyAdmin, UsersController.collect, UsersController.create, Mailer.send, mw.respond, mw.error);

	api.post("/users/verify", UsersController.collect, UsersController.verify, mw.respond, mw.error);

	/**
     * @api {post} /api/users/authenticate  Authenticate user
     * @apiName Authenticate user
     * @apiGroup User

     * @apiSuccess {Integer} success Success status
     * @apiSuccess {string} message Success message

     * @apiSuccessExample {json} Body Parameters Format
     *  {
     *      "email" : "email@email.com",
     *		"password" : "password"
     *  }
     *
     * @apiSuccessExample {json} Success-Response:
     *
     *  {
	 *		"success": 1,
	 * 		"message": "Login successful",
	 * 		"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZG4iOiIxNTU5NDUwMDUyMjEzXzVjZjM1MTVjY2JmMTY0MThkMDlhODI4N181NjMuODkwNzA5ODcxNDA1MiIsImlhdCI6MTU1OTQ1MDA1MiwiZXhwIjoxNTkxMDA3NjUyfQ.JT-AGeI764SK7Tr-nDCSNzfoSjJY-6OffaFodzr1OYc"
	 *	}
     *
     *
     *
     * @apiDescription API to authenticate user
     * @apiVersion 1.0.0
     */

	api.post("/users/authenticate",UsersController.collect,UsersController.authenticate,UsersController.generateToken,mw.respond,mw.error);

	/**
     * @api {get} /api/users/profile Profile [*Protected]
     * @apiName Profile
     * @apiGroup Users

     * @apiSuccess {Integer} success Success status
     * @apiSuccess {string} message Success message

     *
     * @apiDescription API to get user profile
     * @apiVersion 1.0.0
     */

	api.get("/users/profile",expressJwt({secret: secretConfig.jwt.secret}),UsersController.collect,UsersController.getProfile,mw.respond,mw.error);

	/**
     * @api {get} /api/amenities/data Get amenities data
     * @apiName Get amenities data
     * @apiGroup Amenities

     * @apiSuccess {Integer} success Success status
     * @apiSuccess {string} message Success message

     * @apiSuccessExample {json} Query Parameters Format
     *  {
     *      "type" : "public_hospitals, bus_stops, blood_banks, etc..",
     *  }
     *
     *
     *
     * @apiDescription API to get data for amenities
     * @apiVersion 1.0.0
     */
	api.get('/amenities/data', amenities.collect, amenities.getFeaturesFromDB, amenities.list,amenities.applyFilter,amenities.convertToGeojson,amenities.getWards,amenities.includeFilters, mw.respond ,mw.error);

	/**
     * @api {get} /api/amenities/download Download amenities data
     * @apiName Download amenities data
     * @apiGroup Amenities

     * @apiSuccess {Integer} success Success status
     * @apiSuccess {string} message Success message

     * @apiSuccessExample {json} Query Parameters Format
     *  {
     *      "type" : "public_hospitals, bus_stops, blood_banks, etc..",
     *		"outputFormat" : "json OR csv"
     *  }
     *
     *
     *
     * @apiDescription API to get download data for amenities in csv or json format.
     * @apiVersion 1.0.0
     */

	api.get('/amenities/download', amenities.collect, amenities.getFeaturesFromDB, amenities.list,amenities.applyFilter,amenities.convertToGeojson,amenities.getWards,amenities.includeFilters, amenities.flattenGeojson, amenities.download, mw.respond, mw.error);

	/**
     * @api {put} /api/amenities/update/:id Edit amenities [*Protected]
     * @apiName Edit amenities
     * @apiGroup Amenities

     * @apiSuccess {Integer} success Success status
     * @apiSuccess {string} message Success message
	
	 * @apiSuccessExample {json} Route Parameters Format
	 *  {
	 *      "id": "2csdekoploer"
	 *  }
	 *

     * @apiSuccessExample {json} Body Parameters Format
     *  {
     *      "data" : JSON object
     *  }
     *
     *
     *
     * @apiDescription API to update data element.
     * @apiVersion 1.0.0
     */
	
	api.put("/amenities/update/:id",expressJwt({secret: secretConfig.jwt.secret}),amenities.collect,amenities.update,mw.respond,mw.error);


	api.get('/amenities/wards', amenities.getWards);

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}
