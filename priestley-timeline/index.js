import * as d3 from 'd3';
import * as gAxis from 'g-axis';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as parseData from './parseData.js';
import * as priestleyChart from './priestleyChart.js';



const dateFormat = '%Y';

const dataFile = 'data.csv';
const parseDate = d3.timeParse(dateFormat);

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};

const xMin = parseDate('1730');// sets the minimum value on the yAxis
const xMax = parseDate('1950');// sets the maximum value on the xAxis
const numTicks = 5;// Number of tick on the uAxis
const minorAxis = true;// turns on or off the minor axis
const showRects = true;//extent shades
const showLines = false;//connecting line
const showMarkers = false;//marker dots
const colourProperty = 'name';
const yAxisAlign = 'left';// alignment of the axis
const xAxisAlign = 'bottom';
const interval = 'jubilee';// date interval on xAxis "century", "jubilee", "decade", "lustrum", "years", "months", "days", "hours"
const sort = '';// specify 'ascending', 'descending'
const sortOn = 0;// specify column number to sort on (ignore name column)
const legendAlign = 'hori'; // hori or vert, alignment of the legend
const legendType = 'circ'; // rect, line or circ, geometry of legend marker


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
   // .width(53.71)// 1 col
    .width(112.25)// 2 col
    // .width(170.8)// 3 col
    // .width(229.34)// 4 col
    // .width(287.88)// 5 col
    // .width(346.43)// 6 col
    // .width(74)// markets std print
    .height(69.85), // std print (Use 58.21mm for markets charts that matter)


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

parseData.load(dataFile, { sort, sortOn, dateFormat })
.then(({ seriesNames, plotData, valueExtent, data }) => { // eslint-disable-line
    // Draw the frames
    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];
        // define other functions to be called

        const yAxis = gAxis.yOrdinal();// sets up yAxis
        const xAxis = gAxis.xDate();
        const myChart = priestleyChart.draw();
        const myLegend = gLegend.legend();
        const myAnnotations = priestleyChart.drawAnnotations();// sets up annotations

        // const plotDim=currentFrame.dimension()//useful variable to carry the current frame dimensions
        const tickSize = currentFrame.dimension().height;// Used when drawing the yAxis ticks

        yAxis
            .align(yAxisAlign)
            .domain(plotData.map(d => d.name))
            .rangeRound([0, tickSize], 10)
            .frameName(frameName);

        xAxis
            .align(xAxisAlign)
            .domain([Math.min(xMin, valueExtent[0]), Math.max(xMax, valueExtent[1])])
            .interval(interval)
            .fullYear(true)
            .minorAxis(minorAxis)
            .minorTickSize(currentFrame.rem() * 0.5)
            .frameName(frameName);

        const base = currentFrame.plot().append('g'); // eslint-disable-line

      // Draw the yAxis first, this will position the yAxis correctly and measure the width of the label text
        currentFrame.plot()
            .call(yAxis);
        // console.log(plotData);
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
        if (xAxisAlign === 'bottom') {
            if (minorAxis) {
                xAxis.xLabelMinor().attr('transform', `translate(0,${currentFrame.dimension().height - (currentFrame.rem() * 0.5)})`);
            }
        }

        const plotAnnotation = currentFrame.plot().append('g').attr('class', 'annotations-holder');

        myChart
            // .paddingInner(0.06)
            .colourProperty(colourProperty)
            .colourPalette(frameName, showRects)
            .seriesNames(seriesNames)
            .yScale(yAxis.scale())
            .xScale(xAxis.scale())
            .rem(currentFrame.rem())
            .showRects(showRects)
            .showMarkers(showMarkers)
            .showLines(showLines)

        currentFrame.plot()
            .selectAll('.barHolder')
            .data(plotData)
            .enter()
            .append('g')
            .call(myChart);

         // Show annotations for bars
        if (showRects === true) {
       
             // Set up annotation for this frame
            myAnnotations
                .yScale(yAxis.scale())
                .xScale(xAxis.scale())
                .rem(currentFrame.rem());

            // Draw the annotations
            plotAnnotation
                .selectAll('.annotation')
                .data(plotData[0].groups)
                .enter()
                .append('g')
                .call(myAnnotations);
        }

        // Set up legend for this frame
        if (showRects === false) {
            myLegend
                .seriesNames(seriesNames)
                .geometry(legendType)
                .frameName(frameName)
                .rem(currentFrame.rem())
                .alignment(legendAlign)
                .colourPalette((frameName));
        }

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
        const legheight = (legendSelection.node().getBBox().height); // eslint-disable-line
        legendSelection.attr('transform', `translate(0,${-currentFrame.rem()})`);
    });
    // addSVGSavers('figure.saveable');
});
