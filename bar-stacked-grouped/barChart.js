import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';

export function draw() {
    let yScale0 = d3.scaleBand();
    let yScale1 = d3.scaleBand();
    let xScale = d3.scaleLinear();
    let seriesNames = [];
    let colourProperty = 'name'; // eslint-disable-line
    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);
    let rem = 10;
    let logScale = false// show numbers on end of bars


    function bars(parent) {
        const min = xScale.domain()[0]
        
        parent.attr('transform', d => `translate(0, ${yScale1(d.name) - (yScale1.bandwidth() *.3)})`);

         parent.selectAll('rect')
            .data(d => d.stacks)
            .enter()
            .append('rect')
            .attr('height', yScale1.bandwidth())
            .attr('y', d => yScale1(d.name))
            .attr('x', d => xScale(Math.min(d.x, d.x1)))
            .attr('width', d => Math.abs(xScale(d.value) - xScale(0)))
            .attr('fill', d => colourScale(d.name));
      
    }

    bars.yScale0 = (d) => {
        yScale0 = d;
        return bars;
    };
    bars.yDomain0 = (d) => {
        yScale0.domain(d);
        return bars;
    };
    bars.yRange0 = (d) => {
        yScale0.rangeRound(d);
        return bars;
    };
    bars.yScale1 = (d) => {
        if (!d) return yScale1;
        yScale1 = d;
        return bars;
    };
    bars.yDomain1 = (d) => {
        yScale1.domain(d);
        return bars;
    };
    bars.yRange1 = (d) => {
        yScale1.rangeRound(d);
        return bars;
    };
    bars.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return bars;
    };
    bars.xDomain = (d) => {
        xScale.domain(d);
        return bars;
    };
    bars.xRange = (d) => {
        xScale.range(d);
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
