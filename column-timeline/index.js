import * as d3 from 'd3';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as gAxis from 'g-axis';
import * as columnTimelineChart from './columnTimelineChart.js';
import * as parseData from './parseData.js';

const dataFile = 'data.csv';

const dateStructure = '%d-%b-%y';
/*
  some common formatting parsers....
  '%m/%d/%Y'        01/28/1986
  '%d-%b-%y'        28-Jan-86
  '%Y %b'           1986 Jan
  '%Y-%m-%d'        1986-01-28
  '%B %d'           January 28
  '%d %b'           28 Jan
  '%H:%M'           11:39
  '%H:%M %p'        11:39 AM
  '%d/%m/%Y %H:%M'  28/01/2016 11:39
*/

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};
const yMin = 0;// sets the minimum value on the yAxis
const yMax = 0;// sets the maximum value on the xAxis
const yAxisHighlight = -1; // sets which tick to highlight on the yAxis
const numTicksy = 5;// Number of tick on the uAxis
const yAxisAlign = 'right';// alignment of the axis
const xAxisAlign = 'bottom';// alignment of the axis
const interval = 'years';// date interval on xAxis "century", "jubilee", "decade", "lustrum", "years","months","days"
const minorAxis = false;// turns on or off the minor axis
const numbers = false;// show numbers on end of bars
const legendAlign = 'hori';// hori or vert, alignment of the legend
const legendType = 'rect';// rect, line or circ, geometry of legend marker

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
   //Print column sizes-- 1col 53.71mm: 2col 112.25mm: 3col 170.8mm: 4col 229.34mm: 5col 287.88mm: 6col 346.43,
   .width(112.25)
   .height(68),

    social: gChartframe.socialFrame(sharedConfig)
   .margin({ top: 140, left: 50, bottom: 138, right: 40 })
   // .title("Put headline here")
   .width(612)
   .height(750),

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

parseData.fromCSV(dataFile, dateStructure).then(({ columnNames, seriesNames, valueExtent, plotData, data, highlights }) => {
    // define chart
    const myChart = columnTimelineChart.draw()
          .seriesNames(seriesNames)
          .yDomain([Math.min(yMin, valueExtent[0]), Math.max(yMax, valueExtent[1])])
          .xDomain0(d3.extent(data, d => d.date))
          .yAxisAlign(yAxisAlign);


    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];
        const myXAxis0 = gAxis.xDate();// sets up xAxis
        const myXAxis1 = gAxis.xOrdinal();// sets up xAxis
        const myXAxis2 = gAxis.xOrdinal();// sets up xAxis
        const myYAxis = gAxis.yLinear();
        const myLegend = gLegend.legend();
        const myHighlights = columnTimelineChart.drawHighlights();// sets up highlight tonal bands

        // define other functions to be called
        const tickSize = currentFrame.dimension().width;// Used when drawing the yAxis ticks

        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        // create a 'g' element at the back of the chart to add time period highlights after axis have been created
        const axisHighlight = currentFrame.plot().append('g');

        myChart
            .yRange([currentFrame.dimension().height, 0])
            .plotDim(currentFrame.dimension())
            .rem(currentFrame.rem())
            .colourPalette((frameName));

        myYAxis
            .scale(myChart.yScale())
            .numTicks(numTicksy)
            .tickSize(tickSize)
            .yAxisHighlight(yAxisHighlight)
            .align(myChart.yAxisAlign())
            .frameName(frameName);

        const base = currentFrame.plot().append('g'); //eslint-disable-line

        currentFrame.plot()
          .call(myYAxis);


         // return the value in the variable newMargin
        if (yAxisAlign === 'right') {
            const newMargin = myYAxis.labelWidth() + currentFrame.margin().right;
            // Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({ right: newMargin });
        } else {
            const newMargin = myYAxis.labelWidth() + currentFrame.margin().left;
            // Use newMargin re define the new margin and range of xAxis
            currentFrame.margin({ left: newMargin });
        }


        myChart.xRange0([0, currentFrame.dimension().width]);
        myChart.xRange1([0, currentFrame.dimension().width]);
        myChart.xRange2([0, currentFrame.dimension().width]);

        myXAxis0
            .fullYear(currentFrame.fullYear())
            .scale(myChart.xScale0())
            .interval(interval)
            .tickSize(myChart.rem())
            .minorAxis(minorAxis)
            .frameName(frameName);

         // Set up highlights for this frame
        myHighlights
            .yScale(myChart.yScale())
            .yRange([currentFrame.dimension().height, 0])
            .xScale(myChart.xScale0())
            .xRange([0, currentFrame.dimension().width]);

        myXAxis1
            .align(xAxisAlign)
            .domain(columnNames)
            .rangeRound([0, currentFrame.dimension().width])
            .frameName(frameName);

        myXAxis2
            .align(xAxisAlign)
            .domain(seriesNames)
            .rangeRound([0, myXAxis1.bandwidth()]);

        myChart
            .xScale1(myXAxis1.scale())
            .xScale2(myXAxis2.scale())
            .numbers(numbers);
            // .yScale(myYAxis.yScale())

        // Draw the highlights before the lines and xAxis
        axisHighlight
            .selectAll('.highlights')
            .data(highlights)
            .enter()
            .append('g')
            .attr('class', 'highlights')
            .call(myHighlights);


        currentFrame.plot()
          .call(myXAxis0);
        if (xAxisAlign == 'bottom' ){
            myXAxis0.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
            if(minorAxis) {
                myXAxis0.xLabelMinor().attr('transform', `translate(0,${currentFrame.dimension().height})`);

            }
        }
        if (xAxisAlign == 'top' ){
            myXAxis0.xLabel().attr('transform', `translate(0,${myXAxis0.tickSize()})`);
        }


        currentFrame.plot()
          .selectAll('.columnHolder')
          .data(plotData)
          .enter()
          .append('g')
          .attr('class', 'columnHolder')
          .attr('id', d => d.name)
          .call(myChart);

        // remove ticks if numbers are added to vars
        if (numbers) {
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
