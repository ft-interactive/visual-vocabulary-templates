import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';

export function draw() {
    let yScale = d3.scaleBand();
    let xScaleL = d3.scaleLinear();
    let xScaleR = d3.scaleLinear();
    let seriesNames = [];
    let colourProperty = 'name'; // eslint-disable-line
    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);
    let rem = 10;
    let showNumberLabels = false;// show numbers on end of bars
    let highlightGeneration = 'millennial';
    let nonMillennials = '#D4CBC3';

    function bars(parent) {
        parent.append('rect')
            .attr('class', 'bars')
            .attr('y', d => yScale(d.name))
            .attr('height', () => yScale.bandwidth())
            .attr('x', d => xScaleL(Math.max(0, +d[seriesNames[0]])) - (xScaleL(0) * 0.02))
            .attr('width', d => Math.abs(xScaleL(+d[seriesNames[0]]) - xScaleL(0)))
            .attr('fill', (d) => {
                if (d.generation === highlightGeneration) {
                    return '#EE5E2B';
                }
                return nonMillennials;
            });

        parent.append('rect')
            .attr('class', 'bars')
            .attr('y', d => yScale(d.name))
            .attr('height', () => yScale.bandwidth())
            .attr('x', d => xScaleR(Math.min(0, +d[seriesNames[1]])) + (xScaleR(0) * 0.02))
            .attr('width', d => Math.abs(xScaleR(+d[seriesNames[1]]) - xScaleR(0)))
            .attr('fill', (d) => {
                if (d.generation === highlightGeneration) {
                    return '#44A4AA';
                }
                return nonMillennials;
            });

        if (showNumberLabels) {
            parent.append('text')
                .html(d => +d[seriesNames[0]])
                .attr('y', d => yScale(d.name) + (yScale.bandwidth() / 2) + (rem / 2.5))
                .attr('x', xScaleL(0) - (rem / 2))
                .attr('class', 'highlight-label')
                .attr('font-size', rem)
                .style('text-anchor', 'end');

            parent.append('text')
                .html(d => +d[seriesNames[1]])
                .attr('y', d => yScale(d.name) + (yScale.bandwidth() / 2) + (rem / 2.5))
                .attr('x', xScaleR(0) + (rem / 2))
                .attr('class', 'highlight-label')
                .attr('font-size', rem)
                .style('text-anchor', 'start');
        }
    }

    bars.yScale = (d) => {
        yScale = d;
        return bars;
    };
    bars.xScaleL = (d) => {
        if (!d) return xScaleL;
        xScaleL = d;
        return bars;
    };
    bars.xScaleR = (d) => {
        if (!d) return xScaleR;
        xScaleR = d;
        return bars;
    };
    bars.colourProperty = (d) => {
        if (!d) return colourProperty;
        colourProperty = d;
        return bars;
    };
    bars.colourPalette = (d) => {
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (['webS', 'webM', 'webMDefault', 'webL'].includes(d)) {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.barPrint);
        }
        return bars;
    };

    bars.seriesNames = (d) => {
        if (!d) return seriesNames;
        seriesNames = d;
        return bars;
    };
    bars.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return bars;
    };
    bars.showNumberLabels = (d) => {
        if (!d) return showNumberLabels;
        showNumberLabels = d;
        return bars;
    };

    return bars;
}
