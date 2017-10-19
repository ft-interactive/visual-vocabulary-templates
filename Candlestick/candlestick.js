import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';


export function draw() {
    let rem = 10;
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let seriesNames = [];
    let highlightNames = [];
    let yAxisAlign = 'right';
    let markers = false;
    const includeAnnotations = d => (d.annotate !== '' && d.annotate !== undefined); // eslint-disable-line
    let annotate = false; // eslint-disable-line
    let interpolation = d3.curveLinear;
    let colourScale = d3.scaleOrdinal()
    // .range(gChartcolour.lineWeb)
    .domain(seriesNames);
    let intraday;

    function chart(parent) {
        let bandwidth = 10
        if(intraday) {
            bandwidth = ((xScale.range()[1]-xScale.range()[0])/xScale.domain().length)*0.25
        }
         else{
            let ticks = xScale.ticks().length
            bandwidth = ((xScale.range()[1]-xScale.range()[0])/(ticks))*0.25
        }

        parent.append('line')
            .attr('y1', d => yScale(+d.high))
            .attr('x1', d => xScale(d.date))
            .attr('y2', (d) => {
                if(d.open > d.close) {return +yScale(d.open)}
                else {return +yScale(d.close)}
            })
            .attr('x2', d => xScale(d.date));
        
        parent.append('line')
            .attr('y1', d => yScale(+d.low))
            .attr('x1', d => xScale(d.date))
            .attr('y2', (d) => {
                if(d.open < d.close) {return +yScale(d.open)}
                else {return +yScale(d.close)}
            })
            .attr('x2', d => xScale(d.date));

        parent.append('line')
            .attr('y1', d => yScale(+d.high))
            .attr('x1', d => xScale(d.date)-bandwidth/2)
            .attr('y2', d => yScale(+d.high))
            .attr('x2', d => xScale(d.date)+bandwidth/2);

        parent.append('line')
            .attr('y1', d => yScale(+d.low))
            .attr('x1', d => xScale(d.date)-bandwidth/2)
            .attr('y2', d => yScale(+d.low))
            .attr('x2', d => xScale(d.date)+bandwidth/2);

        parent.append('rect')
            .attr('x', d => xScale(d.date)-bandwidth/2)
            .attr('width', bandwidth)
            .attr('y', d => yScale(d.y))
            .attr('height', d => Math.abs(yScale(d.height) - yScale(0)))
            .attr('fill', (d) =>{
                if (d.close > d.open) { return colourScale(6)};
                return colourScale(7)

            })
      
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
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        } else if (d && d.name && d.name === 'scale') {
            colourScale = d;
        }
        return chart;
    };

    return chart;
}
