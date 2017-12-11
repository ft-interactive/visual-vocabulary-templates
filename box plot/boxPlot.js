import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';

export function draw() {
    let yScale = d3.scaleBand();
    let xScale = d3.scaleLinear();
    let geometry = '';
    let seriesNames
    let colourProperty = 'name'; // eslint-disable-line
    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);
    let rem = 10;
    let lines = false;
    let frameName;


    function dots(parent) {
        const currentFrame = frameName;

        if (lines) {
            parent.append('line')
                .attr('y1', d => yScale(d.group) + (yScale.bandwidth() * 0.5))
                .attr('x1', d => xScale(d.min))
                .attr('y2', d => yScale(d.group) + (yScale.bandwidth() * 0.5))
                .attr('x2', d => xScale(d.max));
        }

        if (geometry === 'circle') {
            parent.selectAll('circle')
                .data(d => d.values)
                .enter()
                .append('circle')
                .attr('id', d => d.name)
                .attr('cy', d => yScale(d.group) + (yScale.bandwidth() * 0.5))
                .attr('cx', d => xScale(d.value))
                .attr('r', rem * 0.5)
                .attr('fill', d => colourScale(d.group));
        } else {
            parent.selectAll('rect')
                .data(d => d.values)
                .enter()
                .append('rect')
                .attr('id', d => d.name)
                .attr('y', d => yScale(d.group) + (yScale.bandwidth() * 0.25))
                .attr('x', d => xScale(d.value))
                .attr('height', yScale.bandwidth() * 0.5)
                .attr('width', rem / 5)
                .attr('fill', (d) => {
                    setHighlight = d.highlight === 'yes' ? colourScale(d.group) : colourScale.range()[5];
                    return setHighlight;
                });
        }

        parent.selectAll('text')
            .data(d => d.values.filter(el => el.highlight === 'yes'))
            .enter()
            .append('text')
            .attr('id', d => currentFrame + d.name)
            .attr('class', 'xAxis text')
            .attr('text-anchor', 'middle')
            .attr('x', d => xScale(d.value))
            .attr('y', d => yScale(d.group) + (yScale.bandwidth() * 0.15))
            .text(d => `${d.name} ${d.value}`);
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

