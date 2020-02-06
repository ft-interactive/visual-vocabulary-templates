import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';


export function draw() {
    let rem = 10;
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let seriesNames = []; // eslint-disable-line no-unused-vars
    let highlightNames = []; // eslint-disable-line no-unused-vars
    let intraday;
    let yAxisAlign = 'right';
    let markers = false; // eslint-disable-line no-unused-vars
    const includeAnnotations = d => (d.annotate !== '' && d.annotate !== undefined); // eslint-disable-line
    let annotate = false; // eslint-disable-line
    const interpolation = d3.curveLinear; // eslint-disable-line no-unused-vars
    let colourScale = d3.scaleOrdinal();
    let boxWidth = 7;

    function chart(parent) {
        boxWidth *= 0.5;

        parent.append('line')
            .attr('y1', d => yScale(+d.high))
            .attr('x1', d => xScale(d.date))
            .attr('y2', (d) => {
                if (d.open > d.close) { return +yScale(d.open); }
                return +yScale(d.close);
            })
            .attr('x2', d => xScale(d.date))
            .attr('class', 'whisker')
            .style('stroke', (d) => {
                if (d.close > d.open) { return colourScale(3); }
                return colourScale(7);
            });

        parent.append('line')
            .attr('y1', d => yScale(+d.low))
            .attr('x1', d => xScale(d.date))
            .attr('y2', (d) => {
                if (d.open < d.close) { return +yScale(d.open); } return +yScale(d.close);
            })
            .attr('x2', d => xScale(d.date))
            .attr('class', 'whisker')
            .style('stroke', (d) => {
                if (d.close > d.open) { return colourScale(3); }
                return colourScale(7);
            });

        parent.append('line')
            .attr('y1', d => yScale(+d.high))
            .attr('x1', d => xScale(d.date) - (boxWidth / 4))
            .attr('y2', d => yScale(+d.high))
            .attr('x2', d => xScale(d.date) + (boxWidth / 4))
            .attr('class', 'whisker')
            .style('stroke', (d) => {
                if (d.close > d.open) { return colourScale(3); }
                return colourScale(7);
            });

        parent.append('line')
            .attr('y1', d => yScale(+d.low))
            .attr('x1', d => xScale(d.date) - (boxWidth / 4))
            .attr('y2', d => yScale(+d.low))
            .attr('x2', d => xScale(d.date) + (boxWidth / 4))
            .attr('class', 'whisker')
            .style('stroke', (d) => {
                if (d.close > d.open) { return colourScale(3); }
                return colourScale(7);
            });

        parent.append('rect')
            .attr('x', d => xScale(d.date) - (boxWidth / 2))
            .attr('width', boxWidth)
            .attr('y', d => yScale(d.y))
            .attr('fill','none')
            .attr('height', d => Math.abs(yScale(d.height) - yScale(0)))
            .attr('class', 'whisker')
            .style('stroke', (d) => {
                if (d.close > d.open) { return colourScale(3); }
                return colourScale(7);
            });
    }
    chart.boxWidth = (d) => {
        if (!d) return boxWidth;
        boxWidth = d;
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
    chart.highlightNames = (d) => {
        highlightNames = d;
        return chart;
    };
    chart.intraday = (d) => {
        if (d === undefined) return intraday;
        intraday = d;
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
    chart.annotate = (d) => {
        annotate = d;
        return chart;
    };
    chart.markers = (d) => {
        if (typeof d === 'undefined') return markers;
        markers = d;
        return chart;
    };
    chart.colourPalette = (d) => {
        if (!d) return colourScale;
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.categorical_line);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        } else if (d && d.name && d.name === 'scale') {
            colourScale = d;
        }
        return chart;
    };

    return chart;
}

export function drawVolumes() {
    let rem = 10;
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let seriesNames = []; // eslint-disable-line no-unused-vars
    let highlightNames = []; // eslint-disable-line no-unused-vars
    let intraday;
    let yAxisAlign = 'right';
    let markers = false; // eslint-disable-line no-unused-vars
    const includeAnnotations = d => (d.annotate !== '' && d.annotate !== undefined); // eslint-disable-line
    let annotate = false; // eslint-disable-line
    const interpolation = d3.curveLinear; // eslint-disable-line no-unused-vars
    let colourScale = d3.scaleOrdinal();
    let boxWidth = 7;

    function volumes(parent) {
        boxWidth *= 0.5;

        parent.append('rect')
            .attr('x', d => xScale(d.date) - (boxWidth / 2))
            .attr('width', boxWidth)
            .attr('y', d => yScale(d.volume))
            .attr('height', d => Math.abs(yScale(d.volume) - yScale(0)))
            .attr('fill', colourScale(4));
    }
    volumes.boxWidth = (d) => {
        if (!d) return boxWidth;
        boxWidth = d;
        return volumes;
    };
    volumes.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return volumes;
    };
    volumes.yAxisAlign = (d) => {
        if (!d) return yAxisAlign;
        yAxisAlign = d;
        return volumes;
    };
    volumes.highlightNames = (d) => {
        highlightNames = d;
        return volumes;
    };
    volumes.intraday = (d) => {
        if (d === undefined) return intraday;
        intraday = d;
        return volumes;
    };
    volumes.seriesNames = (d) => {
        if (typeof d === 'undefined') return seriesNames;
        seriesNames = d;
        return volumes;
    };
    volumes.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return volumes;
    };
    volumes.plotDim = (d) => {
        if (!d) return window.plotDim;
        window.plotDim = d;
        return volumes;
    };
    volumes.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return volumes;
    };
    volumes.annotate = (d) => {
        annotate = d;
        return volumes;
    };
    volumes.markers = (d) => {
        if (typeof d === 'undefined') return markers;
        markers = d;
        return volumes;
    };
    volumes.colourPalette = (d) => {
        if (!d) return colourScale;
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.categorical_line);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        } else if (d && d.name && d.name === 'scale') {
            colourScale = d;
        }
        return volumes;
    };

    return volumes ;
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
            .attr('height', () => yScale.range()[0]);
    }

    highlights.yScale = (d) => {
        yScale = d;
        return highlights;
    };
    highlights.xScale = (d) => {
        xScale = d;
        return highlights;
    };
    return highlights;
}

export function drawAnnotations() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let rem = 10;

    function annotations(parent) {
        parent.append('line')
            .attr('class', 'annotation')
            .attr('x1', d => xScale(d.date))
            .attr('x2', d => xScale(d.date))
            .attr('y1', yScale.range()[0])
            .attr('y2', yScale.range()[1] - 5);

        parent.append('text')
            .attr('class', 'annotation')
            .attr('text-anchor', 'middle')
            .attr('x', d => xScale(d.date))
            .attr('y', yScale.range()[1] - (rem / 2))
            .text(d => d.annotate);
    }

    annotations.yScale = (d) => {
        yScale = d;
        return annotations;
    };
    annotations.xScale = (d) => {
        xScale = d;
        return annotations;
    };
    annotations.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return annotations;
    };
    return annotations;
}
