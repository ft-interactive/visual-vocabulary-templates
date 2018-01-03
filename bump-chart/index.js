import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import gChartcolour from 'g-chartcolour';
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

const columns = true;
const xAxisAlign = 'top';// alignment of the axis
const markers = true;// show dots on lines
const highlightNames = ['Real Madrid', 'Arsenal', 'Bayern Munich']; // create an array names you want to highlight eg. ['series1','series2']
const interpolation = d3.curveMonotoneX;// curveStep, curveStepBefore, curveStepAfter, curveBasis, curveCardinal, curveCatmullRom
// const invertScale = false;

// Individual frame configuration, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 82, right: 5 })
    // .title('Put headline here') // use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 5,
        })
    // .title("Put headline here")
        .height(500),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 104, right: 5,
        })
    // .title("Put headline here")
        .height(700)
        .fullYear(true),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 5,
        })
        // .title("Put headline here")
        .height(500),

    print: gChartframe.printFrame(sharedConfig)
        .margin({ top: 40, left: 7, bottom: 35, right: 7 })
        // .title("Put headline here")
        .width(53.71)// 1 col
        // .width(112.25)// 2 col
        // .width(170.8)// 3 col
        // .width(229.34)// 4 col
        // .width(287.88)// 5 col
        // .width(346.43)// 6 col
        // .width(74)// markets std print
        .height(69.85), // std print (Use 58.21mm for markets charts that matter)

    social: gChartframe.socialFrame(sharedConfig)
        .margin({
            top: 140, left: 50, bottom: 138, right: 40,
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
    .then(({ seriesNames, data, plotData, valueExtent, terminusLabels, paths, highlightPaths }) => {
        Object.keys(frame).forEach((frameName) => {
            const currentFrame = frame[frameName];

            const myYAxis = gAxis.yOrdinal();// sets up yAxis
            const myYAxisRight = gAxis.yOrdinal();// sets up yAxisRight
            const myXAxis = gAxis.xOrdinal();// sets up xAxis

            const tickSize = 0;

            const seriesArray = paths.map(d => d.item);

            const myChart = bumpChart.draw()
                .markers(markers)
                .seriesNames(seriesArray)
                .highlightNames(highlightNames)
                .interpolation(interpolation);

            const myHighLines = bumpChart.draw()
                .markers(markers)
                .seriesNames(seriesArray)
                .highlightNames(highlightNames)
                .interpolation(interpolation);

            const highlightedLines = colourPalette(frameName);

            function colourPalette(d) {
                const newPalette = d3.scaleOrdinal();
                if (d === 'social' || d === 'video') {
                    newPalette
                        .domain(highlightNames)
                        .range(Object.values(gChartcolour.lineSocial));
                }
                if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
                    newPalette
                        .domain(highlightNames)
                        .range(Object.values(gChartcolour.lineWeb));
                }
                if (d === 'print') {
                    newPalette
                        .domain(highlightNames)
                        .range(Object.values(gChartcolour.linePrint));
                }
                return newPalette;
            }

            myYAxis
                .domain(terminusLabels.map(d => d.pos))
                .rangeRound([0, currentFrame.dimension().height])
                .tickSize(tickSize)
                .align('left')
                .frameName(frameName);

            currentFrame.plot()
                .call(myYAxis);

            const newMarginYLeft = myYAxis.labelWidth() + currentFrame.margin().left;
            // Use newMargin redefine the new margin and range of yAxis
            currentFrame.margin({ left: newMarginYLeft });
            myYAxis.yLabel().attr('transform', `translate(${(myYAxis.tickSize() - (myYAxis.labelWidth() / 2))},0)`);

            d3.select(currentFrame.plot().node().parentNode)
                .call(currentFrame);

            // Create second y axis for end labels
            myYAxisRight
                .domain(terminusLabels.map(d => d.endLabel))
                .rangeRound([0, currentFrame.dimension().height])
                .tickSize(tickSize)
                .align('right')
                .frameName(frameName);

            currentFrame.plot()
                .call(myYAxisRight);

            // Add id to add extra styles to right labels
            myYAxisRight.yLabel().attr('id', 'endLabels');

            const newMarginYRight = myYAxisRight.labelWidth() + currentFrame.margin().right;
            currentFrame.margin({ right: newMarginYRight });
            myYAxisRight.yLabel().attr('transform', `translate(${currentFrame.dimension().width},0)`);
            myYAxisRight.yLabel().attr('text-anchor', 'start');

            d3.select(currentFrame.plot().node().parentNode)
                .call(currentFrame);

            myXAxis
                .domain(seriesNames)
                .rangeRound([0, currentFrame.dimension().width])
                .align(xAxisAlign)
                .tickSize(tickSize)
                .frameName(frameName);

            currentFrame.plot()
                .call(myXAxis);

            const xScale = myXAxis.scale();

            if (columns) {
                const bgColumns = currentFrame.plot()
                    .selectAll('.columns')
                    .data(plotData)
                    .enter()
                    .append('g')
                    .attr('class', 'columns')
                    .attr('id', d => d.item)
                    .attr('transform', d => `translate(${xScale(d.group)})`);

                bgColumns
                    .append('rect')
                    .attr('class', 'column')
                    .attr('width', myXAxis.bandwidth())
                    .attr('height', currentFrame.dimension().height);
            }

            myChart
                .yScale(myYAxis.scale())
                .xScale(myXAxis.scale())
                .plotDim(currentFrame.dimension())
                .rem(currentFrame.rem())
                .colourPalette((frameName));

            myHighLines
                .yScale(myYAxis.scale())
                .xScale(myXAxis.scale())
                .plotDim(currentFrame.dimension())
                .rem(currentFrame.rem())
                .colourPalette(highlightedLines);

            // Draw the lines
            currentFrame.plot()
                .selectAll('.lines')
                .data(paths)
                .enter()
                .append('g')
                .attr('class', 'lines')
                .attr('id', d => d.item)
                .call(myChart);

            currentFrame.plot()
                .selectAll('.lines.highlighlines')
                .data(highlightPaths)
                .enter()
                .append('g')
                .attr('class', 'lines highlighlines')
                .attr('id', d => d.item)
                .call(myHighLines);
        });
      // addSVGSavers('figure.saveable');
    });
