import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';

export function draw() {
    let yScale = d3.scaleBand();
    let xScale = d3.scaleLinear();
    let geometry = '';
    let seriesNames = [];
    let colourProperty = 'name'; // eslint-disable-line
    const colourScale = d3.scaleOrdinal()
    let rem = 10;
    let lines = false;
    let median = false;
    let frameName;
    let quantile;


    function dots(parent) {
        parent.attr('transform', d => `translate(0,${yScale.bandwidth()/2})`);

        if(geometry ==='rect') {
            parent.append('line')
                .attr('class', 'line')
                .attr('x1', d => xScale(d.min))
                .attr('y1', d => yScale(d.group))
                .attr('x2', d => xScale(d.q1))
                .attr('y2', d => yScale(d.group));
            parent.append('line')
                .attr('class', 'line')
                .attr('x1', d => xScale(d.q3))
                .attr('y1', d => yScale(d.group))
                .attr('x2', d => xScale(d.max))
                .attr('y2', d => yScale(d.group));
            parent.append('line')
                .attr('class', 'line')
                .attr('x1', d => xScale(d.min))
                .attr('x2', d => xScale(d.min))
                .attr('y1', d => yScale(d.group) - (yScale.bandwidth() / 8))
                .attr('y2', d => yScale(d.group) + (yScale.bandwidth() / 8));
            parent.append('line')
                .attr('class', 'line')
                .attr('x1', d => xScale(d.max))
                .attr('x2', d => xScale(d.max))
                .attr('y1', d => yScale(d.group) - (yScale.bandwidth() / 8))
                .attr('y2', d => yScale(d.group) + (yScale.bandwidth() / 8));

            parent.append('rect')
                .attr('class', 'bars')
                .attr('y', d => yScale(d.group) - (yScale.bandwidth() / 4))
                .attr('height', yScale.bandwidth() / 2)
                .attr('x', d => xScale(Math.max(0, d.q1)))
                .attr('width', d => Math.abs(xScale(d.q3) - xScale(d.q1)))
                .attr('fill', colourScale.range()[1]);

            parent.append('line')
                .attr('class', 'line')
                .attr('x1', d => xScale(d.q2))
                .attr('x2', d => xScale(d.q2))
                .attr('y1', d => yScale(d.group) - (yScale.bandwidth() / 4))
                .attr('y2', d => yScale(d.group) + (yScale.bandwidth() / 4));
            if (median) {
                parent.append('line')
                    .attr('class', 'line')
                    .attr('x1', d => xScale(d.median))
                    .attr('x2', d => xScale(d.median))
                    .attr('y1', d => yScale(d.group) - (yScale.bandwidth() / 4))
                    .attr('y2', d => yScale(d.group) + (yScale.bandwidth() / 4))
                    .style('stroke', colourScale.range()[2]);
            }
        }

        if (geometry === 'circle') {
            if (lines) {
                parent.append('line')
                    .attr('class', 'line')
                    .attr('x1', d => xScale(d.min))
                    .attr('y1', d => yScale(d.group))
                    .attr('x2', d => xScale(d.max))
                    .attr('y2', d => yScale(d.group));
            }

            parent.selectAll('circle')
                .data(d => d.values.filter((el) => {return el.label === ''}))
                .enter()
                .append('circle')
                //.attr('id', d => d.name + ' ' + d.value)
                .attr('cx', d => xScale(d.value))
                .attr('cy', d => yScale(d.group))
                .attr('r', rem / 2)
                .attr('fill', colourScale.range()[1]);

            const highlights = parent.append('g').attr('class', 'dotHighlight')

            highlights.selectAll('.circle')
                .data(d => d.values.filter((el) => {return el.label === 'yes'}))
                .enter()
                .append('circle')
                .attr('cx', d => xScale(d.value))
                .attr('cy', d => yScale(d.group))
                .attr('r', rem / 2)
                .attr('fill', colourScale.range()[1]);

            if (quantile) {
                const quantiles = parent.append('g')
                .attr('id', 'quantiles');

                quantiles.selectAll('circle')
                    .data((d) => {
                        return d.quantiles})
                    .enter()
                    .append('circle')
                    .attr('id', d => d.name)
                    .attr('cx', d => xScale(d.value))
                    .attr('cy', d => yScale(d.group))
                    .attr('r', rem / 2)
                    .attr('fill', colourScale.range()[3]);

            }

            parent.append('circle')
                .attr('cx', d => xScale(d.min))
                .attr('cy', d => yScale(d.group))
                .attr('r', rem / 2)
                .attr('fill', colourScale.range()[0]);

            parent.append('circle')
                .attr('cx', d => xScale(d.max))
                .attr('cy', d => yScale(d.group))
                .attr('r', rem / 2)
                .attr('fill', colourScale.range()[0]);

            parent.selectAll('text')
                .data(d => d.values.filter((el) => {return el.label === 'yes'}))
                .enter()
                .append('text')
                .attr('class', 'highlighted-label')
                .attr('x', d => xScale(d.value))
                .attr('y', d => yScale(d.group) - rem)
                .style('text-anchor', 'middle')
                .text(d => d.name+' '+d.value)


            if (median) {
                parent.append('circle')
                    .attr('cx', d => xScale(d.median))
                    .attr('cy', d => yScale(d.group))
                    .attr('r', rem / 2)
                    .attr('fill', colourScale.range()[2]);

            }
        }
    }

    dots.frameName = (d) => {
        if (!d) return frameName;
        frameName = d;
        return dots;
    };
    dots.seriesNames = (d) => {
        if (!d) return seriesNames;
        seriesNames = d;
        return dots;
    };
    dots.lines = (d) => {
        if (d === undefined) return lines;
        lines = d;
        return dots;
    };
    dots.median = (d) => {
        if (d === undefined) return median;
        median = d;
        return dots;
    };
    dots.quantile = (d) => {
        if (d === undefined) return quantile;
        quantile = d;
        return dots;
    };
    dots.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return dots;
    };
    dots.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return dots;
    };
    dots.geometry = (d) => {
        if (typeof d === 'undefined') return geometry;
        geometry = d;
        return dots;
    };
    dots.colourProperty = (d) => {
        if (!d) return colourProperty;
        colourProperty = d;
        return dots;
    };
    dots.colourPalette = (d) => {
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return dots;
    };
    dots.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return dots;
    };
    return dots;
}

