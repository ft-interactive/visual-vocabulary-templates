/**
 * Bootstrapping code for line chart
 */

import * as d3 from 'd3';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as drawChart from './drawChart.js';
import * as annotation from 'g-annotations';

const dataFile = 'data.csv';

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
const xMin = -80;// sets the minimum value on the yAxis
const xMax = 100;// sets the maximum value on the xAxis
const xAxisHighlight = 0; // sets which tick to highlight on the yAxis
const numTicks = 6;// Number of tick on the uAxis
const yAxisAlign = 'left';// alignment of the axis
const xAxisAlign = 'bottom';// alignment of the axis
const interval = 'fiscal';// date interval on xAxis "century", "jubilee", "decade", "lustrum", "years", "months", "days", "hours"
const legendType = 'dots';// rect, line or circ, geometry of legend marker
const invertScale = false;
const banding = true
const divisor = 1;
const opacity = 0.7;
const scaleFactor = 1.1;
const turnWidth = 100

// Individual frame configuration, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
 .margin({ top: 100, left: 15, bottom: 82, right: 15 })
 // .title('Put headline here') // use this if you need to override the defaults
 // .subtitle("Put headline |here") //use this if you need to override the defaults
 .height(500),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 15,
        })
    // .title("Put headline here")
        .height(500),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 104, right:15,
        })
    // .title("Put headline here")
        .height(700)
        .fullYear(true),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 15,
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
parseData.load(dataFile, {})
  .then(({seriesNames, categroies, valueExtent, plotData, annosData}) => {
      Object.keys(frame).forEach((frameName) => {
          const currentFrame = frame[frameName];

          // define other functions to be called

          const tickSize = currentFrame.dimension().height;// Used when drawing the yAxis ticks
          const yAxis = gAxis.yOrdinal();// sets up yAxis
          const xAxis = gAxis.xLinear();
          const myAnnotations = annotation.annotations();// sets up annotations
          const beeswarm = drawChart.draw();
           // create a 'g' element at the back of the chart to add time period
          const background = currentFrame.plot().append('g');

          
          yAxis
            .banding(banding)
            .plotDim([currentFrame.dimension().width,currentFrame.dimension().height])
            .align(yAxisAlign)
            .domain(categroies)
            .rangeRound([0, tickSize], 10)
            .frameName(frameName);

          // Draw the yAxis first, this will position the yAxis correctly and measure the width of the label text
          currentFrame.plot()
            .call(yAxis);

          // return the value in the variable newMargin and move axis if needed
          if (yAxisAlign === 'right') {
              // Use newMargin redefine the new margin and range of xAxis
              yAxis.yLabel()
                  .attr('transform', `translate(${currentFrame.dimension().width},${0})`)
              yAxis.yLabel().selectAll('text')
                .attr('y', -yAxis.bandwidth() / 2)
          }
          else {
              yAxis.yLabel().selectAll('text')
                .attr('y', -yAxis.bandwidth() / 2)
                .style('text-anchor', 'start')
              
              // Use newMargin re define the new margin and range of xAxis
          }

          // Set the plot object to its new dimensions
          d3.select(currentFrame.plot().node().parentNode)
              .call(currentFrame);

          currentFrame.plot().select('.highlights')
            .selectAll('rect')
            .attr('width', currentFrame.dimension().width)

          xAxis
            .range([0, currentFrame.dimension().width])
            .tickSize(currentFrame.dimension().height)
            .align(xAxisAlign)
            .domain([Math.min(xMin, valueExtent[0]), Math.max(xMax, valueExtent[1])])
            .numTicks(numTicks)
            .xAxisHighlight(xAxisHighlight)
            .frameName(frameName)
            .divisor(divisor);

          currentFrame.plot()
            .call(xAxis);

          const sqrtScale = d3.scaleSqrt()
            .domain(valueExtent)
            .range([0,((currentFrame.rem() / 10) * scaleFactor)]);

          
          const plotAnnotation = currentFrame.plot().append('g').attr('class', 'annotations-holder');

          beeswarm
            .colourPalette((frameName))
            .sizeScale(sqrtScale)
            .scaleFactor(scaleFactor)
            .seriesNames(seriesNames)
            .yScale(yAxis.scale())
            .xScale(xAxis.scale())
            .rem(currentFrame.rem())
            .plotDim([currentFrame.dimension().width,currentFrame.dimension().width])
          
          currentFrame.plot()
            .selectAll('swarms')
            .data(plotData)
            .enter()
            .append('g')
            .attr('id', d => `bees__${d.name.toLowerCase()}`)
            .call(beeswarm);

          // myAnnotations
          //           .xScale(xAxis.scale())
          //           .yScale(yAxis.scale())
          //           .rem(currentFrame.rem())
          //           .sizeScale(sqrtScale)
          //           .frameName(frameName)
          //           .lineWidth(turnWidth)
          //           .plotDim([currentFrame.dimension().width,currentFrame.dimension().width])

          // plotAnnotation
          //           .selectAll('.annotations')
          //           .data(annosData)
          //           .enter()
          //           .append('g')
          //           .call(myAnnotations)



      });
      // addSVGSavers('figure.saveable');
  });
