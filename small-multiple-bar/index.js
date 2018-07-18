/**
 * Bootstrapping code for line chart
 */

import * as d3 from 'd3';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as barChart from './smallMultiBarChart.js';

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

const xMin = 0;// sets the minimum value on the yAxis
const xMax = 0;// sets the maximum value on the xAxis
const xAxisHighlight = 0; // sets which tick to highlight on the yAxis
const numTicks = 4;// Number of tick on the uAxis
const yAxisAlign = 'left';// alignment of the axis
const xAxisAlign = 'top';// alignment of the axis
const endTicks = true; /* show just first and last date on x-Axis */ // eslint-disable-line
const fullYear = true; /* show full years for dates on x-Axis */ // eslint-disable-line
const showTints = true; // show tint bands behind charts
const dataDivisor = 1; // divides data values to more manageable numbers
const hideAxisLabels = true; // hide axis labels on middle columns of charts to avoid duplication
const minorAxis = false;// turns on or off the minor axis

// Individual frame configuration, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
        .margin({
            top: 10, left: 0, bottom: 88, right: 5,
        })
    // .title('Put headline here') // use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(1000)
        .extend('numberOfColumns', 2)
        .extend('numberOfRows', 5),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({
            top: 10, left: 0, bottom: 88, right: 7,
        })
    // .title("Put headline here")
        .height(1000)
        .extend('numberOfColumns', 3)
        .extend('numberOfRows', 4),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({
            top: 10, left: 0, bottom: 80, right: 7,
        })
    // .title("Put headline here")
        .height(500)
        .fullYear(true)
        .extend('numberOfColumns', 6)
        .extend('numberOfRows', 2),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({
            top: 10, left: 0, bottom: 80, right: 10,
        })
    // .title("Put headline here")
        .height(900)
        .extend('numberOfColumns', 3)
        .extend('numberOfRows', 4),

    print: gChartframe.printFrame(sharedConfig)
        .margin({
            top: 40, left: 7, bottom: 35, right: 7,
        })
    // .title("Put headline here")
    // .width(53.71)// 1 col
        .width(112.25)// 2 col
    // .width(170.8)// 3 col
    // .width(229.34)// 4 col
    // .width(287.88)// 5 col
    // .width(346.43)// 6 col
    // .width(74)// markets std print
        .height(150)// markets std print
        .extend('numberOfColumns', 3)
        .extend('numberOfRows', 4),

    //    social: gChartframe.socialFrame(sharedConfig)
    // .margin({ top: 140, left: 50, bottom: 138, right: 40 })
    // // .title("Put headline here")
    // .width(612)
    // .height(612), // 700 is ideal height for Instagram

    video: gChartframe.videoFrame(sharedConfig)
        .margin({
            left: 207, right: 207, bottom: 210, top: 233,
        })
    // .title("Put headline here")
        .extend('numberOfColumns', 6)
        .extend('numberOfRows', 2),
};


// add the frames to the page...
d3.selectAll('.framed')
    .each(function addFrames() {
        const figure = d3.select(this);
        figure.select('svg')
            .call(frame[figure.node().dataset.frame]);
    });
