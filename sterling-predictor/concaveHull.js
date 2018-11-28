/**
 * @file
 * d3.concaveHull
 * @url https://bl.ocks.org/pbellon/d397cbdfc596f1724860b60a1d41be43#d3-concaveHull.js
 */
import d3 from 'd3';

export default function concaveHull() {
    var calculateDistance = stdevDistance,
        padding = 0,
        mesh,
        delaunay;


    function distance(a, b) {
        var dx = a[0] - b[0],
            dy = a[1] - b[1];
        return Math.sqrt((dx * dx) + (dy * dy));
    }

    function stdevDistance(delaunay) {
        var sides = [];
        delaunay.forEach(function(d) {
            sides.push(distance(d[0], d[1]));
            sides.push(distance(d[0], d[2]));
            sides.push(distance(d[1], d[2]));
        });

        var dev = d3.deviation(sides);
        var mean = d3.mean(sides);

        return mean + dev;
    }

    function concaveHull(vertices) {

        delaunay = d3.voronoi().triangles(vertices);

        var longEdge = calculateDistance(delaunay);

        mesh = delaunay.filter(function(d) {
            return distance(d[0], d[1]) < longEdge && distance(d[0], d[2]) < longEdge && distance(d[1], d[2]) < longEdge
        })

        var counts = {},
            edges = {},
            r,
            result = [];
        // Traverse the edges of all triangles and discard any edges that appear twice.
        mesh.forEach(function(triangle) {
            for (var i = 0; i < 3; i++) {
                var edge = [triangle[i], triangle[(i + 1) % 3]].sort(ascendingCoords).map(String);
                (edges[edge[0]] = (edges[edge[0]] || [])).push(edge[1]);
                (edges[edge[1]] = (edges[edge[1]] || [])).push(edge[0]);
                var k = edge.join(":");
                if (counts[k]) delete counts[k];
                else counts[k] = 1;
            }
        });

        while (1) {
            var k = null;
            // Pick an arbitrary starting point on a boundary.
            for (k in counts) break;
            if (k == null) break;
            result.push(r = k.split(":").map(function(d) {
                return d.split(",").map(Number);
            }));
            delete counts[k];
            var q = r[1];
            while (q[0] !== r[0][0] || q[1] !== r[0][1]) {
                var p = q,
                    qs = edges[p.join(",")],
                    n = qs.length;
                for (var i = 0; i < n; i++) {
                    q = qs[i].split(",").map(Number);
                    var edge = [p, q].sort(ascendingCoords).join(":");
                    if (counts[edge]) {
                        delete counts[edge];
                        r.push(q);
                        break;
                    }
                }
            }
        }

        if (padding !== 0) {
            result = pad(result, padding);
        }


        return result;
    }

    function pad(bounds, amount) {
        var result = [];
        bounds.forEach(function(bound) {
            var padded = [];

            var area = 0;
            bound.forEach(function(p, i) {
                // http://forums.esri.com/Thread.asp?c=2&f=1718&t=174277
                // Area = Area + (X2 - X1) * (Y2 + Y1) / 2

                var im1 = i - 1;
                if (i == 0) {
                    im1 = bound.length - 1;
                }
                var pm = bound[im1];
                area += (p[0] - pm[0]) * (p[1] + pm[1]) / 2;
            });
            var handedness = 1;
            if (area > 0) handedness = -1
            bound.forEach(function(p, i) {
                // average the tangent between 
                var im1 = i - 1;
                if (i == 0) {
                    im1 = bound.length - 2;
                }
                //var tp = getTangent(p, bound[ip1]);
                var tm = getTangent(p, bound[im1]);
                //var avg = { x: (tp.x + tm.x)/2, y: (tp.y + tm.y)/2 };
                //var normal = rotate2d(avg, 90);
                var normal = rotate2d(tm, 90 * handedness);
                padded.push([p[0] + normal.x * amount, p[1] + normal.y * amount])
            })
            result.push(padded)
        })
        return result
    }

    function getTangent(a, b) {
        var vector = {
            x: b[0] - a[0],
            y: b[1] - a[1]
        }
        var magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        vector.x /= magnitude;
        vector.y /= magnitude;
        return vector
    }

    function rotate2d(vector, angle) {
        //rotate a vector
        angle *= Math.PI / 180; //convert to radians
        return {
            x: vector.x * Math.cos(angle) - vector.y * Math.sin(angle),
            y: vector.x * Math.sin(angle) + vector.y * Math.cos(angle)
        }
    }

    function ascendingCoords(a, b) {
        return a[0] === b[0] ? b[1] - a[1] : b[0] - a[0];
    }

    concaveHull.padding = function(newPadding) {
        if (!arguments.length) return padding;
        padding = newPadding;
        return concaveHull;
    }

    concaveHull.distance = function(newDistance) {
        if (!arguments.length) return calculateDistance;
        calculateDistance = newDistance;
        if (typeof newDistance === "number") {
            calculateDistance = function() {
                return newDistance
            };
        }
        return concaveHull;
    }

    return concaveHull;
}