(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
    typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
    (factory((global.gAxis = global.gAxis || {}),global.d3));
}(this, function (exports,d3) { 'use strict';

    function yaxisOrdinal() {
     	let tickAlign ="left"
        let scale = d3.scaleBand()
            .domain(["Oranges", "Lemons", "Apples", "Pears"])
            .rangeRound([0, 220]);
        let labelWidth = 0;
        let tickSize = 0;
        let offset = 0;

        function axis(parent) {

            const yAxis =getAxis(tickAlign)
                .tickSize(tickSize)
                .scale(scale)

            const yLabel = parent.append("g")
                .attr("class","axis yAxis")
                .call(yAxis)

            //Calculate width of widest .tick text
            parent.selectAll(".yAxis text").each(
                function(){
                    labelWidth=Math.max(this.getBBox().width,labelWidth);
                })

            //position label on right hand axis
            if (tickAlign=="left") {
                yLabel.attr("transform","translate("+(labelWidth )+","+0+")")
            }
            //translate if a right axis
            if (tickAlign=="right") {
                yLabel.attr("transform","translate("+(offset-labelWidth )+","+0+")")
            }
            
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

            axis.labelWidth = (d)=>{
                if(d===undefined) return labelWidth
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

            axis.tickAlign = (d)=>{
                if(!d) return tickAlign;
                tickAlign = d;
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

    exports.yaxisOrdinal = yaxisOrdinal;

    Object.defineProperty(exports, '__esModule', { value: true });

}));