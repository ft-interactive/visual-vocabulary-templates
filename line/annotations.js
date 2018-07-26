import d3 from 'd3';
import { select } from "d3-selection"

export function draw() {
    let lineWidth = 100
    let plotDim = [100,100];
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleLinear();
    let seriesNames  = []; // eslint-disable-line
    let rem = 16;
    let formatDecimal = d3.format(".2f")
    let frameName = ''
    const colourScale = d3.scaleOrdinal();
    let offset = []


    function label(parent) {

        const annotation = parent.append('g')
            .on('mouseover', pointer);
        
        annotation.selectAll('line')
        .data(d => d.annotations.filter((el) => {return el.type === 'threshold'}))
        .enter()
        .append('line')
            .attr('class', 'annotation')
            .attr('x1', d => xScale(d.targetX))
            .attr('x2', d => xScale(d.targetX))
            .attr('y1', yScale.range()[0])
            .attr('y2', yScale.range()[1])
        annotation.selectAll('text')
        .data(d => d.annotations.filter((el) => {return el.type === 'threshold'}))
        .enter()
        .append('text')
            .attr('class', 'highlighted-label')
            .attr('text-anchor', 'middle')
            .attr('x',d => xScale(d.targetX))
            .attr('y', yScale.range()[1] - (rem / 2))
            .text(d => d.title);

        let textLabel =annotation.selectAll('text')
        .data(d => d.annotations.filter((el) => {return el.type === 'curve' || el.type === 'elbow' || el.type === 'arc'}))
        .enter()
        .append('g')

        textLabel.append('text')
            .attr('class', 'highlighted-label')
            .attr('x',d => xScale(d.targetX))
            .attr('y',d => yScale(d.targetY))
            .attr('dy',0)
            .text((d) => {
                return d.title + ' ' + d.note
            })
            .call(wrap,lineWidth,d => xScale(d.targetX),"highlighted-label")
            .attr('transform', function(d, a) {
                const offset = getOffset(d, this);
                return `translate(${offset[0]},${offset[1]})`
            })

        textLabel.append('path')
            .attr('id', d=> d.title)
            .attr('class', 'annotation')
            .attr('stroke', '#000000')// remove when class is updfated to include definition for paths
            .attr('stroke-width', 1)// remove when class is updfated to include definition for paths
            .attr("d", function(d) {
                let label = d3.select(this.parentNode).select('text');
                let translate = [label.node().transform.baseVal[0].matrix.e, label.node().transform.baseVal[0].matrix.f];
                let sourceX = xScale(d.targetX) + translate[0]
                let sourceY = yScale(d.targetY) + translate[1]
                let points = getPathData(label, sourceX, sourceY, d)
               return points
            })
 
        function getOffset(label, textEl) {
            const text = d3.select(textEl);//gets the path or text 'g' parent
            let labelDim = labelDimansions(text);
            let posX = xScale(label.targetX);
            let posY = yScale(label.targetY);
            let radius = label.radius
            let xOffset = 0;
            let yOffset = 0;
                if (posX > plotDim[0]/2) {
                    xOffset = (0 - (labelDim[0] + radius +rem))
                }
                if (posX < plotDim[0]/2) {
                    xOffset = radius + (rem);
                }
                if (posY > (plotDim[1]/2)) {
                    yOffset = (0 - ((labelDim[1]) + radius + rem ))
                }
                if (posY < (plotDim[1]/2)) {
                    yOffset = labelDim[1] + radius + rem 
                }
            return[xOffset,yOffset];
        }

       textLabel
            .call(d3.drag()
                .subject(function() { 
                    const textEl = d3.select(this).select('text');
                    return {x: textEl.attr('x'), y: textEl.attr('y')};
                })
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));
        
        function pointer(d) {
            this.style.cursor = 'pointer';
        }

        function dragstarted(d) {
            d3.select(this).raise().classed('active', true);
        }

        function dragged(d) {
            let label = d3.select(this).select('text')
            let translate = [label.node().transform.baseVal[0].matrix.e, label.node().transform.baseVal[0].matrix.f];
            let sourceX = d3.event.x + translate[0]
            let sourceY = d3.event.y + translate[1]
            d3.select(this).selectAll('tspan').attr("x", d.x = d3.event.x).attr("y", d.y = d3.event.y);
            d3.select(this).selectAll('text').attr("x", d.x = d3.event.x).attr("y", d.y = d3.event.y);
            d3.select(this).selectAll('path').attr("d", function(el) {
                let points = getPathData(label, sourceX, sourceY, el)
                //let pathData = lineGenerator(points);
                return points
            });
        }

        function getPathData(label, sourceX, sourceY, el) {
            let labelDim = labelDimansions(label);
            let targetX = xScale(el.targetX)
            let targetY = yScale(el.targetY)
            let metrics = [sourceX,(sourceX + labelDim[0]),sourceY - rem,(sourceY + labelDim[1] - rem)]
            //console.log('metrics', metrics);
            let newX;
            let newY;
            let c1x = 400
            let c1y = 400
            let c2x = 20
            let c2y = 20
            let radius = el.radius 
            if(targetX > metrics[0] && targetX > metrics[1] && targetY > metrics[2] && targetY > metrics[3]) {
                //console.log('TL');
                newX = sourceX + labelDim[0];
                newY = sourceY + (labelDim[1] / 2);
                c1x = newX + ((targetX-newX) * 0.3)
                c1y = newY - rem
                c2x = targetX - ((targetX-newX)* 0.05)
                c2y = targetY - ((targetY-newY) * 0.8)
            }
            if(targetX < metrics[1] && targetX > metrics[0] && targetY > metrics[2]  && targetY > metrics[3]) {
                //console.log('TM');
                newX = sourceX + (labelDim[0] / 2);
                newY = sourceY + labelDim[1];
                c1x = newX
                c1y = newY + ((targetY-newY)* 0.2)
                c2x = targetX - ((targetX - newX)* 0.6)
                c2y = targetY - ((targetY - newY) * 0.1)
            }
            if(targetX < metrics[0] && targetX < metrics[1] && targetY > metrics[2]  && targetY > metrics[3]) {
                //console.log('TR');
                newX = sourceX
                newY = sourceY + (labelDim[1] / 2);
                c1x = newX - ((newX - targetX) * 0.3)
                c1y = newY - rem
                c2x = targetX + ((newX - targetX) * 0.05)
                c2y = targetY - ((targetY - newY) * 0.8)
            }
            if(targetX > metrics[0] && targetX > metrics[1] && targetY > metrics[2] && targetY < metrics[3]) {
                //console.log('ML')
                newX = sourceX + labelDim[0];
                newY = sourceY + (labelDim[1] / 2);
                c1x = newX + ((targetX-newX) * 0.2)
                c1y = newY - rem
                c2x = targetX - ((targetX-newX)* 0.1)
                c2y = targetY - ((targetY-newY) * 0.8)
            }
            if(targetX < metrics[1] && targetX > metrics[0] && targetY > metrics[2] && targetY < metrics[3]) {
                //console.log('MM');
                newX = sourceX + (labelDim[0] / 2);
                newY = sourceY + (labelDim[1] / 2);

            }
            if(targetX < metrics[0] && targetX < metrics[1] && targetY > metrics[2] && targetY < metrics[3]) {
                //console.log('MR');
                newX = sourceX
                newY = sourceY + (labelDim[1] / 2);
                c1x = newX - ((newX - targetX) * 0.2)
                c1y = newY - rem;
                c2x = targetX + ((newX - targetX) * 0.05)
                c2y = targetY - ((targetY - newY) * 0.8)
            }
            if(targetX > metrics[0] && targetX > metrics[1] && targetY < metrics[2] && targetY < metrics[3]) {
                //console.log('BL');
                newX = sourceX + labelDim[0];
                newY = sourceY + (labelDim[1] / 2);
                c1x = newX + ((targetX - newX) * 0.3)
                c1y = newY - rem
                c2x = targetX - ((targetX - newX)* 0.3)
                c2y = targetY + ((newY - targetY) * 0.6)
            }
            if(targetX < metrics[1] && targetX > metrics[0] && targetY < metrics[2] && targetY < metrics[3]) {
                //console.log('BM');
                newX = sourceX + labelDim[0] / 2;
                newY = sourceY;
                c1x = newX
                c1y = newY + ((targetY-newY)* 0.6)
                c2x = targetX - ((targetX - newX)* 0.2)
                c2y = targetY - ((targetY - newY) * 0.6)    
            }
            if(targetX < metrics[0] && targetX < metrics[1] && targetY < metrics[2] && targetY < metrics[3]) {
                //console.log('BR');
                newX = sourceX;
                newY = sourceY + (labelDim[1] / 2);
                c1x = newX - ((newX - targetX ) * 0.3)
                c1y = newY - rem
                c2x = targetX + ((newX - targetX)* 0.2)
                c2y = targetY + ((newY - targetY) * 0.6)
            }
            var dx = newX - targetX,
                dy = newY - targetY,
                angle = Math.atan2(dx, dy);
                console.log('radius', radius)
                let offsetX = radius * Math.sin(angle);
                let offsetY = radius * Math.cos(angle);
                let dr = Math.sqrt(dx * dx + dy * dy);
            let pathString;
            if (el.type ==='elbow') {
                pathString = "M " + newX + "," + (newY - rem) + " L " + c1x + "," + c1y + "L" + targetX + "," + targetY;
            }
            if (el.type ==='curve') {
                pathString  = "M " + newX + "," + (newY - rem) + " C " + c1x + "," + c1y + " " + c2x + "," + c2y + " " + (targetX) + "," + (targetY);
            }
            if (el.type ==='arc') {
                pathString  = "M" + (newX) + "," + (newY - rem)  + "Q" + c1x + "," + c1y + " "+  (targetX + offsetX) + "," +(targetY + offsetY);
            }
            return pathString
        }

        function dragended(d) {
            d3.select(this).classed('active', false);
        }

        function labelDimansions (label) {
            let labelWidth = label.node().getBBox().width;
            let labelHeight = label.node().getBBox().height;
            return ([labelWidth,labelHeight])
        }

        function wrap(text, width, x, media) {
        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("class", media).attr("x", x).attr("y", y).attr("dy", dy + "em")
            while (word = words.pop()) {
              line.push(word)
              tspan.text(line.join(" "))
              if (tspan.node().getComputedTextLength() > width) {
                line.pop()
                tspan.text(line.join(" "))
                line = [word]
                tspan = text.append("tspan").attr("class", media).attr("x", x).attr("y", y).attr("dy", `${++lineNumber * lineHeight + dy}em`).text(word)
              }
            }
            })
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
    // label.sizeScale = (d) => {
    //     if (!d) return sizeScale;
    //     sizeScale = d;
    //     intersect = true
    //     return label;
    // };
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