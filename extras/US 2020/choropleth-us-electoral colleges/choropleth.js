import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';
import topojson from 'topojson-client';

export function draw() {
    // let interpolation =d3.curveLinear
    let colourScale = d3.scaleThreshold();
    let level = 'states';
    let rem = 16;
    var projection = d3.geoIdentity()
                .scale(0.67)

    function chart(parent) {

        const states = parent.append('g')
            .attr('id', 'states')
        const path = d3.geoPath().projection(projection)

        
        if (level == 'states') {
            states.selectAll('path')
            .data(d => topojson.feature(d, d.objects.states).features)
            .enter()
            .append('path')
            .attr('fill', 'none')
            .attr('id', d => d.id)
            .attr('stroke', '#777')
            .attr('stroke-width', 0.77)
            .attr('d', path)
        }

    }

    chart.level = (d) => {
        if (!d) return level;
        level = d;
        return chart;
    };

    chart.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return chart;
    };

    chart.projection = (d) => {
        if (!d) return projection;
        projection = d;
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
