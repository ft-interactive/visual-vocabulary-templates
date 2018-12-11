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
    let calculateDistance = stdevDistance
    let padding = 0;
    let distance(a, b) {
            let dx = a[0]-b[0]
            let dy = a[1]-b[1];
            return Math.sqrt((dx * dx) + (dy * dy));
        }

    function chart(parent) {
        //vertices values created in earlier code, le
        vertices = vertices.map((d) => {
            //console.log(d)
            return [xScale(d[0]),yScale(d[1])]
        })
 
        let triangles =d3.voronoi().triangles(vertices);
        
        function distance(a, b) {
            let dx = a[0]-b[0]
            let dy = a[1]-b[1];
            return Math.sqrt((dx * dx) + (dy * dy));
        }

        function stdevDistance(delaunay) {
            let sides = [];
            delaunay.forEach(function (d) {
                sides.push(distance(d[0],d[1]));
                sides.push(distance(d[0],d[2]));
                sides.push(distance(d[1],d[2]));
            });

            let dev = d3.deviation(sides);
            let mean = d3.mean(sides);

            return mean + dev;
        }

        var longEdge = calculateDistance(triangles);


        let mesh = triangles.filter(function (d) {
        return distance(d[0],d[1]) < longEdge && distance(d[0],d[2]) < longEdge && distance(d[1],d[2]) < longEdge
        })

        let counts = {}
        let edges = {}
        let r;
        let result = [];
        // Traverse the edges of all triangles and discard any edges that appear twice.
        mesh.forEach(function(triangle) {
            for (var i = 0; i < 3; i++) {
                let edge = [triangle[i], triangle[(i + 1) % 3]].sort(ascendingCoords)
                .map(String);
                (edges[edge[0]] = (edges[edge[0]] || [])).push(edge[1]);
                (edges[edge[1]] = (edges[edge[1]] || [])).push(edge[0]);
                let k = edge.join(":");
                if (counts[k]) delete counts[k];
                else counts[k] = 1;
            }
        });

        while (1) {
            let k = null;
            // Pick an arbitrary starting point on a boundary.
            for (k in counts) break;
            if (k == null) break;
            result.push(r = k.split(":").map(function(d) { return d.split(",").map(Number); }));
            delete counts[k];
            let q = r[1];
            while (q[0] !== r[0][0] || q[1] !== r[0][1]) {
                let p = q;
                let qs = edges[p.join(",")];
                let n = qs.length;
                for (var i = 0; i < n; i++) {
                    q = qs[i].split(",").map(Number);
                    let edge = [p, q].sort(ascendingCoords).join(":");
                    if (counts[edge]) {
                        delete counts[edge];
                        r.push(q);
                        break;
                    }
                }
            }
            
            console.log(result)

            const lineData = d3.line()
                .defined(d => d)
                .curve(d3.curveLinear)
                .x(d => xScale(d[0]))
                .y(d => yScale(d[1]));

            parent.append('path')
                .attr('fill', '#FCE6D6')
                .attr('opacity',0.5)
                .attr('stroke', '#000000')
                .attr('d',  d => lineData(result));

        } 


        function ascendingCoords(a, b) {
            return a[0] === b[0] ? b[1] - a[1] : b[0] - a[0];
        }
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

    chart.distance = (d) => {
      if (!d) return calculateDistance;
      calculateDistance = newDistance;
      if (typeof d === "number") {
        calculateDistance =(d) => {return d};
      }
      return chart;
    }

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
