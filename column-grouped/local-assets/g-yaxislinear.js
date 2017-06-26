(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
    typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
    (factory((global.gAxis = global.gAxis || {}),global.d3));
}(this, function (exports,d3) { 'use strict';

    function yaxisLinear() {

    	let yScale = d3.scaleLinear()
            .domain([0,10000])
            .range([120,0])
        let tickAlign = "right"
        let labelWidth = 0;
        let tickSize = 300;
        let yAxisHighlight = 0;
        let numTicks = 5

        function axis(parent) {

            const yAxis =getAxis(tickAlign)
                .ticks(numTicks)
                .scale(yScale)

            const yLabel = parent.append("g")
                .attr("class","axis yAxis")
                .call(yAxis)

            //Calculate width of widest .tick text
            parent.selectAll(".yAxis text").each(
                function(){
                    labelWidth=Math.max(this.getBBox().width,labelWidth);
                })
            //Use this to amend the tickSIze and re cal the vAxis
            yLabel.call(yAxis.tickSize(tickSize-labelWidth))

            //position label on right hand axis
            if(tickAlign=="right") {
                yLabel.selectAll("text")
                .attr("dx",labelWidth)
            }
            //translate if a left axis
            if (tickAlign=="left") {
                yLabel.attr("transform","translate("+(tickSize-labelWidth)+","+0+")")
            }
            //identify 0 line if there is one
            let originValue = 0;
            let origin = yLabel.selectAll(".tick").filter(function(d, i) {
                    return d==originValue || d==yAxisHighlight;
                }).classed("baseline",true);
        }


        axis.yScale = (d)=>{
            yScale = d;
            return axis;
        }
        axis.domain = (d)=>{
            yScale.domain(d);
            return axis;
        };
        axis.range = (d)=>{
            yScale.range(d);
            return axis;
        };
        axis.tickAlign = (d)=>{
            tickAlign=d;
            return axis;
        }
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
        axis.yAxisHighlight = (d)=>{
            yAxisHighlight = d;
            return axis;
        }
        axis.numTicks = (d)=>{
            numTicks = d;
            return axis;
        }
        axis.tickAlign = (d)=>{
            if(!d) return tickAlign;
            tickAlign = d;
            return axis;
        }
        return axis

        function getAxis(alignment){
            return{
                "left": d3.axisLeft(),
                "right":d3.axisRight()
            }[alignment]
        }
    };

    exports.yaxisLinear = yaxisLinear;

    Object.defineProperty(exports, '__esModule', { value: true });

}));