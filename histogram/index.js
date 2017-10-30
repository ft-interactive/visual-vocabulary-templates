import * as d3 from 'd3';
import gAxis from 'g-axis';
import gChartframe from 'g-chartframe';
import * as histogram from './histogram.js';
import * as parseData from './parseData.js';

const thresholds = 7;

const dataFile = 'data.csv';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};
// let yMin = 0;//sets the minimum value on the yAxis
// let yMax = 1500;//sets the maximum value on the xAxis
// const yAxisHighlight = 100; //sets which tick to highlight on the yAxis
// const numTicksy = 3;//Number of tick on the uAxis
// const yAxisAlign = "right";//alignment of the axis
// const interval = "years";//date interval on xAxis "decade", "lustrum", "years","months","days"
// let annotate = true; // show annotations, defined in the 'annotate' column
// let markers = false;//show dots on lines
// let legendAlign = "vert";//hori or vert, alignment of the legend
// let legendType = "line";//rect, line or circ, geometry of legend marker
// let interpolation=d3.curveLinear//curveStep, curveStepBefore, curveStepAfter, curveBasis, curveCardinal, curveCatmullRom
// let minorAxis = true//turns on or off the minor axis

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
   .margin({ top: 100, left: 15, bottom: 82, right: 5 })
   // .title("Put headline here") //use this if you need to override the defaults
   // .subtitle("Put headline |here") //use this if you need to override the defaults
   .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 86, right: 5 })
   // .title("Put headline here")
   .height(500),

    webL: gChartframe.webFrameL(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 104, right: 5 })
   // .title("Put headline here")
   .height(700)
   .fullYear(true),

    print: gChartframe.printFrame(sharedConfig)
    .margin({ top: 40, left: 7, bottom: 35, right: 7 })
    // .title("Put headline here")
    //.width(53.71)// 1 col
    .width(112.25)// 2 col
    //.width(170.8)// 3 col
    //.width(229.34)// 4 col
    //.width(287.88)// 5 col
    //.width(346.43)// 6 col
    //.width(74)// markets std print
    .height(58.21),//markets std print

    social: gChartframe.socialFrame(sharedConfig)
   .margin({ top: 140, left: 50, bottom: 138, right: 40 })
   // .title("Put headline here")
   .height(750), // 700 is ideal height for Instagram

    video: gChartframe.videoFrame(sharedConfig)
   .margin({ left: 207, right: 207, bottom: 210, top: 233 }),
   // .title("Put headline here")
};

// add the frames to the page...
d3.selectAll('.framed')
    .each(function addFrames() {
        const figure = d3.select(this);
        figure.select('svg')
            .call(frame[figure.node().dataset.frame]);
    });

parseData.fromCSV(dataFile).then(({ data }) => {
    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        const yAxis = gAxis.yLinear()
            .range([currentFrame.dimension().height, 0])
            .tickSize(currentFrame.dimension().width)
            .align('left')
            .frameName(frameName);

        const xAxis = gAxis.xLinear()
            .domain(d3.extent(data))
            .frameName(frameName);

        const histogramGenerator = d3.histogram()
            .domain(xAxis.scale().domain())
            .thresholds(xAxis.scale().ticks(thresholds));

        const bins = histogramGenerator(data);

        yAxis.domain(d3.extent(bins, d => d.length));

        const myChart = histogram.draw()
            .yScale(yAxis.scale())
            .xScale(xAxis.scale())
            .xRange([0, currentFrame.dimension().width])
            .thresholds(thresholds)
            .rem(currentFrame.rem());

        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        currentFrame.plot()
            .selectAll('lines')
            .data(bins)
            .enter()
            .append('g')
            .attr('class', 'bins')
            .call(myChart);
    });
    // addSVGSavers('figure.saveable');
});
