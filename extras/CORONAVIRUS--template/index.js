/**
 * Bootstrapping code for line chart
 */

import * as d3 from 'd3';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as columnChart from './smallMultiColumnTimeChart.js';

const dataFile = 'data.csv';

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
    title: 'Novel coronavirus outbreak',
    subtitle: 'As at 6:30am Feb 2 GMT',
    source: 'Source not yet added',
};

const yMinL = 0;// sets the minimum value on the yAxis
const yMaxL = 20000;// sets the maximum value on the xAxis
const yMinR = 0;// sets the minimum value on the yAxis
const yMaxR = 400;// sets the maximum value on the xAxis
const yAxisHighlight = 0; // sets which tick to highlight on the yAxis
const numTicksy = 5;// Number of tick on the uAxis
const yAxisAlign = 'right';// alignment of the axis
const xAxisAlign = 'bottom';// alignment of the axis
const interval = 'days';// date interval on xAxis "century", "jubilee", "decade", "lustrum", "years","months","days"
const endTicks = true;// show just first and last date on x-Axis
const fullYear = true; // show full years for dates on x-Axis
const dataDivisor = 1; // divides data values to more manageable numbers
const hideAxisLabels = false; // hide axis labels on middle columns of charts to avoid duplication
// const annotate = true; // show annotations, defined in the 'annotate' column
const minorAxis = false;// turns on or off the minor axis

// Individual frame configuration, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
 .margin({ top: 10, left: 0, bottom: 158, right: 5 })
 // .title('Put headline here') // use this if you need to override the defaults
 // .subtitle("Put headline |here") //use this if you need to override the defaults
  .source("* Pneumonia of unknown etiology|Sources: China National Health Commission, Chinese provincial|health authorities, Chinese state media, Johns Hopkins CSSE,|Alipay's city services, QQ news, international health authorities,|international centres for disease control, news agencies")
 .height(816)
 .extend('numberOfColumns', 1)
 .extend('numberOfRows', 2)
 .sourcePlotYOffset(68)
 .plotAdjuster(-20),
 
 webM: gChartframe.webFrameM(sharedConfig)
 .margin({ top: 10, left: 0, bottom: 90, right: 5 })
 // .title("Put headline here")
 .height(500)
 .source("* Pneumonia of unknown etiology|Sources: China National Health Commission, Chinese provincial health authorities, Chinese state media, Johns Hopkins CSSE,|Alipay's city services, QQ news, international health authorities, international centres for disease control, news agencies")
 .extend('numberOfColumns', 2)
 .extend('numberOfRows',1)
 .sourcePlotYOffset(12)
 .plotAdjuster(-20),
 
//     webL: gChartframe.webFrameL(sharedConfig)
//  .margin({ top: 10, left: 10, bottom: 80, right: 5 })
//  // .title("Put headline here")
//  .height(500)
//  .fullYear(true)
//  .extend('numberOfColumns', 11)
//  .extend('numberOfRows', 1),

//     webMDefault: gChartframe.webFrameMDefault(sharedConfig)
//  .margin({ top: 10, left: 10, bottom: 80, right: 5 })
//  // .title("Put headline here")
//  .height(800)
//  .extend('numberOfColumns', 4)
//  .extend('numberOfRows', 3),

//     print: gChartframe.printFrame(sharedConfig)
//  .margin({ top: 40, left: 7, bottom: 35, right: 7 })
//   // .title("Put headline here")
//   // .width(53.71)// 1 col
//   .width(112.25)// 2 col
//   // .width(170.8)// 3 col
//   // .width(229.34)// 4 col
//   // .width(287.88)// 5 col
//   // .width(346.43)// 6 col
//   // .width(74)// markets std print
//   .height(150)// markets std print
//   .extend('numberOfColumns', 3)
//   .extend('numberOfRows', 4),

 //    social: gChartframe.socialFrame(sharedConfig)
 // .margin({ top: 140, left: 50, bottom: 138, right: 40 })
 // // .title("Put headline here")
 // .width(612)
 // .height(612), // 700 is ideal height for Instagram

//     video: gChartframe.videoFrame(sharedConfig)
//  .margin({ left: 207, right: 207, bottom: 210, top: 233 })
//  // .title("Put headline here")
//      .extend('numberOfColumns', 6)
//      .extend('numberOfRows', 2),
};


