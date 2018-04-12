/**
 * Code for generating a beeswarm chart for representing Fed projections
 * of US interest rates at multiple sizes
 */

import * as d3 from 'd3';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as beeswarmChart from './beeswarmChart.js';

const dataFile = 'data.tsv';

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
    subtitle:
        "Policymaker's projections for the midpoint of US interest rates (%)",
    source: 'Source: Federal Reserve',
};
// Put the user defined variablesin delete where not applicable
const yMin = 0; // sets the minimum value on the yAxis
const yMax = 5; // sets the maximum value on the xAxis
const numTicksy = 10; // Number of tick on the uAxis
const yAxisAlign = 'right'; // alignment of the axis
const xAxisAlign = 'bottom'; // alignment of the axis
const legendAlign = 'vert'; // hori or vert, alignment of the legend
const legendType = 'circ'; // rect, line or circ, geometry of legend marker
const invert = false; // inverts the y axis
const logScale = false; // enables log scale on the y axis
const yBanding = false; // enables banding on the y axis

// Individual frame configuration, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe
        .webFrameS(sharedConfig)
        .margin({ top: 100, left: 15, bottom: 82, right: 25 })
        // .title('Put headline here') // use this if you need to override the defaults
        // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(400),

    webM: gChartframe
        .webFrameM(sharedConfig)
        .margin({
            top: 100,
            left: 20,
            bottom: 86,
            right: 25,
        })
        // .title("Put headline here")
        .height(500),

    webL: gChartframe
        .webFrameL(sharedConfig)
        .margin({
            top: 100,
            left: 20,
            bottom: 104,
            right: 25,
        })
        // .title("Put headline here")
        .height(700)
        .fullYear(true),

    webMDefault: gChartframe
        .webFrameMDefault(sharedConfig)
        .margin({
            top: 100,
            left: 20,
            bottom: 86,
            right: 25,
        })
        // .title("Put headline here")
        .height(500),

    print: gChartframe
        .printFrame(sharedConfig)
        .margin({ top: 40, left: 7, bottom: 35, right: 7 })
        // .title("Put headline here")
        .width(53.71) // 1 col
        // .width(112.25)// 2 col
        // .width(170.8)// 3 col
        // .width(229.34)// 4 col
        // .width(287.88)// 5 col
        // .width(346.43)// 6 col
        // .width(74)// markets std print
        .height(69.85), // std print (Use 58.21mm for markets charts that matter)

    social: gChartframe
        .socialFrame(sharedConfig)
        .margin({
            top: 140,
            left: 50,
            bottom: 138,
            right: 40,
        })
        // .title("Put headline here")
        .width(612)
        .height(612), // 700 is ideal height for Instagram

    video: gChartframe.videoFrame(sharedConfig).margin({
        left: 207,
        right: 207,
        bottom: 210,
        top: 233,
    }),
    // .title("Put headline here")
};

// add the frames to the page...
d3.selectAll('.framed').each(function addFrames() {
    const figure = d3.select(this).attr('class', 'button-holder');

    figure.select('svg').call(frame[figure.node().dataset.frame]);
});
parseData
    .load(dataFile, { yMin })
    .then(({ plotData, seriesNames, projectionDates }) => {
        Object.keys(frame).forEach((frameName) => {
            const currentFrame = frame[frameName];

            const myYAxis = gAxis.yLinear(); // sets up yAxis
            const myXAxis = gAxis.xOrdinal(); // sets up xAxis
            const myLegend = gLegend.legend();

            // define other functions to be called
            const tickSize = currentFrame.dimension().width; // Used when drawing the yAxis ticks
            const plotDim = [currentFrame.dimension().width, currentFrame.dimension().height];

            const myChart = beeswarmChart
                .draw()
                .seriesNames(seriesNames)
                .projectionDates(projectionDates);

            // set up y-axis for this frame
            myYAxis
                .plotDim(plotDim)
                .banding(yBanding)
                .domain([yMin, yMax])
                .range([currentFrame.dimension().height, 0])
                .numTicks(numTicksy)
                .tickSize(tickSize)
                .tickFormat(d3.format('.1f'))
                .align(yAxisAlign)
                .rem(currentFrame.rem())
                .frameName(frameName)
                .invert(invert)
                .logScale(logScale);

            currentFrame.plot().call(myYAxis);

            // return the value in the variable newMargin and move axis if needed
            if (yAxisAlign === 'right') {
                const newMargin = myYAxis.labelWidth() + currentFrame.margin().right;
                // Use newMargin redefine the new margin and range of xAxis
                currentFrame.margin({ right: newMargin });
            }
            if (yAxisAlign === 'left') {
                const newMargin = myYAxis.labelWidth() + currentFrame.margin().left;
                // Use newMargin redefine the new margin and range of xAxis
                currentFrame.margin({ left: newMargin });
                myYAxis.yLabel().attr('transform', `translate(${(myYAxis.tickSize() - myYAxis.labelWidth())},0)`);
            }
            d3.select(currentFrame.plot().node().parentNode)
                .call(currentFrame);

            // Set up xAxis for this frame
            myXAxis
                .domain(seriesNames)
                .rangeRound([0, currentFrame.dimension().width])
                .align(xAxisAlign)
                .tickSize(currentFrame.rem() * 0.75)
                .rem(currentFrame.rem())
                .frameName(frameName);

            currentFrame.plot().call(myXAxis);

            if (xAxisAlign === 'bottom') {
                myXAxis.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
            }
            if (xAxisAlign === 'top') {
                myXAxis.xLabel().attr('transform', `translate(0,${myXAxis.tickSize()})`);
            }

            myChart
                .yScale(myYAxis.scale())
                .xScale(myXAxis.scale())
                .plotDim(currentFrame.dimension())
                .rem(currentFrame.rem())
                .colourPalette(frameName);

            // draw beeswarm
            currentFrame
                .plot()
                .selectAll('.year')
                .data(plotData)
                .enter()
                .append('g')
                .attr('class', 'year')
                .attr('id', d => d.name)
                // .attr('transform', d => `translate(${myXAxis(d.name)}, 0)`)
                .call(myChart);

            // Set up legend for this frame
            myLegend
                .frameName(frameName)
                .seriesNames(projectionDates)
                .colourPalette(frameName)
                .rem(myChart.rem())
                .geometry(legendType)
                .alignment(legendAlign);

            // Draw the Legend
            currentFrame
                .plot()
                .append('g')
                .attr('id', 'legend')
                .selectAll('.legend')
                .data(projectionDates)
                .enter()
                .append('g')
                .classed('legend', true)
                .call(myLegend);

            const legendSelection = currentFrame.plot().select('#legend');
            legendSelection.attr(
                'transform',
                `translate(0,${-currentFrame.rem()})`,
            );
        });
        // addSVGSavers('figure.saveable');
    });
