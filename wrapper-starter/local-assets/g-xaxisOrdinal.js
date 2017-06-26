(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
    typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
    (factory((global.gAxis = global.gAxis || {}),global.d3));
}(this, function (exports,d3) { 'use strict';

    function xaxisOrdinal() {
    	let scale = d3.scaleBand()
            .domain(["Oranges", "Lemons", "Apples", "Pears"])
            .rangeRound([40, 300]);
        let tickSize = 0;
        let offset = 0;

        function axis(parent) {

            const xAxis =d3.axisBottom()
                .tickSize(tickSize)
                .scale(scale)

            const xLabel = parent.append("g")
                .attr("class","axis xAxis")
                .call(xAxis)

            xLabel.attr("transform","translate(0,"+(offset)+")");
            
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

        return axis
    };

    exports.xaxisOrdinal = xaxisOrdinal;

    Object.defineProperty(exports, '__esModule', { value: true });

}));