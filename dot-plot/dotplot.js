import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';

export function draw() {
    let yScale = d3.scaleBand();
    let xScale = d3.scaleLinear();
    let groupNames = [];
    let geometry = '';
    const colourScale = d3.scaleOrdinal()
        .domain(groupNames);
    let rem = 10;
    let lines = false;
    let frameName;


    function dots(parent) {
        parent.attr('transform', d => `translate(0,${yScale(d.group) + (yScale.bandwidth() * 0.5)})`);

        if (lines) {
            parent.append('line')
                .attr('x1', d => xScale(d.min))
                .attr('x2', d => xScale(d.max));
        }

        if (geometry === 'circle') {
            parent.selectAll('circle')
                .data(d => d.values)
                .enter()
                .append('circle')
                .attr('id', d => d.cat)
                .attr('cx', d => xScale(d.value))
                .attr('r', yScale.bandwidth() * 0.4)
                .attr('fill', d => colourScale(d.cat));
        } else {
            parent.selectAll('rect')
                .data(d => d.values)
                .enter()
                .append('rect')
                .attr('id', d => d.cat)
                .attr('x', d => xScale(d.value))
                .attr('y', -yScale.bandwidth() / 2)
                .attr('height', yScale.bandwidth() * 0.8)
                .attr('width', yScale.bandwidth() * 0.8)
                .attr('fill', d => colourScale(d.cat));
        }

        // parent.selectAll('text')
        //     .data(d => d.values.filter(el => el.highlight === 'yes'))
        //     .enter()
        //     .append('text')
        //     .attr('id', d => currentFrame + d.name)
        //     .attr('class', 'xAxis text')
        //     .attr('text-anchor', 'middle')
        //     .attr('x', d => xScale(d.value))
        //     .attr('y', d => yScale(d.group) + (yScale.bandwidth() * 0.15))
        //     .text(d => `${d.name} ${d.value}`);
    }

    dots.frameName = (d) => {
        if (!d) return frameName;
        frameName = d;
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

    dots.yDomain = (d) => {
        if (typeof d === 'undefined') return yScale.domain();
        yScale.domain(d);
        return dots;
    };

    dots.yRange = (d) => {
        if (typeof d === 'undefined') return yScale.range();
        yScale.range(d);
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

    dots.colourPalette = (d) => {
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.lineWeb);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return dots;
    };

    dots.groupNames = (d) => {
        if (!d) return groupNames;
        groupNames = d;
        return dots;
    };

    dots.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return dots;
    };

    return dots;
}
