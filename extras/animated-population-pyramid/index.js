import * as d3 from 'd3';
import * as gAxis from 'g-axis';
import gChartframe from 'g-chartframe';
import * as parseData from './parseData.js';
import * as pyramidChart from './pyramidChart.js';


const dataFile = 'populationPyramid19812018.csv';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};

const xMin = 0;// sets the minimum value on the yAxis
const xMax = 40;// sets the maximum value on the xAxis
const xAxisHighlight = 0; // sets which tick to highlight on the xAxis
const invertScale = true;
const numTicks = 3;// Number of tick on the xAxis
const divisor = 1000;// sets the formatting on linear axis for ’000s and millions
const colourProperty = 'name';
const yAxisAlign = 'left';// alignment of the axis
const catLabel = 'Age'; // define the categories
const showNumberLabels = false;// show numbers on end of bars

const yNumTicks = 10;
const groupByYear = true;

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
        .margin({
            top: 100, left: 15, bottom: 82, right: 24,
        })
    // .title("Put headline here") //use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 24,
        })
    // .title("Put headline here")
        .height(500),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 20,
        })
    // .title("Put headline here")
        .height(500),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 104, right: 24,
        })
    // .title("Put headline here")
        .height(700),

    print: gChartframe.printFrame(sharedConfig)
        .margin({
            top: 40, left: 7, bottom: 35, right: 7,
        })
    // .title("Put headline here")
    /* Print column widths */
    // .width(53.71)// 1 col
        .width(112.25)// 2 col
    // .width(170.8)// 3 col
    // .width(229.34)// 4 col
    // .width(287.88)// 5 col
    // .width(346.43)// 6 col
    // .width(74)// markets std print
        .height(58.21), // markets std print


    social: gChartframe.socialFrame(sharedConfig)
        .margin({
            top: 140, left: 50, bottom: 138, right: 40,
        })
    // .title("Put headline here")
        .width(612)
        .height(612),

    video: gChartframe.videoFrame(sharedConfig)
        .margin({
            left: 207, right: 207, bottom: 210, top: 233,
        }),
    // .title("Put headline here")
};


// add the frames to the page...
d3.selectAll('.framed')
    .each(function addFrames() {
        const figure = d3.select(this);
        figure.select('svg')
            .call(frame[figure.node().dataset.frame]);
    });

