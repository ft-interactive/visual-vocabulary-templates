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

const xMin = 0;// sets the minimum value on the yAxis
const xMax = 0;// sets the maximum value on the xAxis
const xAxisHighlight = 0; // sets which tick to highlight on the yAxis
const numTicks = 5;// Number of tick on the uAxis
const colourProperty = 'name';
const yAxisAlign = 'left';// alignment of the axis
const xAxisAlign = 'bottom';
const sort = '';// specify 'ascending', 'descending'
const sortOn = 0;// specify column number to sort on (ignore name column)
const numbers = false;// show numbers on end of bars
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
   //Print column sizes-- 1col 53.71mm: 2col 112.25mm: 3col 170.8mm: 4col 229.34mm: 5col 287.88mm: 6col 346.43,
   .width(112.25)
   .height(68),


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

parseData.fromCSV(dataFile, { sort, sortOn })
.then(({ seriesNames, plotData, valueExtent, data }) => {
    // Draw the frames
    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];
        // define other functions to be called

        const yAxis0 = gAxis.yOrdinal();// sets up yAxis
        const yAxis1 = gAxis.yOrdinal();// sets up yAxis
        const xAxis = gAxis.xLinear();
        const myChart = barChart.draw();
        const myLegend = gLegend.legend();

        // const plotDim=currentFrame.dimension()//useful variable to carry the current frame dimensions
        const tickSize = currentFrame.dimension().height;// Used when drawing the yAxis ticks

        yAxis0
            .align(yAxisAlign)
            .domain(plotData.map(d => d.name))
            .rangeRound([0, currentFrame.dimension().height])
            .frameName(frameName);

        yAxis1
            .paddingInner(0.06)
            .align(yAxisAlign)
            .domain(seriesNames)
            .rangeRound([0, yAxis0.bandwidth()]);

        xAxis
            .align(xAxisAlign)
            .domain([Math.min(xMin, valueExtent[0]), Math.max(xMax, valueExtent[1])])
            .numTicks(numTicks)
            .xAxisHighlight(xAxisHighlight)
            .frameName(frameName);

        const base = currentFrame.plot().append('g');

        // Draw the yAxis first, this will position the yAxis correctly and measure the width of the label text
        currentFrame.plot()
            .call(yAxis0);

        // return the value in the variable newMargin and move axis if needed
        if (yAxisAlign === 'right') {
            const newMargin = yAxis0.labelWidth() + currentFrame.margin().right;
            // Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({ right: newMargin });
            yAxis0.yLabel()
                .attr('transform', `translate(${currentFrame.dimension().width + yAxis0.labelWidth()},${0})`);
        } else {
            const newMargin = yAxis0.labelWidth() + currentFrame.margin().left;
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
            .seriesNames(seriesNames)
            .yScale0(yAxis0.scale())
            .yScale1(yAxis1.scale())
            .xScale(xAxis.scale())
            .rem(currentFrame.rem())
            .numbers(numbers);

        currentFrame.plot()
            .selectAll('.barHolder')
            .data(plotData)
            .enter()
            .append('g')
            .call(myChart);
        // remove ticks if numbers are added to vars
        if (numbers) {
            const clear = xAxis.xLabel().selectAll('.tick').filter(d => d !== 0);
            clear.remove();
        }

        // Set up legend for this frame
        myLegend
            .seriesNames(seriesNames)
            .geometry(legendType)
            .frameName(frameName)
            .rem(currentFrame.rem())
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

        const legendSelection = currentFrame.plot().select('#legend');
        const legheight = (legendSelection.node().getBBox().height);
        legendSelection.attr('transform', `translate(0,${-currentFrame.rem()})`);

    });
    // addSVGSavers('figure.saveable');
});
