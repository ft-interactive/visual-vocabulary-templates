/**
 * Bootstrapping code for line chart
 */

import * as d3 from 'd3';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as barChart from './smallMultiBarChart.js';

const dataFile = "https://bertha.ig.ft.com/view/publish/dsv/1IDBJ41ukUbMzeKxkeU9Geu2qMhKlqVyG7YwFx98savw/supplementary.csv";

const sharedConfig = {
    title: 'How the swing states won the election',
    subtitle: 'Subtitle not yet added',
    source: 'Based on a concept from The New York Times 2000) Source not yet added',
};

const yMin = 0;// sets the minimum value on the yAxis
const yMax = 330;// sets the maximum value on the xAxis
const leftXMin = 0;
const leftXMax = 80;
const rightXMin = 0;
const rightXMax = 50;
const numTicksy = 5;
const numTicksL = 5;// Number of tick on the uAxis
const numTicksR = 2;// Number of tick on the uAxis
const columnNames = ["2012", "2016"];
const invertScale = true;
const logScale = false
const divisor = 1;
const wrapLemgth = 5
const yAxisHighlight = 270; // sets which tick to highlight on the yAxis
const yAxisAlign = 'left';// alignment of the axis
const xAxisAlign = 'bottom';// alignment of the axis
const colorScale = d3
	.scaleOrdinal()
	.domain(["Democrat", "Republican"])
	.range(["#1056B6", "#ED4748"]);
// Individual frame configuration, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
        .margin({
            top: 10, left: 0, bottom: 88, right: 5,
        })
    // .title('Put headline here') // use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(850)
        .extend('numberOfColumns', 1)
        .extend('numberOfRows', 2),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({
            top: 10, left: 0, bottom: 88, right: 7,
        })
    // .title("Put headline here")
        .height(700)
        .extend('numberOfColumns', 2)
        .extend('numberOfRows', 1),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({
            top: 10, left: 0, bottom: 80, right: 7,
        })
    // .title("Put headline here")
        .height(900)
        .fullYear(true)
        .extend('numberOfColumns', 2)
        .extend('numberOfRows', 1),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({
            top: 10, left: 0, bottom: 80, right: 10,
        })
    // .title("Put headline here")
        .height(600)
        .extend('numberOfColumns', 2)
        .extend('numberOfRows', 1),

    print: gChartframe.printFrame(sharedConfig)
        .margin({
            top: 40, left: 7, bottom: 35, right: 7,
        })
    // .title("Put headline here")
    // .width(53.71)// 1 col
        .width(112.25)// 2 col
    // .width(170.8)// 3 col
    // .width(229.34)// 4 col
    // .width(287.88)// 5 col
    // .width(346.43)// 6 col
    // .width(74)// markets std print
        .height(150)// markets std print
        .extend('numberOfColumns', 2)
        .extend('numberOfRows', 1),

       social: gChartframe.socialFrame(sharedConfig)
    .margin({ top: 140, left: 50, bottom: 138, right: 40 })
    // .title("Put headline here")
    .width(612)
    .height(612) // 700 is ideal height for Instagram
    .extend('numberOfColumns', 2)
    .extend('numberOfRows', 1),

    video: gChartframe.videoFrame(sharedConfig)
        .margin({
            left: 207, right: 207, bottom: 210, top: 233,
        })
    // .title("Put headline here")
        .extend('numberOfColumns', 2)
        .extend('numberOfRows', 1)
        ,
};


// add the frames to the page...
d3.selectAll('.framed')
    .each(function addFrames() {
        const figure = d3.select(this);
        figure.select('svg')
            .call(frame[figure.node().dataset.frame]);
    });
