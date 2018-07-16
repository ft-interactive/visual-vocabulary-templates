/**
 * Bootstrapping code for line chart
 */

import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import gChartcolour from 'g-chartcolour';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as drawChart from './surplusDeficit.js';

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

/* eslint-disable */
const yMin = -20;// sets the minimum value on the yAxis
const yMax = 10;// sets the maximum value on the xAxis
const divisor = 1;// sets the formatting on linear axis for ’000s and millions
const yAxisHighlight = 0; // sets which tick to highlight on the yAxis
const numTicksy = 5;// Number of tick on the uAxis
const yAxisAlign = 'right';// alignment of the axis
const xAxisAlign = 'bottom';// alignment of the axis
const interval = 'years';// date interval on xAxis "century", "jubilee", "decade", "lustrum", "years","months","days"
const annotate = true; // show annotations, defined in the 'annotate' column
const markers = false;// show dots on lines
const legendAlign = 'hori';// hori or vert, alignment of the legend
const legendType = 'rect';// rect, line or circ, geometry of legend marker
const minorAxis = false;// turns on or off the minor axis
const logScale = false;
const chartColour = d3.scaleOrdinal()
    .domain(Object.keys(gChartcolour.categorical_line))
    .range(Object.values(gChartcolour.categorical_line));

/* eslint-enable */

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
        .margin({ top: 100, left: 15, bottom: 82, right: 5 })
        // .title('Put headline here') // use this if you need to override the defaults
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
        .width(53.71)// 1 col
        // .width(112.25)// 2 col
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
        figure.select('svg')
            .call(frame[figure.node().dataset.frame]);
    });

parseData.load(dataFile, { dateFormat }).then(({ data, seriesNames, plotData, annos, valueExtent, highlights }) => {
    // Define the chart x and x domains.
    // yDomain will automatically overwrite the user defined min and max if the domain is too small

    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        // define other functions to be called
        const myYAxis = gAxis.yLinear();// sets up yAxis
        const myXAxis = gAxis.xDate();// sets up xAxis
        const myHighlights = drawChart.drawHighlights();// sets up highlight tonal bands
        // const myHighlights = drawChart.drawHighlights();// sets up highlight tonal bands
        const myAnnotations = drawChart.drawAnnotations();// sets up annotations
        // const plotDim=currentFrame.dimension()//useful variable to carry the current frame dimensions
        const tickSize = currentFrame.dimension().width;// Used when drawing the yAxis ticks
        const myChart = drawChart.draw()
            .seriesNames(seriesNames)
            .annotate(annotate);


        // create a 'g' element behind the chart and in front of the highlights
        const axisHighlight = currentFrame.plot().append('g');
        myYAxis
            .domain([Math.min(yMin, valueExtent[0]), Math.max(yMax, valueExtent[1])])
            .range([currentFrame.dimension().height, 0])
            .numTicks(numTicksy)
            .tickSize(tickSize)
            .yAxisHighlight(yAxisHighlight)
            .align(myChart.yAxisAlign())
            .frameName(frameName)
            .divisor(divisor);

        // Draw the yAxis first, this will position the yAxis correctly and
        // measure the width of the label text
        currentFrame.plot()
            .call(myYAxis);

        // return the value in the variable newMargin
        if (yAxisAlign === 'right') {
            const newMargin = myYAxis.labelWidth() + currentFrame.margin().right;
            // Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({ right: newMargin });
            // yAxis.yLabel().attr('transform', `translate(${currentFrame.dimension().width},0)`);
        }
        if (yAxisAlign === 'left') {
            const newMargin = myYAxis.labelWidth() + currentFrame.margin().left;
            // Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({ left: newMargin });
            // myYAxis.yLabel().attr('transform', `translate(${(myYAxis.tickSize()-myYAxis.labelWidth())},0)`);
        }

        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        // Set up xAxis for this frame
        myXAxis
            .domain(d3.extent(data, d => d.date))
            .range([0, currentFrame.dimension().width - currentFrame.rem()])
            .align(xAxisAlign)
            .fullYear(false)
            .interval(interval)
            .tickSize(currentFrame.rem() * 0.75)
            .minorAxis(minorAxis)
            .minorTickSize(currentFrame.rem() * 0.3)
            .fullYear(false)
            .frameName(frameName);

        // Draw the xAxis
        currentFrame.plot()
            .call(myXAxis);

        const plotAnnotation = currentFrame.plot().append('g').attr('class', 'annotations-holder');

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
            .colourPalette(chartColour)
            .frameName(frameName)
            .yAxisHighlight(yAxisHighlight);

        // Set up highlights for this frame
        myHighlights
          .yScale(myYAxis.scale())
          .xScale(myXAxis.scale());

        // Draw the highlights before the lines and xAxis
        axisHighlight
          .selectAll('.highlights')
          .data(highlights)
          .enter()
          .append('g')
          .attr('class', 'highlights')
          .call(myHighlights);


        // Draw the lines
        currentFrame.plot()
            .selectAll('areas')
            .data(plotData(data))
            .enter()
            .append('g')
            .attr('class', 'areas')
            .call(myChart);

        // Set up annotations for this frame
        myAnnotations
            .yScale(myYAxis.scale())
            .xScale(myXAxis.scale())
            .rem(currentFrame.rem());

        // Draw the annotations before the areas
        plotAnnotation
            .selectAll('.annotation')
            .data(annos)
            .enter()
            .append('g')
            .call(myAnnotations);
    });
});
