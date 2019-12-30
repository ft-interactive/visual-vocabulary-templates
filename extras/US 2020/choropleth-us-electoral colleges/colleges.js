import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';
import topojson from 'topojson-client';

export function drawColleges() {
    // let interpolation =d3.curveLinear
    let colourScale = d3.scaleThreshold();
    let rem = 16;

    function chart(parent) {

        parent.selectAll('circle')
        .data(d => d.votes)
        .enter()
        .call(sim)
        .append('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', rem * 0.15)
        .attr('fill', '#C2B7AF')

    } // eslint-disable-line

    function sim(dots) {
            const data = dots.data()
            console.log('data', data)
            const simulation = d3.forceSimulation(data)
                .force("x", d3.forceX(function (d) { return d.x }))
                .force("y", d3.forceY(function (d) { return d.y }))
                .force("collide", d3.forceCollide(d => (rem * .2)))
            for (var i = 0; i < 250; ++i) simulation.tick()
        }

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
            colourScale.range(gChartcolour.linePrint);
        } else if (d && d.name && d.name === 'scale') {
            colourScale = d;
        }
        return chart;
    };

    return chart;
}
