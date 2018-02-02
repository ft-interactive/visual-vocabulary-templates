import * as d3 from 'd3';
import * as gAxis from 'g-axis';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as parseData from './parseData.js';
import * as groupedSymbolChart from './groupedSymbolChart.js';


const dataFile = 'data.csv';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};

const yMin = 0; /* sets the minimum value on the yAxis */ // eslint-disable-line
const yMax = 0; /* sets the maximum value on the yAxis */ // eslint-disable-line
const yAxisHighlight = 0; /* sets which tick to highlight on the yAxis */ // eslint-disable-line
const numTicks = 5; /* Number of tick on the yAxis */ // eslint-disable-line
const colourProperty = 'name';
const yAxisAlign = 'left';// alignment of the axis
const xAxisAlign = 'bottom';
const sort = '';// specify 'ascending', 'descending'
const sortOn = 0;// specify column number to sort on (ignore name column)
const numberOfColumns = 4; // number of rows in each group
const divisor = 0.5;// data divisor to adjust number and value of circles
const showNumberLabels = false;// show column totals
const circleSize = 1;// change this number to increase or decrease the size of the circles
const legendAlign = 'hori'; // hori or vert, alignment of the legend
const legendType = 'circ'; // rect, line or circ, geometry of legend marker


// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
        .margin({ top: 100, left: 15, bottom: 82, right: 24 })
    // .title('Put headline here') //use this if you need to override the defaults
    // .subtitle('Put headline |here') //use this if you need to override the defaults
        .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 86, right: 24 })
    // .title('Put headline here')
        .height(550),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 86, right: 20 })
    // .title('Put headline here')
        .height(550),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 104, right: 24 })
    // .title('Put headline here')
        .height(800),

    print: gChartframe.printFrame(sharedConfig)
        .margin({ top: 40, left: 7, bottom: 35, right: 7 })
    // .title('Put headline here')
    /* Print column widths */
        .width(53.71)// 1 col
    // .width(112.25)// 2 col
    // .width(170.8)// 3 col
    // .width(229.34)// 4 col
    // .width(287.88)// 5 col
    // .width(346.43)// 6 col
    // .width(74)// markets std print
        .height(69.85), // std print (Use 58.21mm for markets charts that matter)


    social: gChartframe.socialFrame(sharedConfig)
        .margin({ .margin({ top: 140, left: 40,, bottom: 138, right: 40 })
    // .title('Put headline here')
        .width(612)
        .height(612),

    video: gChartframe.videoFrame(sharedConfig)
        .margin({ left: 207, right: 207, bottom: 210, top: 233 }),
    // .title('Put headline here')
};


// add the frames to the page...
d3.selectAll('.framed')
    .each(function addFrames() {
        const figure = d3.select(this);

        figure.select('svg')
            .call(frame[figure.node().dataset.frame]);
    });

parseData.load(dataFile, { sort, sortOn, divisor })
    .then(({ seriesNames, plotData, valueExtent, data }) => { // eslint-disable-line
        // Draw the frames
        Object.keys(frame).forEach((frameName) => {
            const currentFrame = frame[frameName];
            // define other functions to be called
            const xAxis = gAxis.xOrdinal();// sets up xAxis
            const xDotAxis = gAxis.xOrdinal();// sets up xAxis
            const xTotalAxis = gAxis.xOrdinal();// sets up xAxis
            const yDotAxis = gAxis.yOrdinal();
            const myChart = groupedSymbolChart.draw();
            const myLegend = gLegend.legend();
            const maxValue = valueExtent[1];
            const maxRows = (maxValue / divisor) / numberOfColumns;
            const rowIndex = d3.range(maxRows);

            // const plotDim=currentFrame.dimension()//useful variable to carry the current frame dimensions
            const tickSize = currentFrame.dimension().width;// Used when drawing the yAxis ticks

            myChart
                .showNumberLabels(showNumberLabels);


            xAxis
                // .align(xAxisAlign)
                .domain(plotData.map(d => d.name))
                .rangeRound([0, tickSize])
                .frameName(frameName);

            xTotalAxis
                // .align(xAxisAlign)
                .domain(plotData.map(d => d.total))
                .rangeRound([0, tickSize])
                .frameName(frameName);

            yDotAxis
                .align(yAxisAlign)
                .domain(rowIndex)
                .rangeRound([(currentFrame.dimension().height - currentFrame.rem()), 0])
                .tickSize(tickSize)
                .align(yAxisAlign)
                .frameName(frameName);

            const base = currentFrame.plot().append('g'); // eslint-disable-line


            // Draw the yAxis first, this will position the yAxis correctly and measure the width of the label text
            currentFrame.plot()
                .call(yDotAxis);

            // return the value in the variable newMargin and move axis if needed
            if (yAxisAlign === 'right') {
                const newMargin = yDotAxis.labelWidth() + currentFrame.margin().right;
                // Use newMargin redefine the new margin and range of xAxis
                currentFrame.margin({ right: newMargin });
                yDotAxis.yLabel()
                    .attr('transform', `translate(${-currentFrame.dimension().width + yDotAxis.labelWidth()},${0})`);
            } else {
                const newMargin = yDotAxis.labelWidth() + currentFrame.margin().left;
                // Use newMargin re define the new margin and range of xAxis
                currentFrame.margin({ left: newMargin });
            }
            // Set the plot object to its new dimensions
            d3.select(currentFrame.plot().node().parentNode)
                .call(currentFrame);
            // Use new widtth of frame to set the range of the x-axis and any other parameters
            xAxis
                .rangeRound([0, currentFrame.dimension().width]);

            xTotalAxis
                .rangeRound([0, currentFrame.dimension().width]);

            // Call the axis and move it if needed
            currentFrame.plot()
                .call(xTotalAxis)
                .call(xAxis);


            xDotAxis
                .domain(d3.range(numberOfColumns))
                .rangeRound([0, xAxis.bandwidth()]);

            myChart
                // .paddingInner(0.06)
                .divisor(divisor)
                .numberOfColumns(numberOfColumns)
                .dotData(plotData)
                .colourProperty(colourProperty)
                .colourPalette((frameName))
                .seriesNames(seriesNames)
                .yDotScale(yDotAxis.scale())
                .xScale(xAxis.scale())
                .xDotScale(xDotAxis.scale())
                .xTotalScale(xTotalAxis.scale())
                .rem(currentFrame.rem())
                .circleSize(circleSize);

            currentFrame.plot()
                .selectAll('.stackHolder')
                .data(plotData)
                .enter()
                .append('g')
                .attr('class', 'stackHolder')
                .call(myChart);

            // Set up legend for this frame
            myLegend
                .seriesNames(seriesNames)
                .geometry(legendType)
                .frameName(frameName)
                .rem(currentFrame.rem())
                .alignment(legendAlign)
                .colourPalette((frameName));

            // Draw the Legend
            currentFrame.plot()
                .append('g')
                .attr('id', 'legend')
                .selectAll('.legend')
                .data(seriesNames)
                .enter()
                .append('g')
                .classed('legend', true)
                .call(myLegend);

            const legendSelection = currentFrame.plot().select('#legend');
            const legheight = (legendSelection.node().getBBox().height); // eslint-disable-line
            legendSelection.attr('transform', `translate(0,${-currentFrame.rem()})`);

            if (xAxisAlign === 'top') {
                xAxis.xLabel()
                    .attr('transform', `translate(0,${-(currentFrame.rem() * 2)})`);
                xTotalAxis.xLabel()
                    .attr('transform', `translate(0,${-currentFrame.rem()})`);

                const holder = currentFrame.plot().append('g').classed('plot-holder', true)
                    .attr('transform', `translate(0,${(currentFrame.rem())})`);

                [...currentFrame.plot().node().children].forEach((d) => {
                    if (d3.select(d).attr('class') !== 'plot-holder') {
                        holder.append(() => d);
                    }
                });
            }

            if (xAxisAlign === 'bottom') {
                xAxis.xLabel()
                    .attr('transform', `translate(0,${currentFrame.dimension().height - currentFrame.rem()})`);
                xTotalAxis.xLabel()
                    .attr('transform', `translate(0,${currentFrame.dimension().height})`);
            }


            xAxis.xLabel().selectAll('.tick line').remove();
            xTotalAxis.xLabel().selectAll('.tick line').remove();
            xTotalAxis.xLabel().classed('axisTotal', true);
            yDotAxis.yLabel().selectAll('.tick').remove();

            // remove total axis
            if (!showNumberLabels) {
                d3.select('.axisTotal').remove();
            }
        });
        // addSVGSavers('figure.saveable');
    });
