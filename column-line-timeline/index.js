import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import * as gLegend from 'g-legend';
import * as gAxis from 'g-axis';
import gChartcolour from 'g-chartcolour';
import * as parseData from './parseData.js';
import * as columnLineTimeline from './columnLineTimeline.js';

const barFile = 'dataBar2.csv';
const lineFile = 'dataLine2.csv';
const dateFormat = '%d/%m/%Y';
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
const yMinL = 0;// sets the minimum value on the yAxis
const yMaxL = 10;// sets the maximum value on the yAxis
const divisorL = 1// formatting for '000 and millions
const yMinR = 0;// sets the minimum value on the yAxis
const yMaxR = 200;// sets the maximum value on the yAxis
const divisorR = 1// formatting for '000 and millions
const yAxisHighlight = 100; /* sets which tick to highlight on the yAxis */ // eslint-disable-line no-unused-vars
const numTicksL = 7;// Number of tick on the uAxis
const numTicksR = 5;// Number of tick on the uAxis
const xAxisAlign = 'bottom';// alignment of the axis
const minorAxis = true;
const invertScaleR = false;
const logScaleL = false;
const logScaleR = false;
const interpolation = d3.curveLinear;// curveStep, curveStepBefore, curveStepAfter, curveBasis, curveCardinal, curveCatmullRom
const joinPoints = true;// Joints gaps in lines where there are no data points
const interval = 'quarters';// date interval on xAxis "century", "jubilee", "decade", "lustrum", "years","months","days"
let barColour = d3.scaleOrdinal() // eslint-disable-line no-unused-vars
    .domain(Object.keys(gChartcolour.categorical_bar))
    .range(Object.values(gChartcolour.categorical_bar));
let lineColour = d3.scaleOrdinal() // eslint-disable-line no-unused-vars
    .domain(Object.keys(gChartcolour.categorical_line))
    .range(Object.values(gChartcolour.categorical_line));

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
    .margin({ top: 100, left: 20, bottom: 86, right: 15 })
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
    //.width(112.25)// 2 col
    // .width(170.8)// 3 col
    // .width(229.34)// 4 col
    // .width(287.88)// 5 col
    // .width(346.43)// 6 col
    // .width(74)// markets std print
    .height(69.85), // std print (use 58.21mm for markets charts that matter)

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

