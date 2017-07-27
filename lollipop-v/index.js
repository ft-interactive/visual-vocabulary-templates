/**
 * Bootstrapping code for lollipop chart
 */

import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as lollipopChart from './lollipopChart.js';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};
const yMin = 0;// sets the minimum value on the yAxis
const yMax = 0;// sets the maximum value on the yAxis

// display options
const dotWidth = 0.3;// 0 = no display, 0.5 = half the width of the column, 1 = full width
const stalkWidth = 0.1;// 0 = no display 0.5 = half the width of the column, 1 = full width

let dots;
let stalks;

if (dotWidth > 0) {
    dots = true;
} else {
    dots = false;
}

if (stalkWidth > 0) {
    stalks = true;
} else {
    stalks = false;
}

let yAxisHighlight;// = 20; //sets which tick to highlight on the yAxis
const numTicksy = 8;// Number of tick on the uAxis
const yAxisAlign = 'left';// alignment of the y axis
const xAxisAlign = 'bottom'

// const legendAlign = 'vert';// hori or vert, alignment of the legend

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
   .height(700),

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
        figure.select('svg').call(frame[figure.node().dataset.frame]);
    });

parseData.fromCSV('data.csv').then(({ seriesNames, valueExtent, data }) => {
    // set up axes
    const myYAxis = gAxis.yLinear();
    const myXAxis = gAxis.xOrdinal();

    // define chart
    const myChart = lollipopChart.draw()
      .seriesNames(seriesNames)
      .xDomain(data.map(d => d.name))
      .yDomain([Math.min(yMin, valueExtent[0]), Math.max(yMax, valueExtent[1])])
      .yAxisAlign(yAxisAlign);

    // draw, for each frame
    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        // define other functions to be called
        const tickSize = currentFrame.dimension().width;// Used when drawing the yAxis ticks

        myChart.stalks(stalks);
        myChart.dots(dots);

        if (dots) {
            myChart.dotWidth(dotWidth);
        }
        if (stalks) {
            myChart.stalkWidth(stalkWidth);
        }

        myChart
          .yRange([currentFrame.dimension().height, 0])
          .xRange([currentFrame.dimension().width, 0])
          .plotDim(currentFrame.dimension())
          .rem(currentFrame.rem())
          .colourPalette((frameName));


        myYAxis
          .scale(myChart.yScale())
          .numTicks(numTicksy)
          .tickSize(tickSize)
          .yAxisHighlight(yAxisHighlight)
          .align(myChart.yAxisAlign());

        currentFrame.plot()
          .call(myYAxis);

        //return the value in the variable newMargin
        if (yAxisAlign == 'right' ){
            let newMargin = myYAxis.labelWidth()+currentFrame.margin().right
            //Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({right:newMargin});
            //yAxis.yLabel().attr('transform', `translate(${currentFrame.dimension().width},0)`);
        }
        if (yAxisAlign == 'left' ){
            let newMargin = myYAxis.labelWidth()+currentFrame.margin().left
            //Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({left:newMargin});
            myYAxis.yLabel().attr('transform', `translate(${(myYAxis.tickSize()-myYAxis.labelWidth())},0)`);
        }


        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        // should be able to set domain from myChart??
        myXAxis
          .domain(myChart.xScale().domain())
          .rangeRound([0, currentFrame.dimension().width])
          .offset(currentFrame.dimension().height + (currentFrame.rem() / 2));
          // .domain(data.map(function(d){return d.name}))

        // call axes
        currentFrame.plot()
          .call(myYAxis);
        currentFrame.plot()
          .call(myXAxis);

          // draw lollipops
        currentFrame.plot()
          .append('g')
          .attr('id', 'lollipops')
          .selectAll('.lollipops')
          .data(data)
          .enter()
          .append('g')
          .attr('class', 'lollipops')
          .attr('id', d => d.name)
          .call(myChart);

        d3.select(currentFrame.plot().node().parentNode)
          .call(currentFrame);
    });
    // addSVGSavers('figure.saveable');
});
