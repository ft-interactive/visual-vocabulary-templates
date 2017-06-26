function xAxisOrdinal() {
    let align ="bottom"
    let scale = d3.scaleBand()
        .domain(["Oranges", "Lemons", "Apples", "Pears"])
        .rangeRound([0, 220])
        .paddingInner(0.066)
    let labelWidth = 0;
    let tickSize = 0;
    let offset = 0;

    function axis(parent) {

        const xAxis =getAxis(align)
            .tickSize(tickSize)
            .scale(scale)

        xLabel = parent.append("g")
            .attr("class","axis xAxis")
            .attr('transform','translate(0,' + offset +')' )
            .call(xAxis)
    }

    axis.scale = (d)=>{
        if(!d) return scale;
        scale = d;
        return axis;
    }
    axis.domain = (d)=>{
        scale.domain(d);
        return axis;
    };
    axis.rangeRound = (d)=>{
        scale.rangeRound(d);
        return axis;
    };
    axis.bandwidth = (  d)=>{
        if (!d) return scale.bandwidth();
        scale.bandwidth(d);
        return axis;
    };

    axis.paddingInner = (  d)=>{
        if (!d) return scale.paddingInner();
        scale.paddingInner(d);
        return axis;
    };

    axis.xLabel = (d)=>{
        if(d===undefined) return yLabel
        labelWidth=d;
        return axis;
    }
    
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

    axis.align = (d)=>{
        if(!d) return align;
        align = d;
        return axis;
    }

    function getAxis(alignment){
        return{
            "top": d3.axisTop(),
            "bottom":d3.axisBottom()
        }[alignment]
    }
    
    return axis
};