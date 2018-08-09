/**
 * Bootstrapping code for line chart
 */

import * as d3 from 'd3';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import gChartcolour from 'g-chartcolour';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as streamChart from './streamChart.js';

const dataFile = 'data.csv';

const dateFormat = '%Y';
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
    title: 'Premiership club sponsoship',
    subtitle: 'By sector',
    source: 'Source not yet added',
};

const yMin = -5;// sets the minimum value on the yAxis
const yMax = 25;// sets the maximum value on the xAxis
const divisor = 1;// sets the formatting on linear axis for ’000s and millions
const yAxisHighlight = 0; // sets which tick to highlight on the yAxis
const numTicksy = 5;// Number of tick on the uAxis
const yAxisAlign = 'right';// alignment of the axis
const xAxisAlign = 'bottom';// alignment of the axis
const interval = 'lustrum';// date interval on xAxis "century", "jubilee", "decade", "lustrum", "years", "months", "days", "hours"
const annotate = true; // show annotations, defined in the 'annotate' column
const markers = false;// show dots on lines
const legendAlign = 'vert';// hori or vert, alignment of the legend
const legendType = 'rect';// rect, line or circ, geometry of legend marker
const minorAxis = true;// turns on or off the minor axis
const highlightNames = []; // create an array names you want to highlight eg. ['series1','series2']
const interpolation = d3.curveLinear;// curveStep, curveStepBefore, curveStepAfter, curveBasis, curveCardinal, curveCatmullRom
const invertScale = false;
const logScale = false;
const joinPoints = true;// Joints gaps in lines where there are no data points
const intraday = false;

// Individual frame configuration, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
 .margin({ top: 100, left: 15, bottom: 82, right: 15 })
 // .title('Put headline here') // use this if you need to override the defaults
 // .subtitle("Put headline |here") //use this if you need to override the defaults
 .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 15,
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
            top: 100, left: 20, bottom: 86, right: 25,
        })
    // .title("Put headline here")
        .height(500),

    print: gChartframe.printFrame(sharedConfig)
 .margin({ top: 40, left: 7, bottom: 35, right: 7 })
  // .title("Put headline here")
  .width(199)// 1 col
  // .width(112.25)// 2 col
  // .width(170.8)// 3 col
  // .width(229.34)// 4 col
  // .width(287.88)// 5 col
  // .width(346.43)// 6 col
  // .width(74)// markets std print
  .height(80), // std print (Use 58.21mm for markets charts that matter)

    social: gChartframe.socialFrame(sharedConfig)
        .margin({
            top: 140, left: 40, bottom: 138, right: 40,
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
      const figure = d3.select(this);
      figure.select('svg')
          .call(frame[figure.node().dataset.frame]);
  });
parseData.load(dataFile, { dateFormat, yMin, joinPoints, highlightNames })
.then(({ seriesNames, data, plotData, highlightLines, valueExtent, highlights, annos,series }) => {
    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        // define other functions to be called
        const myYAxis = gAxis.yLinear();// sets up yAxis
        const myXAxis = gAxis.xDate();// sets up xAxis
        const myLegend = gLegend.legend();// sets up the legend
        // const plotDim=currentFrame.dimension()//useful variable to carry the current frame dimensions
        const tickSize = currentFrame.dimension().width;// Used when drawing the yAxis ticks
        const myChart = streamChart.draw()
          .seriesNames(seriesNames)
          .highlightNames(highlightNames)
          .markers(markers)
          .annotate(annotate)
          .interpolation(interpolation);
        const myLabels = streamChart.label()
        const myHighLines = streamChart.draw()
          .seriesNames(seriesNames)
          .highlightNames(highlightNames)
          .markers(markers)
          .annotate(annotate)
          .interpolation(interpolation);

        const highlightedLines = colourPalette(frameName);

        function colourPalette(d) {
            const newPalette = d3.scaleOrdinal();
            if (d === 'social' || d === 'video') {
                newPalette
                .domain(highlightNames)
                .range(Object.values(gChartcolour.lineSocial));
            }
            if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
                newPalette
                .domain(highlightNames)
                .range(Object.values(gChartcolour.lineWeb));
            }
            if (d === 'print') {
                newPalette
                .domain(highlightNames)
                .range(Object.values(gChartcolour.linePrint));
            }
            return newPalette;
        }

        // create a 'g' element at the back of the chart to add time period
        // highlights after axis have been created
        const axisHighlight = currentFrame.plot().append('g');

        // create a 'g' element behind the chart and in front of the highlights

        myYAxis
          .divisor(divisor)
          .domain([Math.min(yMin, valueExtent[0]), Math.max(yMax, valueExtent[1])])
          .range([currentFrame.dimension().height, 0])
          .numTicks(numTicksy)
          .tickSize(tickSize)
          .yAxisHighlight(yAxisHighlight)
          .align(yAxisAlign)
          .frameName(frameName)
          .invert(invertScale)
          .logScale(logScale);

        // Draw the yAxis first, this will position the yAxis correctly and
        // measure the width of the label text
        // currentFrame.plot()
        //   .call(myYAxis);

        // // return the value in the variable newMargin
        // if (yAxisAlign === 'right') {
        //     const newMargin = myYAxis.labelWidth() + currentFrame.margin().right;
        //     // Use newMargin redefine the new margin and range of xAxis
        //     currentFrame.margin({ right: newMargin });
        //     // yAxis.yLabel().attr('transform', `translate(${currentFrame.dimension().width},0)`);
        // }
        // if (yAxisAlign === 'left') {
        //     const newMargin = myYAxis.labelWidth() + currentFrame.margin().left;
        //     // Use newMargin redefine the new margin and range of xAxis
        //     currentFrame.margin({ left: newMargin });
        //     myYAxis.yLabel().attr('transform', `translate(${(myYAxis.tickSize() - myYAxis.labelWidth())},0)`);
        // }
        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        // axisHighlight.append("rect")
        //   .attr("width", currentFrame.dimension().width)
        //   .attr("height",currentFrame.dimension().height)
        //   .attr("fill","#ededee");
        let xDomain;
        if (intraday) {
            xDomain = data.map(d => d.date);
        } else { xDomain = d3.extent(data, d => d.date); }

        // Set up xAxis for this frame
        myXAxis
          .domain(xDomain)
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
          .call(myXAxis);

        if (xAxisAlign === 'bottom') {
            myXAxis.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
            if (minorAxis) {
                myXAxis.xLabelMinor().attr('transform', `translate(0,${currentFrame.dimension().height})`);
            }
        }
        if (xAxisAlign === 'top') {
            myXAxis.xLabel().attr('transform', `translate(0,${myXAxis.tickSize()})`);
        }

        myChart
          .yScale(myYAxis.scale())
          .xScale(myXAxis.scale())
          .plotDim(currentFrame.dimension())
          .rem(currentFrame.rem())
          .colourPalette((frameName));

        // Draw the lines
        currentFrame.plot()
          .selectAll('.areas')
          .data(series)
          .enter()
          .append('g')
          .attr('class', 'areas')
          .attr('id', d => d.name)
          .call(myChart);

        const plotAnnotation = currentFrame.plot().append('g').attr('class', 'annotations-holder');

        myLabels
          .yScale(myYAxis.scale())
          .xScale(myXAxis.scale())
          .plotDim(currentFrame.dimension())
          .rem(currentFrame.rem())
          .colourPalette((frameName));

        plotAnnotation
          .selectAll('.annotation')
          .data(series)
          .enter()
          .append('g')
          .attr('class', 'annotation')
          .attr('id', d => d.name)
          .call(myLabels);

    });
    // addSVGSavers('figure.saveable');
});
