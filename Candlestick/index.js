/**
 * Bootstrapping code for line chart
 */

import * as d3 from 'd3';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as candlestick from './candlestick.js';
import gChartcolour from 'g-chartcolour';

const dataFile = 'data.csv';

const dateStructure = '%d/%m/%Y';
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
    title: 'Candlestick chart',
    subtitle: 'Intraday true',
    source: 'Source not yet added',
};

const yMin = 560;// sets the minimum value on the yAxis
const yMax = 680;// sets the maximum value on the xAxis
const yAxisHighlight = 560; // sets which tick to highlight on the yAxis
const numTicksy = 5;// Number of tick on the uAxis
const yAxisAlign = 'right';// alignment of the axis
const xAxisAlign = 'bottom';// alignment of the axis
const interval = 'days';// date interval on xAxis "century", "jubilee", "decade", "lustrum", "years","months","days"
const annotate = true; // show annotations, defined in the 'annotate' column
const markers = false;// show dots on lines
const legendAlign = 'vert';// hori or vert, alignment of the legend
const legendType = 'line';// rect, line or circ, geometry of legend marker
const minorAxis = false;// turns on or off the minor axis
const highlightNames = []; // create an array names you want to highlight eg. ['series1','series2']
const invertScale = false;
const logScale = false;
const intraday = true;
const chartColour = d3.scaleOrdinal()
  .domain(Object.keys(gChartcolour.categorical_bar))
  .range(Object.values(gChartcolour.categorical_bar));


// Individual frame configuration, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
 .margin({ top: 100, left: 15, bottom: 82, right: 5 })
 //.title('Put headline here') // use this if you need to override the defaults
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

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
 .margin({ top: 100, left: 20, bottom: 86, right: 5 })
 // .title("Put headline here")
 .height(500),

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
 .width(612)
 .height(612), // 700 is ideal height for Instagram

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
parseData.fromCSV(dataFile, dateStructure, { yMin, highlightNames }).then(({seriesNames, data, plotData, valueExtent, highlights, annos}) => {

    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        // define other functions to be called
        const myYAxis = gAxis.yLinear();// sets up yAxis
        const myXAxis = gAxis.xDate();// sets up xAxis
        // const plotDim=currentFrame.dimension()//useful variable to carry the current frame dimensions
        const tickSize = currentFrame.dimension().width;// Used when drawing the yAxis ticks
        const myChart = candlestick.draw();
        const myHighlights = candlestick.drawHighlights();// sets up highlight tonal bands
        const myAnnotations = candlestick.drawAnnotations();// sets up annotations


          // .seriesNames(seriesNames)
          // .highlightNames(highlightNames)

        // create a 'g' element at the back of the chart to add time period
        // highlights after axis have been created
        const axisHighlight = currentFrame.plot().append('g');

        // create a 'g' element behind the chart and in front of the highlights
        const plotAnnotation = currentFrame.plot().append('g').attr('class', 'annotations-holder');

        myYAxis
          .domain([Math.min(yMin, valueExtent[0]), Math.max(yMax, valueExtent[1])])
          .range([currentFrame.dimension().height, 0])
          .numTicks(numTicksy)
          .tickSize(tickSize)
          .yAxisHighlight(yAxisHighlight)
          .align(yAxisAlign)
          .frameName(frameName)
          .invert(invertScale);

        // Draw the yAxis first, this will position the yAxis correctly and
        // measure the width of the label text
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

        // axisHighlight.append("rect")
        //   .attr("width", currentFrame.dimension().width)
        //   .attr("height",currentFrame.dimension().height)
        //   .attr("fill","#ededee");
        let xDomain;
        if (intraday) {
             xDomain = plotData.map(function(d) { return d.date;})  
            }
        else {xDomain = d3.extent(plotData, d => d.date)}

        // Set up xAxis for this frame
        myXAxis
          .domain(xDomain)
          .range([0, currentFrame.dimension().width])
          .align(xAxisAlign)
          .fullYear(false)
          .interval(interval)
          .tickSize(currentFrame.rem()* 0.75)
          .minorAxis(minorAxis)
          .minorTickSize(currentFrame.rem()* 0.3)
          .fullYear(false)
          .frameName(frameName)
          .intraday(intraday);

        // Draw the xAxis
        currentFrame.plot()
          .call(myXAxis);

        if (xAxisAlign == 'bottom' ){
            myXAxis.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
            if(minorAxis) {
                myXAxis.xLabelMinor().attr('transform', `translate(0,${currentFrame.dimension().height})`);

            }
        }
        if (xAxisAlign == 'top' ){
            myXAxis.xLabel().attr('transform', `translate(0,${myXAxis.tickSize()})`);
        }

        const boxWidth = (currentFrame.dimension().width) / (plotData.length-1);

        myChart
          .yScale(myYAxis.scale())
          .xScale(myXAxis.scale())
          .plotDim(currentFrame.dimension())
          .rem(currentFrame.rem())
          .colourPalette(chartColour)
          .intraday(intraday)
          .boxWidth(boxWidth);

        currentFrame.plot()
          .selectAll('lines') 
          .data(plotData.slice(0,-1))
          .enter()
          .append('g')
          .attr('class', 'whisker')
          .attr('id', d => d.name)
          .call(myChart);

        // Set up highlights for this frame
        myHighlights
          .yScale(myYAxis.scale())
          .xScale(myXAxis.scale());

        //Draw the highlights before the lines and xAxis
        axisHighlight
          .selectAll('.highlights')
          .data(highlights)
          .enter()
          .append('g')
          .call(myHighlights);

        // Set up highlights for this frame
        myAnnotations
          .yScale(myYAxis.scale())
          .xScale(myXAxis.scale())
          .rem(currentFrame.rem());

        // Draw the annotations before the lines
        plotAnnotation
          .selectAll('.annotation')
          .data(annos)
          .enter()
          .append('g')
          .call(myAnnotations);


    });
    // addSVGSavers('figure.saveable');
});
