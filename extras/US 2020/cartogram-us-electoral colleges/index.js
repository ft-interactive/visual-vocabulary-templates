/**
 * Bootstrapping code for line chart
 */

import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import gChartcolour from 'g-chartcolour';
import * as parseData from './parseData.js';
import * as cartogram from './drawChart.js';
import * as ss from 'simple-statistics';
import * as gLegend from './legend-threshold.js';

const dataFile = 'electoralColleage2020.csv';
const shapefile = 'USCarto.json';
const regionsfile = 'uk-regions.json';

const columnNames = ['2016']

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
    title: '2017 Vote share',
    subtitle: 'By constituency, selected parties',
    source: 'Source: Not yet added',
};
//Put the user defined variablesin delete where not applicable
const ftColorScale = 'sequentialSingle'


//Imput values into the domain of this scale to create manual scale breaks
let colorScale = d3.scaleThreshold()
  .domain([0.1, 0.2, 0.4, 0.5, 0.6,])
  .range(['#F3DEC8', '#CEBFAB', '#A9A18F', '#848273', '#5F6456', '#3A453A', '#3A453A']);


// Individual frame configuration, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
     .margin({ top: 100, left: 25, bottom: 82, right: 35 })
     // .title('Put headline here') // use this if you need to override the defaults
     // .subtitle("Put headline |here") //use this if you need to override the defaults
     .height(520)
     .extend('numberOfColumns', 1)
     .extend('numberOfRows', 2),

    webM: gChartframe.webFrameM(sharedConfig)
      .margin({
          top: 100, left: 20, bottom: 86, right: 5,
      })
  // .title("Put headline here")
      .height(420)
      .extend('numberOfColumns', 2)
      .extend('numberOfRows', 1),

    webL: gChartframe.webFrameL(sharedConfig)
      .margin({
          top: 100, left: 20, bottom: 104, right: 5,
      })
  // .title("Put headline here")
      .height(600)
      .fullYear(true)
      .extend('numberOfColumns', 2)
      .extend('numberOfRows', 1),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
      .margin({
          top: 100, left: 20, bottom: 86, right: 5,
      })
  // .title("Put headline here")
      .height(430)
      .extend('numberOfColumns', 2)
      .extend('numberOfRows', 1),

    print: gChartframe.printFrame(sharedConfig)
     .margin({ top: 30, left: 7, bottom: 35, right: 7 })
      // .title("Put headline here")
      //.width(53.71)// 1 col
      //.width(112.25)// 2 col
      .width(170.8)// 3 col
      // .width(229.34)// 4 col
      // .width(287.88)// 5 col
      // .width(346.43)// 6 col
      // .width(74)// markets std print
      .height(90)
      .extend('numberOfColumns', 2)
      .extend('numberOfRows', 1), // std print (Use 58.21mm for markets charts that matter)

    social: gChartframe.socialFrame(sharedConfig)
        .margin({
            top: 140, left: 50, bottom: 138, right: 40,
        })
    // .title("Put headline here")
        .width(612)
        .height(612)
        .extend('numberOfColumns', 3)
        .extend('numberOfRows', 1), // 700 is ideal height for Instagram

    video: gChartframe.videoFrame(sharedConfig)
        .margin({
            left: 207, right: 207, bottom: 210, top: 233,
        })
        .extend('numberOfColumns', 3)
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
parseData.load([dataFile, shapefile, regionsfile], { dateFormat, columnNames})
  .then(({ plotData, shapeData, regionData, valueExtent, jenksValues}) => {
      Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        const plotDim = [currentFrame.dimension().width,currentFrame.dimension().height]
        const mapWidth = plotDim[0] / currentFrame.numberOfColumns()-(currentFrame.rem() * 1.5)
        const mapDim = [mapWidth, (mapWidth * .72) + currentFrame.rem() * 2];
        const carto = cartogram.draw();
        const numberofBreaks = Object.values(gChartcolour[ftColorScale]).length;
        const myLegend = gLegend.drawLegend();

        carto
          .mapDim(mapDim)
          .shapeData(shapeData)
          .regionData(regionData)
          .valueExtent(valueExtent)
          .colourPalette(colorScale);

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
              const yPos = Number((Math.floor(i / currentFrame.numberOfColumns()) * mapDim[1] ));
              const xPos = i % currentFrame.numberOfColumns();
              return `translate(${(((mapDim[0] + (currentFrame.rem() * 1.5)) * xPos))}, ${yPos})`;
          });
        

      });
  });
