import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';


export function draw() {
    let rem = 10;
    let seriesNames = [];
    const colourScale = d3.scaleOrdinal()
    // .range(gChartcolour.lineWeb)
        .domain(seriesNames);

    function chart(parent) {
        const width = window.plotDim.width;
        const height = window.plotDim.height;

        const treemap = d3.treemap().size([width, height]).paddingInner(1);

        const newData = parent.data()[0];

        const root = d3.hierarchy(newData, d => d.children)
            .sum(d => d.value);
            // .sort(function (a, b) {
            //     console.log (a,b)
            //     return b.value - a.value || b.value - a.value;
            // });

        treemap(root);

        const map = parent.append('g')
            .attr('id', 'map')
            .attr('width', width)
            .attr('height', height);

        const cell = map.selectAll('g')
            .data(root.leaves())
            .enter()
            .append('g');

        cell.append('rect')
            .attr('class', 'bars')
            .attr('x', d => d.x0)
            .attr('y', d => d.y0)
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .attr('fill', d => colourScale(d.data.category));

        cell.append('text')
            .attr('dx', d => d.x0 + (rem / 2))
            .attr('dy', d => d.y0 + rem)
            .attr('font-size', rem)
            .attr('class', 'highlight-label')
            .text(d => (d.data.highlight ? `${d.data.name} ${d.value}` : undefined));
    }

    chart.seriesNames = (d) => {
        seriesNames = d;
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
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.barPrint);
        }
        return chart;
    };

    return chart;
}
