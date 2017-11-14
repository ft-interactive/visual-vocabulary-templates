import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

export function draw() {
    let xScale = d3.scaleLinear();
    let yScale = d3.scaleBand();
    let seriesNames = [];
    let yAxisAlign = 'right';
    let rem = 16;
    let showNumberLabels = false; // show numbers on end of bars
    let invertScale = false;
    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);

    function chart(parent) {
        parent.attr('transform', d => `translate(0,${yScale(d.name)})`);

        parent.append('rect')
            .attr('class', 'columns')
            .attr('y', d => yScale(0))
            .attr('height', () => yScale.bandwidth())
            .attr('x', d => { if(invertScale === true) {
                    return xScale(d.end);
                } else {
                    return xScale(d.start);
                }   
            })
            .attr('width', d => { if(invertScale === true) {
                    return Math.abs(xScale(d.end) - xScale(d.start))
                } else {
                    return Math.abs(xScale(d.start) - xScale(d.end))
                }
            })
            .attr('fill', d => colourScale(d.group));

        parent.append('line')
            .attr('y1',0)
            .attr('y2', () => yScale.bandwidth() * 2.25)
            .attr('x1', d => { if(d.value < 0) {
                    return xScale(d.start)
                } else {
                    return xScale(d.end)
                }
            })
            .attr('x2', d => { if(d.value < 0) {
                    return xScale(d.start)
                } else {
                    return xScale(d.end)
                }
            });

        if (showNumberLabels) {
            parent.append('text')
                .html(d => d.value)
                .attr('class', 'column-label')
                .attr('y', d => (yScale.bandwidth() / 2))
                .attr('x', d => { if(invertScale === true) {
                        return xScale(d.start)
                    } else {
                        return xScale(d.end)
                    }
                })
                .attr('dx', (d) => {return (rem / 4); })
                .attr('dy', (d) => {return (rem / 4); })
                .attr('font-size', rem)
                .style('text-anchor', 'start');
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
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.barPrint);
        }
        return chart;
    };

    chart.showNumberLabels = (d) => {
        if (!d) return showNumberLabels;
        showNumberLabels = d;
        return chart;
    };
    chart.invertScale = (d) => {
        if (typeof d === 'undefined') return invertScale;
        invertScale = d;
        return chart;
    };
    return chart;
}
