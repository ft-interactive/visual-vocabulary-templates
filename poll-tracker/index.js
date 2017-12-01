/**
 * Bootstrapping code for line chart
 */

import * as d3 from 'd3';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as drawchart from './drawChart.js';
import gChartcolour from 'g-chartcolour';

const dataFile = 'dotsData.csv';
const lineFile = 'lineData.csv';

const dateFormat = '%d/%m/%Y';
/*
  some common formatting parsers....
  '%m/%d/%Y'        01/28/1986
  '%d-%b-%y'        28-Jan-86
  '%Y %b'           1986 Jan
  '%Y-%m-%d'        1986-01-28
  '%B %d'           January 28
  '%d %b'           28 Jan
  '%H:%M'           11:39
  '%H:%M %p'        11:39 AM
  '%d/%m/%Y %H:%M'  28/01/2016 11:39
*/

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};
//Put the user defined variablesin delete where not applicable
const yMin = 0;// sets the minimum value on the yAxis
const yMax = 45;// sets the maximum value on the xAxis
const divisor = 1
const yAxisHighlight = 0; // sets which tick to highlight on the yAxis
const numTicks = 5;// Number of tick on the uAxis
const yAxisAlign = 'left';// alignment of the axis
const xAxisAlign = 'bottom';// alignment of the axis
const interval = 'years';// date interval on xAxis "century", "jubilee", "decade", "lustrum", "years", "months", "days", "hours"
const annotate = true; // show annotations, defined in the 'annotate' column
const markers = false;// show dots on lines
const legendAlign = 'vert';// hori or vert, alignment of the legend
const legendType = 'line';// rect, line or circ, geometry of legend marker
const minorAxis = false;// turns on or off the minor axis
const highlightNames = []; // create an array names you want to highlight eg. ['series1','series2']
const interpolation = d3.curveLinear;// curveStep, curveStepBefore, curveStepAfter, curveBasis, curveCardinal, curveCatmullRom
const invertScale = false;
const logScale = false;
const joinPoints = true;// Joints gaps in lines where there are no data points
const intraday = false;
const dotOpacity = 0.2;
const partyColours = d3.scaleOrdinal()
  .domain(Object.keys(gChartcolour.germanPoliticalParties_bar))
  .range(Object.values(gChartcolour.germanPoliticalParties_bar));


// Individual frame configuration, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
 .margin({ top: 100, left: 15, bottom: 82, right: 5 })
 // .title('Put headline here') // use this if you need to override the defaults
 // .subtitle("Put headline |here") //use this if you need to override the defaults
 .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 10,
        })
    // .title("Put headline here")
        .height(500),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 104, right: 10,
        })
    // .title("Put headline here")
        .height(700)
        .fullYear(true),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 10,
        })
    // .title("Put headline here")
        .height(500),

    print: gChartframe.printFrame(sharedConfig)
 .margin({ top: 40, left: 7, bottom: 35, right: 7 })
  // .title("Put headline here")
  //.width(53.71)// 1 col
  .width(112.25)// 2 col
  // .width(170.8)// 3 col
  // .width(229.34)// 4 col
  // .width(287.88)// 5 col
  // .width(346.43)// 6 col
  // .width(74)// markets std print
  .height(69.85), // std print (Use 58.21mm for markets charts that matter)

    social: gChartframe.socialFrame(sharedConfig)
        .margin({
            top: 140, left: 50, bottom: 138, right: 40,
        })
    // .title("Put headline here")
        .width(612)
        .height(612), // 700 is ideal height for Instagram

    video: gChartframe.videoFrame(sharedConfig)
        .margin({
            left: 207, right: 207, bottom: 210, top: 233,
        }),
    // .title("Put headline here")
};


// add the frames to the page...
d3.selectAll('.framed')
  .each(function addFrames() {
      const figure = d3.select(this)
        .attr('class', 'button-holder');

      figure.select('svg')
          .call(frame[figure.node().dataset.frame]);
  });
parseData.load(dataFile, { dateFormat })
  .then(({ plotData, dateExtent, valueExtent, data, pollsters}) => {
      Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];
        const yAxis = gAxis.yLinear();//sets up the yAxis
        const xAxis = gAxis.xDate();// sets up xAxis
        const polls = drawchart.drawDots(); // eslint-disable-line


        // define other functions to be called

        const tickSize = currentFrame.dimension().width;// Used when drawing the yAxis ticks

        // create a 'g' element at the back of the chart to add time period
        const background = currentFrame.plot().append('g');

        yAxis
          .domain([Math.min(yMin, valueExtent[0]), Math.max(yMax, valueExtent[1])])
          .divisor(divisor)
          .range([currentFrame.dimension().height, 0])
          .tickSize(currentFrame.dimension().width)
          .numTicks(numTicks)
          .align(yAxisAlign)
          .logScale(logScale)
          .frameName(frameName);

        currentFrame.plot()
        .call(yAxis);

        // return the value in the variable newMargin
        if (yAxisAlign === 'right') {
            const newMargin = yAxis.labelWidth() + currentFrame.margin().right;
            // Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({ right: newMargin });
            // yAxis.yLabel().attr('transform', `translate(${currentFrame.dimension().width},0)`);
        }
        if (yAxisAlign === 'left') {
            const newMargin = yAxis.labelWidth() + currentFrame.margin().left;
            // Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({ left: newMargin });
            yAxis.yLabel().attr('transform', `translate(${(yAxis.tickSize() - yAxis.labelWidth())},0)`);
        }
        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        xAxis
          .domain(dateExtent)
          .range([0, currentFrame.dimension().width])
          .align(xAxisAlign)
          .fullYear(false)
          .interval(interval)
          .tickSize(currentFrame.rem() * 0.75)
          .minorAxis(minorAxis)
          .minorTickSize(currentFrame.rem() * 0.3)
          .fullYear(false)
          .frameName(frameName)
          .intraday(intraday);

        // Draw the xAxis
        currentFrame.plot()
          .call(xAxis);

        if (xAxisAlign === 'bottom') {
          xAxis.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
          if (minorAxis) {
            xAxis.xLabelMinor().attr('transform', `translate(0,${currentFrame.dimension().height})`);
          }
        }
        if (xAxisAlign === 'top') {
            xAxis.xLabel().attr('transform', `translate(0,${xAxis.tickSize()})`);
        }
        polls
          .yScale(yAxis.scale())
          .xScale(xAxis.scale())
          .plotDim(currentFrame.dimension())
          .rem(currentFrame.rem())
          .colourPalette(partyColours)
          .dotOpacity(dotOpacity);

        currentFrame.plot()
          .selectAll('dots')
          .data(plotData)
          .enter()
          .append('g')
          .attr('id', d => d.party)
          .call(polls)

        background.append('rect')
          .attr('width', currentFrame.dimension().width)
          .attr('height', currentFrame.dimension().height)
          .attr('fill', '#ededee');
    });
      // addSVGSavers('figure.saveable');
  });