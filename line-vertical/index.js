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

const xMin = 0;// sets the minimum value on the xAxis
const xMax = 0;// sets the maximum value on the xAxis
const divisor = 1;// sets the formatting on linear axis for ’000s and millions
const xAxisHighlight = 0; // sets which tick to highlight on the xAxis
const numTicks = 4;// Number of tick on the xAxis
const interval = 'years';// date interval on xAxis "century", "jubilee", "decade", "lustrum", "years", "months", "days", "hours"
const fullYear = true; // show dates as full years
const annotate = true; // show annotations, defined in the 'annotate' column
const markers = false;// show dots on lines
const legendAlign = 'hori';// hori or vert, alignment of the legend
const legendType = 'line';// rect, line or circ, geometry of legend marker
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
        .margin({
            top: 100, left: 15, bottom: 82, right: 20,
        })
    // .title('Put headline here') // use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(800),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 20,
        })
    // .title("Put headline here")
        .height(1000),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 104, right: 25,
        })
    // .title("Put headline here")
        .height(1200)
        .fullYear(true),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 25,
        })
    // .title("Put headline here")
        .height(1000),

    print: gChartframe.printFrame(sharedConfig)
        .margin({
            top: 40, left: 15, bottom: 35, right: 20,
        })
        // .title("Put headline here")
        // .width(53.71)// 1 col
        .width(112.25)// 2 col
        // .width(170.8)// 3 col
        // .width(229.34)// 4 col
        // .width(287.88)// 5 col
        // .width(346.43)// 6 col
        // .width(74)// markets std print
        .height(200), // std print (Use 58.21mm for markets charts that matter)

    // social: gChartframe.socialFrame(sharedConfig)
    //     .margin({
    //         .margin({ top: 140, left: 40,, bottom: 138, right: 40,
    //     })
    // // .title("Put headline here")
    //     .width(612)
    //     .height(612), // 700 is ideal height for Instagram

    // video: gChartframe.videoFrame(sharedConfig)
    //     .margin({
    //         left: 207, right: 207, bottom: 210, top: 233,
    //     }),
    // .title("Put headline here")
};


// add the frames to the page...
d3.selectAll('.framed')
    .each(function addFrames() {
        const figure = d3.select(this);

        figure.select('svg')
            .call(frame[figure.node().dataset.frame]);
    });
parseData.load(dataFile, {
    dateFormat, xMin, joinPoints, highlightNames,
})
    .then(({
        seriesNames, data, plotData, valueExtent, highlights, annos,
    }) => {
        Object.keys(frame).forEach((frameName) => {
            const currentFrame = frame[frameName];

            // define other functions to be called
            const myYAxis = gAxis.yDate();// sets up yAxis
            const myYAxis1 = gAxis.yDate();// sets up yAxis
            const myXAxis = gAxis.xLinear();// sets up xAxis
            const myXAxis1 = gAxis.xLinear();// sets up xAxis
            const myHighlights = lineChart.drawHighlights();// sets up highlight tonal bands
            const myAnnotations = lineChart.drawAnnotations();// sets up annotations
            const myLegend = gLegend.legend();// sets up the legend
            // const plotDim=currentFrame.dimension()//useful variable to carry the current frame dimensions
            const tickSize = currentFrame.dimension().height + (currentFrame.rem() * 0.75);
            // const minorTickSize = (currentFrame.rem() * 0.3);

            const myChart = lineChart.draw()
                .seriesNames(seriesNames)
                .highlightNames(highlightNames)
                .markers(markers)
                .annotate(annotate)
                .interpolation(interpolation);

            // create a 'g' element at the back of the chart to add time period
            // highlights after axis have been created
            const axisHighlight = currentFrame.plot().append('g');

            const yDomain = intraday ? data.map(d => d.date) : d3.extent(data, d => d.date);

            // Set up yAxis for this frame
            myYAxis
                .domain(yDomain)
                .range([0, currentFrame.dimension().height])
                .align('left')
                .fullYear(fullYear)
                .interval(interval)
                .minorAxis(minorAxis)
                .minorTickSize(currentFrame.rem() * 0.3)
                .frameName(frameName)
                .intraday(intraday);

            currentFrame.plot()
                .call(myYAxis);

            const yLabelWidth = myYAxis.labelWidth();


            myYAxis
                .tickSize(currentFrame.dimension().width - yLabelWidth);

            myYAxis1
                .domain(yDomain)
                .range([0, currentFrame.dimension().height])
                .align('right')
                .fullYear(true)
                .interval(interval)
                .tickSize(currentFrame.dimension().width - yLabelWidth)
                .minorAxis(minorAxis)
                .minorTickSize(currentFrame.rem() * 0.3)
                .frameName(frameName)
                .intraday(intraday);

            myYAxis.yLabel().selectAll('.tick').remove();

            // Draw the yAxis first, this will position the yAxis correctly and
            // measure the width of the label text
            currentFrame.plot()
                .call(myYAxis)
                .call(myYAxis1);

            // return the value in the variable newMargin

            const newMarginR = myYAxis1.labelWidth() + currentFrame.margin().right;
            currentFrame.margin({ right: newMarginR });


            const newMarginL = myYAxis.labelWidth() + currentFrame.margin().left;
            // Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({ left: newMarginL });
            myYAxis.yLabel().attr('transform', `translate(${(myYAxis.tickSize() - myYAxis.labelWidth())},0)`);
            myYAxis.yLabel().selectAll('.tick text').attr('dx', -(currentFrame.rem() / 2));
            myYAxis1.yLabel().selectAll('.tick text').attr('dx', (currentFrame.rem() / 2));
            myYAxis1.yLabelMinor().attr('transform', `translate(${(myYAxis.tickSize() - myYAxis.labelWidth())},0)`);

            d3.select(currentFrame.plot().node().parentNode)
                .call(currentFrame);

            // axisHighlight.append("rect")
            //   .attr("width", currentFrame.dimension().width)
            //   .attr("height",currentFrame.dimension().height)
            //   .attr("fill","#ededee");


            myXAxis
                .domain([Math.min(xMin, valueExtent[0]), Math.max(xMax, valueExtent[1])])
                .range([0, currentFrame.dimension().width])
                .numTicks(numTicks)
                .tickSize(tickSize)
                .xAxisHighlight(xAxisHighlight)
                .align('top')
                .frameName(frameName)
                .invert(invertScale)
                .logScale(logScale)
                .divisor(divisor);

            myXAxis1
                .domain([Math.min(xMin, valueExtent[0]), Math.max(xMax, valueExtent[1])])
                .range([0, currentFrame.dimension().width])
                .numTicks(numTicks)
                .tickSize(tickSize)
                .xAxisHighlight(xAxisHighlight)
                .align('bottom')
                .frameName(frameName)
                .invert(invertScale)
                .logScale(logScale)
                .divisor(divisor);


            // Draw the xAxis
            currentFrame.plot()
                .call(myXAxis)
                .call(myXAxis1);

            myXAxis.xLabel().attr('transform', `translate(0,${myXAxis.tickSize()})`);
            myXAxis1.xLabel().attr('transform', 'translate(0,0)');

            const plotAnnotation = currentFrame.plot().append('g').attr('class', 'annotations-holder');

            myChart
                .yScale(myYAxis.scale())
                .xScale(myXAxis.scale())
                .plotDim(currentFrame.dimension())
                .rem(currentFrame.rem())
                .colourPalette(frameName);

            // Draw the lines
            currentFrame.plot()
                .selectAll('lines')
                .data(plotData)
                .enter()
                .append('g')
                .attr('class', 'lines')
                .attr('id', d => d.name)
                .call(myChart);

            // Set up highlights for this frame
            myHighlights
                .yScale(myYAxis.scale())
                .xScale(myXAxis.scale())
                .invertScale(invertScale);

            // Draw the highlights before the lines and xAxis
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


            // Set up legend for this frame
            myLegend
                .frameName(frameName)
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

            const legendSelection = currentFrame.plot().select('#legend');
            legendSelection.attr('transform', `translate(0,${-currentFrame.rem()})`);
        });
    // addSVGSavers('figure.saveable');
    });
