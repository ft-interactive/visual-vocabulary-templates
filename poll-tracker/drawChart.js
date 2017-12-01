import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';


export function drawDots() {
    let rem = 10;
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let seriesNames = [];
    let yAxisAlign = 'right';
    let colourScale = d3.scaleOrdinal()
    let dotOpacity = 1
    // .range(gChartcolour.lineWeb)
    //.domain(seriesNames);

    function dots(parent) {
        console.log('dots')
        parent.selectAll('circle')
            .data((d) => {return d.dots.filter(el => el.highlight ==="")})
            .enter()
            .append('circle')
            .attr('cx', d => xScale(d.date))
            .attr('cy', d => yScale(d.value))
            .attr('r', rem / 2.5)
            .attr('fill', d => colourScale(d.name))
            .attr('opacity', dotOpacity);

        const highlights = parent.selectAll('.dotHighlight')
            .data((d) => {return d.dots.filter(el => el.highlight ==="yes")})
            .enter()
            .append('g')
            .attr('class', 'dotHighlight');

        highlights
            .append('circle')
            .attr('cx', d => xScale(d.date))
            .attr('cy', d => yScale(d.value))
            .attr('r', rem / 2.5)
            .attr('fill', d => colourScale(d.name))
            .attr('opacity', 1.0)

        highlights
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('x', d => xScale(d.date))
            .attr('y', d => yScale(d.value) - (rem*.75))
            .text(d => d.pollster + " " + d.value)
    }

    dots.dotOpacity = (d) => {
        if (!d) return dotOpacity;
        dotOpacity = d;
        return dots;
    };

    dots.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return dots;
    };

    dots.yAxisAlign = (d) => {
        if (!d) return yAxisAlign;
        yAxisAlign = d;
        return dots;
    };

    dots.seriesNames = (d) => {
        if (typeof d === 'undefined') return seriesNames;
        seriesNames = d;
        return dots;
    };

    dots.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return dots;
    };

    dots.plotDim = (d) => {
        if (!d) return window.plotDim;
        window.plotDim = d;
        return dots;
    };

    dots.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return dots;
    };

    dots.colourPalette = (d) => {
        if (!d) return colourScale;
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        } else if (d && d.name && d.name === 'scale') {
            colourScale = d;
        }
        return dots;
    };

    return dots;
}

