/**
 * Bootstrapping code for lollipop chart
 */

import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as lollipopChart from './scatter.js';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};

const xMin = 0;// sets the minimum value on the yAxis
const xMax = 0;// sets the maximum value on the yAxis
const yMin = 0;// sets the minimum value on the yAxis
const yMax = 0;// sets the maximum value on the yAxis

// display options


let yAxisHighlight;// = 20; //sets which tick to highlight on the yAxis
const numTicksy = 5;// Number of tick on the uAxis
const yAxisAlign = 'right';// alignment of the y axis
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
   .height(68)
   .width(55),

    social: gChartframe.socialFrame(sharedConfig)
   .margin({ top: 140, left: 50, bottom: 138, right: 40 })
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

parseData.fromCSV('data.csv').then(({ seriesNames, valueExtent, data }) => {


  console.log(seriesNames)

    // set up axes
    const myYAxis = gAxis.yLinear();
    const myXAxis = gAxis.xLinear();

    // define chart
    const myChart = lollipopChart.draw()
      .seriesNames(seriesNames)
      .xDomain([Math.min(xMin, valueExtent[0]), Math.max(xMax, valueExtent[1])])
      .yDomain([Math.min(yMin, valueExtent[0]), Math.max(yMax, valueExtent[1])])
      .yAxisAlign(yAxisAlign);

    // draw, for each frame
    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        // define other functions to be called
        const tickSize = currentFrame.dimension().width;// Used when drawing the yAxis ticks

        /*myChart.stalks(stalks);
        myChart.dots(dots);*/

        myYAxis
          .domain([Math.min(yMin, valueExtent[0]), Math.max(yMax, valueExtent[1])])
          .range([currentFrame.dimension().height, 0])
          .numTicks(numTicksy)
          .tickSize(tickSize)
          .yAxisHighlight(yAxisHighlight)
          .align(yAxisAlign)
          .frameName(frameName);

        currentFrame.plot()
          .call(myYAxis);

        //return the value in the variable newMargin
        if (yAxisAlign == 'right' ){
            let newMargin = myYAxis.labelWidth() +currentFrame.margin().right
            //Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({right:newMargin});
            //yAxis.yLabel().attr('transform', `translate(${currentFrame.dimension().width},0)`);
        }
        if (yAxisAlign == 'left' ){
            let newMargin = myYAxis.labelWidth() + currentFrame.margin().left
            //Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({left:newMargin});
            myYAxis.yLabel().attr('transform', `translate(${(myYAxis.tickSize()-myYAxis.labelWidth())},0)`);
        }


        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        // should be able to set domain from myChart??
        myXAxis
          .domain([Math.min(xMin, valueExtent[0]), Math.max(xMax, valueExtent[1])])
          .range([0, currentFrame.dimension().width])
          .align(xAxisAlign)
          .frameName(frameName);
          // .domain(data.map(function(d){return d.name}))

        // call axes
        currentFrame.plot()
          .call(myXAxis);

        if (xAxisAlign == 'bottom' ){
            myXAxis.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
        }
        if (xAxisAlign == 'top' ){
            myXAxis.xLabel().attr('transform', `translate(0,${myXAxis.tickSize()})`);
        }

        myChart
          .yRange([currentFrame.dimension().height, 0])
          .xScale(myXAxis.scale())
          .plotDim(currentFrame.dimension())
          .rem(currentFrame.rem())
          .colourPalette((frameName));

          // draw lollipops
        currentFrame.plot()
          .append('g')
          .attr('id', 'scatterplot')
          .selectAll('.scatterplot')
          .data(data)
          .enter()
          .append('g')
          .attr('class', 'scatterplot')
          .attr('id', d => d.name)
          .call(myChart);

        d3.select(currentFrame.plot().node().parentNode)
          .call(currentFrame);
    });
    // addSVGSavers('figure.saveable');
});
