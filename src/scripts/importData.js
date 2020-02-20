const appRootPath = require("app-root-path").path;
const config = require("../config.json");
const dataImporter = require("google-spreadsheet-to-json");
const fs = require('fs');
const turf = require("@turf/turf");
const wardBoundaries = require(`${appRootPath}/src/ward_boundaries.json`);

// const amenities = ['Veterinary','Bus Stop','Risk Zone','School near Slum','Tertiary HCS','Secondary HCS','Primary HCS','AYUSH','Private Hospitals','Dental Clinics','Clinics','Pharmacy','IMC','Mental Health','Labs','HMO Office','Blood Bank','Aanganwadi'];

const amenities = config.amenities;

const combinedAmenites = ['public_clinics'];
const accumulator = {};
const callRate = 2000; // delay consecutive request by this much seconds. Just to ensure that there is certain time gap between consecutive API request

function asyncFunction(amenity, cb) {
	console.log(`Waiting for ${callRate/1000} seconds.... -`, amenity.sheetName);
	setTimeout(() => {
		dataImporter({
				spreadsheetId: '17sFTUM_UC283Hqgf14Thb_Bl4bOwKC6ZslY1zKnF-Kw',
				worksheet: amenity.sheetName
			})
			.then((result) => {
				// const data = result[index];
				const data = result;
				data.forEach((element) => {
					if (typeof element.longitude === "number" && typeof element.latitude === "number") {
						const elementCoordinates = turf.point([element.longitude, element.latitude]);
						wardBoundaries.features.forEach((feature) => {
							const isInside = turf.booleanPointInPolygon(elementCoordinates, feature);
							if (isInside) {
								element.ward_no = feature.properties.ward_no;
								element.ward_name = feature.properties.ward_name;
							}
						});
					}
				});
				if (amenity.key.indexOf(combinedAmenites) === -1) {
					const json = {
						[amenity.key]: data
					};
					fs.writeFileSync(`${appRootPath}/src/data_snapshots/${amenity.key}.json`, JSON.stringify(json));
				} else {
					if (!accumulator[amenity.key]) {
						accumulator[amenity.key] = []
					}
					accumulator[amenity.key] = accumulator[amenity.key].concat(data);
				}
				console.log("Done - ", amenity.name);
				cb();

			})

	}, callRate);
}

let requests = amenities.reduce((promiseChain, amenity) => {
	return promiseChain.then(() => new Promise((resolve) => {
		asyncFunction(amenity, resolve);
	}));
}, Promise.resolve());

requests.then(() => {
	const areThereGroupAmenties = Object.keys(accumulator).length;
	if (areThereGroupAmenties > 0) {
		for (let group in accumulator) {
			const jsonObj = {
				[group]: accumulator[group]
			}
			fs.writeFileSync(`${appRootPath}/src/data_snapshots/${group}.json`, JSON.stringify(jsonObj));
		}
	}
	console.log("Done with Snapshot creation")
});