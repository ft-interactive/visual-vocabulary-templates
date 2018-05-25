import * as d3 from 'd3';

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

    	let textLabel = parent.append('g')
            .on('mouseover', pointer)
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended))

        textLabel.append('text')
        	.attr('class', 'highlighted-label')
        	.attr('x',d => xScale(d.x))
        	.attr('y',d => yScale(d.y))
            .attr('dy',0)
        	.text((d) => {
                if (intersect) {
                    radius = sizeScale(d.radius);
                }
        		else {radius = d.radius};
        		return d.title + ' '+ d.note
        	})
        	.call(wrap,lineWidth,(d => xScale(d.x)),"highlighted-label")
            .call(offset)

        let arrow = parent.append('path')

        // link.attr("d", function(d) {
        // var dx = d.target.x - d.source.x,
        // dy = d.target.y - d.source.y,
        // dr = radius;
        // return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
        // });

        function offset(label) {
            label.each(function(d) {
                //console.log(d)
                let labelWidth = this.getBBox().width;
                let labelHeight = this.getBBox().height;
                let x = xScale(d.x);
                let y = yScale(d.y)
                //console.log(x,y,plotDim[0]/2)
                if (x > plotDim[0]/2) {
                    xOffset = (0-(labelWidth + radius + (rem)))
                }
                if (x < plotDim[0]/2) {
                    xOffset = radius + (rem);
                }
                if (y > (plotDim[1]/2)) {
                    yOffset = 0 - (radius + rem + (labelHeight / 2))
                }
                if (y < (plotDim[1]/2)) {
                    yOffset = radius + rem 
                }
                let text = d3.select(this)
                text.attr('transform', `translate(${xOffset},${yOffset})`);
            })
            
        }


    	//wrap text function adapted from Mike Bostock
		function wrap(text, width,x, media) {
		    text.each(function() {
		        var text = d3.select(this),
		        words = text.text().split(/\s+/).reverse(),
		        word,
		        line = [],
		        lineNumber = 0,
		        lineHeight = 1.1,
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

        function dragstarted() {
            d3.select(this).raise().classed('active', true);
            console.log(d3.event);
        }

        function dragged() {
            let item = d3.select(this)
            console.log(item)
            // const dX = window.event.x // subtract cx
            // const dY = window.event.y // subtract cy
            // d3.select(this).attr('transform', `translate(${dX}, ${dY})`);
            // console.log(this);
            console.log(d3.event);
            // console.log(window.event);
            // d3.select(this).attr('transform', `translate(${d3.event.x}, ${d3.event.y})`);
        }

        function dragended() {
            console.log(d3.event);
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