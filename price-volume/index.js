import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import * as gLegend from 'g-legend';
import * as gAxis from 'g-axis';
import gChartcolour from 'g-chartcolour';
import * as parseData from './parseData.js';
import * as columnLineTimeline from './columnLineTimeline.js';
import * as annotation from 'g-annotations';

const dataFile = 'data.csv';
const priceFile = 'priceShort.csv';
const dateFormat = '%d/%m/%Y %H:%M';
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
const yMinBar = 0;// sets the minimum value on the yAxis
const yMaxBar = 800000000;// sets the maximum value on the yAxis
const divisorBar = 1000000// formatting for '000 and millions
const yMinLine = 0;// sets the minimum value on the yAxis
const yMaxLine = 0.1;// sets the maximum value on the yAxis
const divisorLine = 1// formatting for '000 and millions
const yAxisHighlight = 100; /* sets which tick to highlight on the yAxis */ // eslint-disable-line no-unused-vars
const numTicksBar = 4;// Number of tick on the uAxis
const numTicksLine = 5;// Number of tick on the uAxis
const turnWidth = 5;
const yAxisAlign = 'right';// alignment of the axis
const minorAxis = false;
const invertScaleR = false;
const logScaleL = false;
const logScaleR = false;
const interpolation = d3.curveLinear;// curveStep, curveStepBefore, curveStepAfter, curveBasis, curveCardinal, curveCatmullRom
const joinPoints = true;// Joints gaps in lines where there are no data points
const interval = 'days';// date interval on xAxis "century", "jubilee", "decade", "lustrum", "years","months","days"
const intraday = true;

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

parseData.load(dataFile, { dateFormat, joinPoints })
.then(({data,
            barSeries,
            lineSeries,
            valueExtentPrice,
            valueExtentVolume,
            barData,
            lineData,
            annos,}) => {
    // define chart

    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];
        const myBars = columnLineTimeline.drawBars() // eslint-disable-line
        const myLines = columnLineTimeline.drawLines();
        const myAnnotations = annotation.annotations();// sets up annotations
        const yAxisBar = gAxis.yLinear();
        const yAxisLine = gAxis.yLinear();
        const xAxis = gAxis.xDate();
        const xAxis1 = gAxis.xOrdinal();
        const barsLegend = gLegend.legend();
        const lineLegend = gLegend.legend();

        const axisHighlight = currentFrame.plot().append('g'); // eslint-disable-line no-unused-vars
        const tickSize = currentFrame.dimension().width;// Used when drawing the yAxis ticks

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

        yAxisBar
          .domain([Math.min(yMinBar, valueExtentVolume[0]), Math.max(yMaxBar, valueExtentVolume[1])])
          .range([currentFrame.dimension().height, (currentFrame.dimension().height*.75)])
          .tickSize(tickSize)
          .numTicks(numTicksBar)
          .align(yAxisAlign)
          .logScale(logScaleL)
          .frameName(frameName)
          .divisor(divisorBar);

        yAxisLine
           .domain([Math.min(yMinLine, valueExtentPrice[0]), Math.max(yMaxLine, valueExtentPrice[1])])
           .range([(currentFrame.dimension().height*.650), 0])
           .tickSize(tickSize)
           .numTicks(numTicksLine)
           .align(yAxisAlign)
           .invert(invertScaleR)
           .logScale(logScaleR)
           .frameName(frameName)
            .divisor(divisorLine);

        currentFrame.plot()
          .call(yAxisBar);

        currentFrame.plot()
          .call(yAxisLine);
        
        // return the value in the variable newMargin
        if (yAxisAlign === 'right') {
            const newMargin = yAxisBar.labelWidth() + currentFrame.margin().right;
            // Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({ right: newMargin });
            // yAxis.yLabel().attr('transform', `translate(${currentFrame.dimension().width},0)`);
        }
        if (yAxisAlign === 'left') {
            const newMargin = yAxisBar.labelWidth() + currentFrame.margin().left;
            // Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({ left: newMargin });
            yAxisBar.yLabel().attr('transform', `translate(${(yAxisBar.tickSize() - yAxisBar.labelWidth())},0)`);
            yAxisLine.yLabel().attr('transform', `translate(${(yAxisLine.tickSize() - yAxisLine.labelWidth())},0)`);

        }
        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        let xDomain;
        if (intraday) {
            xDomain = data.map(d => d.date);
        } else { xDomain = dateExtent }

        xAxis
        .domain(xDomain)
        .range([0, ((currentFrame.dimension().width))])
        .align('bottom')
        .interval(interval)
        .tickSize(currentFrame.rem() * 0.75)
        .minorAxis(minorAxis)
        .minorTickSize(currentFrame.rem() * 0.3)
        .intraday(intraday);

        // Calculae the bandwidth
        const xScale = xAxis.scale();
        const barLength = barData.length;
        const barWidth = intraday
        ? Math.max(1, currentFrame.dimension().width/xScale.domain().length)
        :(xScale(barData[barLength - 1].date)) - (xScale(barData[0].date)) / barLength;

        xAxis
        .range([0, ((currentFrame.dimension().width) - (barWidth * 0.5))]);
        currentFrame.plot()
          .call(xAxis);

        xAxis.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
        if (minorAxis) {
            xAxis.xLabelMinor().attr('transform', `translate(0,${currentFrame.dimension().height})`);
        }

        xAxis1
            .align('bottom')
            .domain(barSeries)
            .rangeRound([0, barWidth], 10);

        myBars
            .yScaleL(yAxisBar.scale())
            .yScaleR(yAxisLine.scale())
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
            .yScale(yAxisLine.scale())
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
            .seriesNames(barSeries)
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
                .data(barSeries)
                .enter()
                .append('g')
                .classed('legend', true)
            .call(barsLegend);

        lineLegend
            .forceLegend(true)
            .seriesNames(lineSeries)
            .geometry('line')
            .frameName(frameName)
            .rem(currentFrame.rem())
            .alignment('vert')
            .colourPalette((frameName));

        currentFrame.plot()
            .append('g')
            .attr('id', 'lineLegend')
                .selectAll('.legend')
                .data(lineSeries)
                .enter()
                .append('g')
                .classed('legend', true)
            .call(lineLegend);

        const plotAnnotation = currentFrame.plot().append('g').attr('class', 'annotations-holder');

        //Set up highlights for this frame
        myAnnotations
          .xScale(xAxis.scale())
          .yScale(yAxisLine.scale())
          .frameName(frameName)
          .lineWidth(currentFrame.rem() * turnWidth)
          .plotDim([currentFrame.dimension().width,currentFrame.dimension().height])

        // Draw the annotations before the lines
        plotAnnotation
            .selectAll('.annotations')
            .data(annos)
            .enter()
            .append('g')
            .call(myAnnotations)

        const moveLegend = currentFrame.plot().select('#lineLegend');
        const legwidth = ((currentFrame.plot().select('#legend')).node().getBBox().width);
        moveLegend.attr('transform', `translate(${legwidth + currentFrame.rem()},0)`);
    });
});
