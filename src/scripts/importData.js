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

// const fileMapping = {
// 	"public_hospitals": "Public Hospitals",
// 	"private_hospitals": "Private Hospitals",
// 	"public_clinics": "Public Clinics",
// 	"private_clinics": "Private Clinics",
// 	"dentists": "Dentists",
// 	"veterinaries": "Veterinaries",
// 	"patho_radio_labs": "Pathology and Radiology Labs",
// 	"anganwadi": "Anganwadis",
// 	"blood_banks": "Blood Banks",
// 	"mental_health_centers": "Mental Health Centers",
// 	"bus_stops": "Bus Stops"
// };

dataImporter({
	spreadsheetId:'1TaRj3jg3nvAy42GHa1FKKJsHot4EHdHssH2YyKIiwKg',
	worksheet : amenities.map((amenity)=>{
		return amenity.sheetName;
	})
})
.then((result)=>{
	amenities.forEach((amenity,index)=>{
		const data = result[index];
		data.forEach((element)=>{
			if(typeof element.longitude === "number" && typeof element.latitude === "number"){
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
		if(amenity.key.indexOf(combinedAmenites) === -1){
			const json = {
				[amenity.key] : data
			};
			fs.writeFileSync(`${appRootPath}/src/data_snapshots/${amenity.key}.json`, JSON.stringify(json));
		}else{
			if(!accumulator[amenity.key]){
				accumulator[amenity.key] = []
			}
			accumulator[amenity.key] = accumulator[amenity.key].concat(data);
		}
	});

	const areThereGroupAmenties = Object.keys(accumulator).length;
	if(areThereGroupAmenties > 0){
		for(let group in accumulator){
			const jsonObj = {
				[group] : accumulator[group]
			}
			fs.writeFileSync(`${appRootPath}/src/data_snapshots/${group}.json`, JSON.stringify(jsonObj));
		}	
	}

	console.log("Done!!!");

})
.catch((err)=>{
	console.log("Error",err);
})