/**
 * Bootstrapping code for scatterplot
 */

import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import * as gLegend from 'g-legend';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as scatterplot from './scatter.js';
import * as annotation from 'g-annotations';

// dataset and titles
const dataURL = 'data.csv';
const dateFormat = '%d/%m/%Y'
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
    title: 'Scatter-linked plot',
    subtitle: 'With circle sizing',
    source: 'Source not yet added',
};

// display options
const xVar = 'rig';// these should be series (column) names from your data
const xMin = 0;// sets the minimum value on the xAxis - will autoextend to include range of your data
const xMax = 1600;// sets the maximum value on the xAxis - will autoextend to include range of your data
const divisorX = 1;// sets the formatting on linear axis for ’000s and millions
const numTicksx = 9;// Number of tick on the xAxis

const yVar = 'output';
const yMin = 4// sets the minimum value on the yAxis - will autoextend to include range of your data
const yMax = 10;// sets the maximum value on the yAxis - will autoextend to include range of your data
const divisorY = 1;// sets the formatting on linear axis for ’000s and millions

const scaleDots = false;
const sizeVar = 'output';//controls size of scatter dots - for a regular scatter, assign to a column with constant values
const scaleFactor=.5;//controls how big in appearance bubbles are


const opacity = 0.7;// sets the fill opacity of the dots...
const hollowDots = false;// ...or you can set dots to be hollow (will need to adjust key in illustrator)

const legendAlign = 'vert';// hori or vert, alignment of the legend
const legendType = 'circ';// rect, line or circ, geometry of legend marker

const myLegend = gLegend.legend();// sets up the legend
/* eslint-disable */
let yAxisHighlight;// = 20; //sets which tick to highlight on the yAxis
const numTicksy = 5;// Number of tick on the uAxis
const yAxisAlign = 'left';// alignment of the y axis
const xAxisAlign = 'bottom';
/* eslint-enable */

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 82, right: 20 })
    // .title("Put headline here") //use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 86, right: 25 })
    // .title("Put headline here")
        .height(500),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({ top: 100, left: 25, bottom: 86, right: 30 })
    // .title("Put headline here")
        .height(500),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({ top: 100, left: 25, bottom: 104, right: 25 })
    // .title("Put headline here")
        .height(700),

    print: gChartframe.printFrame(sharedConfig)
        .margin({ top: 40, left: 7, bottom: 35, right: 17 })
    // .title("Put headline here")
        // .width(53.71)// 1 col
        .width(112.25)// 2 col
        // .width(170.8)// 3 col
        // .width(229.34)// 4 col
        // .width(287.88)// 5 col
        // .width(346.43)// 6 col
        // .width(74)// markets std print
        .height(58.21), // markets std print


    social: gChartframe.socialFrame(sharedConfig)
        .margin({ top: 140, left: 40, bottom: 138, right: 50 })
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

parseData.load(dataURL, {
        dateFormat,
        xVar,
        yVar,
        sizeVar
    }).then(({
            seriesNames,
            xValueExtent,
            yValueExtent,
            sizeExtent,
            data,
            plotData,
            annotations,
        }) => { // eslint-disable-line
    // identify groups
    const groups = d3.map(data, d => d.group).keys();


    // define chart
    const myChart = scatterplot.draw()
        .seriesNames(seriesNames)
        .yAxisAlign(yAxisAlign);

    // draw, for each frame
    Object.keys(frame).forEach((frameName) => {
        // set up axes
        const myYAxis = gAxis.yLinear();
        const myXAxis = gAxis.xLinear();
        const myAnnotations = annotation.annotations();// sets up annotations
        const currentFrame = frame[frameName];
        const axisLabelX = {
            tag: xVar,
            hori:'middle',
            vert: 'bottom',
            anchor: 'middle',
            rotate: 0
        }
        const axisLabelY = {
            tag: yVar,
            hori:'left',
            vert: 'middle',
            anchor: 'middle',
            rotate: 0
        }
        const sqrtScale = d3.scaleSqrt()
            .domain([0,sizeExtent[1]])
            .range([0,(currentFrame.rem()*scaleFactor)]);
        const plotDim = [currentFrame.dimension().width, currentFrame.dimension().height];
        // define other functions to be called
        const tickSize = currentFrame.dimension().width;// Used when drawing the yAxis ticks

        myYAxis
            .domain([Math.min(yMin, yValueExtent[0]), Math.max(yMax, yValueExtent[1])])
            .range([currentFrame.dimension().height, 0])
            .align(yAxisAlign)
            .tickSize(tickSize)
            .frameName(frameName)
            .divisor(divisorY)
            .rem(currentFrame.rem())
            .plotDim(plotDim)
            .label(axisLabelY);

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
            myYAxis.yLabel().attr('transform', `translate(${(myYAxis.tickSize() - myYAxis.labelWidth())},0)`);
        }

        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        // should be able to set domain from myChart??
        myXAxis
            .domain([Math.min(xMin, xValueExtent[0]), Math.max(xMax, xValueExtent[1])])
            .tickSize(currentFrame.rem() * 0.75)
            .range([0, currentFrame.dimension().width])
            .align(xAxisAlign)
            .frameName(frameName)
            .divisor(divisorX)
            .rem(currentFrame.rem())
            .plotDim(plotDim)
            .label(axisLabelX)
            .numTicks(numTicksx);

        // call axes
        currentFrame.plot()
            .call(myXAxis);

        if (xAxisAlign === 'bottom') {
            myXAxis.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
        }
        if (xAxisAlign === 'top') {
            myXAxis.xLabel().attr('transform', `translate(0,${myXAxis.tickSize()})`);
        }
        const plotAnnotation = currentFrame.plot().append('g').attr('class', 'annotations-holder');

        myChart
            .yScale(myYAxis.scale())
            .xScale(myXAxis.scale())
            .sizeScale(sqrtScale)
            .scaleFactor(scaleFactor)
            .plotDim(currentFrame.dimension())
            .rem(currentFrame.rem())
            .colourPalette((frameName))
            .xVar(xVar)
            .yVar(yVar)
            .sizeVar(sizeVar)
            .hollowDots(hollowDots)
            .groups(groups)
            .opacity(opacity)
            .scaleDots(scaleDots);

        // draw chart
        currentFrame.plot()
          .selectAll('.lines')
          .data(plotData)
          .enter()
          .append('g')
          .attr('class', 'lines')
          .attr('id', d => d.name)
          .call(myChart);


        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        myAnnotations
          .xScale(myXAxis.scale())
          .yScale(myYAxis.scale())
          .rem(currentFrame.rem())
          .sizeScale(sqrtScale)
          .frameName(frameName)
          .lineWidth(currentFrame.rem() * 5)
          .plotDim([currentFrame.dimension().width,currentFrame.dimension().height])

        // // Draw the annotations before the lines
        plotAnnotation  
            .selectAll('.annotations')
            .data(annotations)
            .enter()
            .append('g')
            .call(myAnnotations)

        // Set up legend for this frame
        myLegend
            .frameName(frameName)
            .seriesNames(groups)
            .colourPalette((frameName))
            .rem(myChart.rem())
            .geometry(legendType)
            .alignment(legendAlign);

        // Draw the Legend
        currentFrame.plot()
            .append('g')
            .attr('id', 'legend')
            .selectAll('.legend')
            .data(groups)
            .enter()
            .append('g')
            .classed('legend', true)
            .call(myLegend);

        const legendSelection = currentFrame.plot().select('#legend');
        legendSelection.attr('transform', `translate(0,${-currentFrame.rem()})`);
    });
    // addSVGSavers('figure.saveable');
});
