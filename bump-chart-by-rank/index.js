import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as bumpChart from './bumpChart.js';

const dataFile = 'data.csv';

const dateFormat = '%Y';
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
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};

const columns = true;// show background columns for each date (e.g. year)
const xAxisAlign = 'top';// alignment of the axis
const markers = true;// show dots on lines
const highlightNames = ['Deutsche Bank', 'Citi', 'Barclays']; // create an array names you want to highlight eg. ['series1','series2']
const interpolation = d3.curveMonotoneX;// curveStep, curveStepBefore, curveStepAfter, curveBasis, curveCardinal, curveCatmullRom
// const invertScale = false;

// Individual frame configuration, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
        .margin({ top: 100, left: 0, bottom: 82, right: 5 })
    // .title('Put headline here') // use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({
            top: 100, left: 0, bottom: 86, right: 5,
        })
    // .title("Put headline here")
        .height(500),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({
            top: 100, left: 0, bottom: 104, right: 5,
        })
    // .title("Put headline here")
        .height(700)
        .fullYear(true),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({
            top: 100, left: 0, bottom: 86, right: 5,
        })
        // .title("Put headline here")
        .height(500),

    print: gChartframe.printFrame(sharedConfig)
        .margin({ top: 40, left: 7, bottom: 35, right: 7 })
        // .title("Put headline here")
        //.width(53.71)// 1 col
        .width(112.25)// 2 col
        // .width(170.8)// 3 col
        // .width(229.34)// 4 col
        // .width(287.88)// 5 col
        // .width(346.43)// 6 col
        // .width(74)// markets std print
        .height(69.85), // std print (Use 58.21mm for markets charts that matter)

    social: gChartframe.socialFrame(sharedConfig)
        .margin({
            top: 140, left: 40, bottom: 138, right: 40,
        })
        // .title("Put headline here")
        .width(612)
        .height(612), // 700 is ideal height for Instagram

    video: gChartframe.videoFrame(sharedConfig)
        .margin({
            left: 207, right: 207, bottom: 210, top: 233,
        }),
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

parseData.load(dataFile, { dateFormat, highlightNames })
    .then(({ seriesNames, data, plotData, valueExtent, terminusLabels}) => { // eslint-disable-line
        Object.keys(frame).forEach((frameName) => {
            const currentFrame = frame[frameName];

            const yAxis = gAxis.yLinear();// sets up yAxis
            const ordinalL = gAxis.yOrdinal();// sets up yAxisLeft
            const ordinalR = gAxis.yOrdinal();// sets up yAxisRight
            const xAxis = gAxis.xOrdinal();// sets up xAxis

            const tickSize = 0;
            const bandWidth = currentFrame.dimension().height / (plotData.length)
            const base = currentFrame.plot().append('g')

            yAxis
                .domain([valueExtent[0], valueExtent[1]])
                .range([0, currentFrame.dimension().height])
                .align('right')
                .frameName(frameName)
                .numTicks(plotData.length)
                .tickSize(0.001);

            ordinalL
                .domain(terminusLabels.startLabel)
                .rangeRound([0, currentFrame.dimension().height + bandWidth])
                .tickSize(tickSize)
                .align('left')
                .frameName(frameName);

            ordinalR
                .domain(terminusLabels.endLabel)
                .rangeRound([0, currentFrame.dimension().height + bandWidth])
                .tickSize(tickSize)
                .align('right')
                .frameName(frameName);

            const myChart = bumpChart.draw()
                .seriesNames(seriesNames)
                .interpolation(interpolation)
                .highlightNames(highlightNames);

            // currentFrame.plot()
            //     .call(yAxis);
            currentFrame.plot()
                .call(ordinalL);
            currentFrame.plot()
                .call(ordinalR);

             const newMarginLeft = ordinalL.labelWidth() + currentFrame.margin().left;
             const newMarginRight = ordinalR.labelWidth() + currentFrame.margin().right;

             currentFrame.margin({ left: newMarginLeft, right: newMarginRight});
             d3.select(currentFrame.plot().node().parentNode)
                .call(currentFrame);

            ordinalL.yLabel()
                .attr('transform', `translate(${0},${-(bandWidth / 2)})`);
            ordinalR.yLabel()
                .attr('transform', `translate(${currentFrame.dimension().width + (ordinalR.labelWidth())},${-(bandWidth / 2)})`);

            const plotDim = [currentFrame.dimension().width,currentFrame.dimension().height];

            xAxis
                .plotDim(plotDim)
                .rem(currentFrame.rem())
                .domain(seriesNames)
                .rangeRound([0, currentFrame.dimension().width])
                .align(xAxisAlign)
                .tickSize(tickSize)
                .frameName(frameName)
                .banding(true);

            currentFrame.plot()
                .call(xAxis);


            myChart
                .yScale(yAxis.scale())
                .xScale(xAxis.scale())
                //.plotDim(currentFrame.dimension())
                .rem(currentFrame.rem())
                .colourPalette((frameName));

            currentFrame.plot()
                .selectAll('.lines')
                .data(plotData)
                .enter()
                .append('g')
                .attr('class', 'lines')
                .attr('id', d => d.name)
                .call(myChart);
            //remove labels and replace in correct position    
            ordinalL.yLabel().remove()
            let startLabels = currentFrame.plot()
                .append('g')
                .attr('class', 'axis yAxis')
            startLabels.selectAll('text')
                .data(plotData)
                .enter()
                .append('text')
                .attr('id', `${frameName}yLabel`)
                .attr('y', d => yAxis.scale()(d.start) + (currentFrame.rem() / 4))
                .attr('x', 0)
                .text(d => d.group)

            ordinalR.yLabel().remove()
            let endLabels = currentFrame.plot()
                .append('g')
                .attr('class', 'axis yAxis')
            endLabels.selectAll('text')
                .data(plotData)
                .enter()
                .append('text')
                .attr('id', `${frameName}yLabel`)
                .attr('y', d => yAxis.scale()(d.end) + (currentFrame.rem() / 4))
                .attr('x', currentFrame.dimension().width +ordinalR.labelWidth())
                .text(d => d.group)




        });
      // addSVGSavers('figure.saveable');
    });
