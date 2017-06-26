function xaxisOrdinal() {
    let scale = d3.scalePoint()
        .domain(["2000", "2016"])
        .range([40, 300]);
    let tickSize = 0;
    let offset = 0;

    function axis(parent) {

        const xAxis =d3.axisBottom()
            .tickSize(tickSize)
            .scale(scale)

        const xLabel = parent.append("g")
            .attr("class","axis xAxis")
            .call(xAxis)

        xLabel.attr("transform","translate(0,"+(offset)+")");
        
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

    return axis
}