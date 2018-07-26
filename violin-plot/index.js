/**
 * Bootstrapping code for line chart
 */

import * as d3 from "d3";
import * as gLegend from "g-legend";
import gChartframe from "g-chartframe";
import * as gAxis from "g-axis";
import * as parseData from "./parseData.js";
import * as violinPlot from "./violinPlot.js";

const dataFile = "data.csv";

const dateFormat = "%d/%m/%Y";
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
    title: "Title not yet added",
    subtitle: "Subtitle not yet added",
    source: "Source not yet added"
};

const yMin = 0;
const yMax = 150;
const yAxisAlign = "right";
const xAxisAlign = "bottom";
const numTicks = 5;
const minProbability = 0.000001; // This will cut off values from the top and bottom of the distribution
const kernelBandwidth = "nrd"; // Set this to a number to use a custom bandwidth

// Individual frame configuration, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe
        .webFrameS(sharedConfig)
        .margin({ top: 100, left: 15, bottom: 82, right: 5 })
        // .title('Put headline here') // use this if you need to override the defaults
        // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(400),

    webM: gChartframe
        .webFrameM(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 86, right: 5 })
        // .title("Put headline here")
        .height(500),

    webL: gChartframe
        .webFrameL(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 104, right: 5 })
        // .title("Put headline here")
        .height(700)
        .fullYear(true),

    webMDefault: gChartframe
        .webFrameMDefault(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 86, right: 5 })
        // .title("Put headline here")
        .height(500),

    print: gChartframe
        .printFrame(sharedConfig)
        .margin({ top: 40, left: 7, bottom: 35, right: 7 })
        // .title("Put headline here")
        .width(53.71) // 1 col
        // .width(112.25)// 2 col
        // .width(170.8)// 3 col
        // .width(229.34)// 4 col
        // .width(287.88)// 5 col
        // .width(346.43)// 6 col
        // .width(74)// markets std print
        .height(69.85), // std print (Use 58.21mm for markets charts that matter)

    social: gChartframe
        .socialFrame(sharedConfig)
        .margin({ top: 140, left: 40, bottom: 138, right: 40 })
        // .title("Put headline here")
        .width(612)
        .height(612), // 700 is ideal height for Instagram

    video: gChartframe
        .videoFrame(sharedConfig)
        .margin({ left: 207, right: 207, bottom: 210, top: 233 })
    // .title("Put headline here")
};

// add the frames to the page...
d3.selectAll(".framed").each(function addFrames() {
    const figure = d3.select(this).attr("class", "button-holder");

    figure.select("svg").call(frame[figure.node().dataset.frame]);
});

parseData
    .load(dataFile, { yMin, yMax, kernelBandwidth, minProbability })
    .then(({ plotData, valueExtent, maxProbability }) => {
        Object.keys(frame).forEach(frameName => {
            const currentFrame = frame[frameName];

            const yAxis = gAxis.yLinear();
            const xAxis = gAxis.xOrdinal();
            let xMinorScale;
            const myChart = violinPlot.draw();
            const tickSize = currentFrame.dimension().width;

            yAxis
                .align(yAxisAlign)
                .domain([
                    Math.min(yMin, valueExtent[0]),
                    Math.max(yMax, valueExtent[1])
                ])
                .range([currentFrame.dimension().height, 0])
                .numTicks(numTicks)
                .tickSize(tickSize)
                .frameName(frameName);

            currentFrame.plot().call(yAxis);

            xAxis
                .align(xAxisAlign)
                .domain(plotData.map(d => d.group))
                .rangeRound([0, currentFrame.dimension().width])
                .frameName(frameName);

            currentFrame.plot().call(xAxis);

            xMinorScale = d3
                .scaleLinear()
                .domain([0, maxProbability])
                .range([0, xAxis.scale().bandwidth() / 2]);

            if (xAxisAlign === "bottom") {
                xAxis
                    .xLabel()
                    .attr(
                        "transform",
                        `translate(0,${currentFrame.dimension().height})`
                    );
            }

            myChart
                .yScale(yAxis.scale())
                .xMinorScale(xMinorScale)
                .xScale(xAxis.scale());

            currentFrame
                .plot()
                .selectAll(".violin-plot")
                .data(plotData)
                .enter()
                .append("g")
                .attr("class", "violin-plot")
                .attr(
                    "transform",
                    d => `translate(${xAxis.scale()(d.group)}, 0)`
                )
                .call(myChart);
        });
        // addSVGSavers('figure.saveable');
    });
