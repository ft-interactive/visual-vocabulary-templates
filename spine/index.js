import * as d3 from 'd3';
import * as gAxis from 'g-axis';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as parseData from './parseData.js';
import * as spineChart from './spineChart.js';


const dataFile = 'data.csv';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};

const xMin = 0;// sets the minimum value on the yAxis
const xMax = 40;// sets the maximum value on the xAxis
const xAxisHighlight = 0; // sets which tick to highlight on the yAxis
const numTicks = 5;// Number of tick on the uAxis
const colourProperty = 'name';
const yAxisAlign = 'left';// alignment of the axis
const sort = '';// specify 'ascending', 'descending'
const sortOn = 0;// specify column number to sort on (ignore name column)
const showNumberLabels = false;// show numbers on end of bars


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
    //.width(53.71)// 1 col 
    .width(112.25)// 2 col 
    //.width(170.8)// 3 col
    //.width(229.34)// 4 col
    //.width(287.88)// 5 col 
    //.width(346.43)// 6 col
    //.width(74)// markets std print 
    .height(58.21),//markets std print


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
        const figure = d3.select(this)
                        .attr('class', 'button-holder');

        figure.select('svg')
            .call(frame[figure.node().dataset.frame]);
    });

parseData.fromCSV(dataFile, { sort, sortOn })
.then(({ seriesNames, plotData, valueExtent }) => {
    // Draw the frames
    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];
        // define other functions to be called

        const yAxis = gAxis.yOrdinal();// sets up yAxis
        const xAxisL = gAxis.xLinear();
        const xAxisR = gAxis.xLinear();
        const myChart = spineChart.draw();

        // const plotDim=currentFrame.dimension()//useful variable to carry the current frame dimensions
        yAxis
            .align(yAxisAlign)
            .domain(plotData.map(d => d.name))
            .rangeRound([0, currentFrame.dimension().height], 10)
            .frameName(frameName);

        currentFrame.plot()
            .call(yAxis);

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

        xAxisL
            .range([0, (currentFrame.dimension().width / 2)])
            .domain([Math.min(xMin, valueExtent[0]), Math.max(xMax, valueExtent[1])])
            .tickSize(currentFrame.dimension().height)
            .invert(true)
            .numTicks(numTicks)
            .xAxisHighlight(xAxisHighlight)
            .frameName(frameName);

        // Call the axis and move it if needed
        currentFrame.plot()
            .call(xAxisL);

        xAxisR
            .range([((currentFrame.dimension().width) / 2), currentFrame.dimension().width])
            .domain([Math.min(xMin, valueExtent[0]), Math.max(xMax, valueExtent[1])])
            .tickSize(currentFrame.dimension().height)
            .frameName(frameName);

        currentFrame.plot()
            .call(xAxisR);

        myChart
            // .paddingInner(0.06)
            .colourProperty(colourProperty)
            .colourPalette((frameName))
            .seriesNames(seriesNames)
            .yScale(yAxis.scale())
            .xScaleL(xAxisL.scale())
            .xScaleR(xAxisR.scale())
            .rem(currentFrame.rem())
            .showNumberLabels(showNumberLabels);

        currentFrame.plot()
            .selectAll('.barHolder')
            .data(plotData)
            .enter()
            .append('g')
            .call(myChart);

        currentFrame.plot()
            .append('g')
            .attr('class', 'annotations-holder')
            .append('text')
            .attr('class', 'annotation')
            .attr('id', frameName + 'annotateright')
            .attr('x', (currentFrame.dimension().width / 2) - (currentFrame.rem() / 2))
            .attr('y', -currentFrame.rem() / 4)
            .attr('text-anchor', 'end')
            .text(seriesNames[0]);

        currentFrame.plot()
            .append('g')
            .attr('class', 'annotations-holder')
            .append('text')
            .attr('class', 'annotation')
            .attr('id', frameName + 'annotateleft')
            .attr('x', (currentFrame.dimension().width / 2) + (currentFrame.rem() / 2))
            .attr('y', -currentFrame.rem() / 4)
            .attr('text-anchor', 'start')
            .text(seriesNames[1]);


    });
    // addSVGSavers('figure.saveable');
});
