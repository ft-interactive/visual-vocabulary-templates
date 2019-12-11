/**
 * Bootstrapping code for line chart
 */

import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import * as gAxis from 'g-axis';
import gChartcolour from 'g-chartcolour';
import * as parseData from './parseData.js';
import * as cartogram from './drawChart.js';
import * as ss from 'simple-statistics';
import * as gLegend from 'g-legend';
import * as columnGroupedChart from './columnGroupedChart.js';

const classes = [
  '.annotation',
  '.lines',
  '.highlights',
  '.axis path',
  '.axis text',
  '.axis line',
  '.axis',
  '.baseline',
  '.baseline line',
  '.legend',
  '.legend text',
  '.chart-goalposts',
  '.chart-title',
  '.chart-subtitle',
  '.chart-source',
  '.chart-copyright',
  '.chart-watermark',
  '.annotations-holder',
  '.lines highlighlines',
  '.highlights',
  '.annotation',
  '.annotations-holder line',
  '.annotations-holder text',
  '.line path',
  '.highlights rects',
];

//var myVar = setInterval(myTimer, 60000);

function myTimer() {
  console.log('reloading page')
  const exportFrame = document.getElementsByClassName("ft-socialgraphic")[0];
  exportFrame.addEventListener("load", savePNG(exportFrame,2));
  location.reload();
}


const yMin = 0
const yMax = 350
const dataFile = 'empty.csv';
// const dataFile = 'https://ft-ig-content-prod.s3-eu-west-1.amazonaws.com/v2/Financial-Times/ig-pa-election-backend/test-2019-12-05-general-full/latest/general-constituencies.csv';
const shapefile = 'choropleth.json';
const scaleType = 'political' //linear, jenks or manual sets the type of colour scale
const legendAlign = 'vert'; // hori or vert, alignment of the legend
const legendType = 'rect'; // rect, line or circ, geometry of legend marker
const columnNames = ['constituencyPartyWinning']
const numOfBars = 5;
const divisor = 1// formatting for '000 and millions
const yAxisHighlight = 10; // sets which tick to highlight on the yAxis
const numTicksy = 5;// Number of tick on the uAxis
const yAxisAlign = 'right';// alignment of the axis
const xAxisAlign = 'bottom';// alignment of the axis
const logScale = false
const showNumberLabels = true;// show numbers on end of bars
const dateFormat = '%m/%d %H:%M';
let formatDate = d3.timeFormat("%-I:%M%p");
  let date = formatDate(new Date())
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

function savePNG(svg, scaleFactor) {
  let frame = d3.select(svg)
  console.log(svg)
  frame.selectAll(classes.join(', ')).each(function inlineProps() {
    const element = this;
    const computedStyle = getComputedStyle(element, null);

    // loop through and compute inline svg styles
    for (let i = 0; i < computedStyle.length; i += 1) {
      const property = computedStyle.item(i);
      const value = computedStyle.getPropertyValue(property);
      element.style[property] = value;
    }
  });
  let formatDate = d3.timeFormat("%m%d-%H:%M:%S");
  let date = formatDate(new Date())
  console.log(date)

  saveSvgAsPng(frame.node(), date);
}

const sharedConfig = {
    title: 'How the election night unfolded',
    subtitle: 'Number of seats won',
    source: 'Source: PA',
};
//Defines the scale from the g-chartcolour library when using the jenks calculation
const ftColorScale = 'sequentialSingle'

//Imput values into the domain of this scale to create manual scale breaks
// const colorScale = d3.scaleOrdinal()
//   .domain(Object.keys(gChartcolour.ukPoliticalParties))
//   .range(Object.values(gChartcolour.ukPoliticalParties));

const colorScale = d3.scaleOrdinal()
  .domain(['UUP','UKIP', 'SNP', 'Sinn Féin', 'SDLP', 'PC', 'Lib Dem', 'Lab', 'Independent/Other', 'Green', 'DUP', 'Con', 'Brexit','Independent Group for Change', 'Alliance', 'The Speaker'])
  .range(['#195EF7', '#7F00D9', '#FFF8AB', '#50BF77', '#007D51', '#B30000', '#FFAD36', '#FF634D', '#E0D9D5', '#80FF96', '#4B28B0', '#0095E8', '#00BFBC', '#FCBDC7', '#FACD5D', '#ffffff']);

// Individual frame configuration, used to set margins (defaults shown below) etc
const frame = {
  /*webS: gChartframe.webFrameS(sharedConfig)
    .margin({ top: 100, left: 15, bottom: 25, right: 15 })
    // .title('Put headline here') // use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
    .height(500)
    .extend('numberOfColumns', 1)
    .extend('numberOfRows', 1),

  webM: gChartframe.webFrameM(sharedConfig)
    .margin({
        top: 100, left: 40, bottom: 86, right: 15,
    })
  // .title("Put headline here")
    .height(1050)
    .extend('numberOfColumns', 1)
    .extend('numberOfRows', 1),

  webL: gChartframe.webFrameL(sharedConfig)
    .margin({
        top: 100, left: 20, bottom: 104, right: 15,
    })
  // .title("Put headline here")
    .height(1800)
    .fullYear(true)
    .extend('numberOfColumns', 1)
    .extend('numberOfRows', 1),

  webMDefault: gChartframe.webFrameMDefault(sharedConfig)
    .margin({
        top: 100, left: 20, bottom: 86, right: 15,
    })
  // .title("Put headline here")
    .height(1080)
    .extend('numberOfColumns', 1)
    .extend('numberOfRows', 1),

  print: gChartframe.printFrame(sharedConfig)
    .margin({ top: 30, left: 7, bottom: 35, right: 7 })
    // .title("Put headline here")
    //.width(53.71)// 1 col
    .width(112.25)// 2 col
    //.width(170.8)// 3 col
    // .width(229.34)// 4 col
    // .width(287.88)// 5 col
    // .width(346.43)// 6 col
    // .width(74)// markets std print
    .height(170)
    .extend('numberOfColumns', 1)
    .extend('numberOfRows', 1), // std print (Use 58.21mm for markets charts that matter)
*/
    social: gChartframe.socialFrame(sharedConfig)
        .margin({
            top: 140, left: 40, bottom: 138, right: 10,
        })
    // .title("Put headline here")
        .width(612)
        .height(950)
        .extend('numberOfColumns', 1)
        .extend('numberOfRows', 1) // 700 is ideal height for Instagram
        .titleX(40)
        .titleY(80)
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
parseData.load([dataFile, shapefile,], { dateFormat, columnNames, numOfBars})
  .then(({ barsSeriesName, valueExtent, plotData, shapeData, barsData, totalCount}) => {
      Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        const plotDim = [currentFrame.dimension().width,currentFrame.dimension().height]
        const mapWidth = plotDim[0] / currentFrame.numberOfColumns()-(currentFrame.rem() * 1.5)
        const mapDim = [mapWidth, (mapWidth * 0.95) + currentFrame.rem() * 2];
        const carto = cartogram.draw();
        const myLegend = gLegend.legend();
        const barsDim = [plotDim[0], (plotDim[1]/4.5)]
        const tickSize = currentFrame.dimension().width;// Used when drawing the yAxis ticks

        const myXAxis = gAxis.xOrdinal();// sets up yAxis
        const myXAxis1 = gAxis.xOrdinal();// sets up yAxis
        const myYAxis = gAxis.yLinear();
        const myChart = columnGroupedChart.draw(); // eslint-disable-line no-unused-vars
        const chart = currentFrame.plot().append('g')

        myYAxis
          .range([barsDim[1], 0])
          .domain([yMin, yMax])
          .numTicks(numTicksy)
          .tickSize(tickSize)
          .yAxisHighlight(yAxisHighlight)
          .align(yAxisAlign)
          .logScale(logScale)
          .frameName(frameName)
          .divisor(divisor);
        
        chart
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
        
        myXAxis
          .tickSize(4)
          .align(xAxisAlign)
          .domain(barsSeriesName)
          .rangeRound([0, currentFrame.dimension().width], 10)
          .frameName(frameName);
        
        
        myChart
          .xScale0(myXAxis.scale())
          .yScale(myYAxis.scale())
          .plotDim([currentFrame.dimension().width,barsDim[1]])
          .rem(currentFrame.rem())
          .colourPalette(colorScale)
          .logScale(logScale)
          .showNumberLabels(showNumberLabels);
        
        chart
          .call(myXAxis);
        
        if (xAxisAlign === 'bottom') {
          myXAxis.xLabel().attr('transform', `translate(0,${barsDim[1]})`);
        }
        if (xAxisAlign === 'top') {
          myXAxis.xLabel().attr('transform', `translate(0,${myXAxis.tickSize()})`);
        }

        chart
          .selectAll('.columnHolder')
          .data(barsData)
          .enter()
          .append('g')
          .attr('class', 'columnHolder')
          .call(myChart);

        chart
          .append('g')
          .append('text')
          .attr('class', 'date')
          .style('text-anchor', 'end')
          .text(totalCount + ' of 650 seats declared, ' + date + ", local time")
          .attr('transform', (d, i) => {
            const yPos = Number((Math.floor(i / currentFrame.numberOfColumns()) * mapDim[1] + barsDim[1] + currentFrame.rem()*3.4));
              const xPos = myYAxis.tickSize();
              return `translate(${(mapDim[0]) + 4}, ${yPos})`;
          });

       
        carto
          .mapDim(mapDim)
          .shapeData(shapeData)
          .valueExtent(valueExtent)
          .colourPalette(colorScale);
        
        const legColours = colorScale.domain()

        const map = currentFrame.plot()
          .selectAll('.cartoHolder')
          .data(plotData)
          .enter()
          .append('g')
          .attr('class', 'cartoHolder')
          .attr("preserveAspectRatio", "xMinYMin")
          .call(carto);
        
        map
        .append('g')
        .append('text')
        .attr('class', 'london-label')
        .text('London')
        .attr ('transform', 'translate(282,146)')
        
        map
        .append('g')
        .append('text')
        .attr('class', 'london-label')
        .text('Orkney & Shetland')
        .attr ('transform', 'translate(306, 66)')


        chart
          .attr('transform', (d, i) => {
            const yPos = currentFrame.rem() * -1;
            const xPos = 0;
            return `translate(${(((mapDim[0] + (currentFrame.rem() * 1.5)) * xPos))}, ${yPos})`;
          });
        
        map
          .attr('transform', (d, i) => {
            const yPos = Number((Math.floor(i / currentFrame.numberOfColumns()) * mapDim[1] + barsDim[1] + currentFrame.rem()*1.89));
              const xPos = i % currentFrame.numberOfColumns();
              return `translate(${(((mapDim[0] + (currentFrame.rem() * 5)) * xPos)+25)}, ${yPos + 36})`;
          });
        
        // remove ticks if numbers are added to vars
        if (showNumberLabels) {
          const clearY = myYAxis.yLabel().selectAll('.tick').filter(d => d !== 0);
          const clearX = myXAxis.xLabel().selectAll('.tick line')
          clearY.remove();
          clearX.remove();
      }
        
        // myLegend
        //   .seriesNames(legColours)
        //   .geometry(legendType)
        //   .frameName(frameName)
        //   .rem(currentFrame.rem())
        //   .alignment(legendAlign)
        //   .colourPalette(colorScale);

        // // Draw the Legend
        // currentFrame.plot()
        //   .append('g')
        //   .attr('id', 'legend')
        //   .selectAll('.legend')
        //   .data(legColours)
        //   .enter()
        //   .append('g')
        //   .classed('legend', true)
        //   .call(myLegend);
        

      });
  });
