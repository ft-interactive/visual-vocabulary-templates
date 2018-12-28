import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

let rem = 10;

export function draw() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let seriesNames = [];
    let highlightNames = [];
    let yAxisAlign = 'right';
    let markers = false;
    let interpolation = d3.curveLinear;
    let colourScale = d3.scaleOrdinal()
    // .range(gChartcolour.lineWeb)
    .domain(seriesNames);
    let boxWidth = 20;
    let lines = true;

    function chart(parent) {
        const lineData = d3.line()
        .defined(d => d)
        .curve(interpolation)
        .x(d => xScale(d.date))
        .y(d => yScale(d.value));

        if(lines) {
            parent.append('path')
            .attr('stroke', (d) => {
                if (highlightNames.length > 0 && d.highlightLine === false) {
                    return colourScale.range()[0];
                }
                if (highlightNames.length > 0 && d.highlightLine === true) {
                    return colourScale(d.name);
                } 
                return colourScale(d.name);
            })
            .attr('opacity', (d) => {
                if (highlightNames.length > 0 && d.highlightLine === false) {
                    return 0.5;
                } return 1;
            })
            .attr('d', d => lineData(d.lineData));
            
            parent.append('g')
                .attr('class', 'annotations-holder')
                .append('text')
                .attr('class', 'annotation')
                .attr('class', 'chart-subtitle')
                .attr('x', (d) => {
                    if(d.name === 'value') {
                        return xScale.range()[0] + (rem / 2)
                    }
                    return xScale.range()[1] + (rem/2)
                })
                .attr('y', (d) => {
                    return yScale(d.lineData[d.lineData.length - 1].value) + (rem * 0.3)
                    })
                .style('fill', (d) => {
                    if (highlightNames.length > 0 && d.highlightLine === false) {
                        return colourScale.range()[0];
                    }
                    if (highlightNames.length > 0 && d.highlightLine === true) {
                        return colourScale(d.name);
                    }
                    return colourScale(d.name);
                    })
                .text(d => d.name)

        }
        
        if (markers) {
            parent.selectAll('circle')
                .data(d => d.lineData)
                .enter()
                .append('circle')
                .attr('id', d => `date: ${d.date} value: ${d.value}`)
                .attr('cx', d => xScale(d.date))
                .attr('cy', d => yScale(d.value))
                .attr('r', rem * 0.2)
                .attr('fill', (d) => {
                if (highlightNames.length > 0 && d.highlight=== false) {
                    return colourScale.range()[0];
                }
                if (highlightNames.length > 0 && d.highlight=== true) {
                    return colourScale(d.name);
                } 
                return colourScale(d.name);
            })
                .attr('opacity', (d) => {
                    if (highlightNames.length > 0 && d.highlightLine === false) {
                        return 0.5;
                    } return 1;
                })

        }

        // const range = parent.selectAll('circle')
        //     .data(d => d.dotsData)
        //     .enter()
        
        // range.append('circle')
        //     .classed('markers', true)
        //     .attr('id', d => `date: ${d.date} value: ${d.value}`)
        //     .attr('cx', d => xScale(d.date))
        //     .attr('cy', (d) => {
        //         return yScale(d.low)})
        //     .attr('r', rem * 0.2)
        //     .attr('opacity', 0.6)
        //     .attr('fill', (d) => {return colourScale(d.name);
        //     });

        // range.append('circle')
        //     .classed('markers', true)
        //     .attr('id', d => `date: ${d.date} value: ${d.value}`)
        //     .attr('cx', d => xScale(d.date))
        //     .attr('cy', (d) => {
        //         return yScale(d.high)
        //     })
        //     .attr('r', rem * 0.2)
        //     .attr('opacity', 0.6)
        //     .attr('fill', (d) => {return colourScale(d.name);
        //     });

        // const range2 = parent.selectAll('line')
        //     .data(d => d.rangeData)
        //     .enter()
        // range2.append('line')
        //     .attr('opacity', 0.6)
        //     .attr('y1', d =>  yScale(d.high))
        //     .attr('x1', d => xScale(d.date))
        //     .attr('y2', (d) => yScale(d.low))
        //     .attr('x2', d => xScale(d.date))
        //     .attr('stroke', (d) => {
        //         if (highlightNames.length > 0 && d.highlightLine === false) {
        //             return colourScale.range()[0];
        //         }
        //         if (highlightNames.length > 0 && d.highlightLine === true) {
        //             return colourScale(d.name);
        //         } 
        //         return colourScale(d.name);
        //     })
        //     .attr('stroke-width', 1.5)
        //     .attr('opacity', (d) => {
        //         if (highlightNames.length > 0 && d.highlightLine === false) {
        //             return 0.5;
        //         } return 1;
        //     })

        // range2.append('line')
        //     .attr('y1', d => yScale(d.high))
        //     .attr('x1', d => xScale(d.date) - (boxWidth / 4))
        //     .attr('y2', d => yScale(d.high))
        //     .attr('x2', d => xScale(d.date) + (boxWidth / 4))
        //     .attr('stroke', (d) => {
        //         if (highlightNames.length > 0 && d.highlight === false) {
        //             return colourScale.range()[0];
        //         }
        //         if (highlightNames.length > 0 && d.highlight === true) {
        //             return colourScale(d.name);
        //         } 
        //         return colourScale(d.name);
        //     })
        //     .attr('stroke-width', 1.5)
        //     .attr('opacity', (d) => {
        //         if (highlightNames.length > 0 && d.highlight === false) {
        //             return 0.5;
        //         } return 1;
        //     })

        // range2.append('line')
        //     .attr('y1', d => yScale(d.low))
        //     .attr('x1', d => xScale(d.date) - (boxWidth / 4))
        //     .attr('y2', d => yScale(d.low))
        //     .attr('x2', d => xScale(d.date) + (boxWidth / 4))
        //     .attr('stroke', (d) => {
        //         if (highlightNames.length > 0 && d.highlight === false) {
        //             return colourScale.range()[0];
        //         }
        //         if (highlightNames.length > 0 && d.highlight === true) {
        //             return colourScale(d.name);
        //         } 
        //         return colourScale(d.name);
        //     })
        //     .attr('stroke-width', 1.5)
        //     .attr('opacity', (d) => {
        //         if (highlightNames.length > 0 && d.highlight === false) {
        //             return 0.5;
        //         } return 1;
        //     })




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

    chart.highlightNames = (d) => {
        if (!d) return highlightNames;
        highlightNames = d;
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

    chart.lines = (d) => {
         if (typeof d === 'undefined') return lines;
        lines = d;
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

    chart.markers = (d) => {
        if (typeof d === 'undefined') return markers;
        markers = d;
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
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        } else if (d && d.name && d.name === 'scale') {
            colourScale = d;
        }
        return chart;
    };

    return chart;
}

export function drawHighlights() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let invertScale = false;
    let rem = 10;

    function highlights(parent) {
        parent.append('rect')
            .attr('class', 'highlights')
            .attr('x', d => xScale(d.begin))
            .attr('width', d => xScale(d.end) - xScale(d.begin))
            .attr('y', () => {
                if (invertScale) {
                    return yScale.range()[0];
                }
                return yScale.range()[1];
            })
            .attr('height', () => {
                if (invertScale) {
                    return yScale.range()[1];
                }
                return yScale.range()[0];
            })
    }

    highlights.yScale = (d) => {
        yScale = d;
        return highlights;
    };

    highlights.xScale = (d) => {
        xScale = d;
        return highlights;
    };

    highlights.invertScale = (d) => {
        invertScale = d;
        return highlights;
    };

    highlights.rem = (d) => {
        rem = d;
        return highlights;
    };

    return highlights;
}

export function drawAnnotations() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();

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

    annotations.yRange = (d) => {
        yScale.range(d);
        return annotations;
    };

    annotations.xRange = (d) => {
        xScale.range(d);
        return annotations;
    };

    annotations.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return annotations;
    };

    return annotations;
}

