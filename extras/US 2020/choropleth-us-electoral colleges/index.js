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


const dataFile = 'electoralColleage2020.csv';
const geometryFile = 'https://unpkg.com/@financial-times/annotated-atlas@1.1.3/us/10m.json'

const sharedConfig = {
    title: 'Electoral college votes by state',
    subtitle: 'Each candidate needs 270 electoral college votes to win the presidency',
    source: 'Source not yet added',
};

const level = 'states'; //states or counties,
const scaleType = 'manual' //linear, jenks or manual sets the type of colour scale
let colorScale = d3.scaleOrdinal()
    .domain(Object.keys(gChartcolour.usPoliticalPartiesSmallArea))
    .range(Object.values(gChartcolour.usPoliticalPartiesSmallArea));

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 86, right: 5 })
        // .title("Put headline here")
        .height(580)
        .extend('scale', 0.67)
        .extend('cc', 2.8),

    webS: gChartframe.webFrameS(sharedConfig)
        .margin({ top: 100, left: 15, bottom: 82, right: 5 })
    // .title("Put headline here") //use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(340)
        .extend('scale', 0.26)
        .extend('cc', 1.3),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 86, right: 5 })
    // .title("Put headline here")
        .height(580)
        .extend('scale', 0.67)
        .extend('cc', 2.8),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 104, right: 5 })
    // .title("Put headline here")
        .height(950)
        .fullYear(true)
        .extend('scale', 1.2)
        .extend('cc', 3),

    print: gChartframe.printFrame(sharedConfig)
        .margin({ top: 40, left: 7, bottom: 35, right: 7 })
    // .title("Put headline here")
        .height(90) //(Use 58.21mm for markets charts that matter)
        .width(170.8) 
        .height(130)
        .extend('scale', .48)
        .extend('cc', 1.6),

    social: gChartframe.socialFrame(sharedConfig)
        .margin({ top: 140, left: 50, bottom: 138, right: 40 })
    // .title("Put headline here")
        .height(750) // 700 is ideal height for Instagram
        .extend('scale', .55)
        .extend('cc', 2.4),

    video: gChartframe.videoFrame(sharedConfig)
        .margin({ left: 207, right: 207, bottom: 210, top: 233 })
        .extend('scale', 1.0)
        .extend('cc', 3),
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
        const rem  = currentFrame.rem()

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
                votes: getVotes(el.id, el.name, el.value, el.party),
                party: el.party,
            }
        })
        function getVotes(id, name, qty, party) {
            let votes = []
            for (let i = 0; i < qty; i++) {
               let college = {
                   id: id,
                   name: name,
                   index: i,
                   party: party,
                   x: getCoordinates(id)[0],
                   y: getCoordinates(id)[1],
               }
                votes.push(college)
            }
            return votes
        }

        function getCoordinates(luckup) {
            const coords = centroids.find(item => luckup === item.id)
            let newY = coords.centroid[0]
            let newX = coords.centroid[1]
            if (luckup === '09') {
                newY = currentFrame.dimension().width - (currentFrame.margin().left * 2)
                newX = coords.centroid[1] - rem * 1.5
            }
            if (luckup === '44') {
                newY = currentFrame.dimension().width - (currentFrame.margin().left * 2)
                newX = coords.centroid[1] + rem
            }
            if (luckup === '10') {
                newY = currentFrame.dimension().width - (currentFrame.margin().left * 2)
                newX = coords.centroid[1]
            }
            if (luckup === '11') {
                newY = currentFrame.dimension().width - (currentFrame.margin().left * 2)
                newX = coords.centroid[1] + rem * 2
            }
            if (luckup === '26') {
                newY = coords.centroid[0] + (rem * 0.5)
                newX = coords.centroid[1] + (rem * 0.5)
            }
            return [newY, newX]
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
            .circleSize(currentFrame.cc())
        
            console.log(collegeData)
        
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
