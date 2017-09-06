/**
 * Bootstrapping code for scatterplot
 */

import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import * as gLegend from 'g-legend';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as scatterplot from './scatter.js';

//dataset and titles
const dataURL = "anscombe.csv"
const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};


// display options
const xVar = "var a"// these should be series (column) names from your data
const xMin = 0;// sets the minimum value on the xAxis - will autoextend to include range of your data
const xMax = 0;// sets the maximum value on the xAxis - will autoextend to include range of your data

const yVar = "var b"
const yMin = 0;// sets the minimum value on the yAxis - will autoextend to include range of your data
const yMax = 0;// sets the maximum value on the yAxis - will autoextend to include range of your data

const hollowDots = false;//you can set dots to be hollow (will need to adjust key in illustrator)

const opacity = 0.7;
const legendAlign = 'vert';// hori or vert, alignment of the legend
const legendType = 'circ';// rect, line or circ, geometry of legend marker

//remaining options to implement
//log scales
//invert scales
//proportional circles (bubble chart)


const myLegend = gLegend.legend();// sets up the legend
let yAxisHighlight;// = 20; //sets which tick to highlight on the yAxis
const numTicksy = 5;// Number of tick on the uAxis
const yAxisAlign = 'left';// alignment of the y axis
const xAxisAlign = 'bottom'

// const legendAlign = 'vert';// hori or vert, alignment of the legend

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
   .margin({ top: 100, left: 15, bottom: 82, right: 20 })
   // .title("Put headline here") //use this if you need to override the defaults
   // .subtitle("Put headline |here") //use this if you need to override the defaults
   .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 86, right: 25})
   // .title("Put headline here")
   .height(500),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
    .margin({ top: 100, left: 20, bottom: 86, right: 30})
    // .title("Put headline here")
    .height(500),

    webL: gChartframe.webFrameL(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 104, right: 25 })
   // .title("Put headline here")
   .height(700),

   //print column widths are:
   /*


   */
    print: gChartframe.printFrame(sharedConfig)
   .margin({ top: 40, left: 7, bottom: 35, right: 17 })
   // .title("Put headline here")
   .width(55)
   .height(68),
   

    social: gChartframe.socialFrame(sharedConfig)
   .margin({ top: 140, left: 50, bottom: 138, right: 50 })
   // .title("Put headline here")
   .width(612)
   .height(612),

    video: gChartframe.videoFrame(sharedConfig)
   .margin({ left: 207, right: 207, bottom: 210, top: 233 }),
   // .title("Put headline here")
};


// add the frames to the page...
d3.selectAll('.framed')
    .each(function addFrames() {
        const figure = d3.select(this);
        figure.select('svg').call(frame[figure.node().dataset.frame]);
    });

parseData.fromCSV(dataURL).then(({ seriesNames, valueExtent, data }) => {

//identify groups
const groups = d3.map(data, function(d){return d.group;}).keys();

//determin extents for each scale
let xValRange =[xMin,xMax]
let yValRange =[yMin,yMax]

  data.forEach(function(d){
    xValRange[0] = Math.min(xValRange[0],d[xVar]);
    xValRange[1] = Math.max(xValRange[1],d[xVar]);
    yValRange[0] = Math.min(yValRange[0],d[yVar]);
    yValRange[1] = Math.max(yValRange[1],d[yVar]);
  })


    // set up axes
    const myYAxis = gAxis.yLinear();
    const myXAxis = gAxis.xLinear();


    // define chart
    const myChart = scatterplot.draw()
      .seriesNames(seriesNames)
      .xDomain(xValRange)
      .yDomain(yValRange)
      .yAxisAlign(yAxisAlign);

    // draw, for each frame
    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        // define other functions to be called
        const tickSize = currentFrame.dimension().width;// Used when drawing the yAxis ticks

        myYAxis
          .domain(yValRange)
          .range([currentFrame.dimension().height,0])
          .align(yAxisAlign)
          .tickSize(tickSize)
          .frameName(frameName);

        currentFrame.plot()
          .call(myYAxis);

        //return the value in the variable newMargin
        if (yAxisAlign == 'right' ){
            let newMargin = myYAxis.labelWidth() +currentFrame.margin().right
            //Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({right:newMargin});
            //yAxis.yLabel().attr('transform', `translate(${currentFrame.dimension().width},0)`);
        }
        if (yAxisAlign == 'left' ){
            let newMargin = myYAxis.labelWidth() + currentFrame.margin().left
            //Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({left:newMargin});
            myYAxis.yLabel().attr('transform', `translate(${(myYAxis.tickSize()-myYAxis.labelWidth())},0)`);
        }

        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        // should be able to set domain from myChart??
        myXAxis
          .domain(xValRange)
          .tickSize(currentFrame.rem()* 0.75)
          .range([0, currentFrame.dimension().width])
          .align(xAxisAlign)
          .frameName(frameName);

        // call axes
        currentFrame.plot()
          .call(myXAxis);


        if (xAxisAlign == 'bottom' ){
            myXAxis.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
        }
        if (xAxisAlign == 'top' ){
            myXAxis.xLabel().attr('transform', `translate(0,${myXAxis.tickSize()})`);
        }


        myChart
          .yRange([currentFrame.dimension().height, 0])
          .xScale(myXAxis.scale())
          .plotDim(currentFrame.dimension())
          .rem(currentFrame.rem())
          .colourPalette((frameName))
          .xVar(xVar)
          .yVar(yVar)
          .hollowDots(hollowDots)
          .groups(groups)
          .opacity(opacity)


          // draw chart
        currentFrame.plot()
          .append('g')
          .attr('id', 'scatterplot')
          .selectAll('.scatterplot')
          .data(data)
          .enter()
          .append('g')
          .attr('class', 'scatterplot')
          .attr('id', d => d.name)
          .call(myChart);

        d3.select(currentFrame.plot().node().parentNode)
          .call(currentFrame);


        // Set up legend for this frame
        myLegend
          .frameName(frameName)
          .seriesNames(groups)
          .colourPalette((frameName))
          .rem(myChart.rem())
          .geometry(legendType)
          .alignment(legendAlign);


        // Draw the Legend
        currentFrame.plot()
          .append('g')
          .attr('id', 'legend')
          .selectAll('.legend')
            .data(groups)
            .enter()
            .append('g')
            .classed('legend', true)
            .call(myLegend);

        const legendSelection = currentFrame.plot().select('#legend');
        legendSelection.attr('transform', `translate(0,${-currentFrame.rem()})`);



    });
    // addSVGSavers('figure.saveable');
});
