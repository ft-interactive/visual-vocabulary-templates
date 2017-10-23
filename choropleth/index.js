import * as d3 from 'd3';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import germanyTopojson from 'germany-wahlkreise'; // Custom added to d3-bootloader; see index.html.
import { germanPoliticalParties_bar } from 'g-chartcolour'; //eslint-disable-line
import * as choropleth from './choropleth.js';
import * as parseData from './parseData.js';

const dataFile = 'germany_2.csv';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};

const legendAlign = 'vert';// hori or vert, alignment of the legend
const legendType = 'circ'; // rect, line or circ, geometry of legend marker

const partyScale = d3.scaleOrdinal()
    .domain([
        'cducsu',
        'green',
        'left',
        'spd',
        'afd',
        'fdp',
        'other',
    ])
    .range([
        'CDU/CSU',
        'Grune',
        'Linke',
        'SPD',
        'AfD',
        'FDP',
        'Other',
    ]);

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 86, right: 5 })
        // .title("Put headline here")
        .height(500)
        .extend('scale', 1700),

    webS: gChartframe.webFrameS(sharedConfig)
        .margin({ top: 100, left: 15, bottom: 82, right: 5 })
    // .title("Put headline here") //use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(400)
        .extend('scale', 1100),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 86, right: 5 })
    // .title("Put headline here")
        .height(500)
        .extend('scale', 1700),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 104, right: 5 })
    // .title("Put headline here")
        .height(700)
        .fullYear(true)
        .extend('scale', 2200),

    print: gChartframe.printFrame(sharedConfig)
        .margin({ top: 40, left: 7, bottom: 35, right: 7 })
    // .title("Put headline here")
        .height(68)
        .width(55)
        .extend('scale', 650),

    social: gChartframe.socialFrame(sharedConfig)
        .margin({ top: 140, left: 50, bottom: 138, right: 40 })
    // .title("Put headline here")
        .height(750) // 700 is ideal height for Instagram
        .extend('scale', 2200),

    video: gChartframe.videoFrame(sharedConfig)
        .margin({ left: 207, right: 207, bottom: 210, top: 233 })
        .extend('scale', 3100),
    // .title("Put headline here")
};

// add the frames to the page...
d3.selectAll('.framed')
    .each(function addFrames() {
        const figure = d3.select(this);
        console.dir(frame);
        console.dir(frame[figure.node().dataset.frame]);
        figure.select('svg')
            .call(frame[figure.node().dataset.frame]);
    });

parseData.load(dataFile).then((data) => {
    // define chart
    const colorScale = d3.scaleOrdinal()
        .domain(partyScale.range())
        .range(Object.values(germanPoliticalParties_bar));

    const myChart = choropleth.draw(germanyTopojson, partyScale);
    myChart.colourPalette(colorScale);

    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];
        const myLegend = gLegend.legend();
        const projection = d3.geoMercator()
            .center([10.411293, 51.5]) // Middle of Germany
            .scale(currentFrame.scale())
            .translate([currentFrame.dimension().width / 2, currentFrame.dimension().height / 2]);

        // define other functions to be called
        myChart.projection(projection);

        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        currentFrame.plot()
            .append('g')
            .attr('class', 'choropleth')
            .datum(data)
            .call(myChart);

        // Set up legend for this frame
        myLegend
            .seriesNames(partyScale.range())
            .geometry(legendType)
            .frameName(frameName)
            .rem(myChart.rem())
            .alignment(legendAlign)
            .colourPalette(colorScale);

        // Draw the Legend
        currentFrame.plot()
            .append('g')
            .attr('id', 'legend')
            .selectAll('.legend')
            .data(partyScale.range())
            .enter()
            .append('g')
            .classed('legend', true)
            .call(myLegend);
    });
    // addSVGSavers('figure.saveable');
});
