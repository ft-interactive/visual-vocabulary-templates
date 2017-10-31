import * as d3 from 'd3';
import gAxis from 'g-axis';
import gChartframe from 'g-chartframe';
import * as histogram from './histogram.js';
import * as parseData from './parseData.js';

const thresholdCount = 5;

const dataFile = 'data--random-normal-distribution.csv';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};
const yMin = -Infinity; // Sets the minimum value on the yAxis
const yMax = Infinity; // Sets the maximum value on the yAxis
const xMin = -Infinity; // Sets the minimum value on the xAxis
const xMax = Infinity; // Sets the maximum value on the xAxis
// const yAxisHighlight = 100; //sets which tick to highlight on the yAxis
const numTicksY = 5; // Number of tick on the uAxis
const yAxisAlign = 'left'; // Alignment of the axis
// let annotate = true; // show annotations, defined in the 'annotate' column

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
   .margin({ top: 100, left: 15, bottom: 82, right: 5 })
   // .title("Put headline here") //use this if you need to override the defaults
   // .subtitle("Put headline |here") //use this if you need to override the defaults
   .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 86, right: 5 })
   // .title("Put headline here")
   .height(500),

    webL: gChartframe.webFrameL(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 104, right: 5 })
   // .title("Put headline here")
   .height(700)
   .fullYear(true),

    print: gChartframe.printFrame(sharedConfig)
    .margin({ top: 40, left: 7, bottom: 35, right: 7 })
    // .title("Put headline here")
    // .width(53.71)// 1 col
    .width(112.25)// 2 col
    // .width(170.8)// 3 col
    // .width(229.34)// 4 col
    // .width(287.88)// 5 col
    // .width(346.43)// 6 col
    // .width(74)// markets std print
    .height(58.21), // markets std print

    social: gChartframe.socialFrame(sharedConfig)
   .margin({ top: 140, left: 50, bottom: 138, right: 40 })
   // .title("Put headline here")
   .height(750), // 700 is ideal height for Instagram

    video: gChartframe.videoFrame(sharedConfig)
   .margin({ left: 207, right: 207, bottom: 210, top: 233 }),
   // .title("Put headline here")
};

// add the frames to the page...
d3.selectAll('.framed')
    .each(function addFrames() {
        const figure = d3.select(this);
        figure.select('svg')
            .call(frame[figure.node().dataset.frame]);
    });

parseData.load(dataFile).then(({ data }) => {
    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];
        const tickSize = currentFrame.dimension().width; // Used when drawing the yAxis ticks

        const [minData, maxData] = d3.extent(data);
        const xAxis = gAxis.xLinear()
            .domain([
                (xMin > -Infinity ? xMin : minData),
                (xMax < Infinity ? xMax : maxData),
            ])
            .range([0, currentFrame.dimension().width])
            .tickSize(currentFrame.rem() * 0.75)
            .frameName(frameName);

        const xAxisTicks = xAxis.scale().ticks(thresholdCount);
        const bins = d3.histogram()
            .thresholds(xAxisTicks)(data);
            // For Freedman-Diaconis, comment out the above and use the following:
            // .thresholds(d3.thresholdFreedmanDiaconis(xAxisTicks, yMin, yMax))(data);
            // For Scott's normal reference rule, uncomment the following instead:
            // .thresholds(d3.thresholdScott(xAxisTicks, yMin, yMax))(data);
            //
            // For more on D3's threshold algorithms, @see:
            // http://devdocs.io/d3~4/d3-array#histogram_thresholds

        // Set up and draw y-axis
        const yAxis = gAxis.yLinear()
            .range([currentFrame.dimension().height, 0])
            .tickSize(currentFrame.dimension().width)
            .align(yAxisAlign)
            .tickSize(tickSize)
            .numTicks(numTicksY)
            .frameName(frameName);

        const [lowerBounds, upperBounds] = d3.extent(bins, d => d.length);
        yAxis.domain([
            (yMin > -Infinity ? yMin : lowerBounds),
            (yMax < Infinity ? yMax : upperBounds),
        ]);

        currentFrame.plot().call(yAxis);
        const newMargin = yAxis.labelWidth() + currentFrame.margin().left;
        currentFrame.margin({ left: newMargin }); // Use newMargin redefine the new margin and range of xAxis
        yAxis.yLabel().attr('transform', `translate(${(yAxis.tickSize() - yAxis.labelWidth())}, 0)`);

        // Draw x-axis
        currentFrame.plot().call(xAxis);
        xAxis.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);

        // Set up rest of frame...
        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        // Draw rest of chart
        const myChart = histogram.draw()
            .yScale(yAxis.scale())
            .xScale(xAxis.scale())
            .thresholds(thresholdCount)
            .rem(currentFrame.rem())
            .colourPalette(frameName);

        currentFrame.plot()
            .append('g')
            .attr('class', 'bins')
            .datum(bins)
            .call(myChart);
    });
    // addSVGSavers('figure.saveable');
});
