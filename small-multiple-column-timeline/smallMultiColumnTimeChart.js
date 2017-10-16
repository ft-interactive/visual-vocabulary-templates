import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

let rem = 10;

export function draw() {
    let yScale = d3.scaleLinear();
    let xScale0 = d3.scaleTime();
    let xScale1 = d3.scaleBand();
    let seriesNames = [];
    let yAxisAlign = 'right';
  const includeAnnotations = d => (d.annotate !== '' && d.annotate !== undefined); // eslint-disable-line
  let annotate = false; // eslint-disable-line
    const colourScale = d3.scaleOrdinal()
    // .range(gChartcolour.lineWeb)
    .domain(seriesNames);

    function chart(parent) {

        parent.selectAll('rect')
            .data(d => d.columnData)
            .enter()
            .append('rect')
            .attr('class', 'columns')
            .attr('id', d => `date: ${d.date} value: ${d.value}`)
            .attr('x', d => xScale0(d.date))
            .attr('transform', d => `translate(${-xScale1.bandwidth()/2},0)`)
            .attr('width', () => xScale1.bandwidth())
            .attr('y', d => yScale(Math.max(0, d.value)))
            .attr('height', d => Math.abs(yScale(d.value) - yScale(0)))
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
    chart.yDomain = (d) => {
        if (!d) return yDomain;
        yScale.domain(d);
        return chart;
    };

    chart.yRange = (d) => {
        if (!d) return yRange;
        yScale.range(d);
        return chart;
    };

    chart.highlightNames = (d) => {
        highlightNames = d;
        return chart;
    };
    chart.seriesNames = (d) => {
        seriesNames = d;
        return chart;
    };
    chart.xScale0 = (d) => {
        if (!d) return xScale0;
        xScale0 = d;
        return chart;
    };
    chart.xDomain0 = (d) => {
        if (!d) return xDomain0;
        xScale0.domain(d);
        return chart;
    };
    chart.xRange0 = (d) => {
        if (!d) return xRange0;
        xScale0.range(d);
        return chart;
    };

    chart.xScale1 = (d) => {
        if (!d) return xScale1;
        xScale1 = d;
        return chart;
    };
    chart.xDomain1 = (d) => {
        xScale1.domain(d);
        return chart;
    };
    chart.xRange1 = (d) => {
        xScale1.rangeRound(d);
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
    chart.annotate = (d) => {
        annotate = d;
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

export function drawHighlights() {
    let yScale = d3.scaleLinear();
    let xScale0 = d3.scaleTime();
    let xScale1 = d3.scaleBand();
    let invertScale = false

    function highlights(parent) {
        let highlights = parent.append('rect')
        .attr('class', 'highlights')
        .attr('x', d => xScale0(d.begin) - xScale1.bandwidth() / 2)
        .attr('width', d => (xScale0(d.end) - xScale0(d.begin) + xScale1.bandwidth()))
        .attr('y', function(d) {
              return yScale.range()[1]
            })
        .attr('height', function (d) {
            return yScale.range()[0]
        })
        .attr('fill', '#fff1e0');
    }

    highlights.yScale = (d) => {
        yScale = d;
        return highlights;
    };
    highlights.xScale0 = (d) => {
        xScale0 = d;
        return highlights;
    };
    highlights.xScale1 = (d) => {
        xScale1 = d;
        return highlights;
    };
    highlights.yRange = (d) => {
        yScale.range(d);
        return highlights;
    };
    highlights.xRange = (d) => {
        xScale0.range(d);
        return highlights;
    };
    highlights.invertScale = (d) => {
        invertScale = d;
        return highlights;
    };

    return highlights;
}

export function drawAnnotations() {
    let yScale = d3.scaleLinear();
    let xScale0 = d3.scaleTime();

    function annotations(parent) {
        parent.append('line')
      .attr('class', 'annotation')
      .attr('x1', d => xScale0(d.date))
      .attr('x2', d => xScale0(d.date))
      .attr('y1', yScale.range()[0])
      .attr('y2', yScale.range()[1] - 5);

        parent.append('text')
      .attr('class', 'annotation')
      .attr('text-anchor', 'middle')
      .attr('x', d => xScale0(d.date))
      .attr('y', yScale.range()[1] - (rem / 2))
      .text(d => d.annotate);
    }

    annotations.yScale = (d) => {
        yScale = d;
        return annotations;
    };
    annotations.xScale0 = (d) => {
        xScale0 = d;
        return annotations;
    };
    annotations.yRange = (d) => {
        yScale.range(d);
        return annotations;
    };
    annotations.xRange = (d) => {
        xScale0.range(d);
        return annotations;
    };
    annotations.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return annotations;
    };
    return annotations;
}
