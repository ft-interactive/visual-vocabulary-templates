import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';
import topojson from 'topojson-client';

export function draw(geography, party) {
    // let interpolation =d3.curveLinear
    let colourScale = d3.scaleOrdinal().domain();
    let projection = d3.geoMercator();
    let rem = 16;
    const path = d3.geoPath().projection(projection);

    function chart(parent, useCanvas = false) {
        const { data } = parent.datum();
        if (useCanvas) {} // eslint-disable-line
        else { // SVG rendering here (default)
            parent.selectAll('path.region')
                .data(topojson.feature(geography, geography.objects.wahlkreise).features)
                .enter().append('path')
                .attr('d', d => path(d))
                .attr('fill', d => colourScale(party(data.find(item => d.id === Number(item.number)).winner)));
        }
    } // eslint-disable-line

    chart.projection = (d) => {
        if (!d) return projection;
        projection = d;
        path.projection(projection);
        return chart;
    };

    chart.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return chart;
    };

    chart.colourPalette = (d) => {
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webL') {
            colourScale.range(gChartcolour.lineWeb);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        } else if (d && d.name && d.name === 'scale') {
            colourScale = d;
        }
        return chart;
    };

    return chart;
}
