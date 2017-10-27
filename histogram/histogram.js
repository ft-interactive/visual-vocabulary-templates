import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';

export function draw() {
    let yScale;
    let xScale;
    let yAxisAlign = 'right';
    let rem = 16;
    let thresholds = 4;
    let markers = false; // eslint-disable-line
    let includeMarker = false; // eslint-disable-line
    let interpolation = false;

    function chart(parent) {
        const data = parent.datum();
        const histogramGenerator = d3.histogram()

            .thresholds(xScale.ticks(thresholds));

        const bins = histogramGenerator(data);
        console.log(bins);


        parent.selectAll('.bar')
            .data(bins)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.x0))
            .attr('width', xScale(bins[0].x1) - xScale(bins[0].x0) - 1)
            .attr('height', d => yScale(d.length))
            .attr('fill', 'blue');
    }

    chart.thresholds = (d) => {
        if (!d) return thresholds;
        thresholds = d;
        return chart;
    };

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
        yScale.domain(d);
        return chart;
    };

    chart.yRange = (d) => {
        yScale.range(d);
        return chart;
    };

    chart.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return chart;
    };
    chart.xDomain = (d) => {
        xScale.domain(d);
        return chart;
    };
    chart.xRange = (d) => {
        xScale.range(d);
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
    chart.includeMarker = (d) => {
        includeMarker = d;
        return chart;
    };
    chart.markers = (d) => {
        markers = d;
        return chart;
    };
    chart.interpolation = (d) => {
        if (!d) return interpolation;
        interpolation = d;
        return chart;
    };
    chart.colourPalette = (d) => {
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
