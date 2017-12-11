import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';
import 'd3-selection-multi';

export function draw() {
    let rem = 10;
    const colourScale = d3.scaleOrdinal();
    // .domain(['group']);
    let colourProperty = 'group'; // eslint-disable-line no-unused-vars
    const setPalette = false; // eslint-disable-line no-unused-vars
    const includeLabel = true; // eslint-disable-line no-unused-vars
    let seriesNames = []; // eslint-disable-line no-unused-vars
    let outerRadius;
    let innerRadius;
    let frameName;
    let divisor;
    // let setHighlight;


    function chart(parent) {
        const arc = d3.arc()
            .outerRadius(outerRadius)
            .innerRadius(innerRadius);

        const ribbon = d3.ribbon()
            .radius(innerRadius);

        const group = parent.append('g')
            .attr('class', 'groups')
            .selectAll('.groups')
            .data(d => d.groups)
            .enter()
            .append('g');

        group
            .append('path')
            .attr('d', arc)
            .attr('id', (d, i) => seriesNames[i])
            .style('fill', d => colourScale(d.index))
            .on('click', fade());

        const groupTick = group.selectAll('.baseline')
            .data(d => groupTicks(d, divisor))
            .enter()
            .append('g')
            .attr('class', 'axis baseline tick')
            .attr('transform', d => `rotate(${(d.angle * (180 / Math.PI)) - 90}) translate(${outerRadius},0)`);
            // .attr('transform', d => `rotate((${d.angle} * 180 / Math.PI - 90)) translate(${outerRadius}, 0)`);

        groupTick.append('line')
            .attr('x2', (rem / 2));

        groupTick
            .append('text')
            .attr('x', d => (d.angle > Math.PI ? (rem / 2.5) : (rem / 1.75)))
            .attr('dy', (rem / 3))
            .attr('transform', d => (d.angle > Math.PI ? `rotate(180) translate(${-rem})` : null))
            .style('text-anchor', (d) => {
                const textAnchor = d.angle > Math.PI ? 'end' : null;
                return textAnchor;
            })
            .text(d => d.value);

        parent
            .append('g')
            .attr('class', 'ribbons')
            .selectAll('path')
            .data(d => d)
            .enter()
            .append('path')
            .attr('d', ribbon)
            .attr('id', d => `from ${seriesNames[d.source.index]} to ${seriesNames[d.target.index]}`)
            .style('fill', d => colourScale(d.target.index))
            .style('stroke', d => d3.rgb(colourScale(d.target.index)).darker());

        // Returns an array of tick angles and values for a given group and step.
        function groupTicks(d, step) {
            const k = (d.endAngle - d.startAngle) / d.value;
            return d3.range(0, d.value, step).map(value => ({ value, angle: (value * k) + d.startAngle }));
        }

        function fade() {
            return function setOpacity(g, i) {
                d3.selectAll('.ribbons path')
                    .classed('faded', false)
                    .classed('highlight', true);
                d3.selectAll('.ribbons path')
                    .filter(d => d.source.index !== i && d.target.index !== i)
                    .classed('faded', true)
                    .classed('highlight', false);
            };
        }
    }

    chart.seriesNames = (d) => {
        if (typeof d === 'undefined') return seriesNames;
        seriesNames = d;
        return chart;
    };

    chart.divisor = (d) => {
        if (!d) return divisor;
        divisor = d;
        return chart;
    };

    chart.outerRadius = (d) => {
        if (!d) return outerRadius;
        outerRadius = d;
        return chart;
    };

    chart.innerRadius = (d) => {
        if (!d) return innerRadius;
        innerRadius = d;
        return chart;
    };

    chart.colourPalette = (d) => {
        if (!d) return colourScale;
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (['webS', 'webM', 'webMDefault', 'webL'].includes(d)) {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    };

    chart.colourPicker = (d) => {
        if (d === 'social' || d === 'video' || d === 'print') {
            setHighlight = 1;
        } else if (['webS', 'webM', 'webMDefault', 'webL'].includes(d)) {
            setHighlight = 4;
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
    chart.frameName = (d) => {
        if (!d) return frameName;
        frameName = d;
        return chart;
    };

    return chart;
}
