import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';

export function draw() {
    let yScale0 = d3.scaleBand();
    let yScale1 = d3.scaleBand();
    let xScale = d3.scaleLinear();
    let seriesNames = [];
    let colourProperty = 'name'; // eslint-disable-line
    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);
    let rem = 10;
    let numbers = false;


    function bars(parent) {
        parent.attr('transform', d => `translate(0,${yScale0(d.name)})`);

        parent.selectAll('rect')
            .data(d => d.groups)
            .enter()
            .append('rect')
            .attr('class', 'bars')
            .attr('y', d => yScale1(d.name))
            .attr('height', () => yScale1.bandwidth())
            .attr('x', d => xScale(Math.min(0, d.value)))
            .attr('width', d => Math.abs(xScale(d.value) - xScale(0)))
            .attr('fill', d => colourScale(d.name));

        if (numbers) {
            parent.selectAll('text')
            .data(d => d.groups)
            .enter()
            .append('text')
            .html(d => d.value)
            .attr('class', 'label')
            .style('text-anchor', 'end')
            .attr('y', d => yScale1(d.name) + (yScale1.bandwidth() / 2) + (rem / 2.5))
            .attr('x', () => xScale(0))
            .attr('fill', '#ffffff');

            let labelWidth = 0;
            parent.selectAll('.label').each(function calcLabels() {
                labelWidth = Math.max(this.getBBox().width, labelWidth);
                // console.log(labelWidth);
                // positionText(this,labelWidth)
            });

            parent.selectAll('.label').each(function positionLabels() {
                positionText(this, labelWidth);
            });
        }

        function positionText(item, labelWidth) {
            const object = d3.select(item);
            object.attr('transform', () => `translate(${labelWidth + (rem / 2)},0)`);
        }
    }

    bars.yScale0 = (d) => {
        yScale0 = d;
        return bars;
    };
    bars.yDomain0 = (d) => {
        yScale0.domain(d);
        return bars;
    };
    bars.yRange0 = (d) => {
        yScale0.rangeRound(d);
        return bars;
    };
    bars.yScale1 = (d) => {
        if (!d) return yScale1;
        yScale1 = d;
        return bars;
    };
    bars.yDomain1 = (d) => {
        yScale1.domain(d);
        return bars;
    };
    bars.yRange1 = (d) => {
        yScale1.rangeRound(d);
        return bars;
    };
    bars.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return bars;
    };
    bars.xDomain = (d) => {
        xScale.domain(d);
        return bars;
    };

    bars.xRange = (d) => {
        xScale.range(d);
        return bars;
    };
    bars.colourProperty = (d) => {
        colourProperty = d;
        return bars;
    };
    bars.colourPalette = (d) => {
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webL') {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return bars;
    };
    bars.seriesNames = (d) => {
        seriesNames = d;
        return bars;
    };
    bars.rem = (d) => {
        rem = d;
        return bars;
    };
    bars.numbers = (d) => {
        numbers = d;
        return bars;
    };

    return bars;
}
