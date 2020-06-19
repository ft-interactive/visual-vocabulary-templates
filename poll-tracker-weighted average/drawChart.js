import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';


export function drawDots() {
    let rem = 10;
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let seriesNames = [];
    let yAxisAlign = 'right';
    let colourScale = d3.scaleOrdinal()
    let dotOpacity = 1
    // .range(gChartcolour.lineWeb)
    //.domain(seriesNames);

    function dots(parent) {
        parent.selectAll('circle')
            .data((d) => { return d.dots.filter(el => el.highlight === "" || el.highlight === undefined )})
            .enter()
            .append('circle')
            .attr('cx', d => xScale(d.date))
            .attr('cy', d => yScale(d.value))
            .attr('r', rem / 2.5)
            .attr('fill', d => colourScale(d.name))
            .attr('opacity', dotOpacity);

        const highlights = parent.selectAll('.dotHighlight')
            .data((d) => {return d.dots.filter(el => el.highlight ==="yes")})
            .enter()
            .append('g')
            .attr('class', 'dotHighlight');

        highlights
            .append('circle')
            .attr('cx', d => xScale(d.date))
            .attr('cy', d => yScale(d.value))
            .attr('r', rem / 2.5)
            .attr('fill', d => colourScale(d.name))
            .attr('opacity', 1.0)

        highlights
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('x', d => xScale(d.date))
            .attr('y', d => yScale(d.value) - (rem*.75))
            .text(d => d.pollster + " " + d.value)
    }

    dots.dotOpacity = (d) => {
        if (!d) return dotOpacity;
        dotOpacity = d;
        return dots;
    };

    dots.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return dots;
    };

    dots.yAxisAlign = (d) => {
        if (!d) return yAxisAlign;
        yAxisAlign = d;
        return dots;
    };

    dots.seriesNames = (d) => {
        if (typeof d === 'undefined') return seriesNames;
        seriesNames = d;
        return dots;
    };

    dots.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return dots;
    };

    dots.plotDim = (d) => {
        if (!d) return window.plotDim;
        window.plotDim = d;
        return dots;
    };

    dots.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return dots;
    };

    dots.colourPalette = (d) => {
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
        return dots;
    };

    return dots;
}

export function drawLines() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let yAxisAlign = 'right';
    let interpolation = d3.curveLinear;
    let colourScale = d3.scaleOrdinal()
    // .range(gChartcolour.lineWeb)
    let rem = 10;

    function lines(parent) {
        const lineData = d3.line()
        .defined(d => d)
        .curve(interpolation)
        .x(d => xScale(d.date))
        .y(d => yScale(d.average));

        parent.append('path')
            .attr('stroke', (d) => {return colourScale(d.party);
            })
            .attr('id', d => d.party)
            .attr('opacity', 1)
            .attr('d', d => lineData(d.lines)); 
    }

    lines.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return lines;
    };

    lines.yAxisAlign = (d) => {
        if (!d) return yAxisAlign;
        yAxisAlign = d;
        return lines;
    };

    lines.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return lines;
    };

    lines.plotDim = (d) => {
        if (!d) return window.plotDim;
        window.plotDim = d;
        return lines;
    };

    lines.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return lines;
    };

    lines.interpolation = (d) => {
        if (!d) return interpolation;
        interpolation = d;
        return lines;
    };

    lines.colourPalette = (d) => {
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
        return lines;
    };

    return lines;
}

export function drawLabels() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let yAxisAlign = 'right';
    let interpolation = d3.curveLinear;
    let colourScale = d3.scaleOrdinal()
    // .range(gChartcolour.lineWeb)
    let rem = 10;

    function label(parent) {
        let format = d3.format(",.1f")	

        parent.append('text')
            .attr('class','annotations')
            .attr('x', d => d.x)
            .attr('y', d => yScale(d.y))
            .style('fill', d =>  colourScale(d.name))
            .text(d => format(d.y) + '% ' + d.name)
            
    }

    label.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return label;
    };

    label.yAxisAlign = (d) => {
        if (!d) return yAxisAlign;
        yAxisAlign = d;
        return label;
    };

    label.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return label;
    };

    label.plotDim = (d) => {
        if (!d) return window.plotDim;
        window.plotDim = d;
        return label;
    };

    label.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return label;
    };



    label.colourPalette = (d) => {
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
        return label;
    };

    return label;
}

export function drawHighlights() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let invertScale = false;

    function highlights(parent) {
        parent.append('rect')
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

    highlights.yRange = (d) => {
        yScale.range(d);
        return highlights;
    };

    highlights.xRange = (d) => {
        xScale.range(d);
        return highlights;
    };

    highlights.invertScale = (d) => {
        invertScale = d;
        return highlights;
    };

    return highlights;
}

export function drawAnnotations() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let rem = 10

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




