function xAxisLinear() {
    let scale = d3.scaleLinear()
        .domain([0,100])
        .range([0,220]);
    let tickSize = 50;
    let offset = 0;
    let numTicks = 5
    let align = "bottom"
    let xLabel

    function axis(parent) {

        const xAxis =getAxis(align)
            .tickSize(tickSize)
            .ticks(numTicks)
            .scale(scale)

        xLabel = parent.append("g")
            .attr("class", "axis xAxis" )
            .call(xAxis)
           
    }
    axis.align = (d)=>{
        align=d;
        return axis;
    };

    axis.scale = (d)=>{
        scale = d;
        return axis;
    }
    axis.domain = (d)=>{
        scale.domain(d);
        return axis;
    };
    axis.range = (d)=>{
        scale.range(d);
        return axis;
    };
    
    axis.tickSize = (d)=>{
        if(d===undefined) return tickSize
        tickSize=d;
        return axis;
    }

    axis.xLabel = (d)=>{
        if(d===undefined) return xLabel
        xLabel=d;
        return axis;
    }

    axis.offset = (d)=>{
        if(d===undefined) return offset
        offset=d;
        return axis;
    }

    axis.numTicks = (d)=>{
        if(d===undefined) return numTicks
        numTicks=d;
        return axis;
    }

    function getAxis(alignment){
        return{
            "top": d3.axisTop(),
            "bottom":d3.axisBottom()
        }[alignment]
    }

    
    return axis
}