import * as d3 from 'd3';
import * as gAxis from 'g-axis';
import * as gLegend from 'g-legend';
import gChartframe from 'g-chartframe';
import * as parseData from './parseData.js';
import * as barcode from './barcode.js';
import { draw, annotateHistogram } from './histogram.js';

const dataURL = 'data.csv';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
    sectorHeading: 'Sector heading goes here',
};

const xMin = -80;// sets the minimum value on the yAxis
const xMax = 80;// sets the maximum value on the xAxis
const divisor = 1;// sets the formatting on linear axis for ’000s and millions
const numTicksX = 10;// Number of tick on the uAxis
const numTicksY = 4;// Number of tick on the uAxis
const yAxisAlign = 'left';
const geometry = 'rect'; // set the geometry of the data options are 'circle' or 'rect'
const barCodeSection = 'Information and communication'; // set the section to show on the barcode plot
/*
  # [1] "Manufacturing"
  # [2] "Accommodation and food service activities"
  # [3] "Wholesale and retail trade; repair of motor vehicles and motorcycles"
  # [4] "Human health and social work activities"
  # [5] "Other service activities"
  # [6] "Professional, scientific and technical activities"
  # [7] "Information and communication"
  # [8] "Administrative and support service activities"
  # [9] "Public Sector"
  # [10] "Financial and insurance activities"
  # [11] "Water supply, sewerage, waste management and remediation activities"
  # [12] "Education"
  # [13] "Arts, entertainment and recreation"
  # [14] "Construction"
  # [15] "Public administration and defence; compulsory social security"
  # [16] "Transportation and storage"
  # [17] "Real estate activities"
  # [18] "Agriculture, Forestry and Fishing"
  # [19] "Electricity, gas, steam and air conditioning supply"
  # [20] "Mining and Quarrying"
*/
const binWidth = 2;

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
        .margin({
            top: 100, left: 25, bottom: 82, right: 24,
        })
    // .title("Put headline here") //use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(440),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 35,
        })
    // .title("Put headline here")
        .height(500),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({
            top: 100, left: 40, bottom: 86, right: 15,
        })
    // .title("Put headline here")
        .height(720),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({
            top: 100, left: 30, bottom: 104, right: 35,
        })
    // .title("Put headline here")
        .height(700),

    print: gChartframe.printFrame(sharedConfig)
        .margin({
            top: 40, left: 20, bottom: 35, right: 7,
        })
    // .title("Put headline here")
        .width(53.71)// 1 col
    // .width(112.25)// 2 col
    // .width(170.8)// 3 col
    // .width(229.34)// 4 col
    // .width(287.88)// 5 col
    // .width(346.43)// 6 col
    // .width(74)// markets std print
        .height(69.85), // std print (Use 58.21mm for markets charts that matter)

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

