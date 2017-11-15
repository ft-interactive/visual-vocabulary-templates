import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';

export function draw() {
    let yScale = d3.scaleBand();
    let yDotScale = d3.scaleBand();
    let xDotScale = d3.scaleOrdinal();
    let seriesNames = [];
    let dotData = [];
    let colourProperty = 'name'; // eslint-disable-line
    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);
    let rem = 10;
    let numberOfRows = 0;
    let divisor = 1;
    let ranges = [];
    let showNumberLabels = false;// show numbers on end of groupedSymbols


    function groupedSymbols(parent) {
        parent.attr('transform', d => `translate(0,${(yScale(d.name) + rem / 2.5)})`);
            console.log(d => d.groups);
            parent
                .selectAll('circle')
                    .data(d => d3.range(d.total / divisor))
                    .enter()
                    .append('circle')
                    .attr('r', yDotScale.bandwidth()/2.5)
                    .attr('id', (d, i) =>`${'circle' + i + '_' + d.name}`)
                    .attr('cx', (d, i) => xDotScale(Math.floor(d / numberOfRows)))
                    .attr('cy', (d, i) => yDotScale(d % numberOfRows))
                    .attr('fill', 'red');

            dotData.forEach( function(d, n) { 
                // ranges = [];
                d.groups.forEach( function(g, i) { 
                    if(g.name === seriesNames[i]) {
                        ranges.push(g.value / divisor);
                    }
                });
            });

            console.log(ranges);
            let index = 0;
            let stackIndex = [0];

            seriesNames.forEach(function(obj, k){
                if (k > 0){
                    index = index + ranges[k - 1];
                    stackIndex.push(index);
                }
            });

            for (let i = 0; i < seriesNames.length; i++){
                let selecty = parent.selectAll('circle').filter(function(y, z){
                    if (i < seriesNames.length - 1){
                        return z >= stackIndex[i] && z < stackIndex[i + 1];
                    } else {
                        return z >= stackIndex[i];
                    }
                })
                selecty.attr('fill',colourScale(i));
            }

       

        // // if (showNumberLabels) {
        // //     parent.selectAll('text')
        // //     .data(d => d.groups)
        // //     .enter()
        // //     .append('text')
        // //     .html(d => d.value)
        // //     .attr('class', 'highlight-label')
        // //     .style('text-anchor', 'end')
        // //     .attr('y', d => yScale1(d.name) + (yScale1.bandwidth() / 2) + (rem / 2.5))
        // //     .attr('x', () => xScale(0))
        // //     .attr('dx', (d) => { if (d.value < 0) { return rem / 4; } return -(rem / 4); })
        // //     .attr('font-size', rem)
        // //     .style('text-anchor', (d) => { if (d.value < 0) { return 'start'; } return 'end'; });

        // //     let labelWidth = 0;
        // //     parent.selectAll('.label').each(function calcLabels() {
        // //         labelWidth = Math.max(this.getBBox().width, labelWidth);
        // //         // console.log(labelWidth);
        // //         // positionText(this,labelWidth)
        // //     });

        // //     parent.selectAll('.label').each(function positionLabels() {
        // //         positionText(this, labelWidth);
        // //     });
        // }

        // function positionText(item, labelWidth) {
        //     const object = d3.select(item);
        //     object.attr('transform', () => `translate(${labelWidth + (rem / 2)},0)`);
        // }
    }

    groupedSymbols.yScale = (d) => {
        yScale = d;
        return groupedSymbols;
    };
    groupedSymbols.yDomain = (d) => {
        yScale.domain(d);
        return groupedSymbols;
    };
    groupedSymbols.yRange = (d) => {
        yScale.rangeRound(d);
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
    groupedSymbols.xDotScale = (d) => {
        if (!d) return xDotScale;
        xDotScale = d;
        return groupedSymbols;
    };
    groupedSymbols.xDomain = (d) => {
        xDotScale.domain(d);
        return groupedSymbols;
    };
    groupedSymbols.xRange = (d) => {
        xDotScale.range(d);
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
    groupedSymbols.numberOfRows = (d) => {
        if (!d) return numberOfRows;
        numberOfRows = d;
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
