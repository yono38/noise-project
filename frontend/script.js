// TODO cache json?
// Possible Problem with Rickshaw js
// Seems to need X coords to match up across charts
var noiseMap = {};
var noise = {};
var noiseChart = {};



$(document).ready(function () {

    // START NOISECHART
    noiseChart = {
        // holds the rickshaw charts
        charts: {},
        currComplaints: null,
        initCharts: function () {
            var data = [];
            data[0] = {
                x: 0,
                y: 0
            };

            //DB_month
            this.charts['mo'] = this.chartCreate("mo", data, 0, 100);
            this.charts['mo'].render();

            //DB_week
            this.charts['w'] = this.chartCreate("w", data, 0, 100);
            this.charts['w'].render();

            //DB_day
            this.charts['d'] = this.chartCreate("d", data, 0, 100);
            this.charts['d'].render();

            //DB_sixhour
            this.charts['si'] = this.chartCreate("si", data, 0, 100);
            this.charts['si'].render();

            //DB_hour
            this.charts['h'] = this.chartCreate("h", data, 0, 100);
            this.charts['h'].render();

            //DB_minute
            this.charts['m'] = this.chartCreate("m", data, 0, 100);
            this.charts['m'].render();

            //DB_second
            this.charts['s'] = this.chartCreate("s", data, 0, 100);
            this.charts['s'].render();

            //DB_deciseconds
            this.charts['ds'] = this.chartCreate("ds", data, 0, 100);
            this.charts['ds'].render();
        },
        // creates initial rickshaw charts
        chartCreate: function (chart_name, data, min, max) {
        						var that = this;
            var palette = new Rickshaw.Color.Palette({
                scheme: 'classic9'
            });

            var chart = new Rickshaw.Graph({
                element: document.getElementById(chart_name + "_chart"),
                width: $("#" + chart_name + "_chart").width(),
                height: $("#" + chart_name + "_chart").height(),
                renderer: 'multi',
                max: max,
                min: min,
                series: [{
                    color: palette.color(),
                    data: data,
                    renderer: 'line',
                    name: 'Audio Chart'
                }, {
                    color: palette.color(),
                    data: data,
                    renderer: 'scatterplot',
                    name: '311 Complaints Chart'
                }]
            });
            chart.series[1].disabled = true;;

            chart.render();

            var ticksTreatment = 'glow';
            var xAxis = new Rickshaw.Graph.Axis.Time({
                graph: chart,
                ticksTreatment: ticksTreatment
            });

            xAxis.render();
			//			var hoverDetail = new Rickshaw.Graph.HoverDetail.Multi( {
			//				graph: chart
			//			} );


            var yAxis = new Rickshaw.Graph.Axis.Y({
                graph: chart,
                tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
                ticksTreatment: ticksTreatment
            });

            yAxis.render();



            $("#" + chart_name + "_slider").slider({
                range: true,
                min: 0,
                max: 0,
                values: [0, 0],
                slide: function (event, ui) {
					//					console.log(ui);
                    reduct_to = {
                        'mo': 'w',
                        'w': 'd',
                        'd': 'si',
                        'si': 'h',
                        'h': 'm',
                        'm': 's',
                        's': 'ds'
                    }
                    args = {
                        'id': 0,
                        'samplerate': reduct_to[chart_name],
                        'request_start': ui.values[0],
                        'request_end': ui.values[1]
                    };
										if (that.currComplaints != null){
									//		that.plot311ComplaintsRange(reduct_to[chart_name], ui.values[0], ui.values[1]);
										}
                    Dajaxice.noise_app.getAudioDataRange(that.generateChartInfoAudio, args);
                }
            });


            return chart;
        },
        
        plot311ComplaintsRange: function(chartName, start, end){
   //     	console.log(this);
        	// sanity check
        	if (this.currComplaints == null) return;
        	// underscorejs is my favorite library ever
     //   	console.log(this.currComplaints);
     //   	console.log("range: "+start+" to "+end);
        	var rangeComplaints = _.filter(this.currComplaints, function(obj){
        	//	console.log(obj);
        		return obj.x >= start && obj.x <= end;
        	});
     //   	console.log(rangeComplaints);
        	if (rangeComplaints.length > 0){
		      	this.charts[chartName].series[1].data = rangeComplaints;
		      	this.charts[chartName].series[1].disabled = false;        	
		  //    	this.charts[chartName].render();
        	}
        	else {
		      	this.charts[chartName].series[1].disabled = true;        	
        	}
        },

        // Django callback, loads top chart
        generateChartInfoAudio: function (json) {
      //      console.log("generating chart info");
      //      console.log(json.data);

            // loses context because of fuckin Dajaxice
            // I sure hope it's me that's using it wrong and not just a retared library
            // In which case, maybe some relevant documentation would be helpful?
            var that = noiseChart;

            // careful here Fabio, creating undeclared variables won't throw an error,
            // it'll create a global variable instead
            var samplerate = json['samplerate'];
            that.charts[samplerate].series[0].data = json['data'];

            // disable series to avoid error
            if (that.currComplaints == null) {
            	that.charts[samplerate].series[1].disabled = true;
            }
            else { 
            	that.plot311ComplaintsRange(samplerate, json['start'], json['end']); 
            }

       //     console.log("changing slider to min: "+json['start']+" max: "+json['end']);
            that.charts[samplerate].min = json['chartsize'][0];
            that.charts[samplerate].max = json['chartsize'][1];
            //  console.log(charts);
            that.charts[samplerate].render();

            $("#" + samplerate + "_slider").slider("option", "max", json['end']).slider("option", "min", json['start']).slider("value", [json['start'], json['end']]);

        },
        chartInfo311: [],
        // uses JSON converted into x:unixtime, y:number of complaints that day
        generateChartInfo311: function (json, samplert) {
            // django context fix
            var that = noiseChart;
            that.charts[samplert].series[1].data = json;
            that.charts[samplert].series[1].disabled = false;
            that.charts[samplert].render();


        }
    };
    // END NOISECHART

    // START NOISEMAP
    noiseMap = {
        dataJSON: [],
        mapOptions: {
            zoom: 14,
            center: new google.maps.LatLng(40.730235394714605, -74.00027421471601),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        },
        map: {},
        // sets up map
        initMap: function () {

            this.map = new google.maps.Map(document.getElementById('map_canvas'), this.mapOptions);
            // set up dragable thinger
            this.map.enableKeyDragZoom({
                noZoom: true
            });
            // this provides the ability to select areas of the map
            var zoomObj = this.map.getDragZoomObject();
            var that = this;
            // after area selected, filter json to just that area
            google.maps.event.addListener(zoomObj, "dragend", function (bnds) {
                that.filter311(bnds);
            });

            // load audio marker
            Dajaxice.noise_app.getOneAudio(this.addAudioMarker, {
                'id': 0
            });
        },
        // contains audio sensor markers
        markersAudio: [],
        // when an audio sensor is clicked, it will spawn a new rickshaw chart
        handleAudioMarkerClick: function (event) {
            // figure out where in array based on object context. weird hack, can't believe it worked
            // still would prefer to be in context of noiseMap as this, but I'll take it
            var id = noiseMap.markersAudio.indexOf(this);
            console.log("click");
            args = {
                'id': id,
                'samplerate': 'mo',
                'request_start': Date.UTC(2012, 1, 1) / 1000,
                'request_end': Date.UTC(2012, 12, 31) / 1000
            };
            Dajaxice.noise_app.getAudioDataRange(noiseChart.generateChartInfoAudio, args);
        },
        addAudioMarker: function (json) {
            // Dajaxice makes you lose "this" context. Makes me hate it. Gonna need you to explain why we aren't just using ajax on the client side Fabio
            var that;
            if (this === window) that = noiseMap;
            else that = this;


            var id = json['_id'];
            // creates custom icon to differentiate audio sensors
            var pinColor = "3AA82D";
            var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34));
            that.markersAudio[id] = new google.maps.Marker({
                position: new google.maps.LatLng(json['lat'], json['lng']),
                map: that.map,
                icon: pinImage
            });
            google.maps.event.addListener(that.markersAudio[id], 'click', that.handleAudioMarkerClick);
        },
        // contains 311 data markers
        markers311: [],
        markerCluster: null,

        // TODO not clearing properly
        clear311Markers: function () {
      //      console.log("cleraing 311 markers");
            if (this.markerCluster != null) this.markerCluster.clearMarkers();
            this.markers311 = [];
        },
        // adds 311 markers to the map
        add311Markers: function (json) {
            var that = this;
      //      console.log('adding 311 markers to map');

            this.markers311 = this.markers311 || [];
            for (var i = 0; i < json.length; i++) {
                v = json[i];
                // store coordinate
                var geo = new google.maps.LatLng(v.lat, v.lng);
                // format date
                var date = new Date(v.unixtime * 1000);

                // create info window
                // TODO fix weird bug where all click marker events open same infowindows
                var contentString = '<h2>' + v.descriptor + '<h2><p>Date: ' + date.toString() + '</p><p>Type: ' + v.complaint_type + '</p><p>Location Type: ' + v.location_type + '</p>';
                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });

                var marker = new google.maps.Marker({
                    position: geo,
                    map: that.map,
                    title: v.descriptor
                });
                // 
                google.maps.event.addListener(marker, 'click', function () {
                    infowindow.open(this.map, this);
                });
                this.markers311.push(marker);
            }
     //       console.log(this.markers311);
            this.markerCluster = new MarkerClusterer(this.map, this.markers311);
     //       console.log(this.markerCluster);
        },

        filter311: function (bnds) { // tied to the UI
            var temp = '';
       //     console.log(this);
            var filt_data = this.dataJSON;
            // filter by bounds box
            if (bnds) {
                var ne = bnds.getNorthEast();
                var sw = bnds.getSouthWest();
                filt_data = _(filt_data).filter(function (obj) {
                    return obj.lng >= sw.lng() && obj.lng <= ne.lng();
                });
         //       console.log(filt_data);
                filt_data = _(filt_data).filter(function (obj) {
                    return obj.lat >= sw.lat() && obj.lat <= ne.lat();
                });
            }


            if (this.markers311) this.clear311Markers();
            // make new map
            this.add311Markers(filt_data);
            var keys = _.keys(noiseChart.charts);
            // prepare complaint data for chart
            var complaintsByDate = _(filt_data).countBy(function (obj) {
                return obj.unixtime;
            });
            // group complaints by date
            complaintsByDate = _.map(complaintsByDate, function (k, v) {
                return {
                    x: parseInt(v),
                    y: k
                };
            });
            
            // set current complaints
            noiseChart.currComplaints = complaintsByDate;
            noiseChart.generateChartInfo311(complaintsByDate, "mo");
            // });
        }
    };
    // END NOISEMAP

    // START NOISE
    // will eventually build entire module into being this guy
    noise = {
        // loads Django info
        // uses info to load map and charts
        init: function () {
            noiseChart.initCharts();

            // connects to audio DB
            Dajaxice.noise_app.connect(function(){console.log("connected to server");});
            Dajaxice.noise_app.loadComplaints(function (json) {
                for (var i = 0; i < json.length; i++) {
                    json[i] = JSON.parse(json[i]);
                }
                noiseMap.dataJSON = json;
            });
            noiseMap.initMap();


        }
    };
    // END NOISE


    // starts the whole shebang
    noise.init();

});
