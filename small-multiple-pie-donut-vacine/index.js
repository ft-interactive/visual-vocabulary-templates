/**
 * Bootstrapping code for slope chart
 */

import * as d3 from 'd3';
import * as gLegend from 'g-legend'; // eslint-disable-line no-unused-vars
import gChartframe from 'g-chartframe';
import * as parseData from './parseData.js';
import * as pieChart from './pieChart.js';
import gChartcolour from 'g-chartcolour';



const dataFile = 'country_vax_trajectories.csv';
const dateFormat = '%d/%m/%Y';

const sharedConfig = {
    title: 'Percent of population vacinated',
    subtitle: 'By country, as of Jan 7 2021',
    source: 'Source not yet added',
};

const donut = true; // set to true to turn on donut and display total
const countries = ['All']
const dateRange = ['15/12/2020']
const colourProperty = 'continent'

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
        .margin({
            top: 100, left: 15, bottom: 62, right: 15,
        })
    // .title("Put headline here") //use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(400)
        .extend('numberOfColumns', 3)
        .extend('numberOfRows', 3),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({
            top: 100, left: 30, bottom: 62, right: 30,
        })
    // .title("Put headline here")
        .height(1500)
        .extend('numberOfColumns', 5)
        .extend('numberOfRows', 3),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({
            top: 100, left: 30, bottom: 86, right: 30,
        })
    // .title("Put headline here")
        .height(1000)
        .extend('numberOfColumns', 5)
        .extend('numberOfRows', 5),


    webL: gChartframe.webFrameL(sharedConfig)
        .margin({
            top: 100, left: 50, bottom: 76, right: 50,
        })
    // .title("Put headline here")
        .height(700)
        .extend('numberOfColumns', 5)
        .extend('numberOfRows', 3),

    print: gChartframe.printFrame(sharedConfig)
        .margin({
            top: 40, left: 20, bottom: 35, right: 20,
        })
    // .title("Put headline here")
        .width(53.71)// 1 col
    // .width(112.25)// 2 col
    // .width(170.8)// 3 col
    // .width(229.34)// 4 col
    // .width(287.88)// 5 col
    // .width(346.43)// 6 col
    // .width(74)// markets std print
        .height(69.85) // std print (Use 58.21mm for markets charts that matter)
        .extend('numberOfColumns', 3)
        .extend('numberOfRows', 3),
    social: gChartframe.socialFrame(sharedConfig)
        .margin({
            top: 140, left: 150, bottom: 138, right: 150,
        })
    // .title("Put headline here")
        .width(612)
        .height(612)
        .extend('numberOfColumns', 2)
        .extend('numberOfRows', 3),

    video: gChartframe.videoFrame(sharedConfig)
        .margin({
            left: 400, right: 400, bottom: 210, top: 233,
        })
        .extend('numberOfColumns', 2)
        .extend('numberOfRows', 3),
};


// add the frames to the page...
d3.selectAll('.framed')
    .each(function addFrames() {
        const figure = d3.select(this);
        figure.select('svg')
            .call(frame[figure.node().dataset.frame]);
    });

parseData.load([dataFile], { dateFormat, countries, dateRange, colourProperty}).then(({ seriesNames, data, plotData, frameTimes, colorSeries }) => {


    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];
        const plotDim = [currentFrame.dimension().width,currentFrame.dimension().height]
        const pieWidth = plotDim[0] / currentFrame.numberOfColumns()-(currentFrame.rem() * 1.5)
        const pieDim = [pieWidth, (pieWidth * 1.3) + currentFrame.rem()];
        const innerRadius = pieWidth * 0.15;
        const outerRadius = pieWidth * 0.5;
        const colourScale = d3.scaleOrdinal()
            .domain(colorSeries)

        // define chart
        const myChart = pieChart.draw()
            .seriesNames(colorSeries)
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .frameTimes(frameTimes)
            .plotDim(plotDim)
            .pieDim(pieDim)
            .colourPalette((frameName))
            .colourProperty(colourProperty)
        
        const pie = currentFrame.plot()
          .selectAll('.pieHolder')
          .data(plotData)
          .enter()
          .append('g')
          .attr('id', d => d.code)
          .attr('class', 'pieHolder')
          .call(myChart);
        
        pie
          .attr('transform', (d, i) => {
              const yPos = Number((Math.floor(i / currentFrame.numberOfColumns()) * pieDim[1] ));
              const xPos = i % currentFrame.numberOfColumns();
              return `translate(${(((pieDim[0] + (currentFrame.rem() * 1.5)) * xPos))}, ${yPos})`;
          });


    });
    // addSVGSavers('figure.saveable');
});
