import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

let rem = 10;

export function draw() {
    let yScaleL = d3.scaleLinear();
    let yScaleR = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let seriesNames = [];
    let highlightNames = [];
    let yAxisAlign = 'right';
    let markers = false;
  const includeAnnotations = d => (d.annotate !== '' && d.annotate !== undefined); // eslint-disable-line
  let annotate = false; // eslint-disable-line
    let interpolation = d3.curveLinear;
    const colourScale = d3.scaleOrdinal()
    // .range(gChartcolour.lineWeb)
    .domain(seriesNames);

    function chart(parent) {
    
        const lineData = d3.line()
        .defined(function(d) { return d; })
        .curve(interpolation)
        .x(d => xScale(d.date))
        .y(d => yScaleL(d.value));

        parent.append('path')
      .attr('stroke', (d) => {
          if (highlightNames.length > 0) {
              if (highlightNames.indexOf(d.name) !== -1) {
                  return colourScale(d.name);
              }
              d.name = '';
              return colourScale(d.name);
          }
          return colourScale(d.name);
      })
      .attr('opacity', (d) => {
          if (highlightNames.length > 0) {
              if (highlightNames.indexOf(d.name) !== -1) {
                  return 1;
              }
              return 0.5;
          }
          return 1;
      })
      .attr('d', d => lineData(d.lineData));

        if (markers) {
            parent.selectAll('.markers')
        .data((d) => {
            if (markers) {
                return d.lineData;
            }

            return undefined;
        })
        .enter()
        .append('circle')
        .classed('markers', true)
        .attr('id', d => `date: ${d.date} value: ${d.value}`)
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScaleL(d.value))
        .attr('r', rem * 0.25)
        .attr('fill', d => colourScale(d.name));
        }
    }

    chart.yScaleL = (d) => {
        if (!d) return yScaleL;
        yScaleL = d;
        return chart;
    };
    chart.yAxisAlign = (d) => {
        if (!d) return yAxisAlign;
        yAxisAlign = d;
        return chart;
    };
    chart.yDomainL = (d) => {
        yScaleL.domain(d);
        return chart;
    };
    chart.yDomainR = (d) => {
        yScaleR.domain(d);
        return chart;
    };

    chart.yRange = (d) => {
        yScaleL.range(d);
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
    chart.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return chart;
    };
    chart.xDomain = (d) => {
        xScale.domain(d);
        return chart;
    };
    chart.xRange = (d) => {
        xScale.range(d);
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
    chart.markers = (d) => {
        markers = d;
        return chart;
    };
    chart.interpolation = (d) => {
        if (!d) return interpolation;
        interpolation = d;
        return chart;
    };
    chart.colourPalette = (d) => {
        if (highlightNames.length > 0) {
            if (d === 'social' || d === 'video') {
                colourScale.range(gChartcolour.mutedFirstLineSocial);
            } else if (d === 'webS' || d === 'webM' || d === 'webL') {
                colourScale.range(gChartcolour.mutedFirstLineWeb);
            } else if (d === 'print') {
                colourScale.range(gChartcolour.mutedFirstLinePrint);
            }
            return chart;
        }
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webL') {
            colourScale.range(gChartcolour.lineWeb);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    };

    return chart;
}

export function drawHighlights() {
    let yScaleL = d3.scaleLinear();
    let xScale = d3.scaleTime();

    function highlights(parent) {
        parent.append('rect')
      .attr('class', 'highlights')
      .attr('x', d => xScale(d.begin))
      .attr('width', d => xScale(d.end) - xScale(d.begin))
      .attr('y', () => yScaleL.range()[1])
      .attr('height', () => yScaleL.range()[0])
      .attr('fill', '#fff1e0');
    }

    highlights.yScaleL = (d) => {
        yScaleL = d;
        return highlights;
    };
    highlights.xScale = (d) => {
        xScale = d;
        return highlights;
    };
    highlights.yRange = (d) => {
        yScaleL.range(d);
        return highlights;
    };
    highlights.xRange = (d) => {
        xScale.range(d);
        return highlights;
    };

    return highlights;
}

export function drawAnnotations() {
    let yScaleL = d3.scaleLinear();
    let xScale = d3.scaleTime();

    function annotations(parent) {
        parent.append('line')
      .attr('class', 'annotation')
      .attr('x1', d => xScale(d.date))
      .attr('x2', d => xScale(d.date))
      .attr('y1', yScaleL.range()[0])
      .attr('y2', yScaleL.range()[1] - 5);

        parent.append('text')
      .attr('class', 'annotation')
      .attr('text-anchor', 'middle')
      .attr('x', d => xScale(d.date))
      .attr('y', yScaleL.range()[1] - (rem / 2))
      .text(d => d.annotate);
    }

    annotations.yScaleL = (d) => {
        yScaleL = d;
        return annotations;
    };
    annotations.xScale = (d) => {
        xScale = d;
        return annotations;
    };
    annotations.yRange = (d) => {
        yScaleL.range(d);
        return annotations;
    };
    annotations.xRange = (d) => {
        xScale.range(d);
        return annotations;
    };
    annotations.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return annotations;
    };
    return annotations;
}