parseData.load(dataURL, { binWidth, xMin, xMax })
    .then(({
        valueExtent, plotData, sectionData, data, companiesToAnnotate, groupedData, yMax, lookup, binnedData
    }) => { // eslint-disable-line no-unused-vars
    // Draw the frames
        Object.keys(frame).forEach((frameName) => {
            const currentFrame = frame[frameName];
            // define other functions to be called
            const xAxisBottom = gAxis.xLinear();
            const xAxisTop = gAxis.xLinear();
            const yAxis = gAxis.yLinear();
            const myBarcode = barcode.draw();
            const myHistogram = draw();
            const annotate = annotateHistogram();

            xAxisBottom
                .align('bottom')
                .domain([xMin, xMax])
                .numTicks(numTicksX)
                .frameName(frameName)
                .divisor(divisor);

            xAxisTop
                .align('top')
                .domain([xMin, xMax])
                .numTicks(numTicksX)
                .frameName(frameName)
                .divisor(divisor);

            yAxis
                .align(yAxisAlign)
                .domain([0, yMax])
                .numTicks(numTicksY)
                .frameName(frameName)
                .divisor(divisor);

            const histogramBase = currentFrame.plot().append('g'); // eslint-disable-line no-unused-vars
            const barCodeBase = currentFrame.plot().append('g'); // eslint-disable-line no-unused-vars

            const xTickSize = currentFrame.rem() / 2;
            const barCodeHeight = currentFrame.dimension().height * 0.15;

            // Set the plot object to its new dimensions
            d3.select(currentFrame.plot().node().parentNode)
                .call(currentFrame);
            // Use new widtth of frame to set the range of the x-axis and any other parameters
            xAxisBottom
                .range([0, currentFrame.dimension().width])
                .tickSize(xTickSize);

            xAxisTop
                .range([0, currentFrame.dimension().width])
                .tickSize(xTickSize);


            // Use new widtth of frame to set the range of the x-axis and any other parameters
            yAxis
                .range([currentFrame.dimension().height * 0.7, 0])
                .tickSize(-currentFrame.dimension().width);

            histogramBase
                .call(yAxis);

            // Call the axis and move it if needed
            histogramBase
                .call(xAxisTop);

            // Call the axis and move it if needed
            barCodeBase
                .call(xAxisBottom);

            // Move barcode x axis
            barCodeBase.select('.axis.xAxis')
                .attr('transform', `translate(0,${-xTickSize + barCodeHeight})`);
            barCodeBase.select('.axis.xAxis')
                .append('line')
                .attr('class', 'baseline')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', currentFrame.dimension().width)
                .attr('y2', 0);

            barCodeBase.append('text')
                .attr('class', 'chart-subtitle-2')
                .attr('x', -currentFrame.margin().left)
                .attr('y', -xTickSize)
                .text(sharedConfig.sectorHeading);

            // Move histogram
            histogramBase.attr('transform', `translate(0,${xTickSize * 3})`);
            // Move histogram x axis
            histogramBase.select('.axis.xAxis')
                .attr('transform', `translate(0,${-xTickSize * 2})`);
            histogramBase.select('.axis.xAxis').selectAll('.tick line')
                .attr('transform', `translate(0,${xTickSize / 2})`);

            if (yAxisAlign === 'right') {
                histogramBase.select('.axis.yAxis')
                    .attr('transform', `translate(${currentFrame.dimension().width},0)`);
            }

            barCodeBase.attr('transform', `translate(0,${currentFrame.dimension().height * 0.87})`);

            const xScaleBarcode = xAxisBottom.scale();
            const yScaleHistogram = yAxis.scale();

            myBarcode
                .xScale(xScaleBarcode)
                .rem(currentFrame.rem())
                .geometry(geometry)
                .frameName(frameName)
                .dim({ width: currentFrame.dimension().width, height: barCodeHeight });

            myHistogram
                .yScale(yScaleHistogram)
                .xScale(xScaleBarcode)
                .rem(currentFrame.rem())
                .frameName(frameName)
                .dim({ width: currentFrame.dimension().width, height: currentFrame.dimension().height * 0.7 })
                .binWidth(binWidth);

            annotate
                .yScale(yScaleHistogram)
                .xScale(xScaleBarcode)
                .rem(currentFrame.rem())
                .frameName(frameName)
                .dim({ width: currentFrame.dimension().width, height: currentFrame.dimension().height * 0.7 });

            const section = sectionData.find(el => el.key === barCodeSection);
            const companiesToShow = section.values.filter(d => companiesToAnnotate.includes(d.name));
            const binnedDataToShow = binnedData.filter(d => companiesToAnnotate.includes(d.name));
            const uniqueBinnedDataToShow = [];
            binnedDataToShow.forEach((d) => {
                if (!uniqueBinnedDataToShow.find(x => d.name === x.name)) {
                    uniqueBinnedDataToShow.push(d);
                }
            });

            histogramBase
                .append('g')
                .selectAll('.histobars')
                .data(groupedData)
                .enter()
                .append('g')
                .attr('class', 'histobarholder')
                .call(myHistogram);

            histogramBase
                .append('g')
                .selectAll('.histoannos')
                .data(uniqueBinnedDataToShow)
                .enter()
                .append('g')
                .attr('class', 'histoannoholder')
                .call(annotate);

            // Draw unhighlighted first
            barCodeBase
                .append('g')
                .selectAll('.barholder')
                .data(section.values)
                .enter()
                .append('g')
                .attr('class', 'barholder baseline')
                .call(myBarcode);

            barCodeBase
                .append('g')
                .attr('class', 'median')
                .attr('transform', `translate(${xScaleBarcode(section.median)},${currentFrame.dimension().height / 16})`);

            // Then draw highlighted rects next
            const highlighted = barCodeBase
                .append('g')
                .selectAll('.barHighlight')
                .data(companiesToShow)
                .enter()
                .append('g')
                .attr('class', 'barHighlight axis xAxis')
                .call(myBarcode);

            highlighted
              .selectAll('rect')
              .attr('y', barCodeHeight * 0.15)
              .attr('height', barCodeHeight * 0.6)

            barCodeBase
                .selectAll('text.barAnnotation')
                .data(companiesToShow)
                .enter()
                .append('text')
                .attr('class', 'annotation-text')
                .attr('text-anchor', 'middle')
                .attr('y', xTickSize * 0.75)
                .attr('x', d => xScaleBarcode(d.medianPayDiff))
                .text(d => `${d.clean_name}`);
        });
    // addSVGSavers('figure.saveable');
    });
