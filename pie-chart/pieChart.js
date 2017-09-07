import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';
import 'd3-selection-multi';

export function draw() {
    let rem = 10;
    const colourScale = d3.scaleOrdinal()
        // .range('gChartcolour.basicLineWeb');
        // .domain(['group']);
    let colourProperty = 'group';
    let setPalette = false;
    let includeLabel = true;
    let seriesNames = [];
    let radius;


    function chart(parent) {

        const path = d3.arc()
                    .outerRadius(radius)
                    .innerRadius(0);

        const label = d3.arc()
            .outerRadius(radius -20)
            .innerRadius(radius - 20);

        parent.append('path')
              .attr('d', path)
              .attr('fill', d => colourScale(d.data.name));

        parent.append('text')
              .attr('transform', function(d) { return 'translate(' + label.centroid(d) + ')'; })
              .attr('dy', '0.35em')
              .attr('class', 'pie-value')
              .text(d => d.data.value)
    }


    chart.seriesNames = (d) => {
        seriesNames = d;
        return chart;
    };

    chart.radius = (d) => {
        radius = d;
        return chart;
    };

    chart.colourPalette = (d) => {
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
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

    return chart;
}
