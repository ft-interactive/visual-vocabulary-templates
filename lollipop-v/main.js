function drawChart() {

    let yScale = d3.scaleLinear();
    let xScale = d3.scaleBand()
    let stalks = false;
    let dots = false;
    let stalkWidth = .1;
    let dotWidth = .25;
    
    let seriesNames = [];
    let yAxisAlign = "right"
    let rem =16;

    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);
  
    function chart(parent){

        if (dots){

        parent.append("circle")
            .attr("cx",function(d){
                return xScale(d.name)+(xScale.bandwidth()/2);
            })
            .attr("cy", function(d){
                return yScale(d[seriesNames[0]])
            })
            .attr("r",(dotWidth/2)*xScale.bandwidth())
            .attr("fill",colourScale(seriesNames[0]))

        }

        if (stalks) {
            parent.append("line")
                .attr("x1",function(d){
                    return xScale(d.name)+(xScale.bandwidth()/2)
                })
                .attr("x2",function(d){
                    return xScale(d.name)+(xScale.bandwidth()/2)
                })
               .attr("y1",function(d){
                    //case negative scales
                    if (yScale.domain()[0]<0){
                        return yScale(0)
                    }   else    {//positive scales
                        return yScale(yScale.domain()[0])
                    }

                })
               .attr("y2",function(d){
                    return yScale(d[seriesNames[0]])
               })
               .attr("stroke-width",stalkWidth*xScale.bandwidth())
               .attr("stroke",colourScale(seriesNames[0]))
        }
    }

    chart.yScale = (d)=>{
        if(!d) return yScale;
        yScale = d;
        return chart;
    }
    chart.yAxisAlign = (d)=>{
        if(!d) return yAxisAlign;
        yAxisAlign = d;
        return chart;
    }
    chart.yDomain = (d)=>{
        yScale.domain(d);
        return chart;
    };
    chart.yRange = (d)=>{
        yScale.range(d);
        return chart;
    };
    chart.stalks = (d)=>{
        if(!d) return stalks;
        stalks = d;
        return chart;
    };
    chart.dots = (d)=>{
        if(!d) return dots;
        dots = d;
        return chart;
    };
    chart.stalkWidth = (d)=>{
        if(!d) return stalkWidth;
        stalkWidth = d;
        return chart;
    };
    chart.dotWidth = (d)=>{
        if(!d) return dotWidth;
        dotWidth = d;
        return chart;
    };
    chart.seriesNames = (d)=>{
        seriesNames = d;
        return chart;
    };
    chart.xScale = (d)=>{
        if(!d) return xScale;
        xScale = d;
        return chart;
    };
     chart.xDomain = (d)=>{
         xScale.domain(d);
         return chart;
    };
    chart.xRange = (d)=>{
        xScale.range(d);
        return chart;
    };
    chart.plotDim = (d)=>{
        if(!d) return plotDim;
        plotDim = d;
        return chart;
    };
    chart.rem = (d)=>{
        if(!d) return rem;
        rem = d;
        return chart;
    };
    chart.colourPalette = (d) =>{
        if(d==='social' || d==='video'){
            colourScale.range(gChartcolour.lineSocial);
        } else if (d==='webS' || d==='webM' || d==='webL') {
            colourScale.range(gChartcolour.lineWeb);
        } else if (d==='print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    }

    return chart
}
