import d3 from 'd3';
import { select } from "d3-selection"

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

    	const textLabel = parent.append('g')
            .on('mouseover', pointer)
            .attr('id', 'labelHolder')

        textLabel.append('text')
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
        	.call(wrap,lineWidth,d => xScale(d.targetX),"highlighted-label")
            .call(offset)

        textLabel.append('line')
            .attr('x1', d => xScale(d.targetX) + (getSource(d,textLabel.text)[0]))
            .attr('y1', d => yScale(d.targetY) + (getSource(d,textLabel.text)[1]))
            .attr('x2', d => xScale(d.targetX))
            .attr('y2', d => yScale(d.targetY))
            .attr('stroke', '#000000')
            .attr('stroke-width', 1)



       textLabel
            .call(d3.drag()
                //.container(select('g.anotations').node())
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));


        // link.attr("d", function(d) {
        // var dx = d.target.x - d.source.x,
        // dy = d.target.y - d.source.y,
        // dr = radius;
        // return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
        // });

        function pointer(d) {
            this.style.cursor = 'pointer';
        }

        function dragstarted(d) {
            d3.select(this).raise().classed('active', true);
        }

        function dragged(d) {
            d3.select(this).selectAll('tspan').attr("x", d.x = d3.event.x).attr("y", d.y = d3.event.y);
            d3.select(this).selectAll('text').attr("x", d.x = d3.event.x).attr("y", d.y = d3.event.y);
        }

        function dragended(d) {
            d3.select(this).classed('active', false);
        }

        function offset(label) {
            label.each(function(d) {
                let labelText = d3.select(this)
                console.log('offsetObj',labelText)
                let labDim = labelDimansions(labelText)
                let posX = xScale(d.targetX);
                let posY = yScale(d.targetY);
                //console.log(posX)
                let yOffset = 0;
                let xOffset = 0;
                if (posX > plotDim[0]/2) {
                    xOffset = (0-(labDim[0] + radius + (rem)))
                }
                if (posX < plotDim[0]/2) {
                    xOffset = radius + (rem);
                }
                if (posY > (plotDim[1]/2)) {
                    yOffset = (0 - (radius + rem + (labDim[1])))
                }
                if (posY < (plotDim[1]/2)) {
                    yOffset = radius + rem 
                }
                labelText.attr('transform', `translate(${xOffset},${yOffset})`);
            }) 
        }
        function getSource(d, el) {
            console.log('sourceObj',el)
                let labelText = d3.select(parent.d)
                let labDim = labelDimansions(el)
                let posX = xScale(d.targetX);
                let posY = yScale(d.targetY);
                //console.log(posX)
                let yOffset = 0;
                let xOffset = 0;
                // if (posX > plotDim[0]/2) {
                //     xOffset = (0-(labDim[0] + radius + (rem)))
                // }
                // if (posX < plotDim[0]/2) {
                //     xOffset = radius + (rem);
                // }
                // if (posY > (plotDim[1]/2)) {
                //     yOffset = (0 - (radius + rem + (labDim[1])))
                // }
                // if (posY < (plotDim[1]/2)) {
                //     yOffset = radius + rem 
                // }
                return [xOffset, 0]
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
		                tspan.text(line.join(" "));
		                line = [word];
		                tspan = text.append("tspan").attr("class", media).attr("x", x).attr("y", y).attr("dy",++lineNumber * lineHeight + dy + "em").text(word);
		            }
		        }
		    });
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