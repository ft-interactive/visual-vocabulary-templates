(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
	typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
	(factory((global.gAxis = global.gAxis || {}),global.d3));
}(this, (function (exports,d3) { 'use strict';

var xaxisLinear = function() {
	let scale = d3.scaleLinear()
        .domain([0,100])
        .range([0,220]);
    let tickSize = 50;
    let offset = 0;
    let numTicks = 5;

    function axis(parent) {

        const xAxis =d3.axisBottom()
            .tickSize(tickSize*.75)
            .ticks(numTicks)
            .scale(scale);
        
        if (offset==0) {
            xAxis.tickSize(tickSize);
        }

        const xLabel = parent.append("g")
            .attr("class", "axis xAxis" )
            .call(xAxis);
        
        if (offset>0) {
            xLabel.attr("transform","translate(0,"+(offset)+")");
            let ticks = xLabel.selectAll(".tick");
            ticks.each(function (d) {
                d3.select(this)
                .classed("baseline",true);
            });
        }
        
    }

    axis.scale = (d)=>{
        scale = d;
        return axis;
        };
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
        };

        axis.offset = (d)=>{
            if(d===undefined) return offset
            offset=d;
            return axis;
        };

        axis.numTicks = (d)=>{
            if(d===undefined) return numTicks
            numTicks=d;
            return axis;
        };

    return axis
};

exports.xaxisLinear = xaxisLinear;

Object.defineProperty(exports, '__esModule', { value: true });

})));
