import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import * as gLegend from 'g-legend';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as stackedColumnChart from './stackedColumnChart.js';

// User defined constants similar to version 2
const dateStructure = '%d/%m/%Y';

const dataFile = 'data.csv';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};
let yMin = 0;// sets the minimum value on the yAxis
let yMax = 0;// sets the maximum value on the yAxis
const yAxisHighlight = 100; // sets which tick to highlight on the yAxis
const numTicksy = 5;// Number of tick on the uAxis
const yAxisAlign = 'left';// alignment of the axis
const xAxisAlign = 'bottom';// alignment of the axis
const legendAlign = 'hori';// hori or vert, alignment of the legend
const legendType = 'rect'; // rect, line or circ, geometry of legend marker

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

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
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
   .height(69.85)
   .width(55),

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

parseData.fromCSV(dataFile, dateStructure).then(({ valueExtent, columnNames, seriesNames, data }) => {
    // make sure all the dates in the date column are a date object
    // var parseDate = d3.timeParse("%d/%m/%Y")
    // data.forEach(function(d) {
    //             d.date=parseDate(d.date);
    //         });

    // automatically calculate the seriesnames excluding the "name" column
    console.log(seriesNames)
    // define chart
    const myChart = stackedColumnChart.draw() // eslint-disable-line
          .seriesNames(seriesNames)
          .yAxisAlign(yAxisAlign);

    // Buid the dataset for plotting
    const plotData = data.map(d => ({
        name: d.name,
        bands:getBands(d),
        total:d3.sum(getBands(d), function(d) { return d.height; })
    }));

    function getBands(el) {
        let posCumulative=0;
        let negCumulative=0;
        let baseY=0
        let baseY1=0
        var bands=seriesNames.map(function(name,i) {
            if(el[name]>0){
                baseY1=posCumulative
                posCumulative = posCumulative+(+el[name]);
                baseY=posCumulative;
            }
            if(el[name]<0){
                baseY1=negCumulative
                negCumulative = negCumulative+(+el[name]);
                baseY=negCumulative;
                if (i<1){baseY=0;baseY1=negCumulative}
            }
            return {
                name: name,
                y: +baseY,
                y1:+baseY1,
                height:+el[name]
            }
        });
        yMin = Math.min(yMin,negCumulative)
        yMax = Math.max(yMax,posCumulative)
       return bands
    }


    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        const myXAxis = gAxis.xOrdinal();// sets up yAxis
        const myYAxis = gAxis.yLinear();
        const myChart = stackedColumnChart.draw(); // eslint-disable-line
        const myLegend = gLegend.legend();

        // define other functions to be called
        const tickSize = currentFrame.dimension().width;// Used when drawing the yAxis ticks

        myChart
            .yRange([currentFrame.dimension().height, 0])
            .plotDim(currentFrame.dimension())
            .rem(currentFrame.rem())
            .colourPalette((frameName));

        myYAxis
            .scale(myChart.yScale())
            .numTicks(numTicksy)
            .tickSize(tickSize)
            .yAxisHighlight(yAxisHighlight)
            .align(myChart.yAxisAlign())

        myYAxis
            .align(yAxisAlign)
            .domain([Math.min(yMin, valueExtent[0]), Math.max(yMax, valueExtent[1])])
            .numTicks(numTicksy)
            .frameName(frameName);

        const base = currentFrame.plot().append('g'); // eslint-disable-line

        currentFrame.plot()
          .call(myYAxis);

        //return the value in the variable newMargin
        if (yAxisAlign == 'right' ){
            let newMargin = myYAxis.labelWidth()+currentFrame.margin().right
            //Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({right:newMargin});
            //yAxis.yLabel().attr('transform', `translate(${currentFrame.dimension().width},0)`);
        }
        if (yAxisAlign == 'left' ){
            let newMargin = myYAxis.labelWidth()+currentFrame.margin().left
            //Use newMargin redefine the new margin and range of xAxis
            currentFrame.margin({left:newMargin});
            myYAxis.yLabel().attr('transform', `translate(${(myYAxis.tickSize()-myYAxis.labelWidth())},0)`);
        }
        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        myXAxis
            .align(xAxisAlign)
            .domain(columnNames)
            .rangeRound([0, currentFrame.dimension().width], 10)
            .frameName(frameName);

        myChart
            .xScale(myXAxis.scale())
            // .yScale(myYAxis.yScale())

        currentFrame.plot()
          .call(myXAxis);

        if (xAxisAlign == 'bottom' ){
            myXAxis.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
        }
        if (xAxisAlign == 'top' ){
            myXAxis.xLabel().attr('transform', `translate(0,${myXAxis.tickSize()})`);
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
            .seriesNames(seriesNames)
            .geometry(legendType)
            .frameName(frameName)
            .rem(myChart.rem())
            .alignment(legendAlign)
            .colourPalette((frameName));

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
