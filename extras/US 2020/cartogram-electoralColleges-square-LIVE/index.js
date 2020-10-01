/**
 * Bootstrapping code for line chart
 */

import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import gChartcolour from 'g-chartcolour';
import * as parseData from './parseData.js';
import * as cartogram from './drawChart.js';

//THIS TEMPLATE IS A LIVE FEED AND WILL NOT WORK WORK LOCAL CSV DUE TO COLUMNS NAME CHANGES
const dataFile = 'https://bertha.ig.ft.com/view/publish/dsv/1IDBJ41ukUbMzeKxkeU9Geu2qMhKlqVyG7YwFx98savw/supplementary.csv';
const shapefile = 'squareColleges.json';
const mobileSVG = 'US.svg';//name of file used in mobile

//LOWER CASE ALL COLUMN NAMES EG- raceWinnerParty2012 BECOMES racewinnerparty2012.
const columnNames = ['racewinnerparty2012','racewinnerparty2016']

const sharedConfig = {
  title: 'Electoral college votes by state',
  subtitle: 'Subtitle not yet added',
  source: 'Source: Not yet added',
};

//Imput values into the domain of this scale to create manual scale breaks
let colorScale = d3.scaleOrdinal()
//   .domain(Object.keys(gChartcolour.usPoliticalPartiesSmallArea))
//   .range(Object.values(gChartcolour.usPoliticalPartiesSmallArea));
	  .domain(["Democrat", "Republican"])
	.range(["#1056B6", "#ED4748"]);
	
d3.xml(mobileSVG).mimeType("image/svg+xml").get(function (error, xml) {
  if (error) throw error;
  // Individual frame configuration, used to set margins (defaults shown below) etc
  const frame = {
		webS: gChartframe
			.webFrameS(sharedConfig)
			.margin({ top: 100, left: 15, bottom: 82, right: 25 })
			// .title('Put headline here') // use this if you need to override the defaults
			// .subtitle("Put headline |here") //use this if you need to override the defaults
			.height(600)
			.extend("numberOfColumns", 1)
			.extend("numberOfRows", 2)
			.extend("viewbox", "5 20 350 280")
			.extend("svg", xml.documentElement.cloneNode(true)),

		webM: gChartframe
			.webFrameM(sharedConfig)
			.margin({
				top: 100,
				left: 20,
				bottom: 86,
				right: 5,
			})
			// .title("Put headline here")
			.height(420)
			.extend("numberOfColumns", 2)
			.extend("numberOfRows", 1)
			.extend("viewbox", "0 -10 650 430")
			.extend("svg", xml.documentElement.cloneNode(true)),

		webL: gChartframe
			.webFrameL(sharedConfig)
			.margin({
				top: 100,
				left: 20,
				bottom: 104,
				right: 5,
			})
			// .title("Put headline here")
			.height(600)
			.fullYear(true)
			.extend("numberOfColumns", 2)
			.extend("numberOfRows", 1)
			.extend("viewbox", "5 0 100 70")
			.extend("svg", xml.documentElement.cloneNode(true)),

		webMDefault: gChartframe
			.webFrameMDefault(sharedConfig)
			.margin({
				top: 100,
				left: 20,
				bottom: 86,
				right: 5,
			})
			// .title("Put headline here")
			.height(430)
			.extend("numberOfColumns", 2)
			.extend("numberOfRows", 1)
			.extend("viewbox", "5 0 100 70")
			.extend("svg", xml.documentElement.cloneNode(true)),

		print: gChartframe
			.printFrame(sharedConfig)
			.margin({ top: 30, left: 7, bottom: 35, right: 7 })
			// .title("Put headline here")
			//.width(53.71)// 1 col
			//.width(112.25)// 2 col
			.width(170.8) // 3 col
			// .width(229.34)// 4 col
			// .width(287.88)// 5 col
			// .width(346.43)// 6 col
			// .width(74)// markets std print
			.height(90)
			.extend("numberOfColumns", 2)
			.extend("numberOfRows", 1)
			.extend("viewbox", "5 0 100 70")
			.extend("svg", xml.documentElement.cloneNode(true)), // std print (Use 58.21mm for markets charts that matter)

		social: gChartframe
			.socialFrame(sharedConfig)
			.margin({
				top: 140,
				left: 50,
				bottom: 138,
				right: 30,
			})
			// .title("Put headline here")
			.width(612)
			.height(612)
			.extend("numberOfColumns", 2)
			.extend("numberOfRows", 1)
			.extend("viewbox", "5 0 100 70")
			.extend("svg", xml.documentElement.cloneNode(true)), // 700 is ideal height for Instagram

		video: gChartframe
			.videoFrame(sharedConfig)
			.margin({
				left: 207,
				right: 207,
				bottom: 210,
				top: 233,
			})
			.extend("numberOfColumns", 2)
			.extend("numberOfRows", 1)
			.extend("viewbox", "5 0 100 70")
			.extend("svg", xml.documentElement.cloneNode(true)),
		// .title("Put headline here")
	};

  // add the frames to the page...
  d3.selectAll('.framed')
    .each(function addFrames() {
      const figure = d3.select(this)
        .attr('class', 'button-holder');

      figure.select('svg')
        .call(frame[figure.node().dataset.frame]);
    });

  parseData.load([dataFile, shapefile,], { columnNames })
    .then(({ plotData, valueExtent }) => {
      Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        const plotDim = [currentFrame.dimension().width, currentFrame.dimension().height]
        const mapWidth = plotDim[0] / currentFrame.numberOfColumns() - (currentFrame.rem() * 1.5)
        const mapDim = [mapWidth, (mapWidth * .9)];

        const carto = cartogram.draw();

        carto
					.mapDim(mapDim)
					//.viewbox(currentFrame.viewbox())
					.shapeData(currentFrame.svg())
					.valueExtent(valueExtent)
					.colourPalette(colorScale);

        const map = currentFrame
					.plot()
					.selectAll(".cartoHolder")
					.data(plotData)
					.enter()
					.append("g")
					.attr("class", "cartoHolder")
					.call(carto);

        carto
          .mapDim(mapDim)
          .shapeData(currentFrame.svg())
          .valueExtent(valueExtent)
          .colourPalette(colorScale);

        map
					.attr("transform", (d, i) => {
						const yPos = Number(Math.floor(i / currentFrame.numberOfColumns()) * mapDim[1]);
						const xPos = i % currentFrame.numberOfColumns();
						return `translate(${
							(mapDim[0] + currentFrame.rem() * 1.5) * xPos
						}, ${yPos})`;
          })

      });
    });



});

