import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

let rem = 10;

export function draw() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let seriesNames = [];
    let highlightNames = [];
    let intraday;
    let yAxisAlign = 'right';
    let markers = false;
  const includeAnnotations = d => (d.annotate !== '' && d.annotate !== undefined); // eslint-disable-line
  let annotate = false; // eslint-disable-line
    let interpolation = d3.curveLinear;
    const colourScale = d3.scaleOrdinal()
    // .range(gChartcolour.lineWeb)
    .domain(seriesNames);

    function chart(parent) {
        let offset;
        if (intraday) {
            offset = scale.domain().length
        }
        else {offset = yScale.ticks().length}

        console.log('offset', offset)

        parent.append('line')
            .attr('y1', d => yScale(+d.high))
            .attr('x1', d => xScale(d.date))
            .attr('y2', (d) => {
                if(d.open > d.close) {return +yScale(d.open)}
                else {return +yScale(d.close)}
            })
            .attr('x2', d => xScale(d.date))
            .attr('stroke',d => colourScale(d.name));
        
        parent.append('line')
            .attr('y1', d => yScale(+d.low))
            .attr('x1', d => xScale(d.date))
            .attr('y2', (d) => {
                if(d.open < d.close) {return +yScale(d.open)}
                else {return +yScale(d.close)}
            })
            .attr('x2', d => xScale(d.date))
            .attr('stroke',d => colourScale(d.name));

        parent.append('line')
            .attr('y1', d => yScale(+d.low))
            .attr('x1', d => xScale(d.date))
            .attr('y2', (d) => {
                if(d.open < d.close) {return +yScale(d.open)}
                else {return +yScale(d.close)}
            })
            .attr('x2', d => xScale(d.date))
            .attr('stroke',d => colourScale(d.name));
      
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
    chart.intraday = (d) => {
        if (d === undefined) return intraday;
        intraday = d;
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
        if (!d) return xDomain;
        xScale.domain(d);
        return chart;
    };
    chart.xRange = (d) => {
        if (!d) return xRange;
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
    chart.colourPalette = (d) => {
        if (highlightNames.length > 0) {
            if (d === 'social' || d === 'video') {
                colourScale.range(gChartcolour.mutedFirstLineSocial);
            } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
                colourScale.range(gChartcolour.mutedFirstLineWeb);
            } else if (d === 'print') {
                colourScale.range(gChartcolour.mutedFirstLinePrint);
            }
            return chart;
        }
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
