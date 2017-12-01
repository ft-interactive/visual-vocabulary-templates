import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';

export function draw() {
    let xScale = d3.scaleBand();
    let xDotScale = d3.scaleBand();
    let xTotalScale = d3.scaleBand();
    let yDotScale = d3.scaleOrdinal();
    let seriesNames = [];
    let dotData = [];
    let circleSize = 1;
    let colourProperty = 'name'; // eslint-disable-line
    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);
    let rem = 10;
    let numberOfColumns = 0;
    let divisor = 1;
    let showNumberLabels = false;// show numbers on end of groupedSymbols


    function groupedSymbols(parent) {
        parent.attr('transform', d => `translate(${(xScale(d.name) + (xScale.bandwidth() / 8))},${rem})`);
        parent
            .selectAll('circle')
            .data(d => d.circleCats)
            .enter()
            .append('circle')
            .attr('r', (xDotScale.bandwidth() / 2) * circleSize)
            .attr('cx', (d, i) => xDotScale(i % numberOfColumns))
            .attr('cy', (d, i) => yDotScale(Math.floor(i / numberOfColumns)))
            .attr('fill', d => colourScale.range()[seriesNames.lastIndexOf(d.name)]);
    }

    groupedSymbols.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return groupedSymbols;
    };
    groupedSymbols.xDomain = (d) => {
        if (typeof d === 'undefined') return xScale.domain();
        xScale.domain(d);
        return groupedSymbols;
    };
    groupedSymbols.xRange = (d) => {
        if (typeof d === 'undefined') return xScale.rangeRound();
        xScale.rangeRound(d);
        return groupedSymbols;
    };
    groupedSymbols.xDotScale = (d) => {
        if (!d) return xDotScale;
        xDotScale = d;
        return groupedSymbols;
    };
    groupedSymbols.xDotDomain = (d) => {
        if (typeof d === 'undefined') return xDotScale.domain();
        xDotScale.domain(d);
        return groupedSymbols;
    };
    groupedSymbols.xDotRange = (d) => {
        if (typeof d === 'undefined') return xDotScale.range();
        xDotScale.range(d);
        return groupedSymbols;
    };
    groupedSymbols.xTotalScale = (d) => {
        if (!d) return xTotalScale;
        xTotalScale = d;
        return groupedSymbols;
    };
    groupedSymbols.xTotalDomain = (d) => {
        if (typeof d === 'undefined') return xTotalScale.domain();
        xTotalScale.domain(d);
        return groupedSymbols;
    };
    groupedSymbols.xTotalRange = (d) => {
        if (typeof d === 'undefined') return xTotalScale.range();
        xTotalScale.range(d);
        return groupedSymbols;
    };
    groupedSymbols.yDotScale = (d) => {
        if (!d) return yDotScale;
        yDotScale = d;
        return groupedSymbols;
    };
    groupedSymbols.yDotDomain = (d) => {
        if (typeof d === 'undefined') return yDotScale.domain();
        yDotScale.domain(d);
        return groupedSymbols;
    };
    groupedSymbols.yDotRange = (d) => {
        if (typeof d === 'undefined') return yDotScale.range();
        yDotScale.range(d);
        return groupedSymbols;
    };
    groupedSymbols.colourProperty = (d) => {
        if (typeof d === 'undefined') return colourProperty;
        colourProperty = d;
        return groupedSymbols;
    };
    groupedSymbols.colourPalette = (d) => {
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (['webS', 'webM', 'webMDefault', 'webL'].includes(d)) {
            colourScale.range(gChartcolour.categorical_line);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return groupedSymbols;
    };
    groupedSymbols.seriesNames = (d) => {
        if (typeof d === 'undefined') return seriesNames;
        seriesNames = d;
        return groupedSymbols;
    };
    groupedSymbols.rem = (d) => {
        if (typeof d === 'undefined') return rem;
        rem = d;
        return groupedSymbols;
    };
    groupedSymbols.showNumberLabels = (d) => {
        if (!d) return showNumberLabels;
        showNumberLabels = d;
        return groupedSymbols;
    };
    groupedSymbols.numberOfColumns = (d) => {
        if (!d) return numberOfColumns;
        numberOfColumns = d;
        return groupedSymbols;
    };
    groupedSymbols.divisor = (d) => {
        if (!d) return divisor;
        divisor = d;
        return groupedSymbols;
    };
    groupedSymbols.dotData = (d) => {
        if (!d) return dotData;
        dotData = d;
        return groupedSymbols;
    };
    groupedSymbols.circleSize = (d) => {
        if (!d) return circleSize;
        circleSize = d;
        return groupedSymbols;
    };

    return groupedSymbols;
}
