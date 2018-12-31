/**
 * Bootstrapping code for line chart
 */

import * as d3 from 'd3';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import gChartcolour from 'g-chartcolour';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as lineChart from './lineChart.js';
import * as annotation from 'g-annotations';
import * as areaChart from './areaChart.js';
import concaveHullGenerator from './concaveHull.js';

//const dataFile =  'data.csv'
const dataFile = 'http://bertha.ig.ft.com/republish/publish/dsv/1LXtp1IGDrbFz47wf15IzQ8tQMQtN1s4GtuNWtDHiyyA/bloomberg.csv'
//const predFile = 'http://bertha.ig.ft.com/view/publish/dsv/1LXtp1IGDrbFz47wf15IzQ8tQMQtN1s4GtuNWtDHiyyA/data.csv';
//const predFile = 'projection.csv';
const predFile = 'http://bertha.ig.ft.com/republish/publish/dsv/1LXtp1IGDrbFz47wf15IzQ8tQMQtN1s4GtuNWtDHiyyA/data.csv';
const dateFormat = '%Y-%m-%d';
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
    title: 'Opinions vary',
    subtitle: 'Sterling against US$ and selected predictions',
    source: 'Source: Bloomberg; companies',
};
const yMin = 1.2;// sets the minimum value on the yAxis
const yMax = 1.6;// sets the maximum value on the xAxis
const divisor = 1;// sets the formatting on linear axis for ’000s and millions
const yAxisHighlight = 0; // sets which tick to highlight on the yAxis
const numTicksy = 7;// Number of tick on the uAxis
const yAxisAlign = 'left';// alignment of the axis
const xAxisAlign = 'bottom';// alignment of the axis
const interval = 'years';// date interval on xAxis "century", "jubilee", "decade", "lustrum", "years", "months", "days", "hours"
const markers = true;// show dots on lines
const legend = false //turns the legend off or on
const legendAlign = 'vert';// hori or vert, alignment of the legend
const legendType = 'line';// rect, line or circ, geometry of legend marker
const minorAxis = true;// turns on or off the minor axis
const highlightNames = []; // create an array names you want to highlight eg. ['series1','series2']
const interpolation = d3.curveLinear;// curveStep, curveStepBefore, curveStepAfter, curveBasis, curveCardinal, curveCatmullRom
const invertScale = false; //inverst the y axis
const logScale = false;
const intraday = false;
const excludeSize = 2.8; //Number between 0 and 10, changes the fit of shading
const shading = false; //creates a best fit concave hull behind prediction data
const dotLinks = true; //puts dots on the prediction lines only
const ranges = true; //draw shaded range fans
const turnWidth = 6.5;


// Individual frame configuration, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
 .margin({ top: 100, left: 15, bottom: 82, right: 20 })
 // .title('Put headline here') // use this if you need to override the defaults
 // .subtitle("Put headline |here") //use this if you need to override the defaults
 .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 95,
        })
    // .title("Put headline here")
        .height(500),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 104, right: 100,
        })
    // .title("Put headline here")
        .height(700)
        .fullYear(true),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 100,
        })
    // .title("Put headline here")
        .height(500),

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
  .height(69.85), // std print (Use 58.21mm for markets charts that matter)

    social: gChartframe.socialFrame(sharedConfig)
        .margin({
            top: 140, left: 50, bottom: 138, right: 40,
        })
    // .title("Put headline here")
        .width(612)
        .height(612), // 700 is ideal height for Instagram

    video: gChartframe.videoFrame(sharedConfig)
        .margin({
            left: 207, right: 207, bottom: 210, top: 233,
        }),
    // .title("Put headline here")
};


// add the frames to the page...
d3.selectAll('.framed')
  .each(function addFrames() {
      const figure = d3.select(this);
      figure.select('svg')
          .call(frame[figure.node().dataset.frame]);
  });