parseData
	.load(dataFile, {columnNames, yMin, divisor })
	.then(({ data, plotData, valueExtent }) => {
		Object.keys(frame).forEach((frameName, i) => {
			const currentFrame = frame[frameName];

			// define other functions to be called
			const yAxis = gAxis.yLinear(); // sets up date xAxis
			const xLeftAxis = gAxis.xLinear(); // sets up yAxis
			const xRightAxis = gAxis.xLinear();
			const stack = barChart.draw();
			const rem = currentFrame.rem();

			// Create the plot widths, but for each individual graph
			let chartWidth =
				currentFrame.dimension().width / currentFrame.numberOfColumns() -
				currentFrame.rem() * 1.5;
			const chartHeight =
				currentFrame.dimension().height / currentFrame.numberOfRows() -
				currentFrame.rem() * 1.5;

			const tickSize = currentFrame.dimension().width; // Used when drawing the yAxis ticks
			const chart = currentFrame
				.plot()
				.selectAll("g")
				.data(plotData)
				.enter()
				.append("g")
				.attr("id", (d) => d.name)
				.attr("class", "columnHolder");
			
			yAxis
				.rem(rem)
				.divisor(divisor)
				.domain([yMax, 0])
				.range([chartHeight, 0])
				.tickValues([0, 50, 100, 150, 200, 270])
				.tickSize(chartWidth)
				.align(yAxisAlign)
				.frameName(frameName)
				.invert(invertScale)
				.logScale(logScale)
				.yAxisHighlight(yAxisHighlight);

			// Draw the yAxis first, this will position the yAxis correctly and
			// measure the width of the label text
			chart.call(yAxis);

			// return the value in the variable newMargin
			if (yAxisAlign === "right") {
				const newMargin = yAxis.labelWidth() + currentFrame.margin().right;
				// Use newMargin redefine the new margin and range of xAxis
				currentFrame.margin({ right: newMargin });
				// yAxis.yLabel().attr('transform', `translate(${currentFrame.dimension().width},0)`);
			}
			if (yAxisAlign === "left") {
				const newMargin = yAxis.labelWidth() + currentFrame.margin().left;
				// Use newMargin redefine the new margin and range of xAxis
				currentFrame.margin({ left: newMargin });
				yAxis
					.yLabel()
					.attr(
						"transform",
						`translate(${yAxis.tickSize() - yAxis.labelWidth()},0)`
					);
			}
			d3.select(currentFrame.plot().node().parentNode).call(currentFrame);
			chartWidth = chartWidth - yAxis.labelWidth();

			const macValue = leftXMax + rightXMax;
			const percentile = chartWidth / macValue;

			xLeftAxis
				.tickSize(currentFrame.rem() * 0.75)
				.align(xAxisAlign)
				.range([0, percentile * leftXMax])
				.domain([leftXMax, 0])
				.numTicks(numTicksL)
				.frameName(frameName)
				.logScale(logScale)
				.divisor(divisor);

			xRightAxis
				.tickSize(currentFrame.rem() * 0.75)
				.align(xAxisAlign)
				.range([percentile * leftXMax, chartWidth])
				.domain([0, rightXMax])
				.numTicks(numTicksR)
				.frameName(frameName)
				.logScale(logScale)
				.divisor(divisor);

			chart.call(xLeftAxis);
			chart.call(xRightAxis);

			if (xAxisAlign === "bottom") {
				xLeftAxis.xLabel().attr("transform", `translate(0,${chartHeight})`);
				xRightAxis.xLabel().attr("transform", `translate(0,${chartHeight})`);
			}
			if (xAxisAlign === "top") {
				xLeftAxis.xLabel().attr("transform", `translate(0,0)`);
				xRightAxis.xLabel().attr("transform", `translate(0,0)`);
			}
			stack
				.yScale(yAxis.scale())
				.xLeftScale(xLeftAxis.scale())
				.xRightScale(xRightAxis.scale())
				.chartWidth(chartWidth)
				.colourPalette(colorScale)
				.rem(currentFrame.rem());

			chart.call(stack);

			chart.attr("transform", (d, i) => {
				const yPos = Number(
					Math.floor(i / currentFrame.numberOfColumns()) *
						(chartHeight + currentFrame.rem() * 3.5)
				);
				const xPos = i % currentFrame.numberOfColumns();
				return `translate(${
					(chartWidth + currentFrame.rem() * 2.5) * xPos + currentFrame.rem()
				}, ${yPos})`;
			});

			chart.each(function hideLabels(d,i) {
				if (i === 0 && frameName != "webS") {
					d3.select(this)
						.selectAll(".yAxis .tick text")
						.style("visibility", "hidden")
				}
				if (i > 0 && frameName != "webS") {
					d3.select(this)
						.selectAll(".yAxis .tick text")
						.style("text-anchor", "middle")
						.attr("transform", `translate(${0 - rem * 1.3},0)`);
				}
			});

			currentFrame
				.plot()
				.append("g")
				.attr("class", "chart-label")
				.append("text")
				.attr("x", currentFrame.dimension().width / 2)
				.attr("y", currentFrame.dimension().height + currentFrame.rem() * 1.5)
				.attr("text-anchor", "middle")
				.text("Margin of victory in each state (% of popular vote)");

			const yScale = yAxis.scale();

			currentFrame
				.plot()
				.append("g")
				.attr("class", "axis xAxis")
				.append("text")
				.attr("x", currentFrame.dimension().width / 2)
				.attr("y", yScale(270) + (currentFrame.rem()*1.2))
				.attr("text-anchor", "middle")
				.text("Electoral votes needed to win");
			
			currentFrame
				.plot()
				.append("g")
				.append("text")
				.attr("class", "chart-label")
				.attr("x", 0 - yScale(150))
				.attr("y", 0 - rem * .8)
				.attr("transform", function (d) {
					return "rotate(-90)";
				})
				.attr("text-anchor", "middle")
				.text("Number of electoral college votes per state");

		});

});
