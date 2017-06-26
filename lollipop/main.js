function drawChart() {

    let yScale = d3.scaleLinear();
    let xScale = d3.scaleOrdinal();
    let stalks = false;

    
    let seriesNames = [];
    let yAxisAlign = "right"
    let rem =16;

    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);

  
    function chart(parent){



        const lollies = parent.append("g")
            .attr("id","lollipops")

        //buds
        lollies.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")

    //colourScale(seriesNames[0])



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
