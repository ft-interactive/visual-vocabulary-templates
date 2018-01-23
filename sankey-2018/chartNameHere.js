import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';
import 'd3-selection-multi';

export function draw() {
    let yScale;
    let xScale;
    let seriesNames = [];
    let yAxisAlign = 'right';
    let rem = 16;
    let markers = false; // eslint-disable-line
    let includeMarker = false; // eslint-disable-line
    let interpolation = false;

    // let interpolation =d3.curveLinear
    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);

    function chart(parent) {
      
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
        yScale.domain(d);
        return chart;
    };

    chart.yRange = (d) => {
        yScale.range(d);
        return chart;
    };

    chart.seriesNames = (d) => {
        seriesNames = d;
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

export function drawAxes() {
    let xScale = d3.scaleOrdinal();
    let yScale = d3.scaleLinear();
    let yTicks;
    let yAxisHighlight = 0;
    let startLabel = 'start';
    let endLabel = 'end';
    const tickFormatter = d => d3.format(',')(d);
    let colourInverse = false;
    let tickOffset = 5;
    let labelOffset = 0;
    const tickColour = () => {
        if (colourInverse) {
            return '#FFF';
        }
        return '#000';
    };


    function axes(parent) {
        const container = parent.append('g')
            .attr('class', 'axis');

        container.append('text')
            .text(startLabel)
            .attrs({
                'text-anchor': 'start',
                dx: -1,
                dy: labelOffset,
                class: 'xAxis-label',
                fill: tickColour,
            });

        container.append('text')
            .text(endLabel)
            .attrs({
                x: xScale.range()[1],
                'text-anchor': 'end',
                dx: 0,
                dy: labelOffset,
                class: 'xAxis-label',
                fill: tickColour,
            });

        if (yTicks === undefined) {
            yTicks = yScale.ticks();
        }

        container.selectAll('g.tick')
            .data(yTicks)
                .enter()
            .append('g')
                .attrs({
                    class: 'yAxis tick',
                    transform: d => `translate(0,${yScale(d)})`,
                })
            .call((tick) => {
                tick.append('line')
                    .attrs({
                        x1: 0,
                        y1: 0,
                        x2: xScale.range()[1],
                        y2: 0,
                        stroke: tickColour,
                    });

                tick.append('text')
                    .attrs({
                        'text-anchor': 'end',
                        x: xScale.range()[1],
                        dy: tickOffset,
                        dx: 0,
                        fill: tickColour,
                    })
                    .text(tickFormatter);
            });


        const originValue = 0;
        container.selectAll('.yAxis.tick').filter(d => d === originValue || d === yAxisHighlight).classed('baseline', true);
    }

    axes.startLabel = (x) => {
        startLabel = x;
        return axes;
    };

    axes.colourInverse = (x) => {
        colourInverse = x;
        return axes;
    };

    axes.endLabel = (x) => {
        endLabel = x;
        return axes;
    };

    axes.labelOffset = (x) => {
        labelOffset = x;
        return axes;
    };

    axes.tickOffset = (x) => {
        tickOffset = x;
        return axes;
    };

    axes.xScale = (x) => {
        xScale = x;
        return axes;
    };

    axes.yScale = (x) => {
        yScale = x;
        return axes;
    };

    axes.yTicks = (x) => {
        yTicks = x;
        return axes;
    };

    axes.yAxisHighlight = (x) => {
        yAxisHighlight = x;
        return axes;
    };

    axes.labelFormatter = (x) => {
        window.labelFormatter = x;
        return axes;
    };

    return axes;
}
