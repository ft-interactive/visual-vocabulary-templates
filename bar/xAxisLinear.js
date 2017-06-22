function xAxisLinear() {
    let scale = d3.scaleLinear()
        .domain([0,100])
        .range([0,220]);
    let tickSize = 50;
    let offset = 0;
    let numTicks = 5

    function axis(parent) {

        const xAxis =d3.axisBottom()
            .ticks(numTicks)
            .scale(scale)
        
        if (offset==0) {
            xAxis.tickSize(tickSize)
        }

        const xLabel = parent.append("g")
            .attr("class", "axis xAxis" )
            .call(xAxis)
        
        if (offset>0) {
            xLabel.attr("transform","translate(0,"+(offset)+")");
        }
        
    }

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

    
    return axis
}