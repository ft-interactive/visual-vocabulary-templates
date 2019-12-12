/**
 * Bootstrapping code for line chart
 */

import * as d3 from 'd3';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as cart from './drawChart.js';

const dataFile = 'carto.csv';

const dateFormat = '%m/%d/%Y';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};
//Put the user defined variablesin delete where not applicable
const yMin = 0;// sets the minimum value on the yAxis
const yMax = 0;// sets the maximum value on the xAxis
const yAxisHighlight = 0; // sets which tick to highlight on the yAxis
const numTicksy = 5;// Number of tick on the uAxis
const yAxisAlign = 'left';// alignment of the axis
const xAxisAlign = 'bottom';// alignment of the axis
const interval = 'lustrum';// date interval on xAxis "century", "jubilee", "decade", "lustrum", "years", "months", "days", "hours"
const annotate = true; // show annotations, defined in the 'annotate' column
const markers = false;// show dots on lines
const legendAlign = 'vert';// hori or vert, alignment of the legend
const legendType = 'line';// rect, line or circ, geometry of legend marker
const minorAxis = true;// turns on or off the minor axis
const highlightNames = []; // create an array names you want to highlight eg. ['series1','series2']
const interpolation = d3.curveLinear;// curveStep, curveStepBefore, curveStepAfter, curveBasis, curveCardinal, curveCatmullRom
const invertScale = false;
const logScale = false;
const joinPoints = true;// Joints gaps in lines where there are no data points
const intraday = false;
let colours = 'web'

// Individual frame configuration, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
        .margin({ top: 100, left: 25, bottom: 82, right: 35 })
        // .title('Put headline here') // use this if you need to override the defaults
        // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(550)
        .extend('numberOfColumns', 1)
        .extend('numberOfRows', 1),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 5,
        })
        // .title("Put headline here")
        .height(1300)
        .extend('numberOfColumns', 1)
        .extend('numberOfRows', 1),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 104, right: 5,
        })
        // .title("Put headline here")
        .height(2100)
        .fullYear(true)
        .extend('numberOfColumns', 1)
        .extend('numberOfRows', 1),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 5,
        })
        // .title("Put headline here")
        .height(1250)
        .extend('numberOfColumns', 1)
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
        .height(300)
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
parseData.load(dataFile, { dateFormat})
    .then(({ data,
        seriesNames,
        valueExtentY,
        valueExtentX,
        plotData,}) => {

      Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];
        const plotDim = [currentFrame.dimension().width, currentFrame.dimension().height]
        const mapWidth = plotDim[0] / currentFrame.numberOfColumns() - (currentFrame.rem() * 1.5)
        const mapDim = [mapWidth, (mapWidth * 1.54) + currentFrame.rem() * 2];
        const myYAxis = gAxis.yLinear();// sets up yAxis
        const myXAxis = gAxis.yLinear();// sets up yAxis
        const carto = cart.draw();

        let colorScale;

        if (colours === 'web') {
            colorScale = d3.scaleOrdinal()
                .domain(['UUP', 'UKIP', 'SNP', 'Sinn Féin', 'SDLP', 'Plaid Cymru', 'Liberal Democrats', 'Labour', 'Independent/Other', 'Green', 'DUP', 'Conservative', 'Brexit', 'Independent Group for Change', 'Alliance', 'The Speaker'])
                .range(['#3f67cc', '#7200ab', '#FFF8AB', '#006643', '#5ba373', '#990000', '#f09000', '#cf4d3c', '#d9cace', '#8deb9d', '#210066', '#149adb', '#80cfd6', '#fc8b9d', '#ffbe18', '#ffffff']);
        }
        if (colours === 'print') {
            colorScale = d3.scaleOrdinal()
              .domain(['UUP', 'UKIP', 'SNP', 'Sinn Féin', 'SDLP', 'Plaid Cymru', 'Liberal Democrats', 'Labour', 'Independent/Other', 'Green', 'DUP', 'Conservative', 'Brexit', 'Independent Group for Change', 'Alliance', 'The Speaker'])
              .range(['#95BFC5', '#7F00D9', '#FFDE40', '#8CB861', '#C8DD69', '#79CDCD', '#FAA634', '#F37B70', '#DCDDDE', '#4E9587', '#BBB8DC', '#7BAFDE', '#00B8DE', '#FCBDC7', '#FCBB76', '#ffffff']);
        }
        else {
            colorScale = d3.scaleOrdinal()
                .domain(['UUP', 'UKIP', 'SNP', 'Sinn Féin', 'SDLP', 'Plaid Cymru', 'Liberal Democrats', 'Labour', 'Independent/Other', 'Green', 'DUP', 'Conservative', 'Brexit', 'Independent Group for Change', 'Alliance', 'The Speaker'])
                .range(['#195EF7', '#7F00D9', '#FFF8AB', '#50BF77', '#007D51', '#B30000', '#FFAD36', '#FF634D', '#E0D9D5', '#80FF96', '#4B28B0', '#0095E8', '#00BFBC', '#FCBDC7', '#FACD5D', '#ffffff']);
        }

        myYAxis
            .domain(valueExtentY)
            .range([mapDim[1], 0])
            .align(yAxisAlign)
            .frameName(frameName);
        
        myXAxis
            .domain(valueExtentX)
            .range([0, mapWidth])
        
        let radius = 10;

        if (frameName === 'webS') { radius = 3 }
        if (frameName === 'webM') { radius = 8 }
        if (frameName === 'webL') { radius = 14 }
        if (frameName === 'webMDefault') { radius = 8 }
        if (frameName === 'print') { radius = 5 }
        if (frameName === 'social') { radius = 4 }
        
        carto
            .yScale(myYAxis.scale())
            .xScale(myXAxis.scale())
            .frameName(frameName)
            .rem(radius)
            .plotDim(mapDim)
            .colourPalette(colorScale);
        
        
        const map = currentFrame.plot()
            .selectAll('.scatterplot')
            .data(plotData)
            .enter()
            .append('g')
            .attr('class', 'scatterplot')
            .call(carto);
        
        map
          .attr('transform', (d, i) => {
              const yPos = Number((Math.floor(i / currentFrame.numberOfColumns()) * mapDim[1] ));
              const xPos = i % currentFrame.numberOfColumns();
              return `translate(${(((mapDim[0] + (currentFrame.rem() * 1.5)) * xPos))}, ${yPos})`;
          });



         



          
      });
      // addSVGSavers('figure.saveable');
  });
