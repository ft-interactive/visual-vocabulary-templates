/**
 * Bootstrapping code for lollipop chart
 */

import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as lollipopChart from './lollipopChart.js';
import * as gLegend from 'g-legend';


const dataURL = 'data.csv';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};
const xMin = -30;// sets the minimum value on the yAxis
const xMax = 10;// sets the maximum value on the yAxis

// display options
const scaleFactor = 3;// 0 = no display, 0.5 = half the width of the column, 1 = full width
const stalkWidth = .3;// 0 = no display 0.5 = half the width of the column, 1 = full width
const colorproperty = 'pos/neg' //colour chart by this column heading

let xAxisHighlight;// = 20; //sets which tick to highlight on the yAxis
const numTicks = 4;// Number of tick on the uAxis
const opacity = .5
const yAxisAlign = 'left';// alignment of the y axis
const xAxisAlign = 'bottom';
const logScale = false;
const divisor = 1;// sets the formatting on linear axis for ’000s and millions
const sort = 'descending';// specify 'ascending', 'descending'
const sortOn = 0;// refers to the column in the dataset (or index in seriesNames) that the sort is performed on to sort on (ignores name column)
const banding = true;
const legendType = 'circ'; // rect, line or circ, geometry of legend marker
const legendAlign = 'hori';
const legendHeading = 'total state tax collection'

// const legendAlign = 'vert';// hori or vert, alignment of the legend

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
   .margin({ top: 100, left: 15, bottom: 82, right: 24 })
   // .title("Put headline here") //use this if you need to override the defaults
   // .subtitle("Put headline |here") //use this if you need to override the defaults
   .height(850),

    webM: gChartframe.webFrameM(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 86, right: 24 })
   // .title("Put headline here")
   .height(900),

    // webMDefault: gChartframe.webFrameMDefault(sharedConfig)
    // .margin({ top: 100, left: 20, bottom: 86, right: 5 })
    // // .title("Put headline here")
    // .height(500),

    webL: gChartframe.webFrameL(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 104, right: 25 })
   // .title("Put headline here")
   .height(900),

    print: gChartframe.printFrame(sharedConfig)
    .margin({ top: 40, left: 7, bottom: 35, right: 7 })
    // .title("Put headline here")
    //.width(53.71)// 1 col
    .width(112.25)// 2 col
    // .width(170.8)// 3 col
    // .width(229.34)// 4 col
    // .width(287.88)// 5 col
    // .width(346.43)// 6 col
    // .width(74)// markets std print
    .height(200), // std print (Use 58.21mm for markets charts that matter)

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
        figure.select('svg').call(frame[figure.node().dataset.frame]);
    });

parseData.load(dataURL, {sort, sortOn, colorproperty})
.then(({groupNames, seriesNames, valueExtent, circleExtent, colorDomain, plotData, data }) => {
  
    // draw, for each frame
    Object.keys(frame).forEach((frameName) => {
      const currentFrame = frame[frameName];
      const tickSize = currentFrame.dimension().height;// Used when drawing the yAxis ticks
      const rem = currentFrame.rem()
      const countCategories = plotData.length;
      // set up axes
      const yAxis0 = gAxis.yOrdinal();
      const yAxis1 = gAxis.yOrdinal();
      const xAxis = gAxis.xLinear();
      const myChart = lollipopChart.draw();
      const myLegend = gLegend.legend();
      
      yAxis0.plotDim([currentFrame.dimension().width,currentFrame.dimension().height])
        .banding(banding)
        .align(yAxisAlign)
        .domain(seriesNames.map(d => d))
        .rangeRound([0, tickSize], 10)
        .frameName(frameName);
      
      yAxis1
        .paddingInner(0.06)
        .align(yAxisAlign)
        .domain(groupNames)
        .rangeRound([0, yAxis0.bandwidth()]);
    
      // call axes
      currentFrame.plot()
        .call(yAxis0);
    
      xAxis
        .tickSize(tickSize)
        .align(xAxisAlign)
        .domain([Math.min(xMin, valueExtent[0]), Math.max(xMax, valueExtent[1])])
        .numTicks(numTicks)
        .xAxisHighlight(xAxisHighlight)
        .frameName(frameName)
        .logScale(logScale)
        .divisor(divisor);
      
      const maxCircle = (yAxis0.bandwidth()) * scaleFactor;
      // set radius scale
      const sqrtScale = d3.scaleSqrt()
        .domain([0,circleExtent[1]])
        .range([0,maxCircle]);
        
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
        
      xAxis
        .range([0, currentFrame.dimension().width])
      
      currentFrame.plot()
        .call(xAxis);

      if (xAxisAlign === 'top') {
        xAxis.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
      }
      d3.select(currentFrame.plot().node().parentNode)
        .call(currentFrame);
      
      myChart
        // .paddingInner(0.06)
        .colourPalette((frameName))
        .seriesNames(seriesNames)
        .yScale0(yAxis0.scale())
        .yScale1(yAxis1.scale())
        .xScale(xAxis.scale())
        .circleScale(sqrtScale)
        .stalkWidth(stalkWidth)
        .opacity(opacity)
        .colorproperty(colorproperty)
        .rem(currentFrame.rem())
      
      currentFrame.plot()
        .selectAll('.lollyHolder')
        .data(plotData)
        .enter()
        .append('g')
        .attr('class', 'lollyHolder')
        .call(myChart);
      
         // Set up legend for this frame
        myLegend
            .seriesNames(colorDomain)
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
                .data(colorDomain)
                .enter()
                .append('g')
                .classed('legend', true)
            .call(myLegend);
        
        const cyOffset = (sqrtScale(circleExtent[1])) - sqrtScale(circleExtent[0])  
        const magLegend = currentFrame.plot()
            .append('g')
            .classed('legend', true)
        
        magLegend.append('text')
          .attr('x', 20)
          .attr('y', 100)
          .text('Circle size indicates ' + legendHeading)
        
        magLegend.append('text')
          .attr('x', 20 + (sqrtScale(circleExtent[1]) * 2))
          .attr('y', 120)
          .text(circleExtent[1])
        
          magLegend.append('text')
            .attr('x', 20 + (sqrtScale(circleExtent[1]) * 2))
            .attr('y', 120 + (sqrtScale(circleExtent[1]) * 2) - (sqrtScale(circleExtent[0]) * 2))
            .text(circleExtent[0])

        magLegend.append('circle')
            .attr('cx', 20 + (sqrtScale(circleExtent[1])))
            .attr('cy',120 + (sqrtScale(circleExtent[1]) / 2) + (rem))
            .attr('r', sqrtScale(circleExtent[1]))
            .attr('stroke-width', 1)
            .attr('stroke', '#000000')
            .attr('fill', 'none')
          
      magLegend.append('circle')
          .attr('cx', 20 + sqrtScale(circleExtent[1]))
          .attr('cy',120 + (sqrtScale(circleExtent[1]) / 2) + (rem) + cyOffset)
          .attr('r', sqrtScale(circleExtent[0]))
          .attr('stroke-width', 1)
          .attr('stroke', '#000000')
          .attr('fill', 'none')


        
    });
    // addSVGSavers('figure.saveable');
});
