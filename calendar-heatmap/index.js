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

const legendAlign = 'hori';// hori or vert, alignment of the legend
const legendType = 'rect'; // rect, line or circ, geometry of legend marker

const fiscal = false; // should be true if you want to disply financial years
const clipYear = true;
const scaleBreaks = [20, 40, 60, 80, 100];
const scaleType = 'sequentialBlue';
let colourRange;

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
                colourRange = gChartcolour.sequentialMulti_2;
                break;

            case 'sequentialBlue':
                colourRange = gChartcolour.sequentialMulti;
                break;

            default:
            }

            const colourScale = d3.scaleOrdinal()
                .domain(scaleBreaks)
                .range(colourRange);

            const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            myChart
                .fiscal(fiscal)
                .clipYear(clipYear)
                .plotDim(currentFrame.dimension())
                .rem(currentFrame.rem())
                .scaleBreaks(scaleBreaks)
                .colourPalette(colourRange);

            const years = currentFrame.plot()
                .selectAll('.year')
                .data(plotData)
                .enter()
                .append('g')
                .attr('class', 'year');

            // Append label for each year
            const yearLabels = years.append('text')
                .attr('class', 'year-labels')
                .attr('y', currentFrame.rem())
                .text((d) => {
                    if (fiscal) {
                        return `Year ending ${d.key}`;
                    }
                    return d.key;
                });

            // We're not using an axis so need to caluclate max label width
            let labelWidth = 0;
            yearLabels.each(function getMaxLabelWidth() {
                labelWidth = Math.max(this.getBBox().width, labelWidth);
            });
            // Add option to specify where labels are
            const newMargin = labelWidth;
            currentFrame.margin({ left: newMargin });
            yearLabels.attr('transform', `translate(${-currentFrame.margin().left},0)`);

            d3.select(currentFrame.plot().node().parentNode)
                .call(currentFrame);

            // Calculate cell size and pass this to the chart
            const cellSize = currentFrame.dimension().width / 56;
            myChart.cellSize(cellSize);

            years.call(myChart);

            const dayLabelsLeft = years
                .append('g')
                .attr('class', 'dayLabelsLeft');
            const dayLabelsRight = years
                .append('g')
                .attr('class', 'dayLabelsRight');

            days.forEach((day, i) => {
                dayLabelsLeft.append('text')
                    .attr('class', 'weekday-labels')
                    .attr('y', (currentFrame.rem() * 1.4) + (i * cellSize))
                    .attr('dy', '0.9em')
                    .attr('text-anchor', 'end')
                    .text(day);
                dayLabelsRight.append('text')
                    .attr('class', 'weekday-labels')
                    .attr('y', (currentFrame.rem() * 1.4) + (i * cellSize))
                    .attr('dy', '0.9em')
                    .attr('text-anchor', 'start')
                    .text(day);
            });

            let dayLabelsWidth = 0;
            dayLabelsLeft.each(function getMaxLabelWidth() {
                dayLabelsWidth = Math.max(this.getBBox().width, dayLabelsWidth);
            });

            dayLabelsLeft.attr('transform', `translate(${-currentFrame.margin().left + dayLabelsWidth},0)`);
            dayLabelsRight.attr('transform', `translate(${cellSize * 54},0)`);

            // Get the bounding boxes of month outlines
            const boundingBoxes = [];
            const mp = currentFrame.plot()
                .select('.monthOutlines')
                .node()
                .childNodes;
            for (let i = 0; i < mp.length; i += 1) {
                boundingBoxes.push(mp[i].getBBox());
            }
            const monthX = [];
            boundingBoxes.forEach((d) => {
                const boxCentre = d.width / 2;
                monthX.push(d.x + boxCentre);
            });

            const monthLabels = years
                .append('g')
                .attr('class', 'monthLabels');

            months.forEach((d, i) => {
                monthLabels.append('text')
                    .attr('class', 'month-labels')
                    .attr('x', () => {
                        if (fiscal && i < 3) {
                            return monthX[i + 9];
                        }
                        if (fiscal && i > 2) {
                            return monthX[i - 3];
                        }
                        return monthX[i];
                    })
                    .attr('y', myChart.rem())
                    .text(d);
            });

            myLegend
                .seriesNames(scaleBreaks)
                .geometry(legendType)
                .frameName(frameName)
                .rem(myChart.rem())
                .alignment(legendAlign)
                .colourPalette(colourScale);

            // Draw the Legend
            currentFrame.plot()
                .append('g')
                .attr('id', 'legend')
                .selectAll('.legend')
                .data(scaleBreaks.map(d => `up to ${d}`))
                .enter()
                .append('g')
                .classed('legend', true)
                .call(myLegend);

            const legendSelection = currentFrame.plot().select('#legend');
            const legendWidth = (legendSelection.node().getBBox().width); // eslint-disable-line
            legendSelection.attr('transform', `translate(${currentFrame.dimension().width - legendWidth - currentFrame.rem()},${-currentFrame.rem() * 2})`);
        });

    // addSVGSavers('figure.saveable');
    });
