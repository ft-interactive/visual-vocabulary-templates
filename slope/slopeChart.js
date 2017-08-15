import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';
import 'd3-selection-multi';

export function draw() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleOrdinal();
    let yAxisAlign = 'right';
    let rem = 10;
    const colourScale = d3.scaleOrdinal()
        // .range('gChartcolour.basicLineWeb');
        // .domain(['group']);
    let colourProperty = 'group';
    let setPalette = false;
    let includeLabel = true;
    let groupNames = [];
    let labelTextStart = 'start text';
    let labelTextEnd = 'end text';
    // const highlightColour = '#F00';
    let dotRadius = rem;
    // const yAxisHighlight = 0;
    const lineClasser = (d) => {
        if (d[colourProperty]) {
            return 'highlight-line';
        }
        return 'background-line';
    };

    function chart(parent) {
        parent.append('line')
            .attrs({
                x1: xScale(xScale.domain()[0]),
                x2: xScale(xScale.domain()[1]),
                y1: d => yScale(d[xScale.domain()[0]]),
                y2: d => yScale(d[xScale.domain()[1]]),
                stroke: d => colourScale(d[colourProperty]),
                class: lineClasser,
                opacity: (d) => {
                    if ((groupNames.length > 0 && d[colourProperty]) || groupNames.length === 0) {
                        return 1;
                    }
                    return 0.2;
                },
            });

        const labeled = parent.filter(includeLabel);

// start circle...
        parent.append('circle')
            .attrs({
                cx: xScale(xScale.domain()[0]),
                cy: d => yScale(d[xScale.domain()[0]]),
                r: dotRadius,
                fill: d => colourScale(d[colourProperty]),
                stroke: 'none',
                opacity: (d) => {
                    if ((groupNames.length > 0 && d[colourProperty]) || groupNames.length === 0) {
                        return 1;
                    }
                    return 0.2;
                },
            });

        labeled.append('text')
            .attrs({
                class: 'highlighted-label',
                'text-anchor': 'end',
                y: d => yScale(d[xScale.domain()[0]]),
                dy: 5,
                dx: -dotRadius * 1.5,
            })
            .text(labelTextStart);

// end circle...
        parent.append('circle')
            .attrs({
                class: 'highlighted-circle',
                cx: xScale(xScale.domain()[1]),
                cy: d => yScale(d[xScale.domain()[1]]),
                r: dotRadius,
                fill: d => colourScale(d[colourProperty]),
                stroke: 'none',
                opacity: (d) => {
                    if ((groupNames.length > 0 && d[colourProperty]) || groupNames.length === 0) {
                        return 1;
                    }
                    return 0.2;
                },
            });

        labeled.append('text')
            .attrs({
                class: 'highlighted-label',
                y: d => yScale(d[xScale.domain()[1]]),
                x: xScale(xScale.domain()[1]),
                dy: 5,
                dx: dotRadius * 1.5,
            })
            .text(labelTextEnd);

        parent.append('text');
    }

    chart.labelTextStart = (f) => {
        labelTextStart = f;
        return chart;
    };

    chart.labelTextEnd = (f) => {
        labelTextEnd = f;
        return chart;
    };

    chart.includeLabel = (f) => {
        includeLabel = f;
        return chart;
    };

    chart.xDomain = (x) => {
        xScale.domain(x);
        return chart;
    };

    chart.yAxisAlign = (d) => {
        if (!d) return yAxisAlign;
        yAxisAlign = d;
        return chart;
    };

    chart.yDomain = (x) => {
        yScale.domain(x);
        return chart;
    };

    chart.xRange = (x) => {
        xScale.range(x);
        return chart;
    };

    chart.yRange = (x) => {
        yScale.range(x);
        return chart;
    };

    chart.dotRadius = (x) => {
        dotRadius = x;
        return chart;
    };

    chart.groupNames = (x) => {
        groupNames = x;
        return chart;
    };

    chart.colourPalette = (d, groups, setPalette) => {
        if (groups.length > 0 && setPalette === false) {
            if (d === 'social' || d === 'video') {
                colourScale.range(gChartcolour.mutedFirstLineSocial);
            } else if (d === 'webS' || d === 'webM' || d === 'webL') {
                colourScale.range(gChartcolour.mutedFirstLineWeb);
            } else if (d === 'print') {
                colourScale.range(gChartcolour.mutedFirstLinePrint);
            }
        } else if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webL') {
            colourScale.range(gChartcolour.lineWeb);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    };

    chart.colourRange = (x) => {
        colourScale.range(x);
        return chart;
    };

    chart.colourDomain = (x) => {
        colourScale.domain(x);
        return chart;
    };

    chart.colourProperty = (x) => {
        colourProperty = x;
        return chart;
    };

    chart.setPalette = (x) => {
        setPalette = x;
        return chart;
    };

    chart.xScale = (x) => {
        if (!x) return xScale;
        xScale = x;
        return chart;
    };

    chart.yScale = (x) => {
        if (!x) return yScale;
        yScale = x;
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
