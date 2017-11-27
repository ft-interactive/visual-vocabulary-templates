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

        var root = d3.hierarchy(newData)
            .sum(function (d) {
                return d.value;
            })
            .sort(function (a, b) {
                return b.height - a.height || b.value - a.value;
            });
        console.log('root', root);
 
        treemap(root);

        var map = parent.append('g')
            .attr('id', 'map')
            .attr('width', width )
            .attr('height', height)


        var cell = map.selectAll('g')
            .data(root.leaves())
            .enter()
            .append('g');

        cell.append('rect').attr('x', function (d) {return d.x0;})
        .attr('y', d =>  d.y0)
        .attr('width', (d) => {return d.x1 - d.x0;})
        .attr('height', (d) => {return d.y1 - d.y0;})
        .attr('stroke', '#FFFFFF')
        .attr('fill', (d) => {return colourScale(d.data.category)});

        

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

