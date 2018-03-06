import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';


export function draw() {
    let rem = 10;
    let mapDim = [210,297];
    let colourScale = d3.scaleLinear();
    let shapeData;
    let valueExtent;

    function chart(parent) {
        let allaAuthorities = parent.data()
        console.log('allaAuthorities', allaAuthorities);

        const mapHolder = parent.append('g')

        mapHolder.append('text')
            .attr('class', 'chart-label')
            .attr('dy', rem *1.5)
            .text(d => d.mapName)
            .each(d => drawMap(d.mapName));

        //create geo.path object, set the projection to merator bring it to the svg-viewport

        function drawMap(mapName) {
            console.log('drawMap', mapName)
            let authorities = allaAuthorities.filter((d) => {return d.mapName === mapName});
            console.log('authorities', authorities);

            const projection = d3.geoIdentity()
            .reflectY(true)
            .fitSize([mapDim[0], mapDim[1]], shapeData);

            const path = d3.geoPath(projection);

            //draw svg lines of the boundries
            const authoritiesPaths = mapHolder.append('g')
                .selectAll('.statePolygons')
                .data(shapeData.features)
                .enter()
                .append('path')
                .attr('class','statePolygons')
                .attr('id', d => d.properties.LAD12CD)
                .attr('d', path)
                .attr('fill', d => lookup(authorities[0].mapData, d.properties.LAD12CD));

            function lookup(row, idName) {
                const uniqueAuth = row.filter((d) => {return d.ons_id === idName});
                //console.log('uniqueAuth',uniqueAuth)
                //console.log(uniqueAuth[0].value)
                return colourScale(uniqueAuth[0].value)
            }

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

