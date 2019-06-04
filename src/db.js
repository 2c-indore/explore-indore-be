import mongoose from "mongoose";

export default callback => {
	// connect to Mongo DB
	mongoose.Promise = global.Promise;
	mongoose.connect("mongodb://localhost/exploreindore",{
		useNewUrlParser: true
	})
	.then((connection)=>{
		console.log("Successfully connected to the mongo database!");
		callback();
	})
	.catch((err)=>{
		callback(err);
		console.log("Error connecting",err);
	});
}


// export default callback => {
// 	// connect to a database if needed, then pass it to `callback`:
// 	callback();
// }
