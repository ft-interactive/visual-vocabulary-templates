/**
 * Bootstrapping code for slope chart
 */

import * as d3 from 'd3';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as parseData from './parseData.js';
import * as pieChart from './pieChart.js';

// User defined constants similar to version 2
const dateStructure = '%d/%m/%Y';
const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};


// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
   .margin({ top: 100, left: 80, bottom: 62, right: 80 })
   // .title("Put headline here") //use this if you need to override the defaults
   // .subtitle("Put headline |here") //use this if you need to override the defaults
   .height(400)
   .sourcePlotYOffset(24),

    webM: gChartframe.webFrameM(sharedConfig)
   .margin({ top: 100, left: 100, bottom: 62, right: 100 })
   // .title("Put headline here")
   .height(500)
   .sourcePlotYOffset(28),

   webMDefault: gChartframe.webFrameMDefault(sharedConfig)
   .margin({ top: 100, left: 150, bottom: 86, right: 150 })
    // .title("Put headline here")
   .height(500),


    webL: gChartframe.webFrameL(sharedConfig)
   .margin({ top: 100, left: 150, bottom: 76, right: 150 })
   // .title("Put headline here")
   .height(700)
   .sourcePlotYOffset(32)
   .fullYear(true),

    print: gChartframe.printFrame(sharedConfig)
   .margin({ top: 40, left: 40, bottom: 35, right: 40 })
   // .title("Put headline here")
   .height(90)
   .width(55),

    social: gChartframe.socialFrame(sharedConfig)
   .margin({ top: 140, left: 150, bottom: 138, right: 150 })
   // .title("Put headline here")
   .width(612)
   .height(612),

    video: gChartframe.videoFrame(sharedConfig)
   .margin({ left: 400, right: 400, bottom: 210, top: 233 }),
   // .title("Put headline here")
};


// add the frames to the page...
d3.selectAll('.framed')
    .each(function addFrames() {
        const figure = d3.select(this);
        figure.select('svg')
            .call(frame[figure.node().dataset.frame]);
    });

parseData.fromCSV('./data.csv', dateStructure).then(({ seriesNames, data }) => {
    // Use the seriesNames array to calculate the minimum and max values in the dataset


    const valueFormat = d => d3.format(',')(d);
    const pie = d3.pie();

    // define chart
    const myChart = pieChart.draw()
              .seriesNames(seriesNames)
          // .plotDim(currentFrame.dimension())
          // .rem(currentFrame.rem())
          // .colourPalette((frameName));


    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        myChart
          .rem(currentFrame.rem());

        myChart.colourPalette(frameName); // set colour palette


        currentFrame.plot()
          .selectAll('g.arc')
          .data(data)
          .enter()
          .append('g')
              .attr('class', 'arc')
          .call(myChart);


        // override chartframe margin.top to allow room for axis labels
        currentFrame.plot()
          .attr('transform', `translate(${currentFrame.margin().left},${currentFrame.margin().top + (currentFrame.rem() * 1.2)} )`);
    });
    // addSVGSavers('figure.saveable');
});