parseData.load([barFile, lineFile], { dateFormat, joinPoints })
.then(({ seriesNamesL, seriesNamesR, valueExtentL, valueExtentR, barData, lineData, dateExtent, data1, data2}) => {
    // define chart
    const myBars = columnLineTimeline.drawBars() // eslint-disable-line
    const myLines = columnLineTimeline.drawLines();

    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        const yAxisL = gAxis.yLinear();
        const yAxisR = gAxis.yLinear();
        const xAxis = gAxis.xDate();
        const xAxis1 = gAxis.xOrdinal();
        const barsLegend = gLegend.legend();
        const lineLegend = gLegend.legend();

        const axisHighlight = currentFrame.plot().append('g'); // eslint-disable-line no-unused-vars

        function move(arr, oldIndex, newIndex) {
          while (oldIndex < 0) {
            oldIndex += arr.length;
          }
          while (newIndex < 0) {
            newIndex += arr.length;
          }
          if (newIndex >= arr.length) {
            var k = newIndex - arr.length;
            while ((k--) + 1) {
              arr.push(undefined);
            }
          }
          arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);  
          return arr;
        }
        barColour = colourPalette(frameName);

        function colourPalette(d) {
          let newPalette = d3.scaleOrdinal()
          if (d === 'social' || d === 'video') {
              newPalette
              .domain(Object.keys(gChartcolour.lineSocial))
              .range(Object.values(gChartcolour.lineSocial));
              newPalette.range(move(newPalette.range(), 0, newPalette.range().length - 1));
              newPalette.range(move(newPalette.range(), 0, newPalette.range().length - 1));

          }
          if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
              newPalette
              .domain(Object.keys(gChartcolour.categorical_bar))
              .range(Object.values(gChartcolour.categorical_bar));
              newPalette.range(move(newPalette.range(), 0, newPalette.range().length - 1));
          }
          if (d === 'print') {
              newPalette
              .domain(Object.keys(gChartcolour.linePrint))
              .range(Object.values(gChartcolour.linePrint));
              newPalette.range(move(newPalette.range(), 0, newPalette.range().length - 1));
              newPalette.range(move(newPalette.range(), 0, newPalette.range().length - 1));

          }
          return newPalette;
        }

        yAxisL
          .domain([Math.min(yMinL, valueExtentL[0]), Math.max(yMaxL, valueExtentL[1])])
          .range([currentFrame.dimension().height, 0])
          .tickSize(currentFrame.rem() * 2)
          .numTicks(numTicksL)
          .align('left')
          .logScale(logScaleL)
          .frameName(frameName)
          .divisor(divisorL);

        yAxisR
           .domain([Math.min(yMinR, valueExtentR[0]), Math.max(yMaxR, valueExtentR[1])])
           .range([currentFrame.dimension().height, 0])
           .tickSize(currentFrame.rem() * 2)
           .numTicks(numTicksR)
           .align('right')
           .invert(invertScaleR)
           .logScale(logScaleR)
           .frameName(frameName)
            .divisor(divisorR);

        currentFrame.plot()
          .call(yAxisL);

        currentFrame.plot()
          .call(yAxisR);


        const newMarginL = yAxisL.yLabel().node().getBBox().width + currentFrame.margin().left;
        const newMarginR = yAxisR.yLabel().node().getBBox().width + currentFrame.margin().right;
        currentFrame.margin({ left: newMarginL, right: newMarginR });

        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);


        yAxisR.yLabel()
          .attr('transform', `translate(${(currentFrame.dimension().width)},0)`)
          .classed('baseline', true);

        xAxis
        .domain(dateExtent)
        .range([0, ((currentFrame.dimension().width))])
        .align(xAxisAlign)
        .interval(interval)
        .tickSize(currentFrame.rem() * 0.75)
        .minorAxis(minorAxis)
        .minorTickSize(currentFrame.rem() * 0.3);

        // Calculae the bandwidth
        const xScale = xAxis.scale();
        const barLength = barData.length;
        const barWidth = ((xScale(barData[barLength - 1].date)) - (xScale(barData[0].date))) / barLength;

        xAxis
        .range([0, ((currentFrame.dimension().width) - (barWidth * 0.5))]);
        currentFrame.plot()
          .call(xAxis);

        if (xAxisAlign === 'bottom') {
            xAxis.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
            if (minorAxis) {
                xAxis.xLabelMinor().attr('transform', `translate(0,${currentFrame.dimension().height})`);
            }
        }
        if (xAxisAlign === 'top') {
            xAxis.xLabel().attr('transform', `translate(0,${xAxis.tickSize()})`);
        }

        // axisHighlight.append("rect")
        //   .attr("width", currentFrame.dimension().width)
        //   .attr("height",currentFrame.dimension().height)
        //   .attr("fill","#ededee");

        xAxis1
            .align(xAxisAlign)
            .domain(seriesNamesL)
            .rangeRound([0, barWidth], 10);

        myBars
            .yScaleL(yAxisL.scale())
            .yScaleR(yAxisR.scale())
            .xScale0(xAxis.scale())
            .xScale1(xAxis1.scale())
            .barWidth(barWidth)
            .colourPalette(barColour);

        currentFrame.plot()
          .selectAll('.columnHolder')
          .data(barData)
          .enter()
          .append('g')
          .attr('class', 'columnHolder')
          .call(myBars);

        myLines
            .yScale(yAxisR.scale())
            .xScale(xAxis.scale())
            .interpolation(interpolation)
            .rem(currentFrame.rem())
            .colourPalette((frameName))
            .interpolation(interpolation);

        currentFrame.plot()
          .selectAll('lines')
          .data(lineData)
          .enter()
          .append('g')
          .attr('class', 'lines')
          .attr('id', d => d.name)
          .call(myLines);

        // Set up legend for this frame
        barsLegend
            .forceLegend(true)
            .seriesNames(seriesNamesL)
            .geometry('rect')
            .frameName(frameName)
            .rem(currentFrame.rem())
            .alignment('vert')
            .colourPalette(barColour);

        // Draw the Legend
        currentFrame.plot()
            .append('g')
            .attr('id', 'legend')
                .selectAll('.legend')
                .data(seriesNamesL)
                .enter()
                .append('g')
                .classed('legend', true)
            .call(barsLegend);

        lineLegend
            .forceLegend(true)
            .seriesNames(seriesNamesR)
            .geometry('line')
            .frameName(frameName)
            .rem(currentFrame.rem())
            .alignment('vert')
            .colourPalette((frameName));

        currentFrame.plot()
            .append('g')
            .attr('id', 'lineLegend')
                .selectAll('.legend')
                .data(seriesNamesR)
                .enter()
                .append('g')
                .classed('legend', true)
            .call(lineLegend);

        const moveLegend = currentFrame.plot().select('#lineLegend');
        const legwidth = ((currentFrame.plot().select('#legend')).node().getBBox().width);
        moveLegend.attr('transform', `translate(${legwidth + currentFrame.rem()},0)`);
    });
});
