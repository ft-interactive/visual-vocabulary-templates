/**
 * Bootstrapping code for slope chart
 */

import * as d3 from 'd3';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as parseData from './parseData.js';
import * as pieChart from './pieChart.js';

const dataURL="data.csv"

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};


// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
   .margin({ top: 100, left: 50, bottom: 62, right: 50 })
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
   .margin({ top: 40, left: 20, bottom: 35, right: 20 })
   // .title("Put headline here")
 	//Print column sizes-- 1col 53.71mm: 2col 112.25mm: 3col 170.8mm: 4col 229.34mm: 5col 287.88mm: 6col 346.43,
 	.width(112.25)
 	.height(68),

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

parseData.fromCSV(dataURL).then(({ seriesNames, data }) => {
    // Use the seriesNames array to calculate the minimum and max values in the dataset


    const valueFormat = d => d3.format(',')(d);
    const pie = d3.pie()
                .value(d => d.value);


    // define chart
    const myChart = pieChart.draw()
              .seriesNames(seriesNames)
          // .plotDim(currentFrame.dimension())
          // .rem(currentFrame.rem())
          // .colourPalette((frameName));


    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        const radius = Math.min(currentFrame.dimension().width, currentFrame.dimension().height) / 2;

        myChart
          .rem(currentFrame.rem())
          .radius(radius)
          .colourPalette(frameName)
          .frameName(frameName); // set colour palette


        currentFrame.plot()
          .selectAll('g.arc')
          .data(pie(data))
          .enter()
          .append('g')
              .attr('class', 'arc')
              .attr('transform', `translate(${currentFrame.dimension().width / 2},${currentFrame.dimension().height / 2} )`)
          .call(myChart);


          
    });
    // addSVGSavers('figure.saveable');
});
