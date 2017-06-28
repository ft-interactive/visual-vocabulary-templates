function drawBars() {

	let yScale0 = d3.scaleBand();
	let yScale1 = d3.scaleBand();
	let xScale = d3.scaleLinear();
	let seriesNames = [];
	let colourProperty = "name"
	let colourScale = d3.scaleOrdinal()
        .domain(seriesNames);
    let rem = 10
    let numbers = false


	function bars(parent) {
		parent.attr("transform", function(d) { return "translate(0," + yScale0(d.name) + ")"; })
		
		parent.selectAll("rect")
		.data(function(d) {return d.groups})
		.enter()
		.append("rect")
		.attr("class","bars")
		.attr("y",(d)=> {return yScale1(d.name)})
        .attr("height",(d)=> {return yScale1.bandwidth()})
		.attr("x",(d)=> {return xScale(Math.min(0, d.value))})
		.attr("width", (d)=> {return Math.abs(xScale(d.value) - xScale(0))})
		.attr("fill",(d)=> {return colourScale(d.name)})

        if (numbers) {
            parent.selectAll("text")
            .data(function(d) {return d.groups})
            .enter()
            .append("text")
            .html((d)=> {return d.value})
            .attr("class","label")
            .style("text-anchor", "end")
            .attr("y",(d)=> {return yScale1(d.name)+(yScale1.bandwidth()/2)+(rem/2.5)})
            .attr("x",(d)=> {return xScale(0)})
            .attr("fill","#ffffff")
        }

	}

	bars.yScale0 = (d)=>{
        yScale0 = d;
        return bars;
    }
    bars.yDomain0 = (d)=>{
        yScale0.domain(d);
        return bars;
    };
    bars.yRange0 = (d)=>{
        yScale0.rangeRound(d);
        return bars;
    };
    bars.yScale1 = (d)=>{
    	if(!d) return yScale1;
        yScale1 = d;
        return bars;
    }
    bars.yDomain1 = (d)=>{
        yScale1.domain(d);
        return bars;
    };
    bars.yRange1 = (d)=>{
        yScale1.rangeRound(d);
        return bars;
    };
    bars.xScale = (d)=>{
    	if(!d) return xScale;
        xScale = d;
        return bars;
    }
    bars.xDomain = (d)=>{
        xScale.domain(d);
        return bars;
    };
    
    bars.xRange = (d)=>{
        xScale.range(d);
        return bars;
    };
    bars.colourProperty = (d)=>{
        colourProperty = d;
        return bars;
    };
    bars.colourPalette = (d) =>{
        if(d==='social' || d==='video'){
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d==='webS' || d==='webM' || d==='webL') {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d==='print') {
            colourScale.range(gChartcolour.categorical_bar);
        }
        return bars;
    }
    bars.seriesNames = (d)=>{
        seriesNames = d;
        return bars;
    };
    bars.rem = (d)=>{
        rem = d;
        return bars;
    };
    bars.numbers = (d)=>{
        numbers = d;
        return bars;
    };

return bars
}