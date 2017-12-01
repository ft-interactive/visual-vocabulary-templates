import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import gChartcolour from 'g-chartcolour';
import * as gLegend from 'g-legend';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as xyHeatmapQuantileChart from './xyHeatmapQuantile.js';

const dataFile = 'data.csv';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};

const yAxisAlign = 'left';// alignment of the axis
const xAxisAlign = 'top';// alignment of the axis
const legendAlign = 'hori';// hori or vert, alignment of the legend
const legendType = 'rect'; // rect, line or circ, geometry of legend marker
const scaleBreaks = [-40, -20, 0, 20, 40, 60]; // define the ranges for your data
const scaleType = 'diverging'; // choose from 'sequentialRed', 'sequentialBlue', 'diverging'
const startColor = 0;
let cScale;

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
        .margin({
            top: 100, left: 15, bottom: 82, right: 5,
        })
    // .title("Put headline here") //use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 5,
        })
    // .title("Put headline here")
        .height(500),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
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

    print: gChartframe.printFrame(sharedConfig)
        .margin({
            top: 40, left: 7, bottom: 35, right: 7,
        })
    // .title("Put headline here")
        .width(53.71)// 1 col
    // .width(112.25)// 2 col
    // .width(170.8)// 3 col
    // .width(229.34)// 4 col
    // .width(287.88)// 5 col
    // .width(346.43)// 6 col
    // .width(74)// markets std print
        .height(69.85), //  std print (Use 58.21mm for markets charts that matter)

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

parseData.load(dataFile, { scaleBreaks })
    .then(({
        seriesNames, plotData,
    }) => { // eslint-disable-line no-unused-vars
        Object.keys(frame).forEach((frameName) => {
            const currentFrame = frame[frameName];

            const myXAxis = gAxis.xOrdinal();// sets up yAxis
            const myYAxis = gAxis.yOrdinal();
            const myChart = xyHeatmapQuantileChart.draw(); // eslint-disable-line no-unused-vars
            const myLegend = gLegend.legend();
            console.log(plotData);
            // define color scale based on scale type
            switch (scaleType) {
            case 'diverging':
                cScale = gChartcolour.diverging;
                break;

            case 'sequentialRed':
                cScale = gChartcolour.sequentialMulti_2;
                break;

            case 'sequentialBlue':
                cScale = gChartcolour.sequentialMulti;
                break;

            default:
            }

            const scaleColours = d3.scaleOrdinal()
                .domain(scaleBreaks)
                .range(cScale.slice(startColor, scaleBreaks.length));

            console.log(scaleColours.range());
            console.log(scaleColours.domain());

            myYAxis
                .rangeRound([0, currentFrame.dimension().height], 0)
                .domain(plotData.map(d => d.name))
                .align(yAxisAlign)
                .frameName(frameName);

            const base = currentFrame.plot().append('g'); // eslint-disable-line
            currentFrame.plot()
                .call(myYAxis);

            // return the value in the variable newMargin
            if (yAxisAlign === 'right') {
                const newMargin = myYAxis.labelWidth() + currentFrame.margin().right;
                // Use newMargin redefine the new margin and range of xAxis
                currentFrame.margin({ right: newMargin });
            // yAxis.yLabel().attr('transform', `translate(${currentFrame.dimension().width},0)`);
            }
            if (yAxisAlign === 'left') {
                const newMargin = myYAxis.labelWidth() + currentFrame.margin().left;
                // Use newMargin redefine the new margin and range of xAxis
                currentFrame.margin({ left: newMargin });
                myYAxis.yLabel().attr('transform', 'translate(0,0)');
            }
            d3.select(currentFrame.plot().node().parentNode)
                .call(currentFrame);

            myXAxis
                .align(xAxisAlign)
                .domain(seriesNames)
                .rangeRound([0, currentFrame.dimension().width], 0)
                .frameName(frameName);

            myChart
                .xScale(myXAxis.scale())
                .yScale(myYAxis.scale())
                .plotDim(currentFrame.dimension())
                .rem(currentFrame.rem())
                .scaleBreaks(scaleBreaks)
                .colourPalette(frameName, cScale);

            currentFrame.plot()
                .call(myXAxis);

            if (xAxisAlign === 'bottom') {
                myXAxis.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
            }
            if (xAxisAlign === 'top') {
                myXAxis.xLabel().attr('transform', 'translate(0,0)');
            }

            currentFrame.plot()
                .selectAll('.columnHolder')
                .data(plotData)
                .enter()
                .append('g')
                .attr('class', 'columnHolder')
                .call(myChart);

            // Set up legend for this frame
            myLegend
                .seriesNames(scaleBreaks)
                .geometry(legendType)
                .frameName(frameName)
                .rem(myChart.rem())
                .alignment(legendAlign)
                .colourPalette(scaleColours);

            // Draw the Legend
            currentFrame.plot()
                .append('g')
                .attr('id', 'legend')
                .selectAll('.legend')
                .data(scaleBreaks)
                .enter()
                .append('g')
                .classed('legend', true)
                .call(myLegend);

            // remove ticks from x-axis
            myXAxis.xLabel().selectAll('.tick line').remove();
        });

    // addSVGSavers('figure.saveable');
    });
