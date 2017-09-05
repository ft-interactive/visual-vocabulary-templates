import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

export function draw() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleLinear();
    let seriesNames = [];
    let yAxisAlign = 'right';
    let rem = 16;
    let xVar;
    let opacity;
    let yVar;
    let sizeVar;

    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);

    function chart(parent) {

        parent.append("circle")
            .attr("cx",function(d){
                return xScale(d[xVar])
            })
            .attr("cy",function(d){
                return yScale(d[yVar])
            })
            .attr("r",5)
            .attr("fill",function(){
                return colourScale();
            })
            .attr("opacity",opacity)
            //.attr("cy")
            //.attr("r")
        /*const r = (dotWidth / 2) * xScale.bandwidth();
        if (dots) {
            parent.append('circle')
            .attr('cx', d => xScale(d.name) + (xScale.bandwidth() / 2))
            .attr('cy', d => yScale(d[seriesNames[0]]))
            .attr('r', r)
            .attr('fill', colourScale(seriesNames[0]));
        }

        if (stalks) {
            parent.append('line')
                .attr('x1', d => xScale(d.name) + (xScale.bandwidth() / 2))
                .attr('x2', d => xScale(d.name) + (xScale.bandwidth() / 2))
                .attr('y1', () => {
                    // case negative scales
                    if (yScale.domain()[0] < 0) {
                        return yScale(0);
                    }  // positive scales
                    return yScale(yScale.domain()[0]);
                })
               .attr('y2', d => yScale(d[seriesNames[0]]))
               .attr('stroke-width', stalkWidth * xScale.bandwidth())
               .attr('stroke', colourScale(seriesNames[0]));
        }*/
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
        yScale.domain(d);
        return chart;
    };

    chart.xVar = (d) => {
        xVar = d;
        return chart;
    };
    chart.yVar = (d) => {
        yVar = d;
        return chart;
    };
    chart.sizeVar = (d) => {
        sizeVar = d;
        return chart;
    };
    chart.opacity = (d) => {
        opacity = d;
        return chart;
    };


    chart.yRange = (d) => {
        yScale.range(d);
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
    chart.xRangeRound = (d) => {
        xScale.rangeRound(d);
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
        } else if (d === 'webS' || d === 'webM' || d === 'webL') {
            colourScale.range(gChartcolour.lineWeb);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    };

    return chart;
}
