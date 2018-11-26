import * as d3 from 'd3';
import {Delaunay} from "d3-delaunay";
import gChartcolour from 'g-chartcolour';
//let rem = 10;

export function draw() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let seriesNames = [];
    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);
    let vertices = [];
    let rem = 10;

    function chart(parent) {
        //vertices values created in earlier code, le
        vertices = vertices.map((d) => {
            //console.log(d)
            return [xScale(d[0]),yScale(d[1])]
        })
        let alpha = 0.001
    
        let dsq = function(a,b) {
            var dx = a[0]-b[0], dy = a[1]-b[1];
            return dx*dx+dy*dy;
        }
        let asq = alpha*alpha
        
        // vertices = vertices.filter(function(t) {
        //     return dsq(t[0],t[1]) < asq && dsq(t[0],t[2]) < asq && dsq(t[1],t[2]) < asq;
        // })

        let outline = Delaunay.from(vertices)
        const {points, triangles} = outline;
        let coordinates = []

        triangles.forEach((d,i) => {
            coordinates.push([
                points[triangles[i]],
                points[triangles[i + 1]],
                points[triangles[i + 2]]
            ]);
        })
        coordinates = coordinates
            .filter((el) => {
                return el[0] != undefined && el[1] != undefined && el[2] != undefined
            })
            .filter(function(t,i) {
                //console.log(t,i, dsq(t[0],t[1]))
                return i, dsq(t[0],t[1]) < asq && dsq(t[0],t[2]) < asq && dsq(t[1],t[2]) < asq;
            })

        console.log(coordinates)
        

        // const t0 = triangles[i * 3 + 0];
        // const t1 = triangles[i * 3 + 1];
        // const t2 = triangles[i * 3 + 2];
        // context.moveTo(points[t0 * 2], points[t0 * 2 + 1]);
        // context.lineTo(points[t1 * 2], points[t1 * 2 + 1]);
        // context.lineTo(points[t2 * 2], points[t2 * 2 + 1]);
        // context.closePath();
        
        parent.append('path')
            .attr('fill', '#FCE6D6')
            .attr('opacity',0.5)
            .attr('stroke', '#000000')
            .attr('d', outline.render());
    }

    chart.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return chart;
    };

    chart.yAxisAlign = (d) => {
        if (!d) return yAxisAlign;
        yAxisAlign = d;
        return chart;
    };

    chart.yDomain = (d) => {
        if (typeof d === 'undefined') return yScale.domain();
        yScale.domain(d);
        return chart;
    };

    chart.yRange = (d) => {
        if (typeof d === 'undefined') return yScale.range();
        yScale.range(d);
        return chart;
    };

    chart.seriesNames = (d) => {
        if (typeof d === 'undefined') return seriesNames;
        seriesNames = d;
        return chart;
    };

    chart.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return chart;
    };

    chart.xDomain = (d) => {
        if (typeof d === 'undefined') return xScale.domain();
        xScale.domain(d);
        return chart;
    };

    chart.xRange = (d) => {
        if (typeof d === 'undefined') return xScale.range();
        xScale.range(d);
        return chart;
    };

    chart.plotDim = (d) => {
        if (!d) return window.plotDim;
        window.plotDim = d;
        return chart;
    };

    chart.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return chart;
    };

    chart.vertices = (d) => {
        if (!d) return vertices;
        vertices = d;
        return chart;
    };

    chart.colourPalette = (d) => {
        if (!d) return colourScale;
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    };

    return chart;
}
