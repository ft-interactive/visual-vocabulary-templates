import * as d3 from 'd3';
import * as gAxis from 'g-axis';
import gChartframe from 'g-chartframe';
import germanyTopojson from 'germany-wahlkreise'; // Custom added to d3-bootloader; see index.html.
import gChartcolour from 'g-chartcolour';
import * as choropleth from './choropleth.js';
import * as colleges from './colleges.js';
import * as parseData from './parseData.js';
import * as ss from 'simple-statistics';
import * as gLegend from './legend-threshold.js';


const dataFile = 'college.csv';
const geometryFile = 'https://unpkg.com/@financial-times/annotated-atlas@1.1.3/us/10m.json'

const sharedConfig = {
    title: 'Electoral college votes by state',
    subtitle: 'Each candidate needs 270 electoral college votes to win the presidency',
    source: 'Source not yet added',
};

const level = 'states'; //states or counties,
const scaleType = 'manual' //linear, jenks or manual sets the type of colour scale
const ftColorScale = 'sequentialSingle'
let colorScale = d3.scaleThreshold()
                .domain([3.6, 4.9, 6.6, 9.8, 14.8])
                .range(Object.values(gChartcolour[ftColorScale]));


// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 86, right: 5 })
        // .title("Put headline here")
        .height(580)
        .extend('scale', 0.67),

    webS: gChartframe.webFrameS(sharedConfig)
        .margin({ top: 100, left: 15, bottom: 82, right: 5 })
    // .title("Put headline here") //use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(350)
        .extend('scale', 0.28),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 86, right: 5 })
    // .title("Put headline here")
        .height(580)
        .extend('scale', 0.67),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 104, right: 5 })
    // .title("Put headline here")
        .height(950)
        .fullYear(true)
        .extend('scale', 1.2),

    print: gChartframe.printFrame(sharedConfig)
        .margin({ top: 40, left: 7, bottom: 35, right: 7 })
    // .title("Put headline here")
        .height(90) //(Use 58.21mm for markets charts that matter)
        .width(112.25) 
        .extend('scale', .32),

    social: gChartframe.socialFrame(sharedConfig)
        .margin({ top: 140, left: 50, bottom: 138, right: 40 })
    // .title("Put headline here")
        .height(750) // 700 is ideal height for Instagram
        .extend('scale', .55),

    video: gChartframe.videoFrame(sharedConfig)
        .margin({ left: 207, right: 207, bottom: 210, top: 233 })
        .extend('scale', 1.0),
    // .title("Put headline here")
};

// add the frames to the page...
d3.selectAll('.framed')
    .each(function addFrames() {
        const figure = d3.select(this);
        figure.select('svg')
            .call(frame[figure.node().dataset.frame]);
    });
//parseData.load(geometryFile,{}).then((data) => {
parseData.load([dataFile, geometryFile], {level}).then(([data, geoData, valueExtent, plotData, collegeData]) => {
    // define chart

    Object.keys(frame).forEach((frameName) => {

        const myChart = choropleth.draw();
        const myColleges = colleges.drawColleges();
        const currentFrame = frame[frameName];
        const projection = d3.geoIdentity()
                .scale(currentFrame.scale())
        const numberofBreaks = Object.values(gChartcolour[ftColorScale]).length
        const myLegend = gLegend.drawLegend();
        // console.log('numberofBreaks',numberofBreaks)
        // console.log('valueExtent', valueExtent)
        let test = data.map(function (d) { return +d.value; })

        if(scaleType === 'linear') {
            colorScale = d3.scaleLinear()
            .domain(valueExtent)
            .range(Object.values(gChartcolour.basicLinePrint))
            .interpolate(d3.interpolateHcl);
        }

        if(scaleType === 'ploitical') {
            colorScale = d3.scaleOrdinal()
                .domain(Object.keys(gChartcolour.usPoliticalPartiesSmallArea))
                .range(Object.values(gChartcolour.usPoliticalPartiesSmallArea));
        }
        //create an array of centroids to look up x and y coordinates for lines
        //console.log('geoData', geoData)
        var path = d3.geoPath()
            .projection(projection)
        let features = topojson.feature(geoData, geoData.objects.states).features;
        let centroids = features.map(function (feature) {
            return {
                id: feature.id,
                centroid: path.centroid(feature)
            }
        });
        collegeData = collegeData.map((el) => {
            return {
                id: el.id,
                name: el.name,
                value: el.value,
                votes: getVotes(el.id, el.value),
                party: el.party,
            }
        })
        function getVotes(luckup, qty) {
            let votes = []
            for (let i = 0; i < qty; i++) {
               let college = {
                   name: luckup,
                   index: i,
                   x: getCoordinates(luckup)[0],
                   y: getCoordinates(luckup)[1],
               }
                votes.push(college)
            }
            return votes
        }

        function getCoordinates(luckup) {
            const coords = centroids.find(item => luckup === item.id)
            return coords.centroid
        }
        //console.log('centroids', centroids)
        // console.log('collegeDots', collegeData)

        myChart
            .level(level)
            .projection(projection)
            .colourPalette(colorScale)

        currentFrame.plot()
            .selectAll('.choropleth')
            .data([plotData])
            .enter()
            .append('g')
            .attr('class', 'choropleth')
            .call(myChart);
        
        myColleges
            .rem(currentFrame.rem())
            .colourPalette(colorScale)
        
        currentFrame.plot()
            .selectAll('.scatterplot')
            .data(collegeData)
            .enter()
            .append('g')
            .attr('class', 'scatterplot')
            .call(myColleges);


        // myLegend
        //     .colourScale(colorScale)
        //     .valueExtent(valueExtent)
        //     .linearRange([0,currentFrame.dimension().width/2.6])

        //  currentFrame.plot()
        //   .append('g')
        //   .attr('id', 'legend')
        //   .call(myLegend)

    });
    // addSVGSavers('figure.saveable');
});
