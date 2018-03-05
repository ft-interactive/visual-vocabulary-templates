import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';


export function draw() {
    let rem = 10;
    let seriesNames = [];
    let highlightNames = [];
    let yAxisAlign = 'right';
    let mapDim = [210,297];
    let markers = false;
    const includeAnnotations = d => (d.annotate !== '' && d.annotate !== undefined); // eslint-disable-line
    let annotate = false; // eslint-disable-line
    let interpolation = d3.curveLinear;
    let colourScale = d3.scaleOrdinal();
    let shapeData;
    let valueExtent;
    let allaAuthorities

    function chart(parent) {
        let allaAuthorities = parent.data()
        console.log('allaAuthorities', allaAuthorities);

        parent.append('text')
            .attr('class', 'chart-label')
            .attr('dy', rem *1.5)
            .text(d => d.name)
            .call(drawMap)

        //create geo.path object, set the projection to merator bring it to the svg-viewport

        function drawMap(mapName) {
            console.log('drawMap', mapName.data())
            // let authorities = d.mapData
            // console.log('authorities', authorities);

            const projection = d3.geoIdentity()
            .reflectY(true)
            .fitSize([mapDim[0], mapDim[1]], shapeData);

        const path = d3.geoPath(projection);

        //draw svg lines of the boundries
        const authoritiesPaths = parent.append('g')
            .selectAll('path')
            .data(shapeData.features)
            .enter()
            .append('path')
            .attr('id', d => d.properties.LAD12CD)
            .attr('d', path)
            .attr('fill', d => '#ffffff');
        }

        function createLookup(group) {
            console.log('group', group);
            //console.log(uniqueAuth);
            groupAuthorities = group.mapData
        }

        function lookup(idName) {
            const uniqueAuth = groupAuthorities.filter(d => d.ons_id === idName);
            return colourScale(uniqueAuth[0].value)
        }

    }

    chart.mapDim = (d) => {
        if (!d) return mapDim;
        mapDim = d;
        return chart;
    };
    chart.shapeData = (d) => {
        shapeData = d;
        return chart;
    };

    chart.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return chart;
    };

    chart.annotate = (d) => {
        annotate = d;
        return chart;
    };

    chart.markers = (d) => {
        if (typeof d === 'undefined') return markers;
        markers = d;
        return chart;
    };

    chart.interpolation = (d) => {
        if (!d) return interpolation;
        interpolation = d;
        return chart;
    };

    chart.valueExtent = (d) => {
        if (!d) return valueExtent;
        valueExtent = d;
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
        } else if (d && d.name && d.name === 'scale') {
            colourScale = d;
        }
        return chart;
    };

    return chart;
}

