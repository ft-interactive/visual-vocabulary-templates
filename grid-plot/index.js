import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import * as gLegend from 'g-legend';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as gridPlotChart from './gridPlot.js';

const dataFile = 'data.csv';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};

const legendAlign = 'hori';// hori or vert, alignment of the legend
const legendType = 'rect'; // rect, line or circ, geometry of legend marker

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
        .margin({
            top: 100, left: 0, bottom: 82, right: 5,
        })
    // .title("Put headline here") //use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(1000)
        .extend('numberOfColumns', 1)
        .extend('numberOfRows', 6),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({
            top: 100, left: 0, bottom: 86, right: 5,
        })
    // .title("Put headline here")
        .height(700)
        .extend('numberOfColumns', 3)
        .extend('numberOfRows', 2),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({
            top: 100, left: 0, bottom: 86, right: 5,
        })
    // .title("Put headline here")
        .height(700)
        .extend('numberOfColumns', 3)
        .extend('numberOfRows', 2),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({
            top: 100, left: 0, bottom: 104, right: 5,
        })
    // .title("Put headline here")
        .height(400)
        .fullYear(true)
        .extend('numberOfColumns', 6)
        .extend('numberOfRows', 1),

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
    // .height(69.85), //  std print (Use 58.21mm for markets charts that matter)
        .height(150)// markets std print
        .extend('numberOfColumns', 2)
        .extend('numberOfRows', 3),

    // social: gChartframe.socialFrame(sharedConfig)
    //     .margin({
    //         top: 140, left: 50, bottom: 138, right: 40,
    //     })
    // // .title("Put headline here")
    //     .width(612)
    //     .height(612),

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

parseData.load(dataFile, '')
    .then(({
        seriesNames, groupNames, plotData,
    }) => { // eslint-disable-line no-unused-vars
        Object.keys(frame).forEach((frameName) => {
            const currentFrame = frame[frameName];

            const myXAxis = gAxis.xOrdinal();// sets up yAxis
            const myYAxis = gAxis.yOrdinal();
            const myLegend = gLegend.legend();

            // Create the plot widths, but for each individual graph
            const widthOfSmallCharts = ((currentFrame.dimension().width / currentFrame.numberOfColumns()) - currentFrame.rem());
            const heightOfSmallCharts = ((currentFrame.dimension().height / currentFrame.numberOfRows()) - (currentFrame.rem() * 1.25));

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
                    const yPos = Number((Math.floor(i / currentFrame.numberOfColumns()) * (heightOfSmallCharts + (currentFrame.rem() * 2))));
                    const xPos = i % currentFrame.numberOfColumns();
                    return `translate(${(((widthOfSmallCharts + currentFrame.rem()) * xPos) + currentFrame.rem())}, ${yPos})`;
                });

            const myChart = gridPlotChart.draw(); // eslint-disable-line no-unused-vars

            myYAxis
                .rangeRound([heightOfSmallCharts, 0], 0)
                .domain(d3.range(10))
                .invert(false)
                .frameName(frameName);

        const base = currentFrame.plot().append('g'); // eslint-disable-line
            chart
                .call(myYAxis);


            d3.select(currentFrame.plot().node().parentNode)
                .call(currentFrame);

            myXAxis
                .domain(d3.range(10))
                .rangeRound([0, widthOfSmallCharts], 0)
                .frameName(frameName);

            myChart
                .xScale(myXAxis.scale())
                .yScale(myYAxis.scale())
                .plotDim(currentFrame.dimension())
                .rem(currentFrame.rem())
                .colourPalette(frameName)
                .groupNames(groupNames);

            chart
                .call(myXAxis);

            chart
                .call(myChart);

            // Set up legend for this frame
            myLegend
                .seriesNames(groupNames)
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
                .data(() => groupNames)
                .enter()
                .append('g')
                .classed('legend', true)
                .call(myLegend);

            // remove ticks from x-axis
            myXAxis.xLabel().selectAll('.tick').remove();
            myYAxis.yLabel().selectAll('.tick').remove();
        });

    // addSVGSavers('figure.saveable');
    });
