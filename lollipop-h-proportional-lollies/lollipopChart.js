import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

export function draw() {
    let colorproperty = 'group'
    let xScale = d3.scaleLinear();
    let yScale0 = d3.scaleBand();
    let yScale1 = d3.scaleBand();
    let circleScale = d3.scaleSqrt();
    let logScale = false
    let opacity = .5
    let dotOutline;

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
        const min = xScale.domain()[0]
        const barWidth = yScale1.domain().length
        parent.attr('transform', d => `translate(0,${yScale0(d.name)})`);

        let lollies = parent.selectAll('line')
            .data(d => d.groups)
            .enter()
            .append('g')
        
        lollies.append('line')
            .attr('y1', d => yScale1(d.group) + (yScale1.bandwidth() / 2))
            .attr('y2', d => yScale1(d.group) + (yScale1.bandwidth() / 2))
            .attr('x1', (d) => {
                if(logScale) {
                    return xScale(Math.min(min, d.value));
                }                
                return xScale(Math.min(0, d.value))
                })
            .attr('x2', d => {
                if(logScale) {
                    return xScale(Math.max(min, d.value));
                }                
                return xScale(Math.max(0, d.value))
                })
            .attr('stroke-width', stalkWidth * yScale1.bandwidth())
            .attr('stroke', d => colourScale(d[colorproperty]));
        
            lollies.append('circle')
                    .attr('cx', d => xScale(d.value))
                    .attr('cy', d=> yScale1(d.group) + (yScale1.bandwidth() / 2))
                    .attr('r', d => circleScale(d.radius))
                    .attr('fill', d => colourScale(d[colorproperty]))
                    .attr('opacity', opacity)
                    .attr('stroke-width',rem  *0.05)
                    .attr('stroke', dotOutline)
            
    }

    chart.circleScale = (d) => {
        if (!d) return circleScale;
        circleScale = d;
        return chart;

    };chart.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return chart;
    };
    chart.xAxisAlign = (d) => {
        if (!d) return xAxisAlign;
        xAxisAlign = d;
        return chart;
    };
    chart.colorproperty = (d) => {
        if (!d) return colorproperty;
        colorproperty = d;
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
    chart.opacity = (d) => {
        if (!d) return opacity;
        opacity = d;
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
    chart.logScale = (d) => {
        if (!d) return logScale;
        logScale = d;
        return chart;
    };
    chart.seriesNames = (d) => {
        if (typeof d === 'undefined') return seriesNames;
        seriesNames = d;
        return chart;
    };
    chart.yScale0 = (d) => {
        if (!d) return yScale0;
        yScale0 = d;
        return chart;
    };
    chart.yScale1 = (d) => {
        if (!d) return yScale1;
        yScale1 = d;
        return chart;
    };
    chart.yDomain = (d) => {
        if (typeof d === 'undefined') return yScale0.domain();
        yScale0.domain(d);
        return chart;
    };
    chart.yRangeRound = (d) => {
        yScale0.rangeRound(d);
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
            dotOutline = '#ffffff';
        } else if (d === 'webS' || d === 'webM' || d === 'webL') {
            colourScale.range(gChartcolour.lineWeb);
            dotOutline = '#000000';
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
            dotOutline = '#000000';
        }
        return chart;
    };

    return chart;
}
