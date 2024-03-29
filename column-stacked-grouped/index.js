import * as d3 from 'd3';
import * as gAxis from 'g-axis';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as parseData from './parseData.js';
import * as barChart from './barChart.js';


const dataFile = 'data.csv';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};

const yMin = 0;// sets the minimum value on the yAxis
const yMax = 4000;// sets the maximum value on the xAxis
const divisor = 1 //formatting for '000 and m illionst'
const yAxisHighlight = 0; // sets which tick to highlight on the yAxis
const numTicks = 5;// Number of tick on the uAxis
const colourProperty = 'name';
const xAxisAlign = 'bottom';// alignment of the axis
const yAxisAlign = 'left';
const logScale = false;
const sort = '';// specify 'ascending', 'descending'
const sortOn = 0;// refers to the column in the dataset (or index in seriesNames) that the sort is performed on to sort on (ignores name column)
const legendAlign = 'hori'; // hori or vert, alignment of the legend
const legendType = 'rect'; // rect, line or circ, geometry of legend marker


// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
   .margin({ top: 100, left: 15, bottom: 82, right: 24 })
   // .title("Put headline here") //use this if you need to override the defaults
   // .subtitle("Put headline |here") //use this if you need to override the defaults
   .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 86, right: 24 })
   // .title("Put headline here")
   .height(500),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 86, right: 20 })
    // .title("Put headline here")
   .height(500),

    webL: gChartframe.webFrameL(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 104, right: 24 })
   // .title("Put headline here")
   .height(700),

    print: gChartframe.printFrame(sharedConfig)
   .margin({ top: 40, left: 7, bottom: 35, right: 7 })
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

parseData.load(dataFile, { sort, sortOn })
.then(({categoryNames, seriesNames, groupNames, plotData, valueExtent, data }) => { // eslint-disable-line
    // Draw the frames
    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];
        // define other functions to be called

        const yAxis = gAxis.yLinear();
        const xAxis0 = gAxis.xOrdinal();// sets up yAxis
        const xAxis1 = gAxis.xOrdinal();// sets up yAxis
        const myChart = barChart.draw();
        const myLegend = gLegend.legend();

        // const plotDim=currentFrame.dimension()//useful variable to carry the current frame dimensions
        const tickSize = currentFrame.dimension().width;// Used when drawing the yAxis ticks
        const rem = currentFrame.rem()

        yAxis
            .tickSize(tickSize)
            .align(yAxisAlign)
            .domain([Math.min(yMin, valueExtent[0]), Math.max(yMax, valueExtent[1])])
            .range([currentFrame.dimension().height, 0])
            .numTicks(numTicks)
            .yAxisHighlight(yAxisHighlight)
            .frameName(frameName)
            .logScale(logScale)
            .divisor(divisor);
        
        const base = currentFrame.plot().append('g'); // eslint-disable-line

        // Draw the yAxis first, this will position the yAxis correctly and measure the width of the label text
        currentFrame.plot()
            .call(yAxis)
        
        // return the value in the variable newMargin
        if (yAxisAlign === 'right') {
            const newMargin = yAxis.labelWidth() + currentFrame.margin().right;
            // Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({ right: newMargin });
            // yAxis.yLabel().attr('transform', `translate(${currentFrame.dimension().width},0)`);
        }
        if (yAxisAlign === 'left') {
            const newMargin = yAxis.labelWidth() + currentFrame.margin().left;
            // Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({ left: newMargin });
            yAxis.yLabel().attr('transform', `translate(${(yAxis.tickSize() - yAxis.labelWidth())},0)`);
        }
        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        // Use new widtth of frame to set the range of the x-axis and any other parameters
        xAxis0
            .align(xAxisAlign)
            .domain(categoryNames)
            .rangeRound([0, currentFrame.dimension().width], 10)
            .frameName(frameName)
            .tickSize(0);

        xAxis1
            .paddingInner(0.06)
            .tickSize(0)
            .align(xAxisAlign)
            .domain(groupNames)
            .rangeRound([0, xAxis0.bandwidth()]);

        // Call the axis and move it if needed
       currentFrame.plot()
            .call(xAxis0)
            .call(xAxis1)

        if (xAxisAlign === 'bottom') {
            xAxis0.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height + rem})`);
            xAxis1.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
        }
        if (xAxisAlign === 'top') {
            xAxis0.xLabel().attr('transform', `translate(0,${-rem})`);
        }

        myChart
            // .paddingInner(0.06)
            .colourProperty(colourProperty)
            .colourPalette((frameName))
            .seriesNames(seriesNames)
            .xScale0(xAxis0.scale())
            .xScale1(xAxis1.scale())
            .yScale(yAxis.scale())
            .rem(currentFrame.rem())
            .logScale(logScale);

        categoryNames.map((d) => {
            const filteredPlot = plotData.filter(el => el.category === d)
            const barHolder = currentFrame.plot()
                .append('g')
                .attr('transform',`translate(${xAxis0.scale()(d)}, 0)`)
                .selectAll('.barHolder')
                .data(filteredPlot)
                .enter()
                .append('g')
                .call(myChart);
            
        })
        // Set up legend for this frame
        myLegend
            .seriesNames(seriesNames)
            .geometry(legendType)
            .frameName(frameName)
            .rem(currentFrame.rem())
            .alignment(legendAlign)
            .colourPalette((frameName));

        // // Draw the Legend
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