parseData.load(dataFile, { groupByYear })
    .then(({ seriesNames, plotData, valueExtent, generations }) => {
    // Draw the frames
        Object.keys(frame).forEach((frameName) => {
            const currentFrame = frame[frameName];
            // define other functions to be called

            let startYear = 0;
            const endYear = plotData.length - 1;

            let currentYear = plotData[startYear].values;

            const yAxis = gAxis.yOrdinal();// sets up yAxis
            const yLabelsAxis = gAxis.yLinear();
            const xAxisL = gAxis.xLinear();
            const xAxisR = gAxis.xLinear();
            const myChart = pyramidChart.draw();

            const timeXAxis = gAxis.xLinear();
            const percentYAxis = gAxis.yLinear();

            // const plotDim=currentFrame.dimension()//useful variable to carry the current frame dimensions
            yAxis
                .align(yAxisAlign)
                .domain(d3.range(0, 100, 1))
                .rangeRound([0, currentFrame.dimension().height], 10)
                .invert(invertScale)
                .frameName(frameName);

            yLabelsAxis
                .align(yAxisAlign)
                .domain([0, 100])
                .range([0, currentFrame.dimension().height], 10)
                .tickSize(0.01)
                .numTicks(yNumTicks)
                .invert(invertScale)
                .frameName(frameName);

            currentFrame.plot()
                .call(yAxis);
            yAxis.yLabel()
                .attr('opacity', 0);

            currentFrame.plot()
                .call(yLabelsAxis);

            yLabelsAxis.yLabel()
                .attr('transform', `translate(${((currentFrame.dimension().width / 2) + (currentFrame.rem() / 5))}, ${0})`)
                .selectAll('.tick text')
                .style('text-anchor', 'middle')
                .attr('opacity', (d) => {
                    if (d === 0) {
                        return 0;
                    }
                    return 1;
                });

            xAxisL
                .range([0, ((currentFrame.dimension().width / 2) - (yAxis.labelWidth() / 2) - (currentFrame.rem() / 2.5))])
                .domain([Math.min(xMin, valueExtent[0]), Math.max(xMax, valueExtent[1])])
                .tickSize(currentFrame.dimension().height)
                .invert(true)
                .numTicks(numTicks)
                .divisor(divisor)
                .xAxisHighlight(xAxisHighlight)
                .frameName(frameName);

            // Call the axis and move it if needed
            currentFrame.plot()
                .call(xAxisL);

            xAxisL.xLabel()
                .attr('transform', `translate(${-currentFrame.dimension().width * 0.01}, ${0})`);

            xAxisR
                .range([((currentFrame.dimension().width) / 2) + (yAxis.labelWidth() / 2) + (currentFrame.rem() / 2.5), currentFrame.dimension().width])
                .domain([Math.min(xMin, valueExtent[0]), Math.max(xMax, valueExtent[1])])
                .tickSize(currentFrame.dimension().height)
                .numTicks(numTicks)
                .divisor(divisor)
                .frameName(frameName);

            currentFrame.plot()
                .call(xAxisR);

            xAxisR.xLabel()
                .attr('transform', `translate(${currentFrame.dimension().width * 0.01}, ${0})`);

            const xFontSize = xAxisL.xLabel().selectAll('.tick text').style('font-size').slice(0, -2) * 0.875;
            yLabelsAxis.yLabel().selectAll('.tick text').style('font-size', xFontSize);

            timeXAxis
                .align('bottom')
                .domain(d3.extent(generations, a => +a.key))
                .range([0, currentFrame.dimension().width / 4])
                .tickSize(currentFrame.dimension().height / 3)
                .numTicks(5)
                .frameName(frameName);

            percentYAxis
                .align('left')
                .domain([0, 40])
                .range([0, currentFrame.dimension().height / 3])
                .numTicks(5)
                .invert(true)
                .tickSize(currentFrame.dimension().width / 4)
                .frameName(frameName);

            const minorChart = currentFrame.plot()
                .append('g')
                .attr('transform', `translate(${currentFrame.dimension().width * 0.75}, ${0})`);

            minorChart
                .append('rect')
                .attr('width', currentFrame.dimension().width / 4)
                .attr('height', currentFrame.dimension().height / 3)
                .attr('fill', '#FCF1E1');

            minorChart
                .call(timeXAxis);

            minorChart
                .call(percentYAxis);

            timeXAxis.xLabel()
                .selectAll('.tick text')
                .style('font-size', xFontSize)
                .text(d => d);

            percentYAxis.yLabel()
                .attr('transform', `translate(${currentFrame.dimension().width * 0.25}, ${0})`)
                .selectAll('.tick text')
                .style('font-size', xFontSize);

            myChart
            // .paddingInner(0.06)
                .colourProperty(colourProperty)
                .colourPalette((frameName))
                .seriesNames(seriesNames)
                .yScale(yAxis.scale())
                .xScaleL(xAxisL.scale())
                .xScaleR(xAxisR.scale())
                .rem(currentFrame.rem())
                .showNumberLabels(showNumberLabels);

            currentFrame.plot()
                .append('g')
                .attr('class', 'barGroup')
                .selectAll('.barHolder')
                .data(currentYear)
                .enter()
                .append('g')
                .attr('class', 'barHolder')
                .call(myChart);

            currentFrame.plot()
                .append('g')
                .attr('class', 'annotations-holder')
                .append('text')
                .attr('class', 'annotation')
                .attr('id', `${frameName}annotateright`)
                .attr('x', (currentFrame.dimension().width / 2) - (currentFrame.rem() / 2) - (yAxis.labelWidth()))
                .attr('y', -currentFrame.rem())
                .attr('text-anchor', 'end')
                .style('fill', 'black')
                .text(`← ${seriesNames[0]}`);

            currentFrame.plot()
                .append('g')
                .attr('class', 'annotations-holder')
                .append('text')
                .attr('class', 'annotation')
                .attr('id', `${frameName}annotateleft`)
                .attr('x', (currentFrame.dimension().width / 2) + (currentFrame.rem() / 2) + (yAxis.labelWidth()))
                .attr('y', -currentFrame.rem())
                .attr('text-anchor', 'start')
                .style('fill', 'black')
                .text(`${seriesNames[1]} →`);

            currentFrame.plot()
                .append('g')
                .attr('class', 'annotations-holder')
                .append('text')
                .attr('class', 'annotation')
                .attr('id', `${frameName}annotateleft`)
                .attr('x', (currentFrame.dimension().width / 2))
                .attr('y', -currentFrame.rem())
                .attr('text-anchor', 'middle')
                .style('font-size', xFontSize)
                .text(catLabel.toUpperCase());

            const yearLabel = currentFrame.plot()
                .append('g')
                .attr('class', 'annotations-holder')
                .append('text')
                .attr('class', 'annotation')
                .attr('id', `${frameName}annotateYear`)
                .attr('x', currentFrame.dimension().width * 0.95)
                .attr('y', -currentFrame.rem())
                .attr('text-anchor', 'end')
                .style('font-size', xFontSize * 2)
                .style('fill', '#D4CBC3')
                .text(plotData[startYear].key);

            yLabelsAxis.yLabel().raise();

            d3.select(`#trigger-animation-${frameName}`).on('click', () => {
                const timeoutFunction = setInterval(animateChart, 500);

                function animateChart() {
                    startYear += 1;
                    currentYear = plotData[startYear].values;

                    if (startYear <= endYear) {
                        currentFrame.plot()
                            .select('.barGroup')
                            .remove();

                        currentFrame.plot()
                            .append('g')
                            .attr('class', 'barGroup')
                            .selectAll('.barHolder')
                            .data(currentYear)
                            .enter()
                            .append('g')
                            .attr('class', 'barHolder')
                            .call(myChart);

                        yearLabel.text(plotData[startYear].key)
                    } else {
                        clearTimeout(timeoutFunction);
                    }
                }
            });
        });
    // addSVGSavers('figure.saveable');
    });
