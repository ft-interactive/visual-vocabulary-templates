import * as d3 from "d3";
import * as gChartcolour from "g-chartcolour";
import "d3-selection-multi";

export function draw() {
    let rem = 10;
    const colourScale = d3.scaleOrdinal();
    // .domain(['group']);
    let colourProperty = "group"; // eslint-disable-line no-unused-vars
    let seriesNames = []; // eslint-disable-line no-unused-vars
    let radius;
    let smallRadius;
    let totalSize;
    let frameName;
    let frameTimes;
    let pieDim;
    let plotDim;
    let setHighlight;

    function chart(parent) {
        var pie = d3
            .pie()
            .sort(null)
            .value(function (d) {
                return d;
            });
        var data = [1, 99];
        console.log("frameTimes", frameTimes);

        parent
            .append("text")
            .attr("class", "pie-name")
            .attr("x", 0)
            .attr("dy", rem * 1.5)
            .text((d) => d.code);

        var arc = d3.arc().outerRadius(50).innerRadius(10);

        const smallPie = parent
            .append("g")
            .selectAll(".arc")
            .data(pie(data))
            .enter()
            .append("g")
            .attr("class", "arc")
            .append("path")
            .attr("d", arc)
            .style("fill", "#a3b2f1");
        smallPie.attr(
            "transform",
            `translate(${pieDim[0] * 0.5}, ${pieDim[1]})`
        );

        // parent.append ('g')
        //     //.attr("transform", "translate(100,100);
        // .selectAll('mySlices')
        //     .data(data_ready)
        //     .enter()
        //     .append('path')
        //         .attr('d', arcGenerator)
        //         .attr('fill', '#fff3a4')
        //         .attr("stroke", "black")
        //         .style("stroke-width", "2px")
        //         .style("opacity", 0.7);
    }

    chart.seriesNames = (d) => {
        if (typeof d === "undefined") return seriesNames;
        seriesNames = d;
        return chart;
    };

    chart.frameTimes = (d) => {
        if (typeof d === "undefined") return frameTimes;
        frameTimes = d;
        return chart;
    };

    chart.radius = (d) => {
        if (!d) return radius;
        radius = d;
        return chart;
    };

    chart.smallRadius = (d) => {
        if (!d) return radius;
        smallRadius = d;
        return chart;
    };

    chart.totalSize = (d) => {
        if (!d) return totalSize;
        totalSize = d;
        return chart;
    };

    chart.colourPalette = (d) => {
        if (!d) return colourScale;
        if (d === "social" || d === "video") {
            colourScale.range(gChartcolour.lineSocial);
        } else if (["webS", "webM", "webMDefault", "webL"].includes(d)) {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === "print") {
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    };

    chart.colourPicker = (d) => {
        if (d === "social" || d === "video" || d === "print") {
            setHighlight = 1;
        } else if (["webS", "webM", "webMDefault", "webL"].includes(d)) {
            setHighlight = 4;
        }
        return chart;
    };

    chart.colourRange = (x) => {
        colourScale.range(x);
        return chart;
    };

    chart.colourDomain = (x) => {
        colourScale.domain(x);
        return chart;
    };

    chart.colourProperty = (x) => {
        colourProperty = x;
        return chart;
    };

    chart.plotDim = (d) => {
        if (!d) return window.plotDim;
        window.plotDim = d;
        return chart;
    };

    chart.pieDim = (d) => {
        if (!d) return pieDim;
        pieDim = d;
        return chart;
    };

    chart.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return chart;
    };
    chart.frameName = (d) => {
        if (!d) return frameName;
        frameName = d;
        return chart;
    };

    return chart;
}
