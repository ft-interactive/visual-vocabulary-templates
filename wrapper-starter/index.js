import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import * as CHANGETHISTOYOURCHARTNAME from './chartNameHere.js';
import * as parseData from './parseData.js';

// User defined constants similar to version 2
const dateStructure = '%d/%m/%Y';

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
   .height(68)
   .width(55),

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

parseData.fromCSV(dataFile, dateStructure).then((data) => {
    // define chart
    const myChart = CHANGETHISTOYOURCHARTNAME.draw() // eslint-disable-line
        .seriesNames(data.seriesNames);

    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        // define other functions to be called
        // const tickSize=currentFrame.dimension().width; //Used when drawing the yAxis ticks

        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);
    });
    // addSVGSavers('figure.saveable');
});