parseData.load(dataFile, { dateFormat, xMin, dataDivisor })
.then(({ data, plotData, valueExtent }) => {
    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        // define other functions to be called
        const myXAxis = gAxis.xLinear();// sets up yAxis
        const myYAxis = gAxis.yOrdinal();// sets up date xAxis
        const myLegend = gLegend.legend(); /* sets up the legend */ // eslint-disable-line
        const plotDim = currentFrame.dimension();// useful variable to carry the current frame dimensions

        // Create the plot widths, but for each individual graph
        const heightOfSmallCharts = ((currentFrame.dimension().height / currentFrame.numberOfRows()) - (currentFrame.rem() * 2.5));

        const tickSize = heightOfSmallCharts;// Used when drawing the yAxis ticks


        // draw the chart holders
        const chart = currentFrame.plot()
            .selectAll('g')
            .data(plotData)
            .enter()
            .append('g')
            .attr('id', d => d.name)
            .attr('class', 'columnHolder')
            .attr('xPosition', (d, i) => i % currentFrame.numberOfColumns());

        // draw tint highlight holders
        const tints = chart // eslint-disable-line
            .append('g')
            .attr('class', 'tint');

        const myTints = barChart.drawTints();
        const myChart = barChart.draw();


        myYAxis
            .align(yAxisAlign)
            .domain(data.map(d => d.name))
            .rangeRound([0, heightOfSmallCharts])
            .frameName(frameName)
            .paddingInner(0.2);

        // Draw the yAxis
        chart
            .call(myYAxis);


        // return the value in the variable newMargin and move axis if needed
        if (yAxisAlign === 'right') {
            const newMargin = myYAxis.labelWidth() + currentFrame.margin().right;
            // Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({ right: newMargin });
            myYAxis.yLabel()
                .attr('transform', `translate(${currentFrame.dimension().width + myYAxis.labelWidth()},${0})`);
        } else {
            const newMargin = (myYAxis.labelWidth() - (currentFrame.rem() * 0.7)) + currentFrame.margin().left;
            // Use newMargin re define the new margin and range of xAxis
            currentFrame.margin({ left: newMargin });
            myYAxis.yLabel().selectAll('text')
                .attr('dy', currentFrame.rem());
        }

        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        const widthOfSmallCharts = (((currentFrame.dimension().width + currentFrame.rem()) / currentFrame.numberOfColumns()) - (currentFrame.rem() * 2.5));

        chart
            .attr('transform', (d, i) => {
                const yPos = Number((Math.floor(i / currentFrame.numberOfColumns()) * (heightOfSmallCharts + (currentFrame.rem() * 3.5))));
                const xPos = i % currentFrame.numberOfColumns();
                return `translate(${(((widthOfSmallCharts + (currentFrame.rem() * 2.5)) * xPos) + currentFrame.rem())}, ${yPos})`;
            });

        myTints
            .yScale(myYAxis.scale())
            .plotDim(plotDim)
            .rem(currentFrame.rem())
            .yLabelWidth(myYAxis.labelWidth());

        if (showTints) {
            chart
                .call(myTints);
        }


        myXAxis
            .range([widthOfSmallCharts, 0])
            .domain([Math.max(xMax / dataDivisor, valueExtent[1] / dataDivisor), Math.min(xMin / dataDivisor, valueExtent[0] / dataDivisor)])
            .numTicks(numTicks)
            .tickSize(tickSize)
            .xAxisHighlight(xAxisHighlight)
            .align(xAxisAlign)
            .frameName(frameName);

        // Draw the yAxis first, this will position the yAxis correctly and
        // measure the width of the label text
        chart
            .call(myXAxis);

        if (hideAxisLabels) {
            chart
                .each(function hideLabels() {
                    const xPosAttr = Number(d3.select(this).attr('xPosition'));

                    if (xPosAttr > 0) {
                        d3.select(this).selectAll('.yAxis .tick text').style('visibility', 'hidden');
                    }
                    if (xPosAttr > 0 && xPosAttr < (currentFrame.numberOfColumns() - 1)) {
                        d3.select(this).selectAll('.xAxis .tick text').style('visibility', 'hidden');
                    }
                });
        }

        if (xAxisAlign === 'bottom') {
            myXAxis.xLabel().attr('transform', `translate(0, ${heightOfSmallCharts})`);
            if (minorAxis) {
                myXAxis.xLabelMinor().attr('transform', `translate(0, ${heightOfSmallCharts})`);
            }
        }
        if (xAxisAlign === 'top') {
            myXAxis.xLabel().attr('transform', `translate(0, ${myXAxis.tickSize() + (currentFrame.rem() * 0.7)})`);
        }

        myChart
            .yScale(myYAxis.scale())
            .xScale(myXAxis.scale())
            .plotDim(plotDim)
            .rem(currentFrame.rem())
            .colourPalette((frameName));

        // //Draw the lines
        chart
            .call(myChart);
    });
    // addSVGSavers('figure.saveable');
});
