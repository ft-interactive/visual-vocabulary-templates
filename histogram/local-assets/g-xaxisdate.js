(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
    typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
    (factory((global.gAxis = global.gAxis || {}),global.d3));
}(this, function (exports,d3) { 'use strict';

    function xaxisDate() {
        let mindate = new Date(1970,1,1);
        let maxdate = new Date(2017,6,1);
        let scale = d3.scaleTime()
            .domain([mindate,maxdate])
            .range([0,220]);
        let offset = 0;
        let interval ="lustrum";
        let minorAxis = true;
        let tickSize=10;
        let fullYear = false

        function axis(parent) {

            const xAxis =d3.axisBottom()
                .tickSize(tickSize*.75)
                .ticks(getTicks(interval))
                .tickFormat(tickFormat(interval))
                .scale(scale)
            if (offset==0) {
                xAxis.tickSize(tickSize)
            }

            const xMinor=d3.axisBottom()
                .tickSize(tickSize*.3)
                .ticks(getTicksMinor(interval))
                .tickFormat("")
                .scale(scale)
            if (offset==0) {
                xMinor.tickSize(tickSize)
            }

            const xLabel = parent.append("g")
                .attr("class",(d)=>{
                    if (offset==0) {
                        return "axis baseline";
                    }
                    else {return "axis xAxis"}
                })
                .call(xAxis)
            if (offset>0) {
                xLabel.attr("transform","translate(0,"+(offset)+")");
            }

            if (minorAxis) {
                const xLabelMinor = parent.append("g")
                .attr("class",(d)=>{
                    if (offset==0) {
                        return "axis xAxis";
                    }
                    else {return "axis baseline"}
                })
                .call(xMinor)
                if (offset>0) {
                    xLabelMinor.attr("transform","translate(0,"+(offset)+")");
                }
                
            }

            let ticks = xLabel.selectAll(".tick");
            ticks.each(function (d) {
                d3.select(this)
                .classed("baseline",true);
            })

        }

        function getTicks(interval) {
            console.log()
            return {
                "century":d3.timeYear.every(100),
                "jubilee":d3.timeYear.every(50),
                "decade":d3.timeYear.every(10),
                "lustrum":d3.timeYear.every(5),
                "years":d3.timeYear.every(1),
                "quarters":d3.timeMonth.every(3),
                "months":d3.timeMonth.every(1),
                "weeks":d3.timeWeek.every(1),
                "days":d3.timeDay.every(1),
                "hours":d3.timeHour.every(1)
            }[interval]
        }
        function getTicksMinor(interval) {
            return {
                "century":d3.timeYear.every(10),
                "jubilee":d3.timeYear.every(10),
                "decade":d3.timeYear.every(1),
                "lustrum":d3.timeYear.every(1),
                "years":d3.timeMonth.every(1),
                "quarters":d3.timeMonth.every(1),
                "months":d3.timeDay.every(1),
                "weeks":d3.timeDay.every(1),
                "days":d3.timeHour.every(1),
                "hours":d3.timeMinute.every(1)
            }[interval]
        }

        function tickFormat(interval) {
            let formatFullYear=d3.timeFormat("%Y"),
            formatYear=d3.timeFormat("%y");
            return {
                "century":d3.timeFormat("%Y"),
                "jubilee":d3.timeFormat("%Y"),  
                "decade":d3.timeFormat("%y"),
                "lustrum":d3.timeFormat("%y"),
                "years": function(d) {
                    if (fullYear || (+formatFullYear(d) % 100 === 0)) {
                        return formatFullYear(d)
                    }
                    else {
                        return formatYear(d)
                    }
                },
                "quarters":d3.timeFormat("%b"),
                "months":d3.timeFormat("%b"),
                "weeks":d3.timeFormat("%b"),
                "days":d3.timeFormat("%d"),
                "hours":d3.timeFormat("%I"+":00")
            }[interval]
        }

        axis.scale = (d)=>{
            scale = d;
            return axis;
        }
        axis.domain = (d)=>{
            scale.domain(d);
            return axis;
        };
        axis.range = (d)=>{
            scale.range(d);
            return axis;
        };
        axis.offset = (d)=>{
            offset = d;
            return axis;
        }
        axis.fullYear = (d)=>{
            fullYear = d;
            return axis;
        }
        axis.interval = (d)=>{
            interval = d;
            return axis;
        }
        axis.tickSize = (d)=>{
            if(!d) return tickSize;
            tickSize = d;
            return axis;
        }
        axis.minorAxis = (d)=>{
            minorAxis = d;
            return axis;
        }
        return axis
    };

    exports.xaxisDate = xaxisDate;

    Object.defineProperty(exports, '__esModule', { value: true });

}));