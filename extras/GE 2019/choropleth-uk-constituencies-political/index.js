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



const yMin = 0
const yMax = 150
const dataFile = 'general-constituencies.csv';
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
const showNumberLabels = false;// show numbers on end of bars
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
    title: 'Results summary',
    subtitle: '',
    source: 'Source: Not yet added',
};
//Defines the scale from the g-chartcolour library when using the jenks calculation
const ftColorScale = 'sequentialSingle'

//Imput values into the domain of this scale to create manual scale breaks
// const colorScale = d3.scaleOrdinal()
//   .domain(Object.keys(gChartcolour.ukPoliticalParties))
//   .range(Object.values(gChartcolour.ukPoliticalParties));

const colorScale = d3.scaleOrdinal()
  .domain(['UUIP', 'UKIP', 'SNP', 'Sin Fein', 'SDLP', 'Plaid Cymru', 'Liberal Democrats', 'Labour', 'Independent/Other', 'Green', 'DUP', 'Conservative', 'Brexit','Independent Group for Change', 'Alliance'])
  .range(['#195EF7', '#7F00D9', '#FFF8AB', '#50BF77', '#007D51', '#B30000', '#FFAD36', '#FF634D', '#E0D9D5', '#80FF96', '#4228B0', '#0095E8', '#00BFBC', '#FCBDC7', '#FACD5D']);


// Individual frame configuration, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
     .margin({ top: 100, left: 15, bottom: 25, right: 15 })
     // .title('Put headline here') // use this if you need to override the defaults
     // .subtitle("Put headline |here") //use this if you need to override the defaults
     .height(450)
     .extend('numberOfColumns', 1)
     .extend('numberOfRows', 1),

    webM: gChartframe.webFrameM(sharedConfig)
      .margin({
          top: 100, left: 40, bottom: 86, right: 15,
      })
  // .title("Put headline here")
      .height(850)
      .extend('numberOfColumns', 1)
      .extend('numberOfRows', 1),

    webL: gChartframe.webFrameL(sharedConfig)
      .margin({
          top: 100, left: 20, bottom: 104, right: 15,
      })
  // .title("Put headline here")
      .height(1400)
      .fullYear(true)
      .extend('numberOfColumns', 1)
      .extend('numberOfRows', 1),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
      .margin({
          top: 100, left: 20, bottom: 86, right: 15,
      })
  // .title("Put headline here")
      .height(880)
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
      .height(100)
      .extend('numberOfColumns', 1)
      .extend('numberOfRows', 1), // std print (Use 58.21mm for markets charts that matter)

    social: gChartframe.socialFrame(sharedConfig)
        .margin({
            top: 140, left: 50, bottom: 138, right: 40,
        })
    // .title("Put headline here")
        .width(612)
        .height(950)
        .extend('numberOfColumns', 1)
        .extend('numberOfRows', 1) // 700 is ideal height for Instagram
        .titleX(50)
        .titleY(90), 

    video: gChartframe.videoFrame(sharedConfig)
        .margin({
            left: 207, right: 207, bottom: 210, top: 233,
        })
        .extend('numberOfColumns', 1)
        .extend('numberOfRows', 1),
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
  .then(({ barsSeriesName, valueExtent, plotData, shapeData, barsData,}) => {
      Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        const plotDim = [currentFrame.dimension().width,currentFrame.dimension().height]
        const mapWidth = plotDim[0] / currentFrame.numberOfColumns()-(currentFrame.rem() * 1.5)
        const mapDim = [mapWidth, (mapWidth * 1.07) + currentFrame.rem() * 2];
        const carto = cartogram.draw();
        const myLegend = gLegend.legend();
        const barsDim = [plotDim[0], (plotDim[1]/4)]
        const tickSize = currentFrame.dimension().width;// Used when drawing the yAxis ticks


        console.log(barsData)

        const myXAxis0 = gAxis.xOrdinal();// sets up yAxis
        const myXAxis1 = gAxis.xOrdinal();// sets up yAxis
        const myYAxis = gAxis.yLinear();
        const myChart = columnGroupedChart.draw(); // eslint-disable-line no-unused-vars

        myYAxis
          .range([barsDim[1], 0])
          .domain([Math.min(yMin, valueExtent[0]), Math.max(yMax, valueExtent[1])])
          .numTicks(numTicksy)
          .tickSize(tickSize)
          .yAxisHighlight(yAxisHighlight)
          .align(yAxisAlign)
          .logScale(logScale)
          .frameName(frameName)
          .divisor(divisor);
        
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
        
        myXAxis0
          .tickSize(0)
          .align(xAxisAlign)
          .domain(barsData.map(d => d.partyName))
          .rangeRound([0, currentFrame.dimension().width], 10)
          .frameName(frameName);
        
        myXAxis1
          .align(xAxisAlign)
          .domain(barsSeriesName)
          .rangeRound([0, myXAxis0.bandwidth()]);
        
        myChart
          .xScale0(myXAxis0.scale())
          .xScale1(myXAxis1.scale())
          .yScale(myYAxis.scale())
          .plotDim([currentFrame.dimension().width,barsDim[1]])
          .rem(currentFrame.rem())
          .colourPalette(colorScale)
          .logScale(logScale)
          .showNumberLabels(showNumberLabels);
        
        currentFrame.plot()
          .call(myXAxis0);
        
        if (xAxisAlign === 'bottom') {
          myXAxis0.xLabel().attr('transform', `translate(0,${barsDim[1]})`);
        }
        if (xAxisAlign === 'top') {
          myXAxis0.xLabel().attr('transform', `translate(0,${myXAxis0.tickSize()})`);
        }

        currentFrame.plot()
          .selectAll('.columnHolder')
          .data(barsData)
          .enter()
          .append('g')
          .attr('class', 'columnHolder')
          .call(myChart);
        




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
          .attr('transform', (d, i) => {
            const yPos = Number((Math.floor(i / currentFrame.numberOfColumns()) * mapDim[1] + barsDim[1] + currentFrame.rem()));
              const xPos = i % currentFrame.numberOfColumns();
              return `translate(${(((mapDim[0] + (currentFrame.rem() * 1.5)) * xPos))}, ${yPos})`;
          });
        
        myLegend
          .seriesNames(legColours)
          .geometry(legendType)
          .frameName(frameName)
          .rem(currentFrame.rem())
          .alignment(legendAlign)
          .colourPalette(colorScale);

        // Draw the Legend
        currentFrame.plot()
          .append('g')
          .attr('id', 'legend')
          .selectAll('.legend')
          .data(legColours)
          .enter()
          .append('g')
          .classed('legend', true)
          .call(myLegend);
        

      });
  });
