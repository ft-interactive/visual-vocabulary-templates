import d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';
import * as gAxis from 'g-axis';


export function drawLegend() {
    let colourScale = d3.scaleThreshold();
    let rem = 10;
    let frameName = '';
    let valueExtent = [0,1];
    let linearRange = [0,100];


    function legend(parent) {

        let linearTicks = colourScale.domain();
        linearTicks.unshift(valueExtent[0]);
        linearTicks.push(valueExtent[1]);

        let xAxis = gAxis.xLinear()
            .domain(valueExtent)
            .range(linearRange)
            .tickSize(rem*2)
            .tickValues(linearTicks)

        parent.call(xAxis);

        let postScale = xAxis.scale();
        linearTicks.pop();
        
        parent.selectAll('rect')
            .data(linearTicks)
            .enter()
            .append('rect')
                .attr("height", rem)
                .attr('x', d =>  postScale(d))
                .attr("width", function(d, i) {
                    if(i + 1 === linearTicks.length) {
                        return postScale(valueExtent[1] - d + valueExtent[0])
                    }
                    else {return postScale((linearTicks[i+1] - d) + valueExtent[0])}
                })
                .attr("fill", function(d, i) { return colourScale(d) });

        d3.selectAll('#legend')
            .on('mouseover', pointer)
            .call(d3.drag()
                // .subject(function() {
                //     const obj = d3.select(this).selectAll('g');
                //     return {x: obj.attr('x'), y: obj.attr('y')};
                // })
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        const labels = parent.selectAll('.chart-subtitle');
        labels.each(function setLabelIds() {
            d3.select(this)
                .attr('id', `${frameName}legend`);
        });
    }


    legend.frameName = (d) => {
        frameName = d;
        return legend;
    };

    legend.forceLegend = (d) => {
        if (d === undefined) return forceLegend;
        forceLegend = d;
        return legend;
    };

    legend.colourScale = (d) => {
        if (!d) return colourScale;
        colourScale = d;
        return legend;
    };

    legend.colourPalette = (d) => {
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            if (geometry === 'circ' || geometry === 'line') {
                colourScale.range(gChartcolour.lineWeb);
            } else {
                colourScale.range(gChartcolour.categorical_bar);
            }
        } else if (d === 'print') {
            if (geometry === 'circ' || geometry === 'line') {
                colourScale.range(gChartcolour.linePrint);
            } else {
                colourScale.range(gChartcolour.barPrint);
            }
        } else if (d && d.name && d.name === 'scale') {
            colourScale = d;
        } else if (d === undefined) {
            return colourScale;
        }
        return legend;
    };

    legend.rem = (d) => {
        if (d) {
            rem = d;
            return legend;
        }
        return rem;
    };

    legend.alignment = (d) => {
        alignment = d;
        return legend;
    };

    legend.geometry = (d) => {
        geometry = d;
        return legend;
    };

    legend.linearRange = (d) => {
        linearRange = d;
        return legend;
    };

    legend.valueExtent = (d) => {
        valueExtent = d;
        return legend;
    };

    function pointer() {
        this.style.cursor = 'pointer';
    }

    function dragstarted() {
        d3.select(this).raise().classed('active', true);
    }

    function dragged(d) {
        d3.select(this).attr('transform', `translate(${d3.event.x}, ${d3.event.y})`);

    }

    function dragended() {
        d3.select(this).classed('active', false);
    }

    return legend;
}
