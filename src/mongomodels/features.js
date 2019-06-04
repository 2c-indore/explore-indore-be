const mongoose = require("mongoose");
const Timestamps = require("mongoose-timestamp");

const Schema = mongoose.Schema;

const featureSchema = mongoose.Schema({
	type : { type: String, default: null },
	feature : {},
	is_deleted : { type: Boolean, default: false }
});

featureSchema.plugin(Timestamps);

module.exports = mongoose.model("Features",featureSchema);
