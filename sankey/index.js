/**
 * Bootstrapping code for line chart
 */

import * as d3 from 'd3';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as parseData from './parseData.js';
import * as sankey from './sankey.js';

const dataFile = 'data.csv';
const sharedConfig = {
  title: 'Title not yet added',
  subtitle: 'Subtitle not yet added',
  source: 'Source not yet added',
};
// Put the user defined variablesin delete where not applicable
const sourceKey = 'source'; // This is the column to be used for source nodes
const targetKey = 'target'; // This is the column to be used for target nodes
const valueKey = 'value'; // This is the column to be used for link width

// Individual frame configuration, used to set margins (defaults shown below) etc
const frame = {
  webS: gChartframe
    .webFrameS(sharedConfig)
    .margin({ top: 100, left: 15, bottom: 82, right: 15 })
    // .title('Put headline here') // use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
    .height(400),

  webM: gChartframe
    .webFrameM(sharedConfig)
    .margin({
      top: 100,
      left: 20,
      bottom: 86,
      right: 20,
    })
    // .title("Put headline here")
    .height(500),

  webL: gChartframe
    .webFrameL(sharedConfig)
    .margin({
      top: 100,
      left: 20,
      bottom: 104,
      right: 20,
    })
    // .title("Put headline here")
    .height(700)
    .fullYear(true),

  webMDefault: gChartframe
    .webFrameMDefault(sharedConfig)
    .margin({
      top: 100,
      left: 20,
      bottom: 86,
      right: 20,
    })
    // .title("Put headline here")
    .height(500),

  print: gChartframe
    .printFrame(sharedConfig)
    .margin({ top: 40, left: 7, bottom: 35, right: 7 })
    // .title("Put headline here")
    .width(53.71) // 1 col
    // .width(112.25)// 2 col
    // .width(170.8)// 3 col
    // .width(229.34)// 4 col
    // .width(287.88)// 5 col
    // .width(346.43)// 6 col
    // .width(74)// markets std print
    .height(69.85), // std print (Use 58.21mm for markets charts that matter)

  social: gChartframe
    .socialFrame(sharedConfig)
    .margin({
      top: 140,
      left: 50,
      bottom: 138,
      right: 50,
    })
    // .title("Put headline here")
    .width(612)
    .height(612), // 700 is ideal height for Instagram

  video: gChartframe.videoFrame(sharedConfig).margin({
    left: 207,
    right: 207,
    bottom: 210,
    top: 233,
  }),
  // .title("Put headline here")
};

// add the frames to the page...
d3.selectAll('.framed').each(function addFrames() {
  const figure = d3.select(this).attr('class', 'button-holder');

  figure.select('svg').call(frame[figure.node().dataset.frame]);
});

parseData
  .load(dataFile, { sourceKey, targetKey, valueKey })
  .then(({ plotData }) => {
    Object.keys(frame).forEach((frameName) => {
      const currentFrame = frame[frameName];
      const myChart = sankey.draw();

      myChart
        .colourPalette(frameName)
        .frameName(frameName)
        .plotDim(currentFrame.dimension())
        .rem(currentFrame.rem());

      currentFrame.plot()
        .datum(plotData)
        .call(myChart);
    });
    // addSVGSavers('figure.saveable');
  });
