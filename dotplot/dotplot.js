import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';

export function draw() {
    let yScale = d3.scaleBand();
    let xScale = d3.scaleLinear();
    let groupNames = [];
    let colourProperty = 'name'; // eslint-disable-line
    const colourScale = d3.scaleOrdinal()
        .domain(groupNames);
    let rem = 10;
    let lines = false;


    function dots(parent) {

        if (lines) {
            parent.append('line')
                .attr('y1', d => yScale(d.group) + (yScale.bandwidth() * 0.5))
                .attr('x1', d => xScale(d.min))
                .attr('y2', d => yScale(d.group) + (yScale.bandwidth() * 0.5))
                .attr('x2', d => xScale(d.max));
        }

        parent.selectAll('circle')
            .data(d => d.values)
            .enter()
            .append('circle')
            .attr('class', 'circle')
            .attr('cy', d => yScale(d.group) + (yScale.bandwidth() * 0.5))
            .attr('cx', d => xScale(d.value))
            .attr('r', rem * 0.5)
            .attr('stroke-width', d => {
                if(d.highlight === 'yes') {return 1}
                else {return 0}
            })
            .attr('stroke', '#000000')
            .attr('fill', d => colourScale(d.group));

        parent.selectAll('annotation')
            .data(d => {return d.values.filter(el => el.highlight === 'yes')})
            .enter()
            .append('text')
                .attr('class', 'annotation')
                .attr('text-anchor', 'middle')
                .attr('x', d => xScale(d.value))
                .attr('y', d => yScale(d.group))
                .text(d => d.name);
    }

    dots.lines = (d) => {
        if (d === undefined) return lines;
        lines = d;
        return dots;
    };
    dots.yScale = (d) => {
        yScale = d;
        return dots;
    };
    dots.yDomain = (d) => {
        yScale.domain(d);
        return dots;
    };
    dots.yRange = (d) => {
        yScale.rangeRound(d);
        return dots;
    };
    dots.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return dots;
    };
    dots.xDomain = (d) => {
        xScale.domain(d);
        return dots;
    };

    dots.xRange = (d) => {
        xScale.range(d);
        return dots;
    };
    dots.colourProperty = (d) => {
        colourProperty = d;
        return dots;
    };
    dots.colourPalette = (d) => {
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return dots;
    };
    dots.groupNames = (d) => {
        groupNames = d;
        return dots;
    };
    dots.rem = (d) => {
        rem = d;
        return dots;
    };
    return dots;
};

export function drawQuartiles() {
    let yScale = d3.scaleBand();
    let xScale = d3.scaleLinear();
    let groupNames = [];
    let colourProperty = 'name'; // eslint-disable-line
    const colourScale = d3.scaleOrdinal()
        .domain(groupNames);
    let rem = 10;
    let quantiles = false;

    function quants(parent) {
        parent.selectAll('circle')
            .data(d => d.quantiles)
                .enter()
                .append('circle')
                .attr('class','circle')
                .attr('cy', d => yScale(d.group) + (yScale.bandwidth()*.5))
                .attr('cx', d => xScale(d.value))
                .attr('r', d => rem * 0.5)
                .attr('fill', d => colourScale(d.group))
                .attr('stroke-width', 1)
                .attr('stroke', '#000000')
                .style('fill-opacity', 1.0);       
        
        parent.selectAll('.annotation')
            .data(d => d.quantiles)
            .enter()
                .append('text')
                .attr('class', 'annotation')
                .attr('text-anchor', 'middle')
                .attr('x', d => xScale(d.value))
                .attr('y', d => yScale(d.group))
                .text(d => d.name);
    }
    quants.quantiles = (d) => {
        if (d === undefined) return quantiles;
        quantiles = d;
        return quants;
    };
    quants.yScale = (d) => {
        yScale = d;
        return quants;
    };
    quants.yDomain = (d) => {
        yScale.domain(d);
        return quants;
    };
    quants.yRange = (d) => {
        yScale.rangeRound(d);
        return quants;
    };
    quants.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return quants;
    };
    quants.xDomain = (d) => {
        xScale.domain(d);
        return quants;
    };

    quants.xRange = (d) => {
        xScale.range(d);
        return quants;
    };
    quants.colourProperty = (d) => {
        colourProperty = d;
        return quants;
    };
    quants.colourPalette = (d) => {
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return quants;
    };
    quants.groupNames = (d) => {
        groupNames = d;
        return quants;
    };
    quants.rem = (d) => {
        rem = d;
        return quants;
    };
    return quants;

};
