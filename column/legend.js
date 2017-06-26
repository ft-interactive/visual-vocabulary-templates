function drawLegend() {
	let seriesNames=[]
	const colourScale = d3.scaleOrdinal()
        .range(gChartcolour.lineWeb)
        .domain(seriesNames);
    let rem=10
    let alignment="hori"
    let geometry = "circ";

	function legend(parent) {
		let legendyOffset=0

		parent.attr ("id",function(d,i){
                return "l"+i
            })

        parent.append("text")
            .attr("id",(d,i)=> ("t"+i))
			.attr("x",rem * 1.5)
            .attr("y",rem/3)
            .attr("class","chart-subtitle")
            .text(function(d){
                return d;
            })

        if(geometry==='rect') {    
            parent.append('rect')
                .attr('width', rem * 1.25)
                .attr('height', rem/1.5)
                .attr('class', 'rects')
                .attr('x', 0)
                .attr('y', -rem/3)
                .style('fill', (d)=> colourScale(d))
        }

        else if(geometry === 'line') {
            parent.append("line")
                .attr("stroke",(d)=>colourScale(d))
                .attr("x1",0)
                .attr("x2",rem)
                .attr("y1",0)
                .attr("y2",0)
                .attr("class","lines")
        }

        else if(geometry === 'circ') {
            parent.append("circle")
                .style("fill",(d)=>colourScale(d))
                .attr("cx",rem - (rem/2.5))
                .attr("cy",0)
                .attr("r",rem/2.5)
                .attr("class","circs")
        }

        parent.attr("transform",function(d,i){
            console.log(alignment)
            if (alignment=='hori') {
                var gHeigt=d3.select("#l0").node().getBBox().height;
                if (i>0) {
                    var gWidth=d3.select("#l"+(i-1)).node().getBBox().width + (rem * 1.25); 
                }
                else {gWidth=0};
                legendyOffset=legendyOffset+gWidth;
                return "translate("+(legendyOffset)+","+(gHeigt/2)+")";  
            }
            else {
                return "translate(0,"+((i * rem * 1.2))+")"};
        })

	}

   d3.selectAll("#legend")
        .on("mouseover",pointer)
        .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

	legend.seriesNames = (d)=>{
        seriesNames = d;
        return legend;
    }

    legend.colourPalette = (d) =>{
        if(d==='social' || d==='video'){
            colourScale.range(gChartcolour.lineSocial);
        } else if (d==='webS' || d==='webM' || d==='webL') {
            console.log(geometry)
            if(geometry === 'circ' || geometry === 'line') {
                colourScale.range(gChartcolour.lineWeb);
            } else {
                colourScale.range(gChartcolour.categorical_bar);
            }
        } else if (d==='print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return legend;
    }

    legend.rem = (d)=>{
        rem = d;
        return legend;
    }

    
    legend.alignment = (d)=>{
        alignment = d;
        return legend;
    }

    legend.geometry = (d)=>{
        geometry = d;
        return legend;
    }


    function moveLegend() {
        var dX = d3.event.x; // subtract cx
        var dY = d3.event.y; // subtract cy
        d3.select(this).attr("transform", "translate(" + dX + ", " + dY + ")");
    }

    function pointer() {
        this.style.cursor='pointer'
    }

    function dragstarted(d) {
      d3.select(this).raise().classed("active", true);
    }

    function dragged(d) {
        d3.select(this).attr("transform", "translate(" + d3.event.x + ", " + d3.event.y + ")");
    }

    function dragended(d) {
      d3.select(this).classed("active", false);
    }


	return legend
}