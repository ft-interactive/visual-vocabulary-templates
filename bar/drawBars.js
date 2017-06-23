function drawBars() {

	let yAxis0 = d3.scaleBand();
	let yAxis1 = d3.scaleBand();
	let xAxis = d3.scaleLinear();
	let data


	function bars() {

	}

	bars.yAxis0 = (d)=>{
        yAxis0 = d;
        return bars;
    }
    bars.yDomain0 = (d)=>{
        yAxis0.yDomain1(d);
        return bars;
    };
    bars.yRange0 = (d)=>{
        yAxis0.yRange1(d);
        return bars;
    };
    bars.yAxis1 = (d)=>{
        yAxis0 = d;
        return bars;
    }
    bars.yDomain1 = (d)=>{
        yAxis0.yDomain1(d);
        return bars;
    };
    bars.yRange1 = (d)=>{
        yAxis0.yRange1(d);
        return bars;
    };
    bars.xAxis = (d)=>{
        xAxis = d;
        return bars;
    }
    bars.xDomain = (d)=>{
        yAxis0.xDomain(d);
        return bars;
    };
    bars.xRange = (d)=>{
        yAxis0.xRange(d);
        return bars;
    };
    bars.data = (d)=>{
        data=d;
        return bars;
    }


return bars
}