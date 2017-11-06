import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

export function drawBars() {
    let yScaleL = d3.scaleLinear();
    let yScaleR = d3.scaleLinear();
    let xScale0 = d3.scaleTime();
    let xScale1 = d3.scaleBand();
    let barWidth = 10;
    let seriesNamesL = [];
    let rem = 16;
    let barColour = d3.scaleOrdinal()
        .domain(seriesNamesL);

    function bars(parent) {

        parent.attr('transform', d => `translate(${xScale0(d.date)},0)`)
            .attr('width', barWidth);

        parent.selectAll('rect')
            .data(d => d.groups)
            .enter()
            .append('rect')
            .attr('class', 'columns')
            .attr('x', d => xScale1(d.name))
            .attr('width', () => xScale1.bandwidth())
            .attr('y', d => yScaleL(Math.max(0, d.value)))
            .attr('height', d => Math.abs(yScaleL(d.value) - yScaleL(0)))
            .attr('fill', function(d,i)  { return barColour.range()[i+1]});

    }

    bars.yScaleL = (d) => {
        if (!d) return yScaleL;
        yScaleL = d;
        return bars;
    };
    bars.yScaleR = (d) => {
        if (!d) return yScaleR;
        yScaleR = d;
        return bars;
    };
    bars.xScale0 = (d) => {
        if (!d) return xScale0;
        xScale0 = d;
        return xScale0;
    };
    bars.xScale1 = (d) => {
        if (!d) return xScale0;
        xScale0 = d;
        return xScale0;
    };
    bars.seriesNamesL = (d) => {
        seriesNamesL = d;
        return bars;
    };
    bars.xScale0 = (d) => {
        if (!d) return xScale0;
        xScale0 = d;
        return bars;
    };
    bars.xScale1 = (d) => {
        if (!d) return xScale1;
        xScale1 = d;
        return bars;
    };
    bars.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return bars;
    };
    bars.barWidth = (d) => {
        if (!d) return barWidth;
        barWidth = d;
        return bars;
    };
    bars.colourPalette = (d) => {
        if (d === 'social' || d === 'video') {
            barColour.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            barColour.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            barColour.range(gChartcolour.linePrint);
        } else if (d && d.name && d.name === 'scale') {
            barColour = d;
        }
        return bars;
    };

    return bars;
}

export function drawLines() {
    let interpolation = d3.curveLinear;
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let rem = 16
    let seriesNamesR = [];
    let lineColour = d3.scaleOrdinal()
        .domain(seriesNamesR);

    function lines(parent) {

        const lineData = d3.line()
        .defined(function(d) { return d; })
        .curve(interpolation)
        .x(d => xScale(d.date))
        .y(d => yScale(d.value));

        parent.append('path')
            .attr('stroke', d =>  lineColour(d.name))
            .attr('d', d => lineData(d.linedata));
            

    }

    lines.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return lines;
    };
    lines.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return lines;
    };
    lines.colourPalette = (d) => {
        if (d === 'social' || d === 'video') {
            lineColour.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            lineColour.range(gChartcolour.categorical_line);
        } else if (d === 'print') {
            lineColour.range(gChartcolour.linePrint);
        } else if (d && d.name && d.name === 'scale') {
            lineColour = d;
        }
        return lines;
    };
    lines.interpolation = (d) => {
        if (!d) return interpolation;
        interpolation = d;
        return lines;
    };
    lines.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return lines;
    };
    lines.seriesNamesR = (d) => {
        seriesNamesL = d;
        return lines;
    };


    return lines
}
