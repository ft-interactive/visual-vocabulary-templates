/**
 * Bootstrapping code for line chart
 */

import * as d3 from 'd3';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as unitHistogram from './drawChart.js';

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
const yMin = 0;// sets the minimum value on the yAxis
const yMax = 100;// sets the maximum value on the xAxis
const xMin = -100;
const xMax = 100;
const yAxisHighlight = 0; // sets which tick to highlight on the yAxis
const numTicksy = 4;// Number of tick on the uAxis
const yAxisAlign = 'left';// alignment of the axis
const xAxisAlign = 'bottom';// alignment of the axis
const legendAlign = 'vert';// hori or vert, alignment of the legend
const legendType = 'line';// rect, line or circ, geometry of legend marker
const minorAxis = true;// turns on or off the minor axis
const binWidth = 1; //set the width of your bins. If possible, keep this to a unit the reader will understand
const colourThresholds = [0,1,100]; // choose where colors start and end. Comment out for one colour
const highlightText = 'British'; // a string. If this regex exists in d.name, the corresponding block will be highlighted

// const colourThresholds = [];



// Individual frame configuration, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
 .margin({ top: 100, left: 15, bottom: 82, right: 15 })
 // .title('Put headline here') // use this if you need to override the defaults
 // .subtitle("Put headline |here") //use this if you need to override the defaults
 .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({
            top: 0, left: 10, bottom: 120, right: 15,
        })
    // .title("Put headline here")
        .height(500),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 104, right: 15,
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
  // .width(53.71)// 1 col
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

parseData.load(dataFile, {  yMin,  binWidth, highlightText })
  .then(({ bins, selectedNames, plotAnnos, plotData }) => {
      Object.keys(frame).forEach((frameName) => {
          const currentFrame = frame[frameName];

          const myXAxis0 = gAxis.xLinear();// sets up xAxis
          const myXAxis1 = gAxis.xOrdinal();// sets up xAxis
          const myYAxis0 = gAxis.yLinear();// sets up xAxis
          const myYAxis1 = gAxis.yOrdinal();// sets up xAxis
          const myChart = unitHistogram.draw();
          const myAnnotations = unitHistogram.drawAnnotations();

          // define other functions to be called

          const tickSize = currentFrame.dimension().width;// Used when drawing the yAxis ticks

          console.log(plotAnnos)


          myYAxis0
            .range([currentFrame.dimension().height, 0])
            .domain([0,yMax])
            .numTicks(numTicksy)
            .tickSize(tickSize)
            .yAxisHighlight(yAxisHighlight)
            .align(yAxisAlign)
            .frameName(frameName);

          myYAxis1
            .rangeRound([currentFrame.dimension().height, 0])
            .domain( d3.range( 0, yMax + binWidth, binWidth ) )
            .align(yAxisAlign)
            .frameName(frameName);


        const background = currentFrame.plot().append('g'); // eslint-disable-line

        currentFrame.plot()
          .call(myYAxis0);

        // return the value in the variable newMargin
        if (yAxisAlign === 'right') {
            const newMargin = myYAxis0.labelWidth() + currentFrame.margin().right;
            // Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({ right: newMargin });
            // yAxis.yLabel().attr('transform', `translate(${currentFrame.dimension().width},0)`);
        }
        if (yAxisAlign === 'left') {
            const newMargin = myYAxis0.labelWidth() + currentFrame.margin().left;
            // Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({ left: newMargin });
            myYAxis0.yLabel().attr('transform', `translate(${(myYAxis0.tickSize() - myYAxis0.labelWidth())},0)`);
        }
        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

          myXAxis0
            .align(xAxisAlign)
            .domain([xMin,xMax])
            .tickSize(currentFrame.rem()/2)
            // .numTicks(numTicks)
            .range([0, currentFrame.dimension().width])
            .frameName(frameName);

        myXAxis1
            .align(xAxisAlign)
            .domain(d3.range( xMin, xMax + binWidth , binWidth ) )
            .rangeRound([0, currentFrame.dimension().width]);

          let colourDomain = [];

           if(typeof colourThresholds != 'undefined'){
             colourDomain = colourThresholds;
           };

        myChart
            .xScale0(myXAxis0.scale())
            .xScale1(myXAxis1.scale())
            .yScale0(myYAxis0.scale())
            .yScale1(myYAxis1.scale())
            .plotDim(currentFrame.dimension())
            .selectedNames(selectedNames)
            .rem(currentFrame.rem())
            .colourThresholds(colourDomain)
            .colourPalette((frameName));

         myAnnotations
          .xScale0(myXAxis0.scale())
            .xScale1(myXAxis1.scale())
            .yScale0(myYAxis0.scale())
            .yScale1(myYAxis1.scale())
            .rem(currentFrame.rem())
            

        currentFrame.plot()
          .call(myXAxis0);

        if (xAxisAlign === 'bottom') {
            myXAxis0.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
        }
        if (xAxisAlign === 'top') {
            myXAxis0.xLabel().attr('transform', `translate(0,${-myXAxis0.tickSize()})`);
        }

       



        currentFrame.plot()
          .selectAll('.columnHolder')
          .data(plotData)
          .enter()
          .append('g')
          .attr('class', 'columnHolder')
          .attr('data-name',d => d)
          .call(myChart);

          background.append('rect')
            .attr('width', currentFrame.dimension().width)
            .attr('height', currentFrame.dimension().height)
            .attr('fill', '#ededee');

         const plotAnnotation = currentFrame.plot()
                .append('g')
                .attr('class', 'annotations-holder');

        plotAnnotation
          .selectAll('.annotation')
          .data(plotAnnos)
          .enter()
          .append('g')
          .call(myAnnotations);




      });
      // addSVGSavers('figure.saveable');


  });
