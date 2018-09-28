import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

export function draw() {
    let xScale = d3.scaleLinear();
    let yScale = d3.scaleBand();
    let stalks = false;
    let dots = false;
    let stalkWidth = 0.1;
    let dotWidth = 0.25;

    let seriesNames = [];
    let xAxisAlign = 'left';
    let rem = 16;

    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);

    function chart(parent) {
        const r = (dotWidth / 2) * yScale.bandwidth();
        if (dots) {
            parent.append('circle')
            .attr('cx', d => xScale(d[seriesNames[0]]))
            .attr('cy', d => yScale(d.name) + (yScale.bandwidth() / 2))
            .attr('r', r)
            .attr('fill', colourScale(seriesNames[0]));
        }

        if (stalks) {
            parent.append('line')
                .attr('y1', d => yScale(d.name) + (yScale.bandwidth() / 2))
                .attr('y2', d => yScale(d.name) + (yScale.bandwidth() / 2))
                .attr('x1', () => {
                    // case negative scales
                    if (xScale.domain()[0] < 0) {
                        return xScale(0);
                    }  // positive scales
                    return xScale(xScale.domain()[0]);
                })
               .attr('x2', d => xScale(d[seriesNames[0]]))
               .attr('stroke-width', stalkWidth * yScale.bandwidth())
               .attr('stroke', colourScale(seriesNames[0]));
        }
    }

    chart.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return chart;
    };
    chart.xAxisAlign = (d) => {
        if (!d) return xAxisAlign;
        xAxisAlign = d;
        return chart;
    };
    chart.xDomain = (d) => {
        if (typeof d === 'undefined') return xScale.domain();
        xScale.domain(d);
        return chart;
    };
    chart.xRange = (d) => {
        if (typeof d === 'undefined') return xScale.range();
        xScale.range(d);
        return chart;
    };
    chart.stalks = (d) => {
        if (!d) return stalks;
        stalks = d;
        return chart;
    };
    chart.dots = (d) => {
        if (!d) return dots;
        dots = d;
        return chart;
    };
    chart.stalkWidth = (d) => {
        if (!d) return stalkWidth;
        stalkWidth = d;
        return chart;
    };
    chart.dotWidth = (d) => {
        if (!d) return dotWidth;
        dotWidth = d;
        return chart;
    };
    chart.seriesNames = (d) => {
        if (typeof d === 'undefined') return seriesNames;
        seriesNames = d;
        return chart;
    };
    chart.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return chart;
    };
    chart.yDomain = (d) => {
        if (typeof d === 'undefined') return yScale.domain();
        yScale.domain(d);
        return chart;
    };
    chart.yRangeRound = (d) => {
        yScale.rangeRound(d);
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
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webL') {
            colourScale.range(gChartcolour.lineWeb);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    };

    return chart;
}