parseData.load([dataFile, predFile,], { dateFormat, highlightNames })
.then(({
            data,
            vertices,
            seriesNames,
            plotData,
            highlightLines,
            valueExtent,
            highlights,
            dateExtent,
            annos,
            predictionsData,
            rangeData,
        }) => {
    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        // define other functions to be called
        const myYAxis = gAxis.yLinear();// sets up yAxis
        const myXAxis = gAxis.xDate();// sets up xAxis
        const myHighlights = lineChart.drawHighlights();// sets up highlight tonal bands
        const myAnnotations = annotation.annotations();// sets up annotations
        const myLegend = gLegend.legend();// sets up the legend
        const plotDim=currentFrame.dimension()//useful variable to carry the current frame dimensions
        const myArea = areaChart.draw();
        const tickSize = currentFrame.dimension().width; // Used when drawing the yAxis ticks
        const predictions = lineChart.draw()
          .seriesNames(seriesNames)
          .highlightNames(highlightNames)
          .markers(markers)
          .interpolation(interpolation)
          .lines(dotLinks);
        const myChart = lineChart.draw()
          .seriesNames(seriesNames)
          .highlightNames(highlightNames)
          .markers(false)
          .interpolation(interpolation);
        const myHighLines = lineChart.draw()
          .seriesNames(seriesNames)
          .highlightNames(highlightNames)
          .markers(markers)
          .interpolation(interpolation);

        const hullScale =  d3.scaleLinear()
            .range([0, currentFrame.dimension().width])
            .domain([0,10])
        const concaveHull = concaveHullGenerator().distance(hullScale(excludeSize));

        let colourDomain = seriesNames.map(d => d)
        colourDomain.unshift('other')
        const colourScale = d3.scaleOrdinal()
          .domain(colourDomain)
          .range(Object.values(gChartcolour.mutedFirstLineWeb));

        if (frameName === 'social' || frameName === 'video') {
          colourScale.range(Object.values(gChartcolour.mutedFirstLineSocial));
        }
        if (frameName === 'webS' || frameName === 'webM' || frameName === 'webMDefault' || frameName === 'webL') {
          colourScale.range(Object.values(gChartcolour.mutedFirstLineWeb));
        }
        if (frameName === 'print') {
          colourScale.range(Object.values(gChartcolour.mutedFirstLinePrint));
        }

        // create a 'g' element at the back of the chart to add time period
        // create a 'g' element behind the chart and in front of the highlights
        const axisHighlight = currentFrame.plot().append('g');
        myYAxis
            .divisor(divisor)
            .domain([Math.min(yMin, valueExtent[0]), Math.max(yMax, valueExtent[1])])
            .range([currentFrame.dimension().height, 0])
            .numTicks(numTicksy)
            .tickSize(tickSize)
            .yAxisHighlight(yAxisHighlight)
            .align(yAxisAlign)
            .frameName(frameName)
            .invert(invertScale)
            .tickFormat(d3.format('.3f'))
            .logScale(logScale);

        // Draw the yAxis first, this will position the yAxis correctly and
        // measure the width of the label text
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

        // axisHighlight.append("rect")
        //   .attr("width", currentFrame.dimension().width)
        //   .attr("height",currentFrame.dimension().height)
        //   .attr("fill","#ededee");

        let xDomain;
        if (intraday) {
            xDomain = data.map(d => d.date);
        } else { xDomain = dateExtent}

        // Set up xAxis for this frame
        myXAxis
            .domain(xDomain)
            .range([0, currentFrame.dimension().width])
            .align(xAxisAlign)
            .fullYear(false)
            .interval(interval)
            .tickSize(currentFrame.rem() * 0.75)
            .minorAxis(minorAxis)
            .minorTickSize(currentFrame.rem() * 0.3)
            .fullYear(false)
            .frameName(frameName)
            .intraday(intraday);

        // Draw the xAxis
        currentFrame.plot()
          .call(myXAxis);
        // console.log(myXAxis)

        if (xAxisAlign === 'bottom') {
            myXAxis.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
            if (minorAxis) {
                myXAxis.xLabelMinor().attr('transform', `translate(0,${currentFrame.dimension().height})`);
            }
        }
        if (xAxisAlign === 'top') {
            myXAxis.xLabel().attr('transform', `translate(0,${myXAxis.tickSize()})`);
        }
        // highlights after axis have been created
        const plotHull = currentFrame.plot().append('g')
        const plotArea = currentFrame.plot().append('g')
        const plotPredictions = currentFrame.plot().append('g')
        const series = currentFrame.plot().append('g')
        const plotAnnotation = currentFrame.plot().append('g').attr('class', 'annotations-holder'); 

        //draws the shaded bounding box for the data if sahading is true
        if(shading) {
            const hulls = concaveHull(vertices.map((d) => {
                return [myXAxis.scale()(d[0]),myYAxis.scale()(d[1])]
            }));
            let drawLine = d3.line().curve(d3.curveLinear);
            plotHull
                .selectAll('.hulls')
                .data(hulls)
                .enter()
                .append('path').classed('hull', true)
                .attr('fill', '#FCE6D6')
                .attr('d', d => { return drawLine(d); })
        }

        myArea
            .yScale(myYAxis.scale())
            .xScale(myXAxis.scale())
            .highlightNames(highlightNames)
            .interpolation(interpolation)
            .plotDim(currentFrame.dimension())
            .rem(currentFrame.rem())
            .colourPalette(colourScale);

        plotArea
            .selectAll('areas')
            .data(rangeData)
            .enter()
            .append('g')
            .attr('class', 'areas')
            .call(myArea);

        predictions
            .yScale(myYAxis.scale())
            .xScale(myXAxis.scale())
            .plotDim(currentFrame.dimension())
            .rem(currentFrame.rem())
            .colourPalette(colourScale);

        plotPredictions
            .selectAll('.lines')
            .data(predictionsData)
            .enter()
            .append('g')
            .attr('class', 'lines')
            .attr('id', d => d.name)
            .call(predictions);

        myChart
            .yScale(myYAxis.scale())
            .xScale(myXAxis.scale())
            .plotDim(currentFrame.dimension())
            .rem(currentFrame.rem())
            .colourPalette(colourScale)
            .lines(true);

        // Draw the lines
        series
            .selectAll('.lines')
            .data(plotData)
            .enter()
            .append('g')
            .attr('class', 'lines')
            .attr('id', d => d.name)
            .call(myChart);

        myHighLines
            .yScale(myYAxis.scale())
            .xScale(myXAxis.scale())
            .plotDim(currentFrame.dimension())
            .rem(currentFrame.rem())
            .colourPalette(colourScale);
        
        myHighlights
            .yScale(myYAxis.scale())
            .xScale(myXAxis.scale())
            .rem(currentFrame.rem())

        //Draw the highlights before the lines and xAxis
        axisHighlight
          .selectAll('.highlights')
          .data(highlights)
          .enter()
          .append('g')
          .attr('class', 'highlights')
          .call(myHighlights);

        //Set up highlights for this frame
        myAnnotations
          .xScale(myXAxis.scale())
          .yScale(myYAxis.scale())
          .frameName(frameName)
          .lineWidth(currentFrame.rem() * turnWidth)
          .plotDim([currentFrame.dimension().width,currentFrame.dimension().height])

        // Draw the annotations before the lines
        plotAnnotation
            .selectAll('.annotations')
            .data([annos])
            .enter()
            .append('g')
            .call(myAnnotations)

        // Set up legend for this frame
        if(legend) {
            myLegend
                .frameName(frameName)
                .seriesNames(colourDomain)
                .colourPalette(colourScale)
                .rem(myChart.rem())
                .geometry(legendType)
                .alignment(legendAlign);

            // Draw the Legend
            currentFrame.plot()
                .append('g')
                .attr('id', 'legend')
                .selectAll('.legend')
                .data(() => {
                    if (highlightNames.length > 0) {
                        return highlightNames;
                    }
                    return seriesNames;
                })
                .enter()
                .append('g')
                .classed('legend', true)
                .call(myLegend);

            const legendSelection = currentFrame.plot().select('#legend');
            legendSelection.attr('transform', `translate(0,${-currentFrame.rem()})`);

        }
        
    });
    // addSVGSavers('figure.saveable');
});
