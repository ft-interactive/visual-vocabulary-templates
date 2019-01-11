import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';
import * as annotation from 'g-annotations';


export function draw() {

    let dotOutline;
    let rem = 10;
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let seriesNames = [];
    let opacity = 0.7;
    let sizeScale;
    let scaleFactor;
    let frameName;
    let plotDim;
    const colourScale = d3.scaleOrdinal()


    function chart(parent, i) {

            const swarm = parent.selectAll('.bee')
                .data((d) => {return d.dots})
                .enter()
                .append('g')
                .call(sim)
                .append('circle')
                .attr('id', d => d.id)
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", d => sizeScale(d.radius))
                .attr('fill', d => colourScale(d.category))
                .attr('opacity', opacity)
                .attr('stroke', (d)=> {
                    if (d.label) { return dotOutline}
                    else{return 'none'}
                })
                

            function sim(dots) {
                const data = dots.data()
                const simulation = d3.forceSimulation(data)
                    .force("x", d3.forceX(function(d) { return xScale(d.value)}).strength(1))
                    .force("y", d3.forceY(function(d) { return yScale(d.category) + yScale.bandwidth()/2}))
                    .force("collide", d3.forceCollide(d => sizeScale(d.radius + (rem*3))))
                for (var i = 0; i < 150; ++i) simulation.tick()
            }


    }
    
    chart.opacity = (d) => {
        if (!d) return opacity;
        opacity = d;
        return chart;
    };

    chart.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return chart;
    };

    chart.seriesNames = (d) => {
        if (typeof d === 'undefined') return seriesNames;
        seriesNames = d;
        return chart;
    };

    chart.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return chart;
    };

    chart.plotDim = (d) => {
        if (!d) return plotDim;
        plotDim = d;
        return chart;
    };

    chart.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return chart;
    };

    chart.sizeScale = (d) => {
        if (!d) return sizeScale;
        sizeScale = d;
        return chart;
    };
    chart.scaleFactor = (d) => {
        if (!d) return scaleFactor;
        scaleFactor = d;
        return chart;
    };

    chart.colourPalette = (d) => {
        if (!d) return colourScale;
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
            dotOutline = '#ffffff';
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.lineWeb);
            dotOutline = '#000000';
        } else if (d === 'print') {
            dotOutline = '#000000';
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    };

    return chart;
}

