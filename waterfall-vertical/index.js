import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import * as gLegend from 'g-legend';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as waterfallChart from './waterfallChart.js';

const dataFile = 'data.csv';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};
const xMin = 0;// sets the minimum value on the yAxis
const xMax = 0;// sets the maximum value on the yAxis
const divisor = 1;// sets the formatting on linear axis for ’000s and millions
const xAxisHighlight = 100; // sets which tick to highlight on the yAxis
const numTicksx = 5;// Number of tick on the uAxis
const yAxisAlign = 'left';// alignment of the axis
const xAxisAlign = 'top';// alignment of the axis
const showNumberLabels = false;// show numbers on end of bars
const legendAlign = 'hori';// hori or vert, alignment of the legend
const legendType = 'rect'; // rect, line or circ, geometry of legend marker
const total = false; // show total bar at end of chart
const invertScale = false; // invert y-axis

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
   .margin({ top: 100, left: 15, bottom: 82, right: 10 })
   // .title("Put headline here") //use this if you need to override the defaults
   // .subtitle("Put headline |here") //use this if you need to override the defaults
   .height(600),

    webM: gChartframe.webFrameM(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 86, right: 20 })
   // .title("Put headline here")
   .height(600),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
    .margin({ top: 100, left: 20, bottom: 86, right: 10 })
    // .title("Put headline here")
    .height(600),

    webL: gChartframe.webFrameL(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 104, right: 10 })
   // .title("Put headline here")
   .height(800)
   .fullYear(true),

    print: gChartframe.printFrame(sharedConfig)
    .margin({ top: 40, left: 7, bottom: 35, right: 7 })
    // .title("Put headline here")
    // .width(53.71)// 1 col
    .width(112.25)// 2 col
    // .width(170.8)// 3 col
    // .width(229.34)// 4 col
    // .width(287.88)// 5 col
    // .width(346.43)// 6 col
    // .width(74)// markets std print
    .height(69.85), //  std print (Use 58.21mm for markets charts that matter)

    social: gChartframe.socialFrame(sharedConfig)
   .margin({ top: 140, left: 50, bottom: 138, right: 40 })
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

parseData.load(dataFile, { total })
.then(({ seriesNames, plotData, valueExtent, data, groupNames }) => { // eslint-disable-line no-unused-vars
    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        const myYAxis = gAxis.yOrdinal();// sets up yAxis
        const myXAxis = gAxis.xLinear();
        const myChart = waterfallChart.draw(); // eslint-disable-line no-unused-vars
        const myLegend = gLegend.legend();

        // define other functions to be called
        const tickSize = currentFrame.dimension().height;// Used when drawing the xAxis ticks
        myChart
            .xRange([currentFrame.dimension().width, 0])
            .plotDim(currentFrame.dimension())
            .rem(currentFrame.rem())
            .colourPalette((frameName))
            .invertScale(invertScale);

        myYAxis
            .align(yAxisAlign)
            .domain(plotData.map(d => d.name))
            .rangeRound([0, tickSize], 10)
            .frameName(frameName);

        myXAxis
            .scale(myChart.xScale())
            .numTicks(numTicksx)
            .tickSize(tickSize)
            .xAxisHighlight(xAxisHighlight)
            .frameName(frameName)
            .divisor(divisor);


        myXAxis
            .align(xAxisAlign)
            .domain([Math.min(xMin, valueExtent[0]), Math.max(xMax, valueExtent[1])])
            .invert(invertScale)
            .frameName(frameName);

        const base = currentFrame.plot().append('g'); // eslint-disable-line

        currentFrame.plot()
          .call(myYAxis);

         // return the value in the variable newMargin and move axis if needed
        if (yAxisAlign === 'right') {
            const newMargin = myYAxis.labelWidth() + currentFrame.margin().right;
            // Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({ right: newMargin });
            myYAxis.yLabel()
                .attr('transform', `translate(${currentFrame.dimension().width + myYAxis.labelWidth()},${0})`);
        } else {
            const newMargin = myYAxis.labelWidth() + currentFrame.margin().left;
            // Use newMargin re define the new margin and range of xAxis
            currentFrame.margin({ left: newMargin });
        }
        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        // Use new widtth of frame to set the range of the x-axis and any other parameters
        myXAxis
            .range([0, (currentFrame.dimension().width - (currentFrame.rem() / 3))])
            .tickSize(currentFrame.dimension().height);

        myChart
            .xScale(myXAxis.scale())
            .yScale(myYAxis.scale())
            .showNumberLabels(showNumberLabels);

        currentFrame.plot()
          .call(myXAxis);

        if (xAxisAlign === 'bottom') {
            myXAxis.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
        }
        if (xAxisAlign === 'top') {
            myXAxis.xLabel().attr('transform', `translate(0,${myXAxis.tickSize()})`);
        }


        currentFrame.plot()
            .selectAll('.columnHolder')
            .data(plotData)
            .enter()
            .append('g')
            .attr('class', 'columnHolder')
            .attr('class', (d, i) => { if (i < plotData.length -1) {
                    return 'whisker'
                }
            })
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
                .data(groupNames)
                .enter()
                .append('g')
                .classed('legend', true)
            .call(myLegend);
    });
    // addSVGSavers('figure.saveable');
});
