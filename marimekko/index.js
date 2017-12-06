import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import * as gLegend from 'g-legend';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as stackedBarChart from './stackedBarChart.js';

const dataFile = 'data.csv';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};
const xMin = 0;// sets the minimum value on the yAxis
const xMax = 0;// sets the maximum value on the yAxis
const xAxisHighlight = 100; // sets which tick to highlight on the yAxis
const numTicks = 5;// Number of tick on the uAxis
const yAxisAlign = 'left';// alignment of the axis
const xAxisAlign = 'top';// alignment of the axis
const legendAlign = 'hori';// hori or vert, alignment of the legend
const legendType = 'rect'; // rect, line or circ, geometry of legend marker
const sort = '';// specify 'ascending', 'descending', 'alphabetical' - default is order of input file

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
        .margin({
            top: 100, left: 15, bottom: 82, right: 20,
        })
    // .title("Put headline here") //use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 24,
        })
    // .title("Put headline here")
        .height(500),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 24,
        })
    // .title("Put headline here")
        .height(500),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 104, right: 24,
        })
    // .title("Put headline here")
        .height(700)
        .fullYear(true),

    print: gChartframe.printFrame(sharedConfig)
        .margin({
            top: 40, left: 7, bottom: 35, right: 7,
        })
    // .title("Put headline here")
        /* Print column widths */
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

parseData.load(dataFile, { sort })
    .then(({ valueExtent, plotData, seriesNames, totalSize }) => {
        Object.keys(frame).forEach((frameName) => {
            const currentFrame = frame[frameName];

            const myXAxis = gAxis.xLinear();// sets up yAxis
            const myYAxis = gAxis.yLinear();
            const myChart = stackedBarChart.draw(); // eslint-disable-line
            const myLegend = gLegend.legend();

            // define other functions to be called
            const tickSize = currentFrame.dimension().height + (currentFrame.rem() * 1.4);// Used when drawing the xAxis ticks

            myYAxis
                .align(yAxisAlign)
                .domain([totalSize, 0])
                .range([currentFrame.dimension().height, 0])
                .frameName(frameName);

            myXAxis
                .align(xAxisAlign)
                .domain([Math.min(xMin, valueExtent[0]), Math.max(xMax, valueExtent[1])])
                .numTicks(numTicks)
                .xAxisHighlight(xAxisHighlight)
                .frameName(frameName);

        const base = currentFrame.plot().append('g'); // eslint-disable-line

            currentFrame.plot()
                .call(myYAxis);

            // return the value in the variable newMargin
            if (yAxisAlign === 'right') {
                const newMargin = myYAxis.labelWidth() + currentFrame.margin().right;
                // Use newMargin redefine the new margin and range of xAxis
                currentFrame.margin({ right: newMargin });
                myYAxis.yLabel().attr('transform', `translate(${currentFrame.dimension().width},0)`);
            }
            if (yAxisAlign === 'left') {
                const newMargin = myYAxis.labelWidth() + currentFrame.margin().left;
                // Use newMargin redefine the new margin and range of xAxis
                currentFrame.margin({ left: newMargin });
            // myYAxis.yLabel().attr('transform', `translate(${(myYAxis.tickSize()-myYAxis.labelWidth())},0)`);
            }

            d3.select(currentFrame.plot().node().parentNode)
                .call(currentFrame);

            myXAxis
                .range([0, currentFrame.dimension().width])
                .tickSize(tickSize);

            currentFrame.plot()
                .call(myXAxis);

            if (xAxisAlign === 'bottom') {
                myXAxis.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
            }
            if (xAxisAlign === 'top') {
                myXAxis.xLabel().attr('transform', `translate(0,${myXAxis.tickSize()})`);
            }

            myChart
                .xRange([0, currentFrame.dimension().width])
                .plotDim(currentFrame.dimension())
                .rem(currentFrame.rem())
                .colourPalette((frameName))
                .xScale(myXAxis.scale())
                .yScale(myYAxis.scale());

            currentFrame.plot()
                .selectAll('.columnHolder')
                .data(plotData)
                .enter()
                .append('g')
                .attr('class', d => `${d.name}_columnHolder`)
                .call(myChart);

            // Set up legend for this frame
            myLegend
                .seriesNames(seriesNames)
                .geometry(legendType)
                .frameName(frameName)
                .rem(myChart.rem())
                .alignment(legendAlign)
                .colourPalette((frameName));

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
        });
    // addSVGSavers('figure.saveable');
    });
