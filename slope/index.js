/**
 * Bootstrapping code for slope chart
 */

import * as d3 from 'd3';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as parseData from './parseData.js';
import * as slopeChart from './slopeChart.js';

// User defined constants similar to version 2
const dateStructure = '%d/%m/%Y';
const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};
const yMin = 0;// sets the minimum value on the yAxis
const yMax = 0;// sets the maximum value on the xAxis
const yAxisHighlight = 0; // sets which tick to highlight on the yAxis
// const numTicksy = 5; // Number of tick on the uAxis
const yAxisAlign = 'right';// alignment of the axis
const legendAlign = 'vert';// hori or vert, alignment of the legend
const legendType = 'line';// rect, line or circ, geometry of legend marker

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
   .height(750), // 700 is ideal height for Instagram

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

parseData.fromCSV('./data.csv', dateStructure).then(({ seriesNames, setColourPalette, groupNames, dataSorter, data }) => {
    // Use the seriesNames array to calculate the minimum and max values in the dataset
    const valueExtent = parseData.extentMulti(data, seriesNames);
    data.sort(dataSorter);

    const valueFormat = d => d3.format(',')(d);


    // define chart
    const myChart = slopeChart.draw()
          .colourProperty('group')
          .groupNames(groupNames)
          .xDomain(seriesNames)
          .yDomain([Math.min(yMin, valueExtent[0]), Math.max(yMax, valueExtent[1])])
          .yAxisAlign(yAxisAlign)
          .includeLabel(row => (row.label === 'yes'))
          .labelTextStart(row => (`${row.name} ${valueFormat(row[seriesNames[0]])}`))
          .labelTextEnd(row => (`${row.name} ${valueFormat(row[seriesNames[1]])}`));


          // .plotDim(currentFrame.dimension())
          // .rem(currentFrame.rem())
          // .colourPalette((frameName));

    // general axes configuration
    const myAxes = slopeChart.drawAxes()
              .startLabel(seriesNames[0])
              .endLabel(seriesNames[1])
              .yAxisHighlight(yAxisHighlight); // y-axis tick to highlight, if chart is rebased put 100 here


    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];
        const myLegend = gLegend.legend();// sets up the legend

        myChart
          .yRange([currentFrame.dimension().height, 0])
          .xRange([0, currentFrame.dimension().width])
          .rem(currentFrame.rem());

        myAxes.xScale(myChart.xScale())
          .yScale(myChart.yScale());

        // specifics based on frame type

        // set y-axis tick label offset
        myAxes.tickOffset(-currentFrame.rem() / 4);

        // set start/end label offset
        myAxes.labelOffset(-currentFrame.rem() * 1.3);

        // set radius of circles
        myChart.dotRadius(currentFrame.rem() * 0.3);

        // specifics based on frame type
        myChart.colourPalette(frameName, groupNames, setColourPalette); // set colour palette
        myAxes.colourInverse((frameName === 'social' || frameName === 'video'));


        currentFrame.plot().call(myAxes);

        currentFrame.plot()
          .selectAll('g.slope')
          .data(data)
          .enter()
          .append('g')
              .attr('class', 'slope')
              .attr('id', d => d.name)
          .call(myChart);

          // Set up legend for this frame
        myLegend
            .seriesNames(groupNames)
            .colourPalette(frameName)
            .frameName(frameName)
            .rem(myChart.rem())
            .alignment(legendAlign)
            .geometry(legendType);

            //extract unique group names
            const nest = d3.nest()
              .key(function(d) { return d; })
              .entries(groupNames);

            let uniqueGroupNames = [];

            nest.forEach(function(d,i){
                uniqueGroupNames.push(d.key)
            })

       // Draw the Legend
        currentFrame.plot()
            .append('g')
            .attr('id', 'legend')
                .selectAll('.legend')
                .data(uniqueGroupNames)
                .enter()
                .append('g')
                .classed('legend', true)
            .call(myLegend);

        // override chartframe margin.top to allow room for axis labels
        currentFrame.plot()
          .attr('transform', `translate(${currentFrame.margin().left},${currentFrame.margin().top + (currentFrame.rem() * 1.2)} )`);
    });
    // addSVGSavers('figure.saveable');
});
