import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';


export function draw() {
    let rem = 10;
    let seriesNames = [];
    const colourScale = d3.scaleOrdinal()
    // .range(gChartcolour.lineWeb)
    .domain(seriesNames);

    function chart(parent) {
        const width = plotDim.width;
        const height = plotDim.height;

        let treemap = d3.treemap().size([width, height]).paddingInner(1);

        let newData = parent.data()[0]

        var root = d3.hierarchy(newData, (d) => d.children)
            .sum(function (d) {
                return d.value;
            })
            // .sort(function (a, b) {
            //     console.log (a,b)
            //     return b.value - a.value || b.value - a.value;
            // });
 
        treemap(root);

        var map = parent.append('g')
            .attr('id', 'map')
            .attr('width', width )
            .attr('height', height)

        var cell = map.selectAll('g')
            .data(root.leaves())
            .enter()
            .append('g');

        cell.append('rect')
        .attr('class', 'bars')
        .attr('x', (d) => {return d.x0;})
        .attr('y', d =>  d.y0)
        .attr('width', (d) => {return d.x1 - d.x0;})
        .attr('height', (d) => {return d.y1 - d.y0;})
        .attr('fill', (d) => {return colourScale(d.data.category)});

        cell.append('text')
        .attr('dx',(d) => {return d.x0 +(rem/2);})
        .attr('dy',(d) => {return d.y0 +rem;})
        .attr('font-size', rem)
        .attr('class', 'highlight-label')
        .text((d) => {
            if (d.data.highlight) {
                return d.data.name + ' ' + d.value}
            })
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
            colourScale.range(gChartcolour.lineWeb);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    };

    return chart;
}