// add the frames to the page...
d3.selectAll('.framed')
  .each(function addFrames() {
      const figure = d3.select(this);
      figure.select('svg')
          .call(frame[figure.node().dataset.frame]);
  });
parseData.load(dataFile, { dateFormat,  dataDivisor })
.then(({ seriesNames, columnNames, data, plotData, valueExtent }) => {
    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        // define other functions to be called
        const myYAxisL = gAxis.yLinear();// sets up yAxis
        const myYAxisR = gAxis.yLinear();// sets up yAxis
        const myXAxis0 = gAxis.xDate();// sets up date xAxis
        const myXAxis1 = gAxis.xOrdinal();// sets up date xAxis
        const xDomain = d3.extent(data, d => d.date); // sets up domain for xAxis
        // const myHighlights = columnChart.drawHighlights();// sets up highlight tonal bands
        // const myAnnotations = columnChart.drawAnnotations();// sets up annotations
        const myLegend = gLegend.legend(); /* sets up the legend */ // eslint-disable-line
        // const plotDim=currentFrame.dimension()//useful variable to carry the current frame dimensions

        // Create the plot widths, but for each individual graph
        const widthOfSmallCharts = ((currentFrame.dimension().width / currentFrame.numberOfColumns()) - currentFrame.rem());
        const heightOfSmallCharts = ((currentFrame.dimension().height / currentFrame.numberOfRows()) - (currentFrame.rem() * 2));

        const tickSize = widthOfSmallCharts;// Used when drawing the yAxis ticks

        // draw the chart holders
        const chart = currentFrame.plot()
        .selectAll('g')
        .data(plotData)
            .enter()
        .append('g')
        // .attr('id', d => d.name)
        .attr('class', d => d.name + ' columnHolder')
        .attr('xPosition', (d, i) => i % currentFrame.numberOfColumns())
        .attr('transform', (d, i) => {
          const yPos = Number((Math.floor(i / currentFrame.numberOfColumns()) * (heightOfSmallCharts + (currentFrame.rem() * 6.5))));
          const xPos = i % currentFrame.numberOfColumns();
          return `translate(${(((widthOfSmallCharts + currentFrame.rem()) * xPos) + currentFrame.rem())}, ${yPos})`;
        })
        

        
       
        // create a 'g' element at the back of the chart to add time period
        // highlights after axis have been created
        // const axisHighlight = chart.append('g');

        // create a 'g' element behind the chart and in front of the highlights
        // const plotAnnotation = chart.append('g').attr('class', 'annotations-holder');

        myYAxisL
          .domain([yMinL / dataDivisor,yMaxL / dataDivisor])
          .range([heightOfSmallCharts, 0])
          .numTicks(numTicksy)
          .tickSize(tickSize)
          .yAxisHighlight(yAxisHighlight)
          .align(yAxisAlign)
          .frameName(frameName);
        
        myYAxisR
          .domain([yMinR / dataDivisor,yMaxR / dataDivisor])
          .range([heightOfSmallCharts, 0])
          .numTicks(numTicksy)
          .tickSize(tickSize)
          .yAxisHighlight(yAxisHighlight)
          .align(yAxisAlign)
          .frameName(frameName);

        // Draw the yAxis first, this will position the yAxis correctly and
        // measure the width of the label text

        // console.log(chart.node())
        d3.selectAll('.cases')
          .call(myYAxisL);
        d3.selectAll('.deaths')
          .call(myYAxisR);

        // return the value in the variable newMargin
        if (yAxisAlign === 'right') {
            const newMargin = myYAxisL.labelWidth() + currentFrame.margin().right;
            // Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({ right: newMargin });
            // yAxis.yLabel().attr('transform', `translate(${currentFrame.dimension().width},0)`);
        }
        if (yAxisAlign === 'left') {
            const newMargin = myYAxisL.labelWidth() + currentFrame.margin().left;
            // Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({ left: newMargin });
            myYAxisL.yLabel().attr('transform', `translate(${(myYAxisL.tickSize() - myYAxisL.labelWidth())},0)`);
        }
        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        // Set up xAxis for this frame
        myXAxis0
          .domain(xDomain)
          .range([0, widthOfSmallCharts - myYAxisL.labelWidth()])
          .align(xAxisAlign)
          .interval(interval)
          .fullYear(fullYear)
          // .endTicks(endTicks)
          .tickSize(currentFrame.rem() * 0.75)
          .minorAxis(minorAxis)
          .minorTickSize(currentFrame.rem() * 0.3)
          .frameName(frameName);

        myXAxis1
        .align(xAxisAlign)
        .domain(columnNames)
        .rangeRound([0, widthOfSmallCharts - myYAxisL.labelWidth()])
        .frameName(frameName)
        .paddingInner(0.2);

        const bandWidth = myXAxis1.bandwidth();

        myXAxis0
            .range([bandWidth, ((widthOfSmallCharts - myYAxisL.labelWidth()) - (bandWidth))]);

        // Draw the xAxis
        chart
            .call(myXAxis0);

        if (hideAxisLabels) {
            chart
                .each(function hideLabels() {
                    const xPosAttr = Number(d3.select(this).attr('xPosition'));

                    if (xPosAttr > 0 && xPosAttr < (currentFrame.numberOfColumns() - 1)) {
                        d3.select(this).selectAll('.xAxis .tick text').style('visibility', 'hidden');
                        d3.select(this).selectAll('.yAxis .tick text').style('visibility', 'hidden');
                    }
                });
        }

        if (xAxisAlign === 'bottom') {
            myXAxis0.xLabel().attr('transform', `translate(0, ${heightOfSmallCharts})`);
            if (minorAxis) {
                myXAxis0.xLabelMinor().attr('transform', `translate(0, ${heightOfSmallCharts})`);
            }
        }
        if (xAxisAlign === 'top') {
            myXAxis0.xLabel().attr('transform', `translate(0, ${myXAxis0.tickSize()})`);
        }

        const myChartL = columnChart.draw()
          .seriesNames(seriesNames)
          // .annotate(annotate);
        const myChartR = columnChart.draw()
          .seriesNames(seriesNames)
          // .annotate(annotate);
          
        myChartL
          .yScale(myYAxisL.scale())
          .xScale0(myXAxis0.scale())
          .xScale1(myXAxis1.scale())
          .plotDim(currentFrame.dimension())
          .rem(currentFrame.rem())
          .colourPalette((frameName))
          .valueExtent((valueExtent));
        
          myChartR
          .yScale(myYAxisR.scale())
          .xScale0(myXAxis0.scale())
          .xScale1(myXAxis1.scale())
          .plotDim(currentFrame.dimension())
          .rem(currentFrame.rem())
          .colourPalette((frameName))
          .valueExtent((valueExtent));

         
        // //Draw the lines
        d3.selectAll('.cases')
          .call(myChartL);
          d3.selectAll('.deaths')
          .call(myChartR);

          

        // Set up highlights for this frame
        // myHighlights
        //   .yScale(myYAxisL.scale())
        //   .xScale0(myXAxis0.scale())
        //   .xScale1(myXAxis1.scale());

        // // Draw the highlights before the lines and xAxis
        // axisHighlight
        //   .selectAll('.highlights')
        //   .data(highlights)
        //   .enter()
        //   .append('g')
        //   .call(myHighlights);

        // // Set up highlights for this frame
        // myAnnotations
        //   .yScale(myYAxisL.scale())
        //   .xScale0(myXAxis0.scale())
        //   .rem(currentFrame.rem());

        // // Draw the annotations before the lines
        // plotAnnotation
        //   .selectAll('.annotation')
        //   .data(annos)
        //   .enter()
        //   .append('g')
        //   .call(myAnnotations);
    });
    // addSVGSavers('figure.saveable');
    d3.selection.prototype.last = function() {
      let last = this.size() - 1;
      return d3.select(this.nodes()[this.size() - 3]);
    };
    d3.selection.prototype.lastb = function() {
      let last = this.size() - 1;
      return d3.select(this.nodes()[this.size() - 5]);
    };

    let killAxis = d3.selectAll(".yAxis");
    
    killAxis.last()
      .style('visibility', 'hidden')
    killAxis.lastb()
      .style('visibility', 'hidden')
});


