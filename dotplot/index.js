import * as d3 from 'd3';
import * as gAxis from 'g-axis';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as parseData from './parseData.js';
import * as dotPlot from './dotplot.js';

// User defined constants similar to version 2
const dateStructure = '%d/%m/%Y';
const dataFile = './example.csv';
const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};
const xMin = 0;// sets the minimum value on the yAxis
const xMax = 200;// sets the maximum value on the xAxis
const xAxisHighlight = 0; // sets which tick to highlight on the yAxis
const numTicks = 7;// Number of tick on the uAxis
const colourProperty = 'name';
const yAxisAlign = 'left';// alignment of the axis
const xAxisAlign = 'bottom';
const lines = true;
const quantiles = false;

const sort = '';
const sortOn = 0;



// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
   .margin({ top: 100, left: 15, bottom: 82, right: 24 })
   // .title("Put headline here") //use this if you need to override the defaults
   // .subtitle("Put headline |here") //use this if you need to override the defaults
   .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 86, right: 35 })
   // .title("Put headline here")
   .height(500),

   webMDefault: gChartframe.webFrameMDefault(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 86, right: 38 })
    // .title("Put headline here")
   .height(500),

    webL: gChartframe.webFrameL(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 104, right: 35 })
   // .title("Put headline here")
   .height(700),

    print: gChartframe.printFrame(sharedConfig)
   .margin({ top: 40, left: 7, bottom: 35, right: 7 })
   // .title("Put headline here")
   .height(68)
   .width(55),

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

parseData.fromCSV(dataFile, dateStructure, { sort, sortOn })
.then(({ groupNames, plotData, valueExtent, data }) => {
    // Draw the frames
    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];
        // define other functions to be called
        const yAxis = gAxis.yOrdinal();// sets up yAxis
        const xAxis = gAxis.xLinear();
        const myChart = dotPlot.draw();
        const myQuartiles = dotPlot.drawQuartiles();
        const myLegend = gLegend.legend();

        // const plotDim=currentFrame.dimension()//useful variable to carry the current frame dimensions
        const tickSize = currentFrame.dimension().height;// Used when drawing the yAxis ticks

        yAxis
            .align(yAxisAlign)
            .domain(plotData.map(d => d.group))
            .rangeRound([0, currentFrame.dimension().height])
            .frameName(frameName);

        xAxis
            .align(xAxisAlign)
            .domain([Math.min(xMin, valueExtent[0]), Math.max(xMax, valueExtent[1])])
            .numTicks(numTicks)
            .xAxisHighlight(xAxisHighlight)
            .frameName(frameName);

        // console.log(xMin,xMax,valueExtent, xAxis.domain)
        console.log(plotData)

        const base = currentFrame.plot().append('g');

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
            // .paddingInner(0.06)
            .colourProperty(colourProperty)
            .colourPalette((frameName))
            .groupNames(groupNames)
            .yScale(yAxis.scale())
            .xScale(xAxis.scale())
            .rem(currentFrame.rem())
            .lines(lines);
        
        myQuartiles
            // .paddingInner(0.06)
            .colourProperty(colourProperty)
            .colourPalette((frameName))
            .groupNames(groupNames)
            .yScale(yAxis.scale())
            .xScale(xAxis.scale())
            .rem(currentFrame.rem())
            .quantiles(quantiles);

        const highlights = plotData.map(d => {
            return d.values.filter(el => el.highlight === 'yes');
        });

        console.log(highlights)

        currentFrame.plot()
            .selectAll('.dotholder')
            .data(plotData)
            .enter()
            .append('g')
            .attr('class', 'dotholder annotations-holder')
            .call(myChart);

        if (quantiles) {
          currentFrame.plot()
            .selectAll('.quartHolder')
            .data(plotData)
            .enter()
            .append('g')
            .attr('class', 'quartHolder annotations-holder')
            .call(myQuartiles);

        }
    });
    // addSVGSavers('figure.saveable');
});
