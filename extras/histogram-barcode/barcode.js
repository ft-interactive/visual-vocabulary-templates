import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';

export function draw() {
    let xScale = d3.scaleLinear();
    let geometry = '';
    let rem = 10;
    let frameName;
    let barWidth = 0.5;
    let dim;

    const colours = {
        men: '#00a4aa',
        women: '#f65e2a',
        zero: '#c2b7af',
    };

    function dots(parent) {
        parent
            .append('rect')
            .attr('id', d => d.name)
            .attr('y', dim.height / 4)
            .attr('x', d => xScale(d.medianPayDiff))
            .attr('height', dim.height / 2)
            .attr('width', rem / 20)
            .attr('fill', (d) => {
                if (d.medianPayDiff < 0) {
                    return colours.women;
                }
                if (d.medianPayDiff > 0) {
                    return colours.men;
                }
                if (d.medianPayDiff === 0 ) {
                    return colours.zero;
                }
            })
            .style('opacity', d => d.annotate ? 1: 0.8);
    }

    dots.frameName = (d) => {
        if (!d) return frameName;
        frameName = d;
        return dots;
    };

    dots.barWidth = (d) => {
        if (!d) return barWidth;
        barWidth = d;
        return dots;
    };

    dots.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return dots;
    };

    dots.xDomain = (d) => {
        if (typeof d === 'undefined') return xScale.domain(d);
        xScale.domain(d);
        return dots;
    };

    dots.xRange = (d) => {
        if (typeof d === 'undefined') return xScale.range(d);
        xScale.range(d);
        return dots;
    };

    dots.geometry = (d) => {
        if (typeof d === 'undefined') return geometry;
        geometry = d;
        return dots;
    };
    dots.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return dots;
    };
    dots.dim = (d) => {
        if (!d) return dim;
        dim = d;
        return dots;
    };
    return dots;
}
