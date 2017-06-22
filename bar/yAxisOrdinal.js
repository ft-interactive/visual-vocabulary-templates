function yAxisOrdinal() {
    let align ="left"
    let scale = d3.scaleBand()
        .domain(["Oranges", "Lemons", "Apples", "Pears"])
        .rangeRound([0, 220])
    let labelWidth = 0;
    let tickSize = 0;
    let offset = 0;

    function axis(parent) {

        const yAxis =getAxis(align)
            .tickSize(tickSize)
            .scale(scale)

        yLabel = parent.append("g")
            .attr("class","axis yAxis")
            .call(yAxis)

        //Calculate width of widest .tick text
        parent.selectAll(".yAxis text").each(
            function(){
                labelWidth=Math.max(this.getBBox().width,labelWidth);
            })
        
    }

    axis.scale = (d)=>{
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
        scale.bandwidth(d);
        return axis;
    };

    axis.labelWidth = (d)=>{
        if(d===undefined) return labelWidth
        labelWidth=d;
        return axis;
    }
    axis.yLabel = (d)=>{
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
            "left": d3.axisLeft(),
            "right":d3.axisRight()
        }[alignment]
    }
    
    return axis
};