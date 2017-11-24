import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';

export function draw() {
    let xScale = d3.scaleBand();
    let xDotScale = d3.scaleBand();
    let xTotalScale = d3.scaleBand();
    let yDotScale = d3.scaleOrdinal();
    let seriesNames = [];
    let dotData = [];
    let colourProperty = 'name'; // eslint-disable-line
    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);
    let rem = 10;
    let numberOfColumns = 0;
    let divisor = 1;
    let ranges = [];
    let showNumberLabels = false;// show numbers on end of groupedSymbols


    function groupedSymbols(parent) {
        if (showNumberLabels) {
            parent.attr('transform', d => `translate(${(xScale(d.name))},${rem})`);
        } else {
            parent.attr('transform', d => `translate(${(xScale(d.name))},${rem})`);
        }
            parent
                .selectAll('circle')
                    .data(d => d.circleCats)
                    .enter()
                    .append('circle')
                    .attr('r', yDotScale.bandwidth() / 2)
                    .attr('id', (d, i) =>`${'circle' + i + '_' + i}`)
                    .attr('cx', (d, i) => xDotScale(i % numberOfColumns))
                    .attr('cy', (d, i) => yDotScale(Math.floor(i / numberOfColumns)))
                    .attr('fill', (d)  => {
                        let colourIndex = 0;
                        seriesNames.forEach(function(obj, k) {
                            if (obj === d.name) {
                                colourIndex = colourScale.range()[k];
                            }
                        });
                        return colourIndex;
                    });

        if (showNumberLabels) {
            // parent
            //     .append('text')
            //     .html(d => d.total)
            //     .attr('class', 'highlight-label')
            //     .style('text-anchor', 'end')
            //     .attr('x', d => xScale.bandwidth()/2)
            //     .attr('y', () => parent.node().getBBox().height + (rem * 2))
            //     .attr('font-size', rem)
            //     .style('font-weight', 600)
            //     .style('text-anchor', 'middle');
        //     let labelWidth = 0;
        //     parent.selectAll('.label').each(function calcLabels() {
        //         labelWidth = Math.max(this.getBBox().width, labelWidth);
        //     });

        //     parent.selectAll('.label').each(function positionLabels() {
        //         positionText(this, labelWidth);
        //     });
        }

        // function positionText(item, labelWidth) {
        //     const object = d3.select(item);
        //     object.attr('transform', () => `translate(${labelWidth + (rem / 2)},0)`);
        // }
    }

    groupedSymbols.xScale = (d) => {
        xScale = d;
        return groupedSymbols;
    };
    groupedSymbols.xDomain = (d) => {
        xScale.domain(d);
        return groupedSymbols;
    };
    groupedSymbols.xRange = (d) => {
        xScale.rangeRound(d);
        return groupedSymbols;
    };
    groupedSymbols.xDotScale = (d) => {
        if (!d) return xDotScale;
        xDotScale = d;
        return groupedSymbols;
    };
    groupedSymbols.xDotDomain = (d) => {
        xDotScale.domain(d);
        return groupedSymbols;
    };
    groupedSymbols.xDotRange = (d) => {
        xDotScale.range(d);
        return groupedSymbols;
    };
    groupedSymbols.xTotalScale = (d) => {
        if (!d) return xTotalScale;
        xTotalScale = d;
        return groupedSymbols;
    };
    groupedSymbols.xTotalDomain = (d) => {
        xTotalScale.domain(d);
        return groupedSymbols;
    };
    groupedSymbols.xTotalRange = (d) => {
        xTotalScale.range(d);
        return groupedSymbols;
    };
    groupedSymbols.yDotScale = (d) => {
        if (!d) return yDotScale;
        yDotScale = d;
        return groupedSymbols;
    };
    groupedSymbols.yDotDomain = (d) => {
        yDotScale.domain(d);
        return groupedSymbols;
    };
    groupedSymbols.yDotRange = (d) => {
        yDotScale.range(d);
        return groupedSymbols;
    };
    groupedSymbols.colourProperty = (d) => {
        colourProperty = d;
        return groupedSymbols;
    };
    groupedSymbols.colourPalette = (d) => {
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.categorical_line);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return groupedSymbols;
    };
    groupedSymbols.seriesNames = (d) => {
        seriesNames = d;
        return groupedSymbols;
    };
    groupedSymbols.rem = (d) => {
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

    return groupedSymbols;
}
