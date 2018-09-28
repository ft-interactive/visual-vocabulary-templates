import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

export function draw() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleLinear();
    let sizeScale = d3.scaleSqrt();
    let scaleDots;
    let scaleFactor;
    let seriesNames  = []; // eslint-disable-line
    let groups = [];
    let yAxisAlign = 'right';
    let rem = 16;
    let xVar;
    let opacity;
    let yVar;
    let sizeVar;
    let hollowDots;
    let dotOutline;

    const colourScale = d3.scaleOrdinal();


    function chart(parent) {

        const lineData = d3.line()
        .defined(d => d)
        .curve(d3.curveLinear)
        .x(d => xScale(d.x))
        .y(d => yScale(d.y));

        parent.append('path')
            .attr('stroke', d => colourScale(d.name))
            .attr('d', d => lineData(d.lineData));

        parent.selectAll('circle')
            .data(d => d.dotsData)
            .enter()
            .append('circle')
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
            .attr('r', (d) => {
                if (scaleDots) {
                    return sizeScale(d.radius)
                }   else {
                    return rem*(scaleFactor*.5)
                }
            })
            .attr('fill', (d) => {
                if (hollowDots) {
                    return 'none';
                }
                return colourScale(d.name);
            })
            .attr("id", d => d.name+":"+d[sizeVar])
            .attr('fill-opacity', (d) => {
                if (scaleDots) {
                    return opacity
                }
                return 1.0
            })

    }



    chart.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return chart;
    };
    chart.yAxisAlign = (d) => {
        if (!d) return yAxisAlign;
        yAxisAlign = d;
        return chart;
    };
    chart.yDomain = (d) => {
        if (typeof d === 'undefined') return yScale.domain();
        yScale.domain(d);
        return chart;
    };

    chart.xVar = (d) => {
        xVar = d;
        return chart;
    };
    chart.yVar = (d) => {
        yVar = d;
        return chart;
    };
    chart.sizeVar = (d) => {
        sizeVar = d;
        return chart;
    };
    chart.opacity = (d) => {
        opacity = d;
        return chart;
    };
    chart.groups = (d) => {
        groups = d;
        return chart;
    };
    chart.hollowDots = (d) => {
        hollowDots = d;
        return chart;
    };

    chart.yRange = (d) => {
        if (typeof d === 'undefined') return yScale.range();
        yScale.range(d);
        return chart;
    };

    chart.seriesNames = (d) => {
        if (typeof d === 'undefined') return seriesNames;
        seriesNames = d;
        return chart;
    };
    chart.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return chart;
    };
    chart.scaleDots = (d) => {
        if (!d) return scaleDots;
        scaleDots = d;
        return chart;
    };
    chart.scaleFactor = (d) => {
        if (!d) return scaleFactor;
        scaleFactor = d;
        return chart;
    };
    chart.sizeScale = (d) => {
        if (!d) return sizeScale;
        sizeScale = d;
        return chart;
    };
    chart.xDomain = (d) => {
        if (typeof d === 'undefined') return xScale.domain();
        xScale.domain(d);
        return chart;
    };
    chart.xRangeRound = (d) => {
        xScale.rangeRound(d);
        return chart;
    };
    chart.plotDim = (d) => {
        if (!d) return window.plotDim;
        window.plotDim = d;
        return chart;
    };
    chart.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return chart;
    };
    chart.colourPalette = (d) => {
        if (!d) return colourScale;
        colourScale.domain(groups);
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
            dotOutline = '#ffffff';
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.lineWeb);
            dotOutline = '#000000';
        } else if (d === 'print') {
            dotOutline = '#000000';
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    };

    return chart;
}
