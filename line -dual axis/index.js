/**
 * Bootstrapping code for line chart
 */

import * as d3 from 'd3';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as lineChart from './lineChart.js';

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
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};

const yMinL = 0;// sets the minimum value on the yAxisL
const yMaxL = 1500;// sets the maximum value on the xAxisL
const yMinR = 50;// sets the minimum value on the yAxisR
const yMaxR = 400;// sets the maximum value on the xAxisR
const doubleScale = 2
const numTicksL = 10;// Number of tick on the uAxis
const numTicksR = 5;// Number of tick on the uAxis
const yAxisAlign = 'left';// alignment of the axis
const xAxisAlign = 'bottom';// alignment of the axis
const interval = 'years';// date interval on xAxis "century", "jubilee", "decade", "lustrum", "years","months","days"
const annotate = true; // show annotations, defined in the 'annotate' column
const markers = false;// show dots on lines
const legendAlign = 'vert';// hori or vert, alignment of the legend
const legendType = 'line';// rect, line or circ, geometry of legend marker
const minorAxis = true;// turns on or off the minor axis
const highlightNames = []; // create an array names you want to highlight eg. ['series1','series2']
const interpolation = d3.curveLinear;// curveStep, curveStepBefore, curveStepAfter, curveBasis, curveCardinal, curveCatmullRom

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
 .margin({ top: 100, left: 15, bottom: 82, right: 5 })
 .title('Put headline here') // use this if you need to override the defaults
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
    // Automatically calculate the seriesnames excluding the "marker" and "annotate column"
    const seriesNames = parseData.getSeriesNames(data.columns);

    // Format the dataset that is used to draw the lines
    const plotData = seriesNames.map(function(d,i) {
      return {
        name: d,
        index: i,
        lineData: parseData.getlines(data, d, i)
      }
    });

    console.log(plotData)

    // Sort the data so that the labeled items are drawn on top
    const dataSorter = function dataSorter(a, b) {
        if (highlightNames.indexOf(a.name) > highlightNames.indexOf(b.name)) {
            return 1;
        } else if (highlightNames.indexOf(a.name) === highlightNames.indexOf(b.name)) {
            return 0;
        }
        return -1;
    };

    if (highlightNames) { plotData.sort(dataSorter); }

    // Filter data for annotations
    const annos = data.filter(d => (d.annotate !== '' && d.annotate !== undefined));

    // Format the data that is used to draw highlight tonal bands
    const boundaries = data.filter(d => (d.highlight === 'begin' || d.highlight === 'end'));
    const highlights = [];

    boundaries.forEach((d, i) => {
        if (d.highlight === 'begin') {
            highlights.push({ begin: d.date, end: boundaries[i + 1].date });
        }
    });

    // Use the seriesNames array to calculate the minimum and max values in the dataset
    const valueExtentL = parseData.extentMulti(data, seriesNames.slice(0,doubleScale), yMinL);
    const valueExtentR = parseData.extentMulti(data, seriesNames.slice(doubleScale ), yMinR);

    console.log('Left', valueExtentL, 'Right',valueExtentR)

    // Define the chart x and x domains.
    // yDomainL will automatically overwrite the user defined min and max if the domain is too small
    const myChart = lineChart.draw()
      .seriesNames(seriesNames)
      .highlightNames(highlightNames)
      .yDomainL([Math.min(yMinL, valueExtentL[0]), Math.max(yMaxL, valueExtentL[1])])
      .yDomainR([Math.min(yMinR, valueExtentR[0]), Math.max(yMaxR, valueExtentR[1])])
      .xDomain(d3.extent(data, d => d.date))
      .markers(markers)
      .annotate(annotate)
      .interpolation(interpolation);

    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        // define other functions to be called
        const yAxisL = gAxis.yLinear();// sets up yAxis
        const yAxisR = gAxis.yLinear();// sets up yAxis
        const myXAxis = gAxis.xDate();// sets up xAxis
        const myHighlights = lineChart.drawHighlights();// sets up highlight tonal bands
        const myAnnotations = lineChart.drawAnnotations();// sets up annotations
        const myLegend = gLegend.legend();// sets up the legend
        // const plotDim=currentFrame.dimension()//useful variable to carry the current frame dimensions
        const tickSize = currentFrame.dimension().width;// Used when drawing the yAxis ticks

        // create a 'g' element at the back of the chart to add time period
        // highlights after axis have been created
        const axisHighlight = currentFrame.plot().append('g');

        // create a 'g' element behind the chart and in front of the highlights
        const plotAnnotation = currentFrame.plot().append('g').attr('class', 'annotations-holder');


        myChart
          .yRangeL([currentFrame.dimension().height, 0])
          .yRangeR([currentFrame.dimension().height, 0])
          .plotDim(currentFrame.dimension())
          .rem(currentFrame.rem())
          .colourPalette((frameName));

        yAxisL
          .scale(myChart.yScaleL())
          .numTicks(numTicksL)
          .tickSize(currentFrame.rem())
          .align('left');

        // Draw the yAxis first, this will position the yAxis correctly and
        // measure the width of the label text
        currentFrame.plot()
          .call(yAxisL);

        yAxisR
          .scale(myChart.yScaleR())
          .numTicks(numTicksR)
          .tickSize(currentFrame.rem())
          .align('right');

        currentFrame.plot()
          .call(yAxisR);

        let newMarginL = yAxisL.labelWidth()+currentFrame.margin().left
        let newMarginR = yAxisR.labelWidth()+currentFrame.margin().right
        currentFrame.margin({left:newMarginL,right:newMarginR});

        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        yAxisL.yLabel().attr('transform', `translate(${(yAxisL.tickSize()-yAxisL.labelWidth())},0)`);
        yAxisR.yLabel().attr('transform', `translate(${(currentFrame.dimension().width)},0)`);


        axisHighlight.append("rect")
          .attr("width", currentFrame.dimension().width)
          .attr("height",currentFrame.dimension().height)
          .attr("fill","#ededee");

        myChart.xRange([0, currentFrame.dimension().width]);

        // Set up xAxis for this frame
        myXAxis
            .align(xAxisAlign)
          .fullYear(false)
          .scale(myChart.xScale())
          .interval(interval)
          .tickSize(myChart.rem())
          .minorAxis(minorAxis)
          .fullYear(false);

        // // Set up highlights for this frame
        myHighlights
          .yScaleL(myChart.yScaleL())
          .yRange([currentFrame.dimension().height, 0])
          .xScale(myChart.xScale())
          .xRange([0, currentFrame.dimension().width]);

        // Draw the highlights before the lines and xAxis
        axisHighlight
          .selectAll('.highlights')
          .data(highlights)
          .enter()
          .append('g')
          .call(myHighlights);

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

        // Set up highlights for this frame
        myAnnotations
          .yScaleL(myChart.yScaleL())
          .yRange([currentFrame.dimension().height, 0])
          .xScale(myChart.xScale())
          .xRange([0, currentFrame.dimension().width])
          .rem(currentFrame.rem());

        // Draw the annotations before the lines
        plotAnnotation
          .selectAll('.annotation')
          .data(annos)
          .enter()
          .append('g')
          .call(myAnnotations);

        // Draw the lines
        currentFrame.plot()
          .selectAll('lines')
          .data(plotData)
          .enter()
          .append('g')
          .attr('class', 'lines')
          .call(myChart);

        // Set up legend for this frame
        myLegend
          .seriesNames(seriesNames)
          .colourPalette((frameName))
          .rem(myChart.rem())
          .geometry(legendType)
          .alignment(legendAlign);

        // Draw the Legend
        currentFrame.plot()
          .append('g')
          .attr('id', 'legend')
          .selectAll('.legend')
            .data(() => {
                if (highlightNames.length > 0) {
                    return highlightNames;
                }
                return seriesNames;
            })
            .enter()
            .append('g')
            .classed('legend', true)
            .call(myLegend);
    });
    // addSVGSavers('figure.saveable');
});
