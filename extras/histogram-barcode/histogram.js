import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';
import {event as currentEvent} from 'd3-selection'

export function draw() {
    let xScale = d3.scaleLinear();
    let yScale = d3.scaleLinear();
    let rem = 10;
    let frameName;
    let dim;
    let binWidth;

    const colours = {
        men: '#00a4aa',
        women: '#f65e2a',
        zero: '#c2b7af',
    };

    function histogram(parent) {
        const xBinWidth = xScale(binWidth) - xScale(0);

        parent
            .append('rect')
            .attr('y', d => yScale(d.values.length))
            .attr('x', d => xScale(+d.key) - xBinWidth / 2)
            .attr('width', xBinWidth)
            .attr('height', d => dim.height - yScale(d.values.length))
            .attr('fill', (d) => {
                if (d.key < 0) {
                    return colours.women;
                }
                if (d.key > 0) {
                    return colours.men;
                }
                if (+d.key === 0) {
                    return colours.zero;
                }
            });
    }

    histogram.frameName = (d) => {
        if (!d) return frameName;
        frameName = d;
        return histogram;
    };

    histogram.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return histogram;
    };

    histogram.xDomain = (d) => {
        if (typeof d === 'undefined') return xScale.domain(d);
        xScale.domain(d);
        return histogram;
    };

    histogram.xRange = (d) => {
        if (typeof d === 'undefined') return xScale.range(d);
        xScale.range(d);
        return histogram;
    };

    histogram.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return histogram;
    };

    histogram.yDomain = (d) => {
        if (typeof d === 'undefined') return yScale.domain();
        yScale.domain(d);
        return histogram;
    };

    histogram.yRange = (d) => {
        if (typeof d === 'undefined') return yScale.range();
        yScale.range(d);
        return histogram;
    };

    histogram.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return histogram;
    };

    histogram.dim = (d) => {
        if (!d) return dim;
        dim = d;
        return histogram;
    };

    histogram.binWidth = (d) => {
        if (!d) return binWidth;
        binWidth = d;
        return histogram;
    };

    return histogram;
}

export function annotateHistogram() {
    let xScale = d3.scaleLinear();
    let yScale = d3.scaleLinear();
    let rem = 10;
    let frameName;
    let dim;

    const textXOffset = -5;
    const textYOffset = -5;

    function annotate(parent) {

        const xDist = -dim.width * 0.03;
        const yDist = -dim.height * 0.3;
        // parent.attr('id', frameName + data.name.replace(/ /g, '').replace(/&/g, ''))
        parent.append('circle')
            .attr('class', 'annotation-circle')
            .attr('cx', d => xScale(d.bin))
            .attr('cy', d => yScale(d.y))
            .attr('r', rem / 10);

        parent.each(function annoThis() {
            const anno = d3.select(this);
            const data = anno.datum();

            const direction = data.bin < 0 ? 1 : -1;

            const x1 = xScale(data.bin);
            const y1 = yScale(data.y);
            const aX = xScale(data.bin) + xDist * direction;
            const aY = yScale(data.y) + yDist;
            const sCtrl = [x1, y1];
            const eCtrl = [aX, y1];

            anno.append('text')
                .attr('class', 'annotation-text')
                .attr('text-anchor', 'middle')
                .attr('x', aX + textXOffset)
                .attr('y', aY + textYOffset)
                .text(data.cleanName);

            const pathString = `M${x1} ${y1}, C${sCtrl[0]} ${sCtrl[1]}, ${eCtrl[0]} ${eCtrl[1]}, ${aX} ${aY}`;

            anno.append('path')
                .attr('class', 'annotation-path')
                .attr('d', pathString);
        });
    }

    annotate.frameName = (d) => {
        if (!d) return frameName;
        frameName = d;
        return annotate;
    };

    annotate.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return annotate;
    };

    annotate.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return annotate;
    };

    annotate.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return annotate;
    };

    annotate.dim = (d) => {
        if (!d) return dim;
        dim = d;
        return annotate;
    };

    return annotate;
}
