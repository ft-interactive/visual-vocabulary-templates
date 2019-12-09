/**
 * Bootstrapping code for line chart
 */

import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import gChartcolour from 'g-chartcolour';
import * as parseData from './parseData.js';
import * as cartogram from './drawChart.js';
import * as ss from 'simple-statistics';
import * as gLegend from 'g-legend';



const dataFile = 'general-constituencies.csv';
const shapefile = 'choropleth.json';
const regionsfile = 'uk-regions.json';
const scaleType = 'political' //linear, jenks or manual sets the type of colour scale
const legendAlign = 'vert'; // hori or vert, alignment of the legend
const legendType = 'rect'; // rect, line or circ, geometry of legend marker
const columnNames = ['constituencyPartyWinning']
const colours = 'web'
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
    subtitle: 'By constituency',
    source: 'Source: Not yet added',
};
let colorScale;

if (colours === 'web') {
  colorScale = d3.scaleOrdinal()
    .domain(['UUP', 'UKIP', 'SNP', 'Sinn Féin', 'SDLP', 'Plaid Cymru', 'Liberal Democrats', 'Labour', 'Independent/Other', 'Green', 'DUP', 'Conservative', 'Brexit', 'Independent Group for Change', 'Alliance', 'The Speaker'])
    .range(['#3f67cc', '#7200ab', '#FFF8AB', '#006643', '#5ba373', '#990000', '#f09000', '#cf4d3c', '#d9cace', '#8deb9d', '#210066', '#149adb', '#80cfd6', '#fc8b9d', '#ffbe18', '#ffffff']);
}
else {
  colorScale = d3.scaleOrdinal()
    .domain(['UUP', 'UKIP', 'SNP', 'Sinn Féin', 'SDLP', 'Plaid Cymru', 'Liberal Democrats', 'Labour', 'Independent/Other', 'Green', 'DUP', 'Conservative', 'Brexit', 'Independent Group for Change', 'Alliance', 'The Speaker'])
    .range(['#195EF7', '#7F00D9', '#FFF8AB', '#50BF77', '#007D51', '#B30000', '#FFAD36', '#FF634D', '#E0D9D5', '#80FF96', '#4B28B0', '#0095E8', '#00BFBC', '#FCBDC7', '#FACD5D', '#ffffff']);
}

// Individual frame configuration, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
     .margin({ top: 100, left: 15, bottom: 25, right: 5 })
     // .title('Put headline here') // use this if you need to override the defaults
     // .subtitle("Put headline |here") //use this if you need to override the defaults
     .height(450)
     .extend('numberOfColumns', 1)
     .extend('numberOfRows', 1),

    webM: gChartframe.webFrameM(sharedConfig)
      .margin({
          top: 100, left: 40, bottom: 86, right: 5,
      })
  // .title("Put headline here")
      .height(850)
      .extend('numberOfColumns', 1)
      .extend('numberOfRows', 1),

    webL: gChartframe.webFrameL(sharedConfig)
      .margin({
          top: 100, left: 20, bottom: 104, right: 5,
      })
  // .title("Put headline here")
      .height(1400)
      .fullYear(true)
      .extend('numberOfColumns', 1)
      .extend('numberOfRows', 1),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
      .margin({
          top: 100, left: 20, bottom: 86, right: 5,
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
        .height(612)
        .extend('numberOfColumns', 1)
        .extend('numberOfRows', 1), // 700 is ideal height for Instagram

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
parseData.load([dataFile, shapefile, regionsfile], { dateFormat, columnNames})
  .then(({ plotData, shapeData, regionData, valueExtent, jenksValues}) => {
      Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        const plotDim = [currentFrame.dimension().width,currentFrame.dimension().height]
        const mapWidth = plotDim[0] / currentFrame.numberOfColumns()-(currentFrame.rem() * 1.5)
        const mapDim = [mapWidth, (mapWidth * 1.07) + currentFrame.rem() * 2];
        const carto = cartogram.draw();
        const myLegend = gLegend.legend();
        
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
        
        myLegend
          .seriesNames(colorScale.domain())
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
          .data(colorScale.domain())
          .enter()
          .append('g')
          .classed('legend', true)
          .call(myLegend);
        

      });
  });
