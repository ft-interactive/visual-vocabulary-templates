import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

let rem = 10;

export function draw() {
    let yScale = d3.scaleBand();
    let xScale = d3.scaleLinear();
    let seriesNames = [];
    let yAxisAlign = 'left';
  const includeAnnotations = d => (d.annotate !== '' && d.annotate !== undefined); // eslint-disable-line
  let annotate = false; // eslint-disable-line
    const colourScale = d3.scaleOrdinal()
    // .range(gChartcolour.lineWeb)
    .domain(seriesNames);

    function chart(parent) {
        parent
        .each(function(d,i){
            if ( d3.select(this).attr('xPosition') === '0') {
                var tints = d3.select(this).select('.tint').selectAll('rect')
                .data(d => d.columnData)
                .enter()
                .append('rect')
                .attr('x', 0)
                .attr('y', (d,i) => ((yScale.bandwidth() + (yScale.bandwidth() * yScale.paddingInner())) * i) + rem)
                .attr('width', plotDim.width)
                .attr('height', yScale.bandwidth())
            }
        });


        parent.selectAll('.columns')
            .data(d => d.columnData)
            .enter()
            .append('rect')
            .attr('class', 'columns')
            .attr('id', d => `date: ${d.name} value: ${d.value}`)
            .attr('x', d => xScale(Math.min(d.value,0)))
            // .attr('transform', d => `translate(0, ${yScale.bandwidth()})`)
            .attr('height', () => yScale.bandwidth())
            .attr('y', (d,i) => ((yScale.bandwidth() + (yScale.bandwidth() * yScale.paddingInner())) * i) + rem)
            .attr('width', d => Math.abs(xScale(d.value) - xScale(0)))
            .attr('fill', d => colourScale());

        //add titles for each chart
        parent.append('text')
            .attr("class", "chart-label")
            .attr("dy", -5)
            .text((d) => d.name.toUpperCase());
    }

    chart.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return chart;
    };
    chart.yAxisAlign = (d) => {
        if (!d) return yAxisAlign;
        yAxisAlign = d;
        return chart;
    };

    chart.seriesNames = (d) => {
        seriesNames = d;
        return chart;
    };
    chart.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
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


