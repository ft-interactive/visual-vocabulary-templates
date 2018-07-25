/**
 * Bootstrapping code for lollipop chart
 */

import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as lollipopChart from './lollipopChart.js';

const dataURL = 'data.csv';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};
const xMin = 0;// sets the minimum value on the yAxis
const xMax = 0;// sets the maximum value on the yAxis

// display options
const dotWidth = 0.3;// 0 = no display, 0.5 = half the width of the column, 1 = full width
const stalkWidth = 0.08;// 0 = no display 0.5 = half the width of the column, 1 = full width

const dots = dotWidth > 0;
const stalks = stalkWidth > 0;

let xAxisHighlight;// = 20; //sets which tick to highlight on the yAxis
const numTicksX = 8;// Number of tick on the uAxis
const yAxisAlign = 'left';// alignment of the y axis
const xAxisAlign = 'bottom';
const logScale = false;
const divisor = 1;// sets the formatting on linear axis for ’000s and millions

// const legendAlign = 'vert';// hori or vert, alignment of the legend

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
   .margin({ top: 100, left: 15, bottom: 82, right: 10 })
   // .title("Put headline here") //use this if you need to override the defaults
   // .subtitle("Put headline |here") //use this if you need to override the defaults
   .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 86, right: 5 })
   // .title("Put headline here")
   .height(500),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
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
    .width(53.71)// 1 col
    //.width(112.25)// 2 col
    // .width(170.8)// 3 col
    // .width(229.34)// 4 col
    // .width(287.88)// 5 col
    // .width(346.43)// 6 col
    // .width(74)// markets std print
    .height(69.85), // std print (Use 58.21mm for markets charts that matter)

    social: gChartframe.socialFrame(sharedConfig)
   .margin({ top: 140, left: 40, bottom: 138, right: 40 })
   // .title("Put headline here")
   .width(612)
   .height(612),

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

parseData.load(dataURL)
.then(({ seriesNames, valueExtent, data }) => {
    // set up axes
    const myXAxis = gAxis.xLinear();
    const myYAxis = gAxis.yOrdinal();

    // define chart
    const myChart = lollipopChart.draw()
      .seriesNames(seriesNames)
      .xAxisAlign(xAxisAlign);

    // draw, for each frame
    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        // define other functions to be called
        const tickSize = currentFrame.dimension().height;// Used when drawing the xAxis ticks

        myChart.stalks(stalks);
        myChart.dots(dots);

        if (dots) {
            myChart.dotWidth(dotWidth);
        }
        if (stalks) {
            myChart.stalkWidth(stalkWidth);
        }

        const newMarginRight = currentFrame.margin().right + currentFrame.rem();
        currentFrame.margin({ right: newMarginRight });

        // should be able to set domain from myChart??
        myYAxis
          .domain(data.map(d => d.name))
          .rangeRound([0, currentFrame.dimension().height])
          .align(yAxisAlign)
          .frameName(frameName);
          // .domain(data.map(function(d){return d.name}))

        // call axes
        currentFrame.plot()
          .call(myYAxis);

        // return the value in the variable newMargin
        if (yAxisAlign === 'right') {
            const newMargin = myYAxis.labelWidth() + currentFrame.margin().right;
            // Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({ right: newMargin });
            myYAxis.yLabel().attr('transform', `translate(${currentFrame.dimension().width + myYAxis.labelWidth() + currentFrame.rem()},0)`);
        } else {
            const newMargin = myYAxis.labelWidth() + currentFrame.margin().left;
            // Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({ left: newMargin });
        }

        d3.select(currentFrame.plot().node().parentNode)
          .call(currentFrame);

        myXAxis
          .domain([Math.min(xMin, valueExtent[0]), Math.max(xMax, valueExtent[1])])
          .range([0, currentFrame.dimension().width])
          .numTicks(numTicksX)
          .tickSize(tickSize)
          .xAxisHighlight(xAxisHighlight)
          .align(xAxisAlign)
          .frameName(frameName)
          .logScale(logScale)
          .divisor(divisor);

        myChart.xScale(myXAxis.scale());

        currentFrame.plot()
          .call(myXAxis);

        if (xAxisAlign === 'top') {
            myXAxis.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
        }

        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        myChart
          .xRange([0, currentFrame.dimension().width])
          .yScale(myYAxis.scale())
          .plotDim(currentFrame.dimension())
          .rem(currentFrame.rem())
          .colourPalette((frameName));

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
