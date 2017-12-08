(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3'), require('g-chartcolour')) :
    typeof define === 'function' && define.amd ? define(['exports', 'd3', 'g-chartcolour'], factory) :
    (factory((global.gLegend = global.gLegend || {}),global.d3,global.gChartcolour));
}(this, function (exports,d3,gChartcolour) { 'use strict';

    gChartcolour = 'default' in gChartcolour ? gChartcolour['default'] : gChartcolour;

    function drawLegend() {
        let seriesNames = [];

        let colourScale = d3.scaleOrdinal()
            .range(gChartcolour.lineWeb)
            .domain(seriesNames);
        let rem = 10;
        let frameName = '';
        let alignment = 'hori';
        let geometry = 'circ';


        function legend(parent) {
            if (seriesNames.length > 1) {
                let legendyOffset = 0;

                parent.attr('id', (d, i) => `${frameName}-l${i}`);

                parent.append('text')
                    .attr('id', (d, i) => (`t${i}`))
                    .attr('x', rem * 1.5)
                    .attr('y', rem / 3)
                    .attr('class', 'chart-subtitle')
                    .text(d => d);

                if (geometry === 'rect') {
                    parent.append('rect')
                        .attr('width', rem * 1.25)
                        .attr('height', rem / 1.5)
                        .attr('class', 'rects')
                        .attr('x', 0)
                        .attr('y', -rem / 3)
                        .style('fill', d => colourScale(d));
                } else if (geometry === 'line') {
                    parent.append('line')
                        .attr('stroke', d => colourScale(d))
                        .attr('x1', 0)
                        .attr('x2', rem)
                        .attr('y1', 0)
                        .attr('y2', 0)
                        .attr('class', 'lines');
                } else if (geometry === 'circ') {
                    parent.append('circle')
                        .style('fill', d => colourScale(d))
                        .attr('cx', rem - (rem / 2.5))
                        .attr('cy', 0)
                        .attr('r', rem / 2.5)
                        .attr('class', 'circs');
                }

                parent.attr('transform', (d, i) => {
                    let gWidth;
                    if (alignment === 'hori') {
                        const gHeigt = d3.select(`#${frameName}-l0`).node().getBBox().height;
                        if (i > 0) {
                            gWidth = d3.select(`#${frameName}-l${i - 1}`).node().getBBox().width + (rem);
                        } else {
                            gWidth = 0;
                        }
                        legendyOffset += gWidth;
                        return `translate(${legendyOffset},${gHeigt / 2})`;
                    }
                    return `translate(0,${i * rem * 1.2})`;
                });
            }

            d3.selectAll('#legend')
                .on('mouseover', pointer)
                .call(d3.drag()
                    .on('start', dragstarted)
                    .on('drag', dragged)
                    .on('end', dragended));

            const labels = parent.selectAll('.chart-subtitle');
            labels.each(function setLabelIds() {
                d3.select(this)
                    .attr('id', `${frameName}legend`);
            });
        }

        legend.seriesNames = (d) => {
            seriesNames = d;
            return legend;
        };

        legend.frameName = (d) => {
            frameName = d;
            return legend;
        };

        legend.colourPalette = (d) => {
            if (d === 'social' || d === 'video') {
                colourScale.range(gChartcolour.lineSocial);
            } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
                if (geometry === 'circ' || geometry === 'line') {
                    colourScale.range(gChartcolour.lineWeb);
                } else {
                    colourScale.range(gChartcolour.categorical_bar);
                }
            } else if (d === 'print') {
                colourScale.range(gChartcolour.linePrint);
            } else if (d && d.name && d.name === 'scale') {
                colourScale = d;
            } else if (d === undefined) {
                return colourScale;
            }
            return legend;
        };

        legend.rem = (d) => {
            if (d) {
                rem = d;
                return legend;
            }
            return rem;
        };

        legend.alignment = (d) => {
            alignment = d;
            return legend;
        };

        legend.geometry = (d) => {
            geometry = d;
            return legend;
        };

        function moveLegend() { // eslint-disable-line
            const dX = d3.event.x; // subtract cx
            const dY = d3.event.y; // subtract cy
            d3.select(this).attr('transform', `translate(${dX}, ${dY})`);
        }

        function pointer() {
            this.style.cursor = 'pointer';
        }

        function dragstarted() {
            d3.select(this).raise().classed('active', true);
        }

        function dragged() {
            d3.select(this).attr('transform', `translate(${d3.event.x}, ${d3.event.y})`);
        }

        function dragended() {
            d3.select(this).classed('active', false);
        }

        return legend;
    }

    exports.legend = drawLegend;

    Object.defineProperty(exports, '__esModule', { value: true });

}));