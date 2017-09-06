import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

export function draw() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleLinear();
    let seriesNames = [];
    let groups = [];
    let yAxisAlign = 'right';
    let rem = 16;
    let xVar;
    let opacity;
    let yVar;
    let sizeVar;
    let hollowDots;
    let dotOutline;

    const colourScale = d3.scaleOrdinal();


    function chart(parent) {


        parent.append("circle")
            .attr("cx",function(d){
                return xScale(d[xVar])
            })
            .attr("cy",function(d){
                return yScale(d[yVar])
            })
            .attr("r",rem/2.5)
            .attr("fill",function(d){
                if (hollowDots){
                    return "none";
                }
                else    {
                    return colourScale(d.group);
                }
            })
            .attr("fill-opacity",opacity)
            .attr("stroke",function(d){
                if (hollowDots){
                    return colourScale(d.group);
                } else {
                    if (d.label=="yes"){
                        return dotOutline;
                    }   else    {
                        return "none"
                    }
                }
            })
            .attr("stroke-width",function(d){
                if (hollowDots){
                    if (d.label=="yes"){
                        return rem/10;
                    }   else{
                        return rem/20;
                    }
                } else {
                    if (d.label=="yes"){
                        return rem/10;
                    }   else{
                        return 0;
                    }
                }
            })


        //create text labels required
        parent.filter(function(d){
            return d.label=="yes"
        })
        .append("text")
        .attr("class","highlighted-label")
        .attr("x",function(d){
                return xScale(d[xVar])
            })
        .attr("y",function(d){
                return yScale(d[yVar])
            })
        .attr("dy",-(rem/2))
        .attr("text-anchor","middle")
        .text(function(d){return d.name})

        //bring labelled objects to front
        parent.filter(function(d){
            return d.label=="yes"
        }).each(function(d){
            this.parentNode.appendChild(this);
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
    chart.groups = (d) => {
        groups = d;
        return chart;
    };
    chart.hollowDots = (d) => {
        hollowDots = d;
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
            colourScale.domain(groups);
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
            dotOutline = "#ffffff"
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.lineWeb);
            dotOutline = "#000000"
        } else if (d === 'print') {
            dotOutline = "#000000"
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    };

    return chart;
}
