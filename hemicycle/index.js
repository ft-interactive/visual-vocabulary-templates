import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import * as gChartcolour from 'g-chartcolour';
import * as gLegend from 'g-legend';
import * as hemicycle from './hemicycle.js';
import * as parseData from './parseData.js';

const dataFile = 'bundestag2013.csv';

const legendAlign = 'vert';// hori or vert, alignment of the legend
const legendType = 'line';// rect, line or circ, geometry of legend marker

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};

const parties = {
    llamas: '#ff0000',
    avocados: '#00ff00',
    ducks: '#0000ff',
};

const partyOrder = {
    llamas: 1,
    ducks: 2,
    avocados: 3,
    empty: 99,
};

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 86, right: 20 })
        // .title("Put headline here")
        .height(500),

    webS: gChartframe.webFrameS(sharedConfig)
        .margin({ top: 100, left: 5, bottom: 100, right: 5 })
        // .title("Put headline here") //use this if you need to override the defaults
        // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 100, right: 20 })
        // .title("Put headline here")
        .height(500),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({ top: 150, left: 40, bottom: 100, right: 40 })
        // .title("Put headline here")
        .height(700),

    print: gChartframe.printFrame(sharedConfig)
        .margin({ top: 20, left: 7, bottom: 50, right: 7 })
        // .title("Put headline here")
        .height(68)
        .width(55),

    social: gChartframe.socialFrame(sharedConfig)
        .margin({ top: -0, left: 10, bottom: 200, right: 10 })
        // .title("Put headline here")
        .height(750), // 700 is ideal height for Instagram

    video: gChartframe.videoFrame(sharedConfig)
        .margin({ left: 120, right: 120, bottom: 210, top: 233 }),
    // .title("Put headline here")
};

// add the frames to the page...
d3.selectAll('.framed')
    .each(function addFrames() {
        const figure = d3.select(this);
        figure.select('svg')
            .call(frame[figure.node().dataset.frame]);
    });

parseData.fromCSV(dataFile).then(({ data, plotData }) => {
    // define chart
    const myChart = hemicycle.draw()
        .datasize(data.reduce((col, d) => col + Number(d.seats), 0));

    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];
        const { width, height } = currentFrame.dimension();
        const widthMargin = currentFrame.margin().left + currentFrame.margin().right;
        const myLegend = gLegend.legend();// sets up the legend

        myChart.angleScaleDomain([0, (myChart.datasize() / myChart.rows()) - 1]);
        myChart.angleScaleRange([0, myChart.arc()]);

        myChart.distanceScaleDomain([0, myChart.rows() - 1]);
        myChart.distanceScaleRange([(width / 4) - widthMargin, (width / 2) - widthMargin]);

        myChart.partyOrder(partyOrder);

        // myChart.colourPalette(parties);
        myChart.colourPalette(gChartcolour.germanPoliticalParties_bar);

        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        currentFrame.plot()
            .append('g')
            .attr('class', 'hemicycle')
            .attr('transform', `translate(${width / 2}, ${height})`)
            .attr('id', d => d.name)
            .datum({
                data: plotData,
                width,
                height,
            })
            .call(myChart);

        // Set up legend for this frame
        myLegend
            .frameName(frameName)
            .seriesNames(myChart.colourPalette().domain())
            .colourPalette(frameName)
            .rem(myChart.rem())
            .geometry(legendType)
            .alignment(legendAlign);

        // Draw the Legend
        currentFrame.plot()
            .append('g')
            .attr('id', 'legend')
            .selectAll('.legend')
            .data(myChart.colourPalette().domain())
            .enter()
            .append('g')
            .classed('legend', true)
            .call(myLegend);

        const legendSelection = currentFrame.plot().select('#legend');
        legendSelection.attr('transform', `translate(0,${-currentFrame.rem()})`);
    });
    // addSVGSavers('figure.saveable');
});
