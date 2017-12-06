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
            top: 100, left: 0, bottom: 82, right: 10,
        })
    // .title("Put headline here") //use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({
            top: 100, left: 0, bottom: 86, right: 10,
        })
    // .title("Put headline here")
        .height(500),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({
            top: 100, left: 0, bottom: 86, right: 10,
        })
    // .title("Put headline here")
        .height(500),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({
            top: 100, left: 0, bottom: 104, right: 10,
        })
    // .title("Put headline here")
        .height(700)
        .fullYear(true),

    print: gChartframe.printFrame(sharedConfig)
        .margin({
            top: 40, left: 5, bottom: 35, right: 5,
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
    .then(({
        valueExtent, plotData, seriesNames, totalSize,
    }) => {
        Object.keys(frame).forEach((frameName) => {
            const currentFrame = frame[frameName];

            const myXAxis = gAxis.xLinear();// sets up yAxis
            const myYAxis = gAxis.yLinear();
            const myChart = stackedBarChart.draw(); // eslint-disable-line
            const myLegend = gLegend.legend();
            const formatNumber = d3.format(',');

            // define other functions to be called
            const tickSize = currentFrame.dimension().height + (currentFrame.rem() * 2);// Used when drawing the xAxis ticks

            myYAxis
                .align(yAxisAlign)
                .domain([totalSize, 0])
                .range([currentFrame.dimension().height, 0])
                .frameName(frameName);

            const yLabelScale = myYAxis.scale();

            myXAxis
                .align(xAxisAlign)
                .domain([Math.min(xMin, valueExtent[0]), Math.max(xMax, valueExtent[1])])
                .numTicks(numTicks)
                .xAxisHighlight(xAxisHighlight)
                .frameName(frameName);

        const base = currentFrame.plot().append('g'); // eslint-disable-line

            currentFrame.plot()
                .call(myYAxis);


            const leftLabel = currentFrame.plot().append('g').attr('class', 'axis yAxis');
            const rightLabel = currentFrame.plot().append('g').attr('class', 'axis yAxis');
            let labelWidthL = 0;
            let labelWidthR = 0;

            leftLabel
                .selectAll('text')
                .data(plotData)
                .enter()
                .append('text')
                .attr('class', 'yLabel')
                .text(d => d.name)
                .attr('y', (d, i) => (yLabelScale(d.yPos) + Math.round(Number(i * (currentFrame.rem() / 10)))))
                .attr('dy', d => (yLabelScale(d.size / 2) + (currentFrame.rem() / 4)))
                .attr('x', -(currentFrame.rem() / 4));

            rightLabel
                .selectAll('text')
                .data(plotData)
                .enter()
                .append('text')
                .attr('class', 'yLabel')
                .text(d => formatNumber(d.size))
                .attr('y', (d, i) => (yLabelScale(d.yPos) + Math.round(Number(i * (currentFrame.rem() / 10)))))
                .attr('dy', d => (yLabelScale(d.size / 2) + (currentFrame.rem() / 4)))
                .attr('x', -(currentFrame.rem() / 4))
                .style('text-anchor', 'start');

            // Calculate width of widest left label text
            leftLabel.selectAll('.yLabel').each(function calcTickTextWidthL() {
                labelWidthL = Math.max(this.getBBox().width, labelWidthL);
            });

            // Calculate width of widest right label text
            rightLabel.selectAll('.yLabel').each(function calcTickTextWidthR() {
                labelWidthR = Math.max(this.getBBox().width, labelWidthR);
            });

            // return the value in the variable newMargin
            const newMarginR = labelWidthR + currentFrame.margin().right;
            currentFrame.margin({ right: newMarginR });
            rightLabel.attr('transform', `translate(${currentFrame.dimension().width - labelWidthL}, 0)`);

            const newMarginL = labelWidthL + currentFrame.margin().left + (currentFrame.rem() / 2);
            currentFrame.margin({ left: newMarginL });

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
                myXAxis.xLabel().attr('transform', `translate(0,${myXAxis.tickSize() - (currentFrame.rem() / 4)})`);
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

            myYAxis.yLabel().remove();

        });
    // addSVGSavers('figure.saveable');
    });
