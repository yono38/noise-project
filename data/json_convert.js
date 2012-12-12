// load json file
// create new json object
// append each complaint to json object
var fs = require('fs');
var info = []; 

fs.readFile("311_data.json", 'utf8', 
	function(err,data){
		if (err) {
			return console.log(err);
		}
		data = JSON.parse(data);
		for (var i=0;i<data["data"].length; i++){
		// remove id (going to use pk)
		  delete data["data"][i].id;
		  // convert strings to float or int 
		  if (data["data"][i].geo.lat == null || data["data"][i].geo.long == null || data["data"][i].location_type == null) continue;
		  data["data"][i].lat = parseFloat(data["data"][i].geo.lat);
		  data["data"][i].lng = parseFloat(data["data"][i].geo.long);	
		  delete data["data"][i].geo;
		  data["data"][i].incident_zip = parseInt(data["data"][i].incident_zip);		 
		  // get unixtime
		  data["data"][i].unixtime = Date.parse(data["data"][i].created_at.date)/1000;
		  delete data["data"][i].created_at;

			var temp = {
				model : "noise_app.complaint",
				pk: null,
				fields: data["data"][i]
			};

			info.push(temp);
		}
		var str = JSON.stringify(info);
		fs.writeFile("311_data_new.json", str,
			function(err) { 
				if (err) { console.log(err); }
				else { console.log("success!"); }
		});
});
	
