const appRootPath = require("app-root-path").path;
const config = require("../config.json");
const mongoose = require("mongoose");
const { Features } = require("../mongomodels");

const amenities = Array.from(new Set(config.amenities.map((amenity)=>{
	return amenity.key;
})));

const PromisesToKeep = [];

function saveToDB(amenity,feature){
	return new Promise((resolve,reject)=>{
		let featureComponent = new Features({
			type : amenity,
			feature
		});
		featureComponent.save(function(err) {
			if (err)  reject(err);
			resolve(err);
		});
	})
}

// connect to Mongo DB
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/exploreindore",{
	useNewUrlParser: true
})
.then((connection)=>{
	console.log("Successfully connected to the mongo database!");
	amenities.forEach((amenity)=>{
		const data = require(`${appRootPath}/src/data_snapshots/${amenity}.json`)[amenity];
		data.forEach((feature)=>{
			PromisesToKeep.push(saveToDB(amenity,feature));
		});
	});
	return Promise.all(PromisesToKeep);
})
.then((done)=>{
	console.log("Done");
	process.exit();
})
.catch((err)=>{
	console.log("Error connecting",err);
});







