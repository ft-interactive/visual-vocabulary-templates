import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

let rem = 10;

export function draw() {
    let yScale = d3.scaleLinear();
    let xLeftScale = d3.scaleLinear();
    let xRightScale = d3.scaleLinear();
    let colourScale = d3.scaleOrdinal();
    let chartWidth;
    // .range(gChartcolour.lineWeb)
    // .domain(seriesNames);

    function chart(parent) {
        let democrats = parent
            .selectAll(".leftcolumns")
            .data((d) => d.demData)
            .enter()
            .append('g')
            .attr("class", "leftcolumns")
            .append("rect")
            .attr("id", (d) => d.name)
            .attr("y", (d) => yScale(d.y1))
            .attr("height", (d) => Math.abs(yScale(d.y1) - yScale(d.y0)))
            .attr("x", (d) => xLeftScale(d.width))
            .attr("width", (d) => Math.abs(xLeftScale(d.width) - xLeftScale(0)))
            .attr("fill", (d) => colourScale(d.party));

        democrats = parent
            .selectAll("text")
            .data((d) => d.demData)
            .enter()
            .append("g")
            .attr("class", "leftcolumns")
            .append("text")
            .attr("x", (d) => xLeftScale(d.width) - rem / 2)
            .attr("y",(d) => yScale(d.y1) + Math.abs(yScale(d.y1) - yScale(d.y0)) / 2 + rem / 2)
            .attr("text-anchor", "end")
            .attr("fill", (d) => colourScale(d.party))
            .text((d) => {
                if (d.y1 > 270) {
                    return d.abbreviation + " " + d.width;
                } else return "";
            });
        parent
		    .append("g")
            .attr("class", "chart-label")
            .append("text")
            .attr("x", 0)
            .attr("y", 0)
            .text((d) => d.demLabel);

        let republicans = parent
            .selectAll(".rightcolumnst")
            .data((d) => d.repData)
            .enter()
            .append("g")
            .attr("class", "rightcolumns")
            .append("rect")
            .attr("id", (d) => d.name)
            .attr("y", (d) => yScale(d.y1))
            .attr("height", (d) => Math.abs(yScale(d.y1) - yScale(d.y0)))
            .attr("x", (d) => xRightScale(d.x))
            .attr("width", (d) => xRightScale(d.width) - xRightScale(0))
            .attr("fill", (d) => colourScale(d.party));
        
        republicans = parent
            .selectAll("text")
            .data((d) => d.repData)
            .enter()
            .append("g")
            .attr("class", "rightcolumns")
            .append("text")
            .attr("x", (d) => xRightScale(d.width)  + rem / 2)
            .attr(
                "y",
                (d) =>
                    yScale(d.y1) +
                    Math.abs(yScale(d.y1) - yScale(d.y0)) / 2 +
                    rem / 2
            )
            .attr("fill", (d) => colourScale(d.party))
            .text((d) => {
                if (d.y1 > 270) {
                    return d.abbreviation + " " + d.width;
                } else return "";
            });
        
        parent
            .append("g")
            .attr("class", "chart-label")
            .append("text")
            .attr("x", chartWidth)
            .attr("y", 0)
            .attr("text-anchor", "end")
            .text((d) => d.repLabel);
                    
    };


    chart.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return chart;
    };

    chart.xLeftScale = (d) => {
        if (!d) return xLeftScale;
        xLeftScale = d;
        return chart;
    };
    chart.xRightScale = (d) => {
			if (!d) return xRightScale;
			xRightScale = d;
			return chart;
        };
        
    chart.chartWidth = (d) => {
        if (!d) return chartWidth;
        chartWidth = d;
        return chart;
        };
        
    chart.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return chart;
    };

    chart.colourPalette = (d) => {
        if (!d) return colourScale;
        if (d === "social" || d === "video") {
					colourScale.range(gChartcolour.lineSocial);
				} else if (
					d === "webS" ||
					d === "webM" ||
					d === "webMDefault" ||
					d === "webL"
				) {
					colourScale.range(gChartcolour.lineWeb);
				} else if (d === "print") {
					colourScale.range(gChartcolour.barPrint);
                } else if (d && d.name && d.name === "scale") {
                    colourScale = d;
                }
                
                return chart;
    };

    return chart;
}