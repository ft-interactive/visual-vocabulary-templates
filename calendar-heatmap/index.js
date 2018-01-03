import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import gChartcolour from 'g-chartcolour';
import * as gLegend from 'g-legend';
// import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as calendarHeatmap from './calendarHeatmap.js';

const dataFile = 'data.csv';

const dateFormat = '%d/%m/%Y';
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

// const yAxisAlign = 'left';// alignment of the axis
// const xAxisAlign = 'top';// alignment of the axis
// const showValues = false;
// const rotateLabels = false;
const legendAlign = 'hori';// hori or vert, alignment of the legend
const legendType = 'rect'; // rect, line or circ, geometry of legend marker

const fiscal = true; // should be true if you want to disply financial years
const scaleBreaks = [20, 40, 60, 80, 100];
const scaleType = 'sequentialBlue';
let colourScale;

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

parseData.load(dataFile, { fiscal, dateFormat })
    .then(({
        plotData, data, // eslint-disable-line no-unused-vars
    }) => {
        Object.keys(frame).forEach((frameName) => {
            const currentFrame = frame[frameName];

            const myChart = calendarHeatmap.draw();
            const myLegend = gLegend.legend();

            switch (scaleType) {
            case 'sequentialRed':
                colourScale = gChartcolour.sequentialMulti_2;
                break;

            case 'sequentialBlue':
                colourScale = gChartcolour.sequentialMulti;
                break;

            default:
            }

            const scaleColours = d3.scaleOrdinal()
                .domain(scaleBreaks)
                .range(colourScale);

            // Remove repeated variable
            const cellSize = currentFrame.dimension().width / 54;
            const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

            myChart
                .fiscal(fiscal)
                .plotDim(currentFrame.dimension())
                .rem(currentFrame.rem())
                .colourPalette(colourScale);

            const years = currentFrame.plot()
                .selectAll('.year')
                .data(plotData)
                .enter()
                .append('g')
                .attr('class', 'year')
                .call(myChart);

            // Append label for each year
            years.append('text')
                .attr('class', 'year-label')
                .attr('y', currentFrame.rem())
                .text((d) => {
                    if (fiscal) {
                        return `Year ending ${d.key}`;
                    }
                    return d.key;
                });

            const dayLabels = years
                .append('g')
                .attr('id', 'dayLabels');

            days.forEach((day, i) => {
                dayLabels.append('text')
                    .attr('class', 'weekday-labels')
                    // Remove magic number
                    .attr('y', (currentFrame.rem() * 1.4) + (i * cellSize))
                    .attr('dy', '0.9em')
                    .text(day);
            });

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
        });

    // addSVGSavers('figure.saveable');
    });
