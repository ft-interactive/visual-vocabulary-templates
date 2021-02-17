import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';

export function draw() {
    let xScale0 = d3.scaleBand();
    let xScale1 = d3.scaleBand();
    let yScale = d3.scaleLinear();
    let seriesNames = [];
    let colourProperty = 'name'; // eslint-disable-line
    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);
    let rem = 10;
    let logScale = false// show numbers on end of bars


    function bars(parent) {
        const min = yScale.domain()[0]
        
        parent.attr('transform', d => `translate(${xScale1(d.name) - (xScale1.bandwidth() *.3)}, 0)`);

         parent.selectAll('rect')
            .data(d => d.stacks)
            .enter()
            .append('rect')
            .attr('width', xScale1.bandwidth())
            .attr('x', d => xScale1(d.name))
            .attr('y', d => yScale(Math.max(d.y, d.y1)))
            .attr('height', d => Math.abs(yScale(0) - yScale(d.value)))
            .attr('fill', d => colourScale(d.name));
      
    }

    bars.xScale0 = (d) => {
        xScale0 = d;
        return bars;
    };
    bars.xDomain0 = (d) => {
        xScale0.domain(d);
        return bars;
    };
    bars.xRange0 = (d) => {
        xScale0.rangeRound(d);
        return bars;
    };
    bars.xScale1 = (d) => {
        if (!d) return xScale1;
        xScale1 = d;
        return bars;
    };
    bars.xDomain1 = (d) => {
        xScale0.domain(d);
        return bars;
    };
    bars.xRange1 = (d) => {
        xScale0.rangeRound(d);
        return bars;
    };
    bars.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return bars;
    };
    bars.yDomain = (d) => {
        yScale.domain(d);
        return bars;
    };
    bars.yRange = (d) => {
        yScale.range(d);
        return bars;
    };
    bars.logScale = (d) => {
        if (typeof d === 'undefined') return logScale;
        logScale = d;
        return bars;
    };
    bars.colourProperty = (d) => {
        colourProperty = d;
        return bars;
    };
    bars.colourPalette = (d) => {
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.barPrint);
        }
        return bars;
    };
    bars.seriesNames = (d) => {
        seriesNames = d;
        return bars;
    };
    bars.rem = (d) => {
        rem = d;
        return bars;
    };

    return bars;
}
