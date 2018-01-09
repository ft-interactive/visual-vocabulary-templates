import * as d3 from 'd3';
import * as gAxis from 'g-axis';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as parseData from './parseData.js';
import * as dotPlot from './dotplot.js';


const dataURL = 'data.csv';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};

const xMin = -5;// sets the minimum value on the yAxis
const xMax = 60;// sets the maximum value on the xAxis
const divisor = 1;// sets the formatting on linear axis for ’000s and millions
const xAxisHighlight = 0; // sets which tick to highlight on the yAxis
const numTicks = 3;// Number of tick on the yAxis
const yAxisAlign = 'left';// sets alignment of the yAxis
const xAxisAlign = 'bottom';// sets alignment of the xAxis
const lines = true;// sets whether to display lines between data point
const logscale = false;
const geometry = 'circle'; // set the geometry of the data options are 'circle' or 'rect'
const sort = 'descending';// order in which to sort data 'ascending' or 'descending'
const sortOn = 'Change Critical Load';// category to sort data on
const rows = true;// show background rows
const labelFirst = false;// show labels on first group of data
const showLegend = true;// sets whether to show the legend
const legendType = 'circ';// sets the legend type 'circ', 'rect', 'line'
const legendAlign = 'vert';// sets the alignment of the legend 'vert' or 'hort'

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
        .margin({
            top: 100, left: 15, bottom: 82, right: 24,
        })
    // .title("Put headline here") //use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 35,
        })
    // .title("Put headline here")
        .height(500),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 38,
        })
    // .title("Put headline here")
        .height(500),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 104, right: 35,
        })
    // .title("Put headline here")
        .height(700),

    print: gChartframe.printFrame(sharedConfig)
        .margin({
            top: 40, left: 7, bottom: 35, right: 7,
        })
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
        .margin({
            top: 140, left: 50, bottom: 138, right: 40,
        })
    // .title("Put headline here")
        .width(612)
        .height(612),

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

parseData.load(dataURL, { sort, sortOn })
    .then(({
        seriesNames, plotData, valueExtent, data, // eslint-disable-line no-unused-vars
    }) => {
    // Draw the frames
        Object.keys(frame).forEach((frameName) => {
            const currentFrame = frame[frameName];
            // define other functions to be called
            const yAxis = gAxis.yOrdinal();// sets up yAxis
            const xAxis = gAxis.xLinear();
            const myChart = dotPlot.draw();
            const myLegend = gLegend.legend(); // eslint-disable-line no-unused-vars
            const tickSize = currentFrame.dimension().height; /* Used when drawing the yAxis ticks */ // eslint-disable-line no-unused-vars
            // const plotDim=currentFrame.dimension(); // useful variable to carry the current frame dimensions

            yAxis
                .align(yAxisAlign)
                .domain(plotData.map(d => d.group))
                .rangeRound([0, currentFrame.dimension().height])
                .frameName(frameName);

            xAxis
                .align(xAxisAlign)
                .logScale(logscale)
                .domain([Math.min(xMin, valueExtent[0]), Math.max(xMax, valueExtent[1])])
                .numTicks(numTicks)
                .xAxisHighlight(xAxisHighlight)
                .frameName(frameName)
                .divisor(divisor);

            const base = currentFrame.plot().append('g'); // eslint-disable-line no-unused-vars

            // Draw the yAxis first, this will position the yAxis correctly and measure the width of the label text
            currentFrame.plot()
                .call(yAxis);

            // return the value in the variable newMargin and move axis if needed
            if (yAxisAlign === 'right') {
                const newMargin = yAxis.labelWidth() + currentFrame.margin().right;
                // Use newMargin redefine the new margin and range of xAxis
                currentFrame.margin({ right: newMargin });
                yAxis.yLabel()
                    .attr('transform', `translate(${currentFrame.dimension().width + yAxis.labelWidth()},${0})`);
            } else {
                const newMargin = yAxis.labelWidth() + currentFrame.margin().left;
                // Use newMargin re define the new margin and range of xAxis
                currentFrame.margin({ left: newMargin });
            }
            // Set the plot object to its new dimensions
            d3.select(currentFrame.plot().node().parentNode)
                .call(currentFrame);

            const yScale = yAxis.scale();

            if (rows) {
                currentFrame.plot()
                    .append('g')
                    .attr('class', 'row-holder')
                    .selectAll('.rows')
                    .data(plotData.map(d => d.group))
                    .enter()
                    .append('rect')
                    .attr('y', d => yScale(d))
                    // .attr('height', yScale.bandwidth())
                    .attr('height', currentFrame.dimension().height / plotData.length)
                    .attr('width', currentFrame.dimension().width + yScale.bandwidth())
                    // .attr('class', 'rows');
                    .attr('class', (d, i) => {
                        if (i % 2 === 0) {
                            return 'rows-filled';
                        }
                        return 'rows-empty';
                    });
            }

            // Use new widtth of frame to set the range of the x-axis and any other parameters
            xAxis
                .range([0, currentFrame.dimension().width])
                .tickSize(currentFrame.dimension().height);
            // Call the axis and move it if needed
            currentFrame.plot()
                .call(xAxis);

            if (xAxisAlign === 'top') {
                xAxis.xLabel()
                    .attr('transform', `translate(0,${-currentFrame.dimension().top})`);
            }

            myChart
                .colourPalette((frameName))
                // what should this be called?
                .groupNames(seriesNames)
                .yScale(yAxis.scale())
                .xScale(xAxis.scale())
                .rem(currentFrame.rem())
                .lines(lines)
                .geometry(geometry)
                .frameName(frameName);

            currentFrame.plot()
                .append('g')
                .attr('class', 'dot-plots')
                .selectAll('.dotholder')
                .data(plotData)
                .enter()
                .append('g')
                .attr('class', 'dotholder baseline')
                .call(myChart);

            if (labelFirst) {
                const xScale = xAxis.scale();

                currentFrame.plot()
                    .append('g')
                    .selectAll('text')
                    .data(plotData[0].values)
                    .enter()
                    .append('text')
                    .attr('class', 'first-label')
                    .attr('x', d => xScale(d.value))
                    .text(d => d.cat);
            }

            if (showLegend) {
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
                    .data(seriesNames)
                    .enter()
                    .append('g')
                    .classed('legend', true)
                    .call(myLegend);
            }
        });
    // addSVGSavers('figure.saveable');
    });
