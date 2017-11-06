import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';

export function draw() {
    let yScale = d3.scaleLinear();
    let xScale0 = d3.scaleTime();
    let xScale1 = d3.scaleBand();
    let xScale2 = d3.scaleBand();
    let seriesNames = [];
    let yAxisAlign = 'right';
    let rem = 16;
    let includeMarker;
    let interpolation = d3.curveLinear;
    let showNumberLabels = false;// show numbers on end of bars
    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);

    function chart(parent) {
        parent.attr('transform', d => `translate(${xScale2(d.name)},0)`)
            .attr('width', xScale1.bandwidth());

        parent.selectAll('rect')
            .data(d => d.columnData)
            .enter()
            .append('rect')
            .attr('class', 'columns')
            .attr('id', d => `date: ${d.date} value: ${d.value}`)
            .attr('x', d => xScale0(d.date))
            .attr('width', () => xScale2.bandwidth())
            .attr('y', d => yScale(Math.max(0, d.value)))
            .attr('height', d => Math.abs(yScale(d.value) - yScale(0)))
            .attr('fill', d => colourScale(d.name));
        if (showNumberLabels) {
            parent.selectAll('text')
            .data(d => d.columnData)
            .enter()
            .append('text')
            .html(d => d.value)
            .attr('class', 'column-label')
            .attr('x', d => xScale0(d.date) + (xScale2.bandwidth() / 2))
            .attr('y', () => yScale(0))
            .attr('dy', (d) => { if (d.value < 0) { return rem; } return -(rem / 4); })
            .attr('font-size', rem)
            .attr('fill', '#ffffff')
            .style('text-anchor', 'middle');
        }
    }

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

    chart.yRange = (d) => {
        if (typeof d === 'undefined') return yScale.range();
        yScale.range(d);
        return chart;
    };

    chart.yAxisAlign = (d) => {
        if (!d) return yAxisAlign;
        yAxisAlign = d;
        return chart;
    };

    chart.seriesNames = (d) => {
        if (typeof d === 'undefined') return seriesNames;
        seriesNames = d;
        return chart;
    };
    chart.xScale0 = (d) => {
        if (!d) return xScale0;
        xScale0 = d;
        return chart;
    };
    chart.xDomain0 = (d) => {
        xScale0.domain(d);
        return chart;
    };
    chart.xRange0 = (d) => {
        xScale0.range(d);
        return chart;
    };

    chart.xScale1 = (d) => {
        if (!d) return xScale1;
        xScale1 = d;
        return chart;
    };
    chart.xDomain1 = (d) => {
        xScale1.domain(d);
        return chart;
    };
    chart.xRange1 = (d) => {
        xScale1.rangeRound(d);
        return chart;
    };

    chart.xScale2 = (d) => {
        if (!d) return xScale2;
        xScale2 = d;
        return chart;
    };
    chart.xDomain2 = (d) => {
        xScale2.domain(d);
        return chart;
    };
    chart.xRange2 = (d) => {
        xScale2.rangeRound(d);
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
        if (typeof d === 'undefined') return includeMarker;
        if (typeof includeMarker === 'undefined') return includeMarker;
        if (!d) return includeMarker;
        includeMarker = d;
        return chart;
    };
    chart.interpolation = (d) => {
        if (!d) return interpolation;
        interpolation = d;
        return chart;
    };
    chart.colourPalette = (d) => {
        if (!d) return colourScale;
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webL') {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    };
    chart.showNumberLabels = (d) => {
        if (!d) return showNumberLabels;
        showNumberLabels = d;
        return chart;
    };

    return chart;
}

export function drawHighlights() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();

    function highlights(parent) {
        parent.append('rect')
            .attr('class', 'highlights')
            .attr('x', d => xScale(d.begin))
            .attr('width', d => xScale(d.end) - xScale(d.begin))
            .attr('y', () => yScale.range()[1])
            .attr('height', () => yScale.range()[0])
            .attr('fill', '#000');
    }

    highlights.yScale = (d) => {
        yScale = d;
        return highlights;
    };
    highlights.xScale = (d) => {
        xScale = d;
        return highlights;
    };
    highlights.yRange = (d) => {
        yScale.range(d);
        return highlights;
    };
    highlights.xRange = (d) => {
        xScale.range(d);
        return highlights;
    };

    return highlights;
}
