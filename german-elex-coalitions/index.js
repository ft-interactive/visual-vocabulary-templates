import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import * as gLegend from 'g-legend';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as stackedBarChart from './stackedBarChart.js';
import gChartcolour from 'g-chartcolour';

const dataFile = 'https://bertha.ig.ft.com/republish/publish/dsv/1UlBBMV8lrmwqTMtyiyaQBr_Qz7Ffrr6qFr1ERsKEtTs/coalitions.csv';
//https://docs.google.com/a/ft.com/spreadsheets/d/e/2PACX-1vQ04R6rNcTxQLVrEagI2kBH21LZLnhKZaVamvYAnkKI92TZF26zC9I5GdLX_FaKLM7AjbWBuZjqM5us/pubhtml
const sharedConfig = {
    title: 'Test test Vote share',
    subtitle: '%',
    source: 'Source not yet added',
};
const xMin = 0;// sets the minimum value on the yAxis
const xMax = 60;// sets the maximum value on the yAxis
const xAxisHighlight = 50; // sets which tick to highlight on the yAxis
const numTicks = 5;// Number of tick on the uAxis
const yAxisAlign = 'left';// alignment of the axis
const xAxisAlign = 'top';// alignment of the axis
const legendAlign = 'hori';// hori or vert, alignment of the legend
const legendType = 'rect'; // rect, line or circ, geometry of legend marker
const sort = '';// specify 'ascending', 'descending', 'alphabetical' - default is order of input file

//const data = loadsheet(key, data)
//get spreadsheet info

// const url = 'https://bertha.ig.ft.com/republish/publish/dsv/1UlBBMV8lrmwqTMtyiyaQBr_Qz7Ffrr6qFr1ERsKEtTs/coalitions.csv';
// const text = await fetch(url).then(response => response.ok ? response.text() : Promise.reject(response.status));
// const data = d3.csvParse(text);

// console.log(data)

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
        .margin({ top: 40, left: 15, bottom: 100, right: 20 })
    // .title("Put headline here") //use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({ top: 200, left: 20, bottom: 120, right: 24 })
    // .title("Put headline here")
        .height(500),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({ top: 0, left: 20, bottom: 100, right: 24 })
    // .title("Put headline here")
        .height(500),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({ top: 80, left: 20, bottom: 104, right: 24 })
    // .title("Put headline here")
        .height(700)
        .fullYear(true),

    print: gChartframe.printFrame(sharedConfig)
        .margin({ top: 40, left: 7, bottom: 35, right: 7 })
    // .title("Put headline here")
        //Print column sizes-- 1col 53.71mm: 2col 112.25mm: 3col 170.8mm: 4col 229.34mm: 5col 287.88mm: 6col 346.43,
        .width(112.25)
        .height(69.85),


    social: gChartframe.socialFrame(sharedConfig)
        .margin({ top: 140, left: 50, bottom: 138, right: 40 })
    // .title("Put headline here")
        .width(612)
        .height(612),

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

parseData.fromCSV(dataFile, { sort }).then(({ valueExtent, plotData, seriesNames }) => {
    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];
        console.log('seriesNames', seriesNames)
        const partyColours = d3.scaleOrdinal()
                // .domain(Object.keys(gChartcolour.germanPoliticalParties_bar))
                // .range(Object.values(gChartcolour.germanPoliticalParties_bar));
                .domain(['cducsu','spd','fdp','left','afd','green','other'])
                .range(['#33302E','#F34D5B','#fcc83c','#B3325D','#1E8FCC','#AECC70','#CEC6B9']);

        const myXAxis = gAxis.xLinear();// sets up yAxis
        const myYAxis = gAxis.yOrdinal();
        const myChart = stackedBarChart.draw(); // eslint-disable-line
        const myLegend = gLegend.legend();

        // define other functions to be called
        const tickSize = currentFrame.dimension().height + (currentFrame.rem() * 1.4);// Used when drawing the xAxis ticks

        myYAxis
            .align(yAxisAlign)
            .domain(plotData.map(d => d.name))
            .rangeRound([0, tickSize], 10)
            .frameName(frameName);

        myXAxis
            .align(xAxisAlign)
            .domain([Math.min(xMin, valueExtent[0]), Math.max(xMax, valueExtent[1])])
            .numTicks(numTicks)
            .xAxisHighlight(xAxisHighlight)
            .frameName(frameName);

        const base = currentFrame.plot().append('g'); // eslint-disable-line

        currentFrame.plot()
            .call(myYAxis);

        // return the value in the variable newMargin
        if (yAxisAlign === 'right') {
            const newMargin = myYAxis.labelWidth() + currentFrame.margin().right;
            // Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({ right: newMargin });
            myYAxis.yLabel().attr('transform', `translate(${currentFrame.dimension().width},0)`);
        }
        if (yAxisAlign === 'left') {
            const newMargin = myYAxis.labelWidth() + currentFrame.margin().left;
            // Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({ left: newMargin });
            // myYAxis.yLabel().attr('transform', `translate(${(myYAxis.tickSize()-myYAxis.labelWidth())},0)`);
        }

        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        myXAxis
            .range([0, currentFrame.dimension().width])
            .tickSize(tickSize);

        currentFrame.plot()
            .call(myXAxis);


        if (xAxisAlign === 'top') {
            myXAxis.xLabel().attr('transform', `translate(0,${myXAxis.tickSize()})`);
        }

        myChart
            .xRange([0, currentFrame.dimension().width])
            .plotDim(currentFrame.dimension())
            .seriesNames(seriesNames)
            .rem(currentFrame.rem())
            .colourPalette(partyColours)
            .xScale(myXAxis.scale())
            .yScale(myYAxis.scale());

        currentFrame.plot()
            .selectAll('.columnHolder')
            .data(plotData)
            .enter()
            .append('g')
            .attr('class', d => `${d.name}_columnHolder`)
            .call(myChart);

        // Set up legend for this frame
        myLegend
            .seriesNames(seriesNames)
            .geometry(legendType)
            .frameName(frameName)
            .rem(myChart.rem())
            .alignment(legendAlign)
            .colourPalette(partyColours);

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
    });
    // addSVGSavers('figure.saveable');
});
