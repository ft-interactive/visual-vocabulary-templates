function columnChart() {
    let yScale = d3.scaleLinear();
    let xScale0 = d3.scaleBand();
    let xScale1 = d3.scaleBand();
    let seriesNames = [];
    let yAxisAlign = "right"
    let rem =16;
    let markers = false;
    // let interpolation =d3.curveLinear
    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);
  
    function chart(parent){

        
    }

    chart.yScale = (d)=>{
        if(!d) return yScale;
        yScale = d;
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

    chart.yAxisAlign = (d)=>{
        if(!d) return yAxisAlign;
        yAxisAlign = d;
        return chart;
    }

    chart.seriesNames = (d)=>{
        seriesNames = d;
        return chart;
    }
    chart.xScale0 = (d)=>{
        if(!d) return xScale0;
        xScale0 = d;
        return chart;
    }
    chart.xDomain0 = (d)=>{
        xScale0.domain(d);
        return chart;
    };
    chart.xRange0 = (d)=>{
        xScale0.range(d);
        return chart;
    };

    chart.xScale1 = (d)=>{
        if(!d) return xScale1;
        xScale1 = d;
        return chart;
    }
    chart.xDomain1 = (d)=>{
        xScale1.domain(d);
        return chart;
    };
    chart.xRange1 = (d)=>{
        xScale1.range(d);
        return chart;
    };
    chart.plotDim = (d)=>{
        if(!d) return plotDim;
        plotDim = d;
        return chart;
    }
    chart.rem = (d)=>{
        if(!d) return rem;
        rem = d;
        return chart;
    }
    chart.includeMarker = (d)=>{
        includeMarker = d;
        return chart;
    }
    chart.markers = (d)=>{
        markers = d;
        return chart;
    }
    chart.interpolation = (d)=>{
        if(!d) return interpolation;
        interpolation = d;
        return chart;
    }
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
