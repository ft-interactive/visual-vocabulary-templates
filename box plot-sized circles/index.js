import * as d3 from 'd3';
import * as gAxis from 'g-axis';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as parseData from './parseData.js';
import * as boxPlot from './boxPlot.js';

const dataURL = 'CO2.csv';

const sharedConfig = {
    title: 'Waste generation rate',
    subtitle: 'kg per person per day, 2010',
    source: 'Source not yet added',
};

const xMin = 1;// sets the minimum value on the yAxis
const xMax = 6;// sets the maximum value on the xAxis
const divisor = 1;// sets the formatting on linear axis for ’000s and millions
const xAxisHighlight = 0; // sets which tick to highlight on the yAxis
const numTicks = 6;// Number of tick on the uAxis
const colourProperty = 'name';
const yAxisAlign = 'left';// alignment of the axis
const xAxisAlign = 'bottom';
const lines = true;//connecting lines on circles
const mean = false;//add a marker to show mean
const geometry = 'rect'; // set the geometry of the data options are 'circle' or 'rect'
const logScale = false;
const quantile = false; // circle geometry only
const scaleFactor = 10


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
        .height(700),

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
    // .width(53.71)// 1 col
    .width(198.61)// 2 col
    // .width(170.8)// 3 col
    // .width(229.34)// 4 col
    // .width(287.88)// 5 col
    // .width(346.43)// 6 col
    // .width(74)// markets std print
        .height(170.74), // std print (Use 58.21mm for markets charts that matter)

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

parseData.load(dataURL)
  .then(({
              valueExtent,
              radiusExtent,
              seriesNames,
              plotData,
              data
          }) => { // eslint-disable-line no-unused-vars
    // Draw the frames
    plotData.sort((a, b) => {
        return a.mean - b.mean;
    })

    console.log(plotData)
        Object.keys(frame).forEach((frameName) => {
            const currentFrame = frame[frameName];
            // define other functions to be called
            const yAxis = gAxis.yOrdinal();// sets up yAxis
            const xAxis = gAxis.xLinear();
            const myChart = boxPlot.draw();
            const tickSize = currentFrame.dimension().height; /* Used when drawing the yAxis ticks */ // eslint-disable-line no-unused-vars
            const width = currentFrame.dimension().width; // useful variable to carry the current frame dimensions
            yAxis
                .align(yAxisAlign)
                .domain(plotData.map(d => d.group))
                .rangeRound([0, currentFrame.dimension().height])
                .frameName(frameName)
                .plotDim([width, tickSize])
                .banding(true);

            xAxis
                .logScale(logScale)
                .align(xAxisAlign)
                .domain([Math.min(xMin, 2), Math.max(xMax, valueExtent[1])])
                .numTicks(numTicks)
                .xAxisHighlight(xAxisHighlight)
                .frameName(frameName)
                .divisor(divisor);

            // console.log(xMin,xMax,valueExtent, xAxis.domain)

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
            }
            else {
                const newMargin = yAxis.labelWidth() + currentFrame.margin().left;
                // Use newMargin re define the new margin and range of xAxis
                currentFrame.margin({ left: newMargin });
            }
            // Set the plot object to its new dimensions
            d3.select(currentFrame.plot().node().parentNode)
                .call(currentFrame);
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

            const sqrtScale = d3.scaleSqrt()
                .domain([0, radiusExtent[1]])
                .range([0, ((currentFrame.rem() / 10) * scaleFactor)]);

            myChart
            // .paddingInner(0.06)
                .colourProperty(colourProperty)
                .colourPalette((frameName))
                .yScale(yAxis.scale())
                .xScale(xAxis.scale())
                .sizeScale(sqrtScale)
                .scaleFactor(scaleFactor)
                .rem(currentFrame.rem())
                .lines(lines)
                .geometry(geometry)
                .frameName(frameName)
                .seriesNames(seriesNames)
                .mean(mean)
                .quantile(quantile);

            // Draw unhighlighted circles first
            currentFrame.plot()
                .selectAll('.g')
                .data(plotData)
                .enter()
                .append('g')
                .attr('class','boxplot')
                .call(myChart);
        });

    });
