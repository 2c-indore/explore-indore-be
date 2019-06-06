import { path as appRootPath } from "app-root-path";
import { Features } from "../mongomodels";
import proc from "proc-utils";
import { sanitize } from "google-caja";

const { parse } = require('json2csv');
const config = require("../config.json");
const turf = require("@turf/turf");
const wardBoundaries = require(`${appRootPath}/src/ward_boundaries.json`);

const amenities = config.amenities.map((amenity)=>{
	return amenity.key;
});

let fields = ["id","data","outputFormat","type","platform"];


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

	getFeaturesFromDB(req,res,next){
		const amenityType = req.query.type;
		Features.find({
			type: amenityType
		})
		.then((features)=>{
			req.features = features.map((feature)=>{
				const featureObj = Object.assign({
					id: feature._id,
				},feature.feature);
				return featureObj;
			})
			return next();
		})
		.catch((err)=>{
			return next(err);
		});
	},

	list(req, res, next) {
		const amenityType = req.query.type;
		if(req.query.ward && req.query.ward=="*"){
			delete req.query.ward;
		}
		if(!amenities.includes(amenityType)){
			return res.json({
				success:0,
				message : "This amenity is not supported!"
			})
		}
		// const dataForAmenity = require(`${appRootPath}/src/data_snapshots/${amenityType}.json`);
		req.cdata={
			data: req.features.map((amenity,index)=>{
				if(!amenity["id"]){
					amenity["id"] = `${amenityType}/${index+1}`;				
				}
				return amenity;
			})
		}
		req.cdata.totalCounts = req.cdata.data.length;
		const calculateInsightsFor = config.parameters[req.query.type].filter((insight)=>{
			return insight.isInsight == true;
		}).map((insight)=>{
			return insight.database_schema_key;
		}).reduce((obj,insight)=>{
			let count = 0;
			req.cdata.data.forEach((feature)=>{
				if(feature[insight]){
					count = count + Number(feature[insight]);
				}
			});
			obj[insight] = count;
			return obj;
		},{});
		req.totalInsights = calculateInsightsFor;
		return next();
	},
	applyFilter (req,res,next) {
		const possibleFiltersForAmenity= config.parameters[req.query.type];
		possibleFiltersForAmenity.forEach((possibleFilter)=>{
			if(req.query[possibleFilter.parameter_name]){
				if(possibleFilter.parameter_name === "ward"){
					req.cdata.data = req.cdata.data.filter((datum)=>{
						return datum.ward_no == req.query.ward;
					});
				}else{
					const filterAsObject = JSON.parse(req.query[possibleFilter.parameter_name]);
					if(possibleFilter.type === "range"){
						req.cdata.data = req.cdata.data.filter((datum)=>{
							return (datum[possibleFilter.database_schema_key] >= filterAsObject.low && datum[possibleFilter.database_schema_key] <= filterAsObject.high);
						});
					}else if(possibleFilter.type === "multi-select"){
						possibleFilter.options.forEach((option)=>{
							if(filterAsObject[option.value]){
								if(filterAsObject[option.value] == true){
									req.cdata.data = req.cdata.data.filter((datum)=>{
										return datum[option.database_schema_key] == "yes" || !datum[option.database_schema_key] ;
									});
								}
							}
						})
					}
				}
			}
		});
		return next();
	},
	convertToGeojson(req,res,next) {
		req.cdata = {
			success: 1,
			geometries: {
				pois: {
					type: "FeatureCollection",
					features: req.cdata.data.filter((datum)=>{
						return typeof datum.longitude === "number" && typeof datum.latitude === "number";
					}).map((datum)=>{
						return {
							type: "Feature",
							id: datum.id,
							properties: {
								tags : datum
							},
							geometry: turf.point([datum.longitude,datum.latitude]).geometry
						}
					})
				},
				boundaryWithWards: req.query.ward ? wardBoundaries.features.filter((feature)=>{
					return feature.properties.ward_no === req.query.ward;
				})[0]: wardBoundaries
			},
			insights : [
				{
					"max_value" : req.cdata.totalCounts,
					"value" : req.cdata.data.length,
					"insight_title": config.amenities.filter((parameter)=>{
						return parameter.key === req.query.type;
					})[0].name
				}
			]
		};
		function calculateValue(tag){
			let count = 0;
			req.cdata.geometries.pois.features.forEach((feature)=>{
				if(feature.properties.tags[tag]){
					count = count + feature.properties.tags[tag];
				}
			});
			return count;
		}
		const filteredInsights = Object.keys(req.totalInsights).map((insight)=>{
			return {
				"max_value": req.totalInsights[insight],
				"value": calculateValue(insight),
				"insight_title": config.parameters[req.query.type].filter((parameter)=>{
					return parameter.database_schema_key === insight;
				})[0].label
			}
		});
		req.cdata.insights = req.cdata.insights.concat(filteredInsights).reduce((obj,insight,index)=>{
			obj[index+1] = insight;
			return obj;
		},{});
		req.cdata.geometries.boundary = req.query.ward ? req.cdata.geometries.boundaryWithWards : require(`${appRootPath}/src/indore_geojson.json`);
		return next();
	},
	getWards(req, res, next) {
		const wards = [];
		wardBoundaries.features.forEach((feature) => {	
			wards.push({
				value: feature.properties.ward_no,
				label: feature.properties.ward_name
			})
		});
		wards.sort((a,b)=>{
			return Number(a.value)-Number(b.value);
		})
		req.cdata.wards = wards;
		return next();
	},
	includeFilters(req,res,next) {
		function calculateRangeMetrics(tag){
			const data= req.cdata.geometries.pois.features;
			let maxValue=0;
			data.forEach((datum)=>{
				if(datum.properties.tags[tag] && Number(datum.properties.tags[tag])>maxValue){
					maxValue=Number(datum.properties.tags[tag]);
				}
			});
			return {
				low:0,
				step:5,
				high: maxValue,
				max: maxValue,
				min:0
			};
		}
		req.cdata.filters = config.parameters[req.query.type].map((filter)=>{
			if(filter.parameter_name === "ward"){
				filter.options = [{
					"value": "*",
                    "label": "All Wards"
				}].concat(req.cdata.wards);
			}else{
				if(filter.type === "range"){
					filter.range = calculateRangeMetrics(filter.database_schema_key);
				}else if(filter.type === "multi-select"){
					filter.options = filter.options;
				}
			}
			return filter;
		});
		req.cdata.parameters = req.cdata.filters.reduce((obj,filter,index)=>{
			obj[index+1] = filter;
			return obj;
		},{});
		delete req.cdata.wards;
		return next();
	},

	mobileCompatible(req,res,next){
		if(req.collects.platform !== "mobile") return next();

		req.cdata.geometries.pois.features.forEach((feature)=>{
			feature.properties.tags = Object.keys(feature.properties.tags).map((key)=>{
				return {
					"label" : key,
					"value" : feature.properties.tags[key]
				}
			})
		});

		return next();

	},

	update(req,res,next){
		const err = proc.utils.required(req.collects, ["id","data"]);
		if (err) return next(err);

		Features.update({
			_id: req.collects.id
		}, {
			feature: typeof req.collects.data === "object" ? req.collects.data : JSON.parse(req.collects.data)
		})
		.then((updated) => {
			req.cdata = {
				success: 1,
				message: "Data successfully updated!"
			};
			return next();
		})
		.catch((err) => {
			return next(err);
		});
	},

	flattenGeojson(req,rex,next){
		req.cdata = req.cdata.geometries.pois.features.map((feature)=>{
			const featureObject = feature.properties.tags;
			delete featureObject.id;
			return featureObject;
		});
		return next();
	},

	download(req,res,next){
		const err = proc.utils.required(req.collects, ["outputFormat"]);
		if (err) return next(err);
		if(req.collects.outputFormat === "json"){
			res.setHeader('Content-disposition', 'attachment; filename='+req.collects.type+'.json');
			res.header("Content-Type",'application/json');
			return res.send(JSON.stringify(req.cdata));
		}else{
			const fields = Array.from(req.cdata.reduce((set, obj)=>{
				Object.keys(obj).forEach((key)=>{
					set.add(key);
				})
				return set;
			},new Set([])));
			const opts = { fields };
			try {
			  const csv = parse(req.cdata, opts);
			  res.setHeader('Content-disposition', 'attachment; filename='+req.collects.type+'.csv');
			  res.header("Content-Type",'application/csv');
			  return res.send(csv);
			} catch (err) {
				console.log(err)
				res.json({
					success:0,
					message:err
				});
			}
		}
	}
}