import d3 from 'd3';

export function draw() {
    let lineWidth = 100
	let plotDim = [100,100];
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleLinear();
    let sizeScale = d3.scaleSqrt();
    let intersect = false
    let seriesNames  = []; // eslint-disable-line
    let rem = 16;
    let formatDecimal = d3.format(".2f")
    let frameName = ''

    const colourScale = d3.scaleOrdinal();


    function label(parent) {

    	let radius;
        let yOffset = 0;
        let xOffset = 0;

    	const textLabel = parent.append('g')
            .on('mouseover', pointer)

        // textLabel.append('circle')
        //     .attr('cx',d => xScale(d.targetX))
        //     .attr('cy',d => yScale(d.targetY))
        //     .attr('r',10)

        textLabel.append('g')
        .append('text')
        	.attr('class', 'highlighted-label')
        	.attr('x',d => xScale(d.targetX))
        	.attr('y',d => yScale(d.targetY))
            .attr('dy',0)
        	.text((d) => {
                if (intersect) {
                    radius = sizeScale(d.radius);
                }
        		else {radius = d.radius};
        		return d.title + ' '+ d.note
        	})


        	.call(wrap,lineWidth,(d => xScale(d.targetX)),"highlighted-label")
            //.call(offset)

       textLabel.call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

        let arrow = parent.append('path')
        let source =  getSource(textLabel)

        // link.attr("d", function(d) {
        // var dx = d.target.x - d.source.x,
        // dy = d.target.y - d.source.y,
        // dr = radius;
        // return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
        // });

        function getSource(label) {
            let labelX = label.attr('x')
            let labelY = label.attr('y')
            let labDim = labelDimansions(label)
            console.log(labDim)

        }

        function offset(label) {
            label.each(function(d) {
                let labDim = labelDimansions(textLabel)
                let posX = label.attr('x');
                let posY = label.attr('y');
                //console.log(x,y,plotDim[0]/2)
                if (posX > plotDim[0]/2) {
                    xOffset = (0-(labDim[0] + radius + (rem)))
                }
                if (posX < plotDim[0]/2) {
                    xOffset = radius + (rem);
                }
                if (posY > (plotDim[1]/2)) {
                    yOffset = 0 - (radius + rem + (labDim[1] / 2))
                }
                if (posY < (plotDim[1]/2)) {
                    yOffset = radius + rem 
                }
                let text = d3.select(this)
                text.attr('transform', `translate(${xOffset},${yOffset})`);
            })   
        }

        function labelDimansions (label) {
            let labelWidth = label.node().getBBox().width;
            let labelHeight = label.node().getBBox().height;
            return ([labelWidth,labelHeight])
        }

    	//wrap text function adapted from Mike Bostock
		function wrap(text, width,x, media) {
		    text.each(function() {
		        var text = d3.select(this),
		        words = text.text().split(/\s+/).reverse(),
		        word,
		        line = [],
		        lineNumber = 0,
		        lineHeight = 1.0,
		        y = text.attr("y"),
		        dy = parseFloat(text.attr("dy")),
		        tspan = text.text(null).append("tspan").attr("class", media).attr("x", x).attr("y", y).attr("dy", dy + "em");
		        while (word = words.pop()) {
		            line.push(word);
		            tspan.text(line.join(" "));
		            if (tspan.node().getComputedTextLength() > width) {
		                line.pop();
		                tspan.text(line.join(" "));
		                line = [word];
		                tspan = text.append("tspan").attr("class", media).attr("x", x).attr("y", y).attr("dy",++lineNumber * lineHeight + dy + "em").text(word);
		            }
		        }
		    });
		}
        function pointer() {
            this.style.cursor = 'pointer';
        }

        function dragstarted(d) {
            d3.select(this).raise().classed('active', true);
        }

        function dragged(d) {
               d3.select(this).selectAll('tspan').attr('x', d.x = d3.event.x).attr('y', d.y = d3.event.y);

           //d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
            //d3.select(this).attr('transform', `translate(${d3.event.d.x}, ${d3.event.d.y})`);
        }

        function dragended(d) {
            d3.select(this).classed('active', false);
        }

    }

    label.frameName = (d) => {
        frameName = d;
        return label;
    };
    label.seriesNames = (d) => {
        if (typeof d === 'undefined') return seriesNames;
        seriesNames = d;
        return label;
    };
    label.sizeScale = (d) => {
        if (!d) return sizeScale;
        sizeScale = d;
        intersect = true
        return label;
    };
    label.lineWidth = (d) => {
        if (!d) return lineWidth;
        lineWidth = d;
        return label;
    };
    label.plotDim = (d) => {
        if (!d) return window.plotDim;
        plotDim = d;
        return label;
    };
    label.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return label;
    };
    label.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return label;
    };

    return label;
}