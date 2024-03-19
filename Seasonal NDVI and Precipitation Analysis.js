var S2 = ee.ImageCollection("COPERNICUS/S2_SR"),
    AOI = /* color: #0b4a8b */ee.Geometry.Polygon(
        [[[107.75191616917411, 10.871984336779233],
          [108.16733670140067, 10.871984336779233],
          [108.16733670140067, 11.245658420262382],
          [107.75191616917411, 11.245658420262382]]]),
    POI = /* color: #98ff00 */ee.Geometry.Point([107.80981626912582, 11.00308253902219]),
    POI2 = /* color: #da892d */ee.Geometry.Point([108.03845192796351, 11.135090619127975]),
    TRMM = ee.ImageCollection("TRMM/3B43V7");

Map.centerObject(AOI,9);

// Filter Sentinel-2 collection for 2019 and 2020.
var s2Collection = S2.filterDate("2019-01-01", "2020-12-31").filterBounds(AOI)

// Load Sentinel-2 collection RGB with clouds to vizualize differences
var RGBcloud = {min: 0, max: 3000, bands: ['B4', 'B3', 'B2']};

Map.addLayer(s2Collection, RGBcloud, 'RGBcloud');

//Cloud mask.
var s2FreeClouds = ee.ImageCollection(
    ee.Join.saveFirst('cloudProbability').apply({
         primary: s2Collection 
          .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 75)),
         secondary: ee.ImageCollection('COPERNICUS/S2_CLOUD_PROBABILITY')
          .filterDate("2019-01-01", "2020-12-31")
          .filterBounds(AOI),
         condition: ee.Filter.equals({leftField: 'system:index', rightField: 'system:index'})
     })
).map(maskClouds);

function maskClouds(image) {
  var cloudFree = ee.Image(image.get('cloudProbability')).lt(30);
  return image.updateMask(cloudFree);
}

// Load Sentinel-2 collection RGB without clouds to vizualize differences.

Map.addLayer(s2FreeClouds, {bands: 'B4,B3,B2', max: 3000, gamma: 1.5}, 'RGB');

//Generate an NDVI image for each image in the collection s2FreeClouds. 
var addNDVI = function(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
  return image.addBands(ndvi);
};
var withNDVI = s2FreeClouds.map(addNDVI);

// Make a time series graph for Max NDVI.
var chart = ui.Chart.image.series({
  imageCollection: withNDVI.select('NDVI'), 
  region: POI,
  reducer: ee.Reducer.mean(), 
  scale: 100
}).setChartType('LineChart'); 

// Define titles for the chart
var options = { 
  interpolateNulls: true,
  title: 'NDVI time series', 
  hAxis: { title: 'time' },
  vAxis: { title: 'NDVI' },
  lineWidth: 1,  
  pointSize: 4,  
  };

var chartInter = chart.setOptions(options);
print(chart); 


// Make a time series graph POI2.
var chart2 = ui.Chart.image.series({
  imageCollection: withNDVI.select('NDVI'), 
  region: POI2, 
  reducer: ee.Reducer.mean(), 
  scale: 100
}).setChartType('LineChart'); 

// Define title for the chart POI2
var options2 = { 
  interpolateNulls: true,
  title: 'NDVI time series', 
  hAxis: { title: 'time' },
  vAxis: { title: 'NDVI' },
  lineWidth: 1,  
  pointSize: 4, 
  };
  var chartInter2 = chart2.setOptions(options2);
print(chart2); 

//Import TRMM precipitation data.
var trmmCollection = TRMM
  .filterBounds(AOI)
  .filterDate("2019-01-01", "2020-12-31");

// Monthly precipitation.
var calculatePrecipitation = function(image) {
  var precipitation = image.select('precipitation');
  var precipitationSum = precipitation.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: AOI,
    scale: 100 
  });
  return image.set('precipitation_sum', precipitationSum.get('precipitation'));
};

var trmmWithPrecipSum = trmmCollection.map(calculatePrecipitation);

// Create a time series for total precipitation.
var chart = ui.Chart.image.series({
  imageCollection: trmmWithPrecipSum,
  region: AOI,
  reducer: ee.Reducer.mean(),
  scale: 100
}).setChartType('LineChart')
  .setOptions({
    title: 'Time Series of Precipitation',
    hAxis: {title: 'Time'},
    vAxis: {title: 'Precipitation (mm)'}
  });
print(chart);

// Composite NDVI for Dry Season 2019-2020 for s2FreeClouds collection.

// Filter dry season data.
var dryfiltered1 = s2FreeClouds.filterDate('2019-01-01', '2019-05-31');

var dryfiltered2 = s2FreeClouds.filterDate('2019-12-01', '2020-05-31');

// Combine two collections.
var dryCollection = dryfiltered1.merge(dryfiltered2);
var bands = ['B8', 'B4'];

var dryNDVI = dryCollection.map(function(image) {
  var ndvi = image.normalizedDifference(bands).rename('NDVI');
  return ndvi.set('system:time_start', image.get('system:time_start'));
});

// NDVI with maximum values.
var maxdryNDVI = dryNDVI.qualityMosaic('NDVI');

var ndviVis = {
  min: -1,
  max: 1,
  palette: ['blue', 'white', 'green']
};

Map.addLayer(maxdryNDVI, ndviVis, 'Dry NDVI');

// Composite NDVI for Wet Season 2019-2020 for s2FreeClouds collection

// Filter wet season data.
var wetfiltered1 = s2FreeClouds.filterDate('2019-06-01', '2019-11-30');

var wetfiltered2 = s2FreeClouds.filterDate('2020-06-01', '2020-11-30');

//  Combine two collections.
var wetCollection = wetfiltered1.merge(wetfiltered2);
var bands = ['B8', 'B4'];

var wetNDVI = wetCollection.map(function(image) {
  var ndvi = image.normalizedDifference(bands).rename('NDVI2');
  return ndvi.set('system:time_start2', image.get('system:time_start2'));
});

// NDVI with maximum values
var maxwetNDVI = wetNDVI.qualityMosaic('NDVI2');

var ndviwetVis = {
  min: -1,
  max: 1,
  palette: ['blue', 'white', 'green']
};
Map.addLayer(maxwetNDVI, ndviwetVis, 'Wet NDVI ');

//S2 Dry season, composite RED-GREEN-BLUE dryCollection 
var s2dryRGB = dryCollection.select('B4', 'B3', 'B2').reduce(ee.Reducer.median());
var visParams = {
  min: 0, 
  max: 3000,  
  gamma: 1.4  
};
Map.addLayer(s2dryRGB,visParams,'Dry RGB');

//S2 Wet season, composite RED-GREEN-BLUE wetCollection 
var s2wetRGB = wetCollection.select('B4', 'B3', 'B2').reduce(ee.Reducer.median());
var visParams2 = {
  min: 0,  
  max: 3000,  
  gamma: 1.4 
};
Map.addLayer(s2wetRGB,visParams2,'Wet RGB');

// Combine wet dataset
var WetDataset = ee.ImageCollection([s2wetRGB, maxwetNDVI]);
var clipToAOI = function(image) {
  return image.clip(AOI);
};

var WetDatasetAOI = WetDataset.map(clipToAOI);
print(WetDatasetAOI);

//Bring each image of dataset to 
var imagen1 = ee.Image(WetDatasetAOI.toList(WetDatasetAOI.size()).get(0));
var imagen2 = ee.Image(WetDatasetAOI.toList(WetDatasetAOI.size()).get(1));

Map.addLayer(imagen1, visParams2, 's2wetRGB');
Map.addLayer(imagen2, ndviwetVis, 'maxwetNDVI');
