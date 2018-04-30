import * as d3 from 'd3';
import * as gAxis from 'g-axis';
import gChartframe from 'g-chartframe';
import gChartcolour from 'g-chartcolour';
import * as parseData from './parseData.js';
import * as pyramidChart from './pyramidChart.js';


const dataFile = 'populationPyramid19812018.csv';

const sharedConfig = {
    title: 'Millennials now make up more of | the population than baby boomers',
    subtitle: 'Population by age (millions)',
    source: 'Source not yet added',
};

const minorChartTitle = 'Generation as percentage of | total population over time';

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
const minorChartGenerationsToShow = ['boomer', 'millennial'];
const minorChartLabelPlacement = [
  { generation: 'Millennials', right: 0.05, top: 0.175 },
  { generation: 'Boomers', right: 0.05, top: 0.75 }
];

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
        .margin({
            top: 100, left: 15, bottom: 82, right: 24,
        })
    // .title("Put headline here") //use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(500),

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
        .height(600),

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
    .then(({ seriesNames, plotData, valueExtent, byGeneration }) => {
    // Draw the frames
        Object.keys(frame).forEach((frameName) => {
            const currentFrame = frame[frameName];
            // define other functions to be called

            let startYear = 0;
            const endYear = plotData.length - 1;

            let currentYear = plotData[startYear].values;

            // const yAxis = gAxis.yOrdinal();// sets up yAxis
            const yLabelsAxis = gAxis.yLinear();
            const xAxisL = gAxis.xLinear();
            const xAxisR = gAxis.xLinear();
            const myChart = pyramidChart.draw();

            const timeXAxis = gAxis.xLinear();
            const percentYAxis = gAxis.yLinear();

            const y = d3.scaleBand()
                .domain(d3.range(0, 100, 1))
                .range([currentFrame.dimension().height, 0])
                .padding(0.25);

            yLabelsAxis
                .align(yAxisAlign)
                .domain([0, 100])
                .range([0, currentFrame.dimension().height])
                .tickSize(0.01)
                .numTicks(yNumTicks)
                .invert(invertScale)
                .frameName(frameName);

            currentFrame.plot()
                .call(yLabelsAxis);

            yLabelsAxis.yLabel()
                .attr('transform', `translate(${((currentFrame.dimension().width / 2) + (currentFrame.rem() / 5))}, ${-y.bandwidth()})`)
                .selectAll('.tick text')
                .style('text-anchor', 'middle')
                .attr('opacity', (d) => {
                    if (d === 0) {
                        return 0;
                    }
                    return 1;
                });

            xAxisL
                .range([0, ((currentFrame.dimension().width / 2) - (yLabelsAxis.labelWidth() / 2) - (currentFrame.rem() / 2.5))])
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
                .range([((currentFrame.dimension().width) / 2) + (yLabelsAxis.labelWidth() / 2) + (currentFrame.rem() / 2.5), currentFrame.dimension().width])
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

            /* Minor chart code  START */
            const minorChartPosition = { right: 0, top: -40 };
            const minorChartDim = {
                width: currentFrame.dimension().width * 0.25,
                height: currentFrame.dimension().height / 3,
            };

            timeXAxis
                .align('bottom')
                .domain(d3.extent(plotData, a => +a.key))
                .range([0, minorChartDim.width])
                .tickSize(minorChartDim.height)
                .numTicks(5)
                .frameName(frameName);

            percentYAxis
                .align('right')
                .domain([0, 40])
                .range([0, minorChartDim.height])
                .numTicks(5)
                .invert(true)
                .tickSize(-minorChartDim.width)
                .frameName(frameName);

            const minorChart = currentFrame.plot()
                .append('g')
                .attr('transform',
                  `translate(${currentFrame.dimension().width - minorChartDim.width - minorChartPosition.right}, ${minorChartPosition.top})`
                );

            minorChart
                .call(timeXAxis);

            minorChart
                .call(percentYAxis);

            timeXAxis.xLabel()
                .selectAll('.tick text')
                .style('font-size', xFontSize)
                .text(d => d);

            percentYAxis.yLabel()
                .attr('transform', `translate(${minorChartDim.width}, ${0})`)
                .selectAll('.tick text')
                .attr('dx', -minorChartDim.width - percentYAxis.labelWidth() - 5)
                .style('font-size', xFontSize);

            minorChart
              .append('g')
              .attr('class', 'minor-chart-title')
              .append('text')
              .attr('class', 'minor-title')
              .attr('y', -minorChartTitle.split('|').length * 16)
              .attr('text-anchor', 'start')
              .selectAll('tspan')
              .data(minorChartTitle.split('|'))
              .enter()
              .append('tspan')
              .attr('x', -percentYAxis.labelWidth())
              .attr('dy', (d, i) => i * 16)
              .text(d => d.trim());

            const drawLine = d3.line()
              .x(d => timeXAxis.scale()(d.values[0].year))
              .y(d => percentYAxis.scale()(d.percent));

            minorChart
                .append('g')
                .attr('class', 'minor-chart-lines')
                .selectAll('path')
                .data(byGeneration.filter(d => minorChartGenerationsToShow.includes(d.generation)).map(d => d.values))
                .enter()
                .append('path')
                .attr('d', drawLine)
                .style('stroke', (d, i) => gChartcolour.lineWeb[i]);

            minorChart
                .append('rect')
                .attr('y', -(minorChartTitle.split('|').length + 1) * 16)
                .attr('x', -percentYAxis.labelWidth())
                .attr('width', minorChartDim.width + percentYAxis.labelWidth())
                .attr('height', ((minorChartTitle.split('|').length + 1) * 16) + (minorChartDim.height * 1.2))
                .attr('fill', '#FBE6D7')
                .lower();

            const yearLine = minorChart
              .append('line')
              .attr('class', 'year-line')
              .attr('x1', 0)
              .attr('x2', 0)
              .attr('y1', 0)
              .attr('y2', minorChartDim.height);

            const minorChartText = minorChart
                .append('g')
                .selectAll('text')
                .data(minorChartLabelPlacement)
                .enter()
                .append('text')
                .attr('class', 'minor-chart-label')
                .style('font-size', xFontSize * 0.9)
                .attr('x', d => minorChartDim.width * (1 - d.right))
                .attr('y', d => d.top * minorChartDim.height)
                .text(d => d.generation);

            /* END */

            myChart
                .colourProperty(colourProperty)
                .colourPalette((frameName))
                .seriesNames(seriesNames)
                .yScale(y)
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
                .attr('x', (currentFrame.dimension().width / 2) - (currentFrame.rem() / 2) - (yLabelsAxis.labelWidth()))
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
                .attr('x', (currentFrame.dimension().width / 2) + (currentFrame.rem() / 2) + (yLabelsAxis.labelWidth()))
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

            const yearLabelGroup = currentFrame.plot()
                .append('g')
                .append('text')
                .attr('class', 'year-label')
                .attr('text-anchor', 'start')
                .attr('x', -currentFrame.margin().left)
                .attr('y', -xFontSize * 0.5)
                .style('font-size', xFontSize * 1.5);
            yearLabelGroup.append('tspan')
                .text('Year: ');
            const yearLabel = yearLabelGroup.append('tspan')
                .attr('class', 'year-label-bold')
                .text(plotData[startYear].key);

            yLabelsAxis.yLabel().raise();

            d3.select(`#trigger-animation-${frameName}`).on('click', () => {
                const timeoutFunction = setInterval(animateChart, 500);

                function animateChart() {
                    startYear += 1;
                    if (!plotData[startYear]) {
                        clearTimeout(timeoutFunction);
                        return;
                    }
                    currentYear = plotData[startYear].values;

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

                    const newPos = timeXAxis.scale()(startYear + 1981);
                    yearLine
                      .attr('x1', newPos)
                      .attr('x2', newPos);

                    yearLabel.text(plotData[startYear].key);
                }
            });
        });
    // addSVGSavers('figure.saveable');
    });
