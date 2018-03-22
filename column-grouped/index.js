import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import * as gLegend from 'g-legend';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as columnGroupedChart from './columnGroupedChart.js';

const dataFile = 'data.csv';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};
const yMin = 0;// sets the minimum value on the yAxis
const yMax = 0;// sets the maximum value on the yAxis
const divisor = 1// formatting for '000 and millions
const yAxisHighlight = 10; // sets which tick to highlight on the yAxis
const numTicksy = 5;// Number of tick on the uAxis
const yAxisAlign = 'right';// alignment of the axis
const xAxisAlign = 'bottom';// alignment of the axis
const logScale = false
const sort = '';// specify 'ascending', 'descending', 'alphabetical'
const sortOn = 0;// specify column number to sort on (ignore name column)
const showNumberLabels = false;// show numbers on end of bars
const legendAlign = 'hori';// hori or vert, alignment of the legend
const legendType = 'rect'; // rect, line or circ, geometry of legend marker

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
   .margin({ top: 100, left: 15, bottom: 82, right: 5 })
   // .title("Put headline here") //use this if you need to override the defaults
   // .subtitle("Put headline |here") //use this if you need to override the defaults
   .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 86, right: 5 })
   // .title("Put headline here")
   .height(500),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
    .margin({ top: 100, left: 20, bottom: 86, right: 5 })
    // .title("Put headline here")
    .height(500),

    webL: gChartframe.webFrameL(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 104, right: 5 })
   // .title("Put headline here")
   .height(700)
   .fullYear(true),

    print: gChartframe.printFrame(sharedConfig)
    .margin({ top: 40, left: 7, bottom: 35, right: 7 })
    // .title("Put headline here")
    .width(53.71)// 1 col
    // .width(112.25)// 2 col
    // .width(170.8)// 3 col
    // .width(229.34)// 4 col
    // .width(287.88)// 5 col
    // .width(346.43)// 6 col
    // .width(74)// markets std print
    .height(69.85), //  std print (Use 58.21mm for markets charts that matter)

    social: gChartframe.socialFrame(sharedConfig)
   .margin({ top: 140, left: 40, bottom: 138, right: 40 })
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
        figure.select('svg')
            .call(frame[figure.node().dataset.frame]);
    });

parseData.load(dataFile, '', { sort, sortOn })
.then(({ seriesNames, plotData, valueExtent, data }) => { // eslint-disable-line no-unused-vars
    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        const myXAxis0 = gAxis.xOrdinal();// sets up yAxis
        const myXAxis1 = gAxis.xOrdinal();// sets up yAxis
        const myYAxis = gAxis.yLinear();
        const myChart = columnGroupedChart.draw(); // eslint-disable-line no-unused-vars
        const myLegend = gLegend.legend();

        // define other functions to be called
        const tickSize = currentFrame.dimension().width;// Used when drawing the yAxis ticks



        myYAxis
            .range([currentFrame.dimension().height, 0])
            .domain([Math.min(yMin, valueExtent[0]), Math.max(yMax, valueExtent[1])])
            .numTicks(numTicksy)
            .tickSize(tickSize)
            .yAxisHighlight(yAxisHighlight)
            .align(yAxisAlign)
            .logScale(logScale)
            .frameName(frameName)
            .divisor(divisor);

        const base = currentFrame.plot().append('g'); // eslint-disable-line

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

        myXAxis0
            .tickSize(0)
            .align(xAxisAlign)
            .domain(plotData.map(d => d.name))
            .rangeRound([0, currentFrame.dimension().width], 10)
            .frameName(frameName);

        myXAxis1
            .align(xAxisAlign)
            .domain(seriesNames)
            .rangeRound([0, myXAxis0.bandwidth()]);

        myChart
            .xScale0(myXAxis0.scale())
            .xScale1(myXAxis1.scale())
            .yScale(myYAxis.scale())
            .plotDim(currentFrame.dimension())
            .rem(currentFrame.rem())
            .colourPalette((frameName))
            .logScale(logScale)
            .showNumberLabels(showNumberLabels);
            // .yScale(myYAxis.yScale())

        currentFrame.plot()
          .call(myXAxis0);

        if (xAxisAlign === 'bottom') {
            myXAxis0.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
        }
        if (xAxisAlign === 'top') {
            myXAxis0.xLabel().attr('transform', `translate(0,${myXAxis0.tickSize()})`);
        }


        currentFrame.plot()
          .selectAll('.columnHolder')
          .data(plotData)
          .enter()
          .append('g')
          .attr('class', 'columnHolder')
          .call(myChart);

        // remove ticks if numbers are added to vars
        if (showNumberLabels) {
            const clear = myYAxis.yLabel().selectAll('.tick').filter(d => d !== 0);
            clear.remove();
        }


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
