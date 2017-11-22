import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as circleTimeline from './circleTimeline.js';


const dataFile = 'data.csv';

const dateFormat = '%Y';
const circleSize = 1;
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

const xAxisAlign = 'bottom'; // alignment of the axis
const interval = 'years'; // date interval on xAxis "century", "jubilee", "decade", "lustrum", "years","months","days"
const minorAxis = false; /* turns on or off the minor axis */ // eslint-disable-line

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
        .margin({ top: 100, left: 15, bottom: 82, right: 60 })
    // .title("Put headline here") //use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(700),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 86, right: 60 })
    // .title("Put headline here")
        .height(700),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 86, right: 60 })
    // .title("Put headline here")
        .height(700),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 104, right: 60 })
    // .title("Put headline here")
        .height(700)
        .fullYear(true),

    print: gChartframe.printFrame(sharedConfig)
        .margin({ top: 40, left: 7, bottom: 40, right: 25 })
    // .title("Put headline here")
        .width(53.71)// 1 col
        //.width(112.25)// 2 col
        // .width(170.8)// 3 col
        // .width(229.34)// 4 col
        // .width(287.88)// 5 col
        // .width(346.43)// 6 col
        // .width(74)// markets std print
        .height(69.85), // std print (Use 58.21mm for markets charts that matter)

    social: gChartframe.socialFrame(sharedConfig)
        .margin({ top: 100, left: 50, bottom: 100, right: 80 })
    // .title("Put headline here")
        .width(612)
        .height(612),

    video: gChartframe.videoFrame(sharedConfig)
        .margin({ left: 150, right: 207, bottom: 150, top: 233 }),
    // .title("Put headline here")
};


// add the frames to the page...
d3.selectAll('.framed')
    .each(function addFrames() {
        const figure = d3.select(this);
        figure.select('svg')
            .call(frame[figure.node().dataset.frame]);

        const holder = figure.append('div');
        holder.append('button')
            .attr('class', 'button')
            .text('Does nothing')
            .style("float", "left")
            .style('opacity',0.6)
            .on('click', function (d) {
                savePNG(1)
            });
        holder.append('button')
            .attr('class', 'button')
            .style("float", "left")
            .style('opacity',0.6)
            .text('Does nothing twice as big')
            .on('click', function (d) {
                savePNG(2)
            });
        holder.append('div')
            .html('<br/>')

        function savePNG(scaleFactor) {
            console.log('Does nothing', scaleFactor);
            const exportSVG = figure.select('svg');
            //saveSvgAsPng(exportSVG, 'area-chart.png',{scale: scaleFactor`});
        }
    });

parseData.load(dataFile, { dateFormat })
.then(({ valueExtent, seriesNames, plotData, dateDomain }) => {
    // make sure all the dates in the date column are a date object
    // var parseDate = d3.timeParse("%d/%m/%Y")
    // data.forEach(function(d) {
    //             d.date=parseDate(d.date);
    //         });

    // automatically calculate the seriesnames excluding the "name" column

    // define chart
    const myChart = circleTimeline.draw() // eslint-disable-line
        .seriesNames(seriesNames);

    const countCategories = plotData.length;

    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        const myXAxis = gAxis.xDate();// sets up yAxis
        const myChart = circleTimeline.draw(); // eslint-disable-line

        // define other functions to be called

        // Used when drawing the yAxis ticks
        const tickSize = currentFrame.dimension().width; // eslint-disable-line

        // Get the size of the container to set scales for each box
        const h = currentFrame.dimension().height;
        const w = currentFrame.dimension().width; // eslint-disable-line

        // calculate the size of the max circle - here using height
        const maxCircle = (h / 2 / countCategories) * circleSize;
        // const timelineSpacer = h - (maxCircle / 2);

        // set radius scale
        const rScale = d3.scalePow().exponent(0.5)
            .domain([0, valueExtent[1]])
            .range([0, maxCircle]);

        myChart
            .plotDim(currentFrame.dimension())
            .rem(currentFrame.rem())
            .colourPalette((frameName));

        const base = currentFrame.plot().append('g'); // eslint-disable-line

        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        myXAxis
            .align(xAxisAlign)
            .domain(dateDomain)
            .range([0, currentFrame.dimension().width])
            .frameName(frameName)
            .interval(interval);
        myChart
            .rScale(rScale)
            .maxCircle(maxCircle)
            .xScale(myXAxis.scale())
            .setDateFormat(dateFormat);

        currentFrame.plot()
            .selectAll('.timelineHolder')
            .data(plotData)
            .enter()
            .append('g')
            .attr('transform', (d, i) => `translate(${currentFrame.margin().left}, ${((i * (h / countCategories)) * 1.1) + (maxCircle / 2)})`)
            .attr('class', 'timelineHolder')
            .call(myChart)
            .call(myXAxis);
    });
    // addSVGSavers('figure.saveable');
});
