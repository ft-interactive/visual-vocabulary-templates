/**
 * Bootstrapping code for line chart
 */

import * as d3 from 'd3';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as columnChart from './smallMultiColumnGroupChart.js';

const dataFile = 'data.csv';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};

const yMin = 0;// sets the minimum value on the yAxis
const yMax = 0;// sets the maximum value on the xAxis
const yAxisHighlight = 0; // sets which tick to highlight on the yAxis
const numTicksy = 4;// Number of tick on the uAxis
const yAxisAlign = 'right';// alignment of the axis
const xAxisAlign = 'bottom';// alignment of the axis
const dataDivisor = 1; // divides data values to more manageable numbers
const hideAxisLabels = false; // hide axis labels on middle columns of charts to avoid duplication
const minorAxis = false;// turns on or off the minor axis
const legendAlign = 'hori';// hori or vert, alignment of the legend
const legendType = 'rect';// rect, line or circ, geometry of legend marker

// Individual frame configuration, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
        .margin({
            top: 10, left: 10, bottom: 78, right: 5,
        })
        // .title('Put headline here') // use this if you need to override the defaults
        // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(1000)
        .extend('numberOfColumns', 1)
        .extend('numberOfRows', 6),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({
            top: 10, left: 10, bottom: 88, right: 5,
        })
        // .title("Put headline here")
        .height(1000)
        .extend('numberOfColumns', 3)
        .extend('numberOfRows', 2),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({
            top: 10, left: 10, bottom: 80, right: 5,
        })
        // .title("Put headline here")
        .height(400)
        .fullYear(true)
        .extend('numberOfColumns', 6)
        .extend('numberOfRows', 1),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({
            top: 10, left: 10, bottom: 80, right: 5,
        })
    // .title("Put headline here")
        .height(500)
        .extend('numberOfColumns', 3)
        .extend('numberOfRows', 2),

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
        .extend('numberOfColumns', 2)
        .extend('numberOfRows', 3),

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
        .extend('numberOfRows', 1),
};


// add the frames to the page...
d3.selectAll('.framed')
    .each(function addFrames() {
        const figure = d3.select(this);
        figure.select('svg')
            .call(frame[figure.node().dataset.frame]);
    });
parseData.fromCSV(dataFile, { yMin, dataDivisor })
    .then(({
        columnNames, plotData, valueExtent,
    }) => {
        Object.keys(frame).forEach((frameName) => {
            const currentFrame = frame[frameName];

            // define other functions to be called
            const myYAxis = gAxis.yLinear();// sets up yAxis
            const myXAxis0 = gAxis.xOrdinal();// sets up date xAxis
            // const xDomain = data.map(columnNames);// sets up domain for xAxis
            const myLegend = gLegend.legend();// sets up the legend
            // const plotDim=currentFrame.dimension()//useful variable to carry the current frame dimensions

            // Create the plot widths, but for each individual graph
            const widthOfSmallCharts = ((currentFrame.dimension().width / currentFrame.numberOfColumns()) - currentFrame.rem());
            const heightOfSmallCharts = ((currentFrame.dimension().height / currentFrame.numberOfRows()) - (currentFrame.rem() * 2.5));

            const tickSize = widthOfSmallCharts;// Used when drawing the yAxis ticks

            // draw the chart holders
            const chart = currentFrame.plot()
                .selectAll('g')
                .data(plotData)
                .enter()
                .append('g')
                .attr('id', d => d.name)
                .attr('class', 'columnHolder')
                .attr('xPosition', (d, i) => i % currentFrame.numberOfColumns())
                .attr('transform', (d, i) => {
                    const yPos = Number((Math.floor(i / currentFrame.numberOfColumns()) * (heightOfSmallCharts + (currentFrame.rem() * 3.25))));
                    const xPos = i % currentFrame.numberOfColumns();
                    return `translate(${(((widthOfSmallCharts + currentFrame.rem()) * xPos) + currentFrame.rem())}, ${yPos})`;
                });

            const myChart = columnChart.draw();

            myYAxis
                .domain([Math.min(yMin / dataDivisor, valueExtent[0] / dataDivisor), Math.max(yMax / dataDivisor, valueExtent[1] / dataDivisor)])
                .range([heightOfSmallCharts, 0])
                .numTicks(numTicksy)
                .tickSize(tickSize)
                .yAxisHighlight(yAxisHighlight)
                .align(yAxisAlign)
                .frameName(frameName);

            // Draw the yAxis first, this will position the yAxis correctly and
            // measure the width of the label text
            chart
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

            // Set up xAxis for this frame
            myXAxis0
                .domain(columnNames)
                .rangeRound([0, widthOfSmallCharts - myYAxis.labelWidth()])
                .align(xAxisAlign)
                .frameName(frameName);

            const bandWidth = myXAxis0.bandwidth();

            myXAxis0
                .rangeRound([bandWidth / 4, ((widthOfSmallCharts - myYAxis.labelWidth()) - (bandWidth / 4))]);

            // Draw the xAxis
            chart
                .call(myXAxis0);

            if (hideAxisLabels) {
                chart
                    .each(function hideLabels() {
                        const xPosAttr = Number(d3.select(this).attr('xPosition'));

                        if (xPosAttr > 0 && xPosAttr < (currentFrame.numberOfColumns() - 1)) {
                            d3.select(this).selectAll('.xAxis .tick text').style('visibility', 'hidden');
                            d3.select(this).selectAll('.yAxis .tick text').style('visibility', 'hidden');
                        }
                    });
            }

            if (xAxisAlign === 'bottom') {
                myXAxis0.xLabel().attr('transform', `translate(0, ${heightOfSmallCharts})`);
                if (minorAxis) {
                    myXAxis0.xLabelMinor().attr('transform', `translate(0, ${heightOfSmallCharts})`);
                }
            }
            if (xAxisAlign === 'top') {
                myXAxis0.xLabel().attr('transform', `translate(0, ${myXAxis0.tickSize()})`);
            }

            myChart
                .yScale(myYAxis.scale())
                .xScale0(myXAxis0.scale())
                .plotDim(currentFrame.dimension())
                .rem(currentFrame.rem())
                .colourPalette((frameName))
                .columnNames(columnNames);

            // //Draw the lines
            chart
                .call(myChart);

            // Set up legend for this frame
            myLegend
                .frameName(frameName)
                .seriesNames(columnNames)
                .colourPalette((frameName))
                .rem(myChart.rem())
                .geometry(legendType)
                .alignment(legendAlign);

            // Draw the Legend
            currentFrame.plot()
                .append('g')
                .attr('id', 'legend')
                .selectAll('.legend')
                .data(() => columnNames)
                .enter()
                .append('g')
                .classed('legend', true)
                .call(myLegend);

            const legendSelection = currentFrame.plot().select('#legend');
            legendSelection.attr('transform', `translate(0,${-currentFrame.rem()})`);
        });
    // addSVGSavers('figure.saveable');
    });
