(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.gChartframe = global.gChartframe || {})));
}(this, function (exports) { 'use strict';

  var watermarkPathDark = '<path fill="#000" fill-opacity="0.2" id="logo" d="M12,57h11.9v-0.9c-0.8,0-1.4,0-1.9-0.2c-0.5,0-0.8-0.2-1.1-0.5c-0.3-0.2-0.5-0.5-0.6-0.9c-0.2-0.3-0.2-0.9-0.2-1.6v-8.1H22c1.7,0,3,0.3,3.6,0.8c0.8,0.5,1.2,1.4,1.6,3h0.9v-8.8h-0.8c-0.2,0.9-0.5,1.6-0.8,2s-0.8,0.8-1.6,0.9c-0.6,0.2-1.6,0.3-2.8,0.3h-1.9v-8c0-0.5,0.2-0.8,0.3-1.1c0.2-0.2,0.5-0.3,1.1-0.3h3.8c1.3,0,2.2,0,3,0.2s1.4,0.3,1.9,0.6s0.9,0.6,1.1,1.1c0.3,0.5,0.5,1.1,0.8,1.7h1.1L32.9,32H12v0.9c0.6,0,1.2,0.2,1.6,0.2s0.6,0.2,0.9,0.5c0.3,0.2,0.5,0.5,0.6,0.8s0.2,0.9,0.2,1.6v17c0,0.6,0,1.2-0.2,1.6s-0.3,0.6-0.6,0.9c-0.3,0.2-0.6,0.3-0.9,0.5c-0.3,0-0.9,0.2-1.6,0.2V57z M34.2,37.5h1.2c0.5-1.4,0.9-2.3,1.6-2.8c0.6-0.6,1.7-0.8,3-0.8h3.1v19.2c0,0.6,0,1.2-0.2,1.6s-0.3,0.6-0.6,0.9c-0.3,0.2-0.6,0.3-1.1,0.5c-0.5,0-0.9,0.2-1.7,0.2V57h12v-0.9c-0.8,0-1.4,0-1.7-0.2c-0.5,0-0.8-0.2-1.1-0.5c-0.3-0.2-0.5-0.5-0.6-0.9c-0.2-0.3-0.2-0.9-0.2-1.6V33.9h3.1c1.2,0,2.3,0.3,3,0.8c0.6,0.6,1.2,1.6,1.6,2.8h1.2L56.5,32H34.8L34.2,37.5z"/>';
  var watermarkPathLight = '<path fill="#FFF" fill-opacity="0.2" id="logo" d="M1.502 1.5h97.996v98h-97.996v-98zm46.127 23.686h1.866l-.287-9.762h-36.988v1.675c1.18.063 2.074.151 2.68.263.606.112 1.148.359 1.627.742s.797.909.957 1.579c.159.67.239 1.595.239 2.775v30.193c0 1.18-.08 2.097-.239 2.747-.16.654-.479 1.181-.957 1.562-.479.383-1.037.639-1.675.766-.638.128-1.547.208-2.728.239v1.723h20.958v-1.723c-1.468-.031-2.568-.111-3.302-.239-.734-.127-1.372-.383-1.914-.766-.542-.382-.893-.908-1.053-1.562-.16-.65-.239-1.567-.239-2.747v-14.451h3.302c2.967 0 5.136.454 6.507 1.364 1.372.908 2.281 2.623 2.728 5.144h1.675v-15.647h-1.675c-.287 1.627-.71 2.84-1.268 3.637-.558.798-1.443 1.372-2.656 1.723-1.212.352-2.982.527-5.311.527h-3.302v-14.021c0-.894.16-1.491.479-1.794.319-.304.973-.455 1.962-.455h6.699c2.201 0 3.972.096 5.312.287s2.448.566 3.326 1.125c.877.558 1.539 1.212 1.985 1.961.447.75.877 1.795 1.292 3.135zm42.107 0h2.249l-.909-9.762h-38.805l-.909 9.762h2.249c.702-2.393 1.658-4.075 2.871-5.049 1.212-.973 2.982-1.459 5.312-1.459h5.454v33.974c0 1.18-.079 2.097-.239 2.747-.159.654-.502 1.181-1.028 1.562-.526.383-1.141.639-1.843.766-.701.128-1.738.208-3.109.239v1.723h21.341v-1.723c-1.372-.031-2.417-.111-3.135-.239-.718-.127-1.34-.383-1.866-.766-.526-.382-.869-.908-1.028-1.562-.159-.65-.239-1.567-.239-2.747v-33.974h5.455c2.328 0 4.099.486 5.311 1.459 1.21.973 2.167 2.656 2.868 5.049z"/>';

  function chartFrame(configObject){
  	var axisAlign = 'right',
  		backgroundColour,
  		containerClass='g-chartframe',

  		copyright = '© FT',
  		copyrightStyle = false,

  		goalposts = false, 	//goalpost is the bit at the top and bottom of pritn charts
  		blackbar = false, 	//blackbar the short black bar above web graphics

  		fullYear = false,
  		graphicHeight = 400,
  		graphicWidth = 500,

  		margin = {
  			top:100,
  			left:1,
  			bottom:20,
  			right:20
  		},
  		plot,
  		rem = 18,
  		subtitle = 'some supporting information, units perhaps',
  		subtitleLineHeight = 16,
  		subtitlePosition = {x:1, y:59},
  		subtitleStyle={},

  		source = 'Source: research|FT Graphic Tom Pearson',
  		sourceLineHeight = 16,
  		sourcePosition = {x:1},
  		sourcePlotYOffset = 46,
  		sourceStyle={},

  		title = 'Title: A description of the charts purpose',
  		titleLineHeight = 20,
  		titlePosition = {x:1, y:34},
  		titleStyle={},

      transition = 0.2,

  		watermarkLocation = 'icons.svg#ft-logo',
  		watermarkMarkup = '',
  		watermarkOffset = 0,
  		watermarkSize = 58,

  		units = 'px';


  	var convertFrom = {
  		mm: function(x){return (x * 2.83464480558843); },
  		px: function(x){return x; },
  	};

  	function attributeStyle(parent, style){
  	    Object.keys(style).forEach(function(attribute){
  	        parent.attr(attribute, style[attribute]);
  	    });
  	}

  	function frame(p){

  //overall graphic properties
  		p.attr('class', containerClass)
  			.attr('font-family','MetricWeb,sans-serif');
  			console.log(p)
  		if (p.node().nodeName.toLowerCase() == 'svg') {
  			p.transition(transition)
          .attr('width', graphicWidth)
          .attr('height', graphicHeight)
          .attr('viewBox', ['0 0', graphicWidth, graphicHeight].join(' '));

  			p.selectAll('title')
          .data([title])
          .enter()
          .append('title');

  			p.selectAll('title').text(title);
  		}

  //background
  		if(backgroundColour !== undefined){
        p.selectAll('rect.chart-background')
          .data([backgroundColour])
          .enter()
          .append('rect')
          .attr('class','chart-background');

        p.selectAll('rect.chart-background')
          .transition(transition)
  				.attr('x', 0)
  				.attr('y', 0)
  				.attr('width', graphicWidth)
  				.attr('height', graphicHeight)
  				.attr('fill', backgroundColour);
  		};

  //	'blackbar' (the short black bar above web graphics)
  		if(blackbar) {
  			p.append('rect')
  				.attr('width', 60)
  				.attr('height', 4)
  				.style('fill', blackbar)
  		}

  // 'goalposts' (the bit at the top and the bottom of print charts)
  		if(goalposts){
        var goalpostPaths = [
          'M 0, '+graphicHeight+' L '+graphicWidth+', ' + graphicHeight,
          'M 0, 15 L 0, 0 L '+graphicWidth+', 0 L '+graphicWidth+', 15',
        ];

        p.selectAll('path.chart-goalposts')
          .data(goalpostPaths)
          .enter()
          .append('path').attr('class','chart-goalposts');

  			p.selectAll('path.chart-goalposts')
          .transition(transition)
  				.attr('d',function(d){ return d; })
  				.attr('stroke-width', 1)
          .attr('fill','none')
  				.attr('stroke', goalposts);
  		}

  //title
      var titleLineCount = title.split('|').length;
      p.selectAll('text.chart-title')
        .data([title])
        .enter()
        .append('text')
        .attr('class', 'chart-title')
        .call(function(titleText){
          titleText.selectAll('tspan')
            .data(title.split('|'))
            .enter()
          .append('tspan')
            .html(function(d){ return d; })
            .attr('y',function(d,i){ return (titlePosition.y + (i * titleLineHeight)); })
            .attr('x',titlePosition.x)
            .call(attributeStyle, titleStyle);
        });

      p.selectAll('text.chart-title tspan')
        .html(function(d){ return d; })
        .transition(transition)
          .attr('y', function(d,i){ return (titlePosition.y + (i * titleLineHeight)); })
          .attr('x', titlePosition.x)
          .call(attributeStyle, titleStyle);

      var subtitleLineCount = subtitle.split('|').length;
  //subtitle
      p.selectAll('text.chart-subtitle')
        .data([subtitle])
        .enter()
        .append('text')
        .attr('class', 'chart-subtitle')
        .call(function(subtitleText){
          subtitleText.selectAll('tspan')
            .data(subtitle.split('|'))
            .enter()
          .append('tspan')
            .html(function(d){ return d; })
            .attr('y',function(d,i){ 
              if(titleLineCount > 1) {
                console.log('yes')
                return (titlePosition.y + (titleLineCount * titleLineHeight) +(subtitleLineHeight*i));
              } else {
                return (subtitlePosition.y + (i * subtitleLineHeight)); }
              })
              
            .attr('x',subtitlePosition.x)
            .call(attributeStyle, subtitleStyle);
        });

      p.selectAll('text.chart-subtitle tspan')
        .html(function(d){ return d; })
        .transition(transition)
          .attr('y', function(d,i){ 
            if(titleLineCount > 1) {
                console.log('yes')
                return (titlePosition.y + (titleLineCount * titleLineHeight) +(subtitleLineHeight*i));
              } else {
                return (subtitlePosition.y + (i * subtitleLineHeight)); }
          })
          .attr('x', subtitlePosition.x)
          .call(attributeStyle, subtitleStyle);

  //source
      p.selectAll('text.chart-source')
        .data([source])
        .enter()
        .append('text')
        .attr('class', 'chart-source')
        .call(function(sourceText){
          sourceText.selectAll('tspan')
            .data(source.split('|'))
            .enter()
          .append('tspan')
            .html(function(d){ return d; })
            .attr('y', function(d,i){
              if(sourcePosition.y){
                return (sourcePosition.y +(i * sourceLineHeight));
              }
              return ((graphicHeight - (margin.bottom - sourcePlotYOffset) + sourceLineHeight*1.5) + ((i) * sourceLineHeight));
            })
            .attr('x',subtitlePosition.x)
            .call(attributeStyle, subtitleStyle);
        });

      p.selectAll('text.chart-source tspan')
        .html(function(d){ return d; })
        .transition(transition)
          .attr('y', function(d,i){
            if(sourcePosition.y){
              return (sourcePosition.y +(i * sourceLineHeight));
            }
            return ((graphicHeight - (margin.bottom - sourcePlotYOffset) + sourceLineHeight*1.5) + ((i) * sourceLineHeight));
          })
          .attr('x', sourcePosition.x)
          .call(attributeStyle, sourceStyle);

      var sourceLineCount = source.split('|').length;
      // copyright
      if(copyrightStyle) {
      	p.selectAll('text.chart-copyright')
  	      .data([copyright])
  	      .enter()
  	      .append('text')
  	      .attr('class', 'chart-copyright')
  	      .append('tspan')
  	      	.html(function(d){ return d; })
  	      	.attr('x', sourcePosition.x)
  	      	.attr('y', function(d) { 
              if(sourceLineCount > 1) {
                return (graphicHeight - (margin.bottom - sourcePlotYOffset) + (sourceLineHeight * 1.25) + (sourceLineCount * sourceLineHeight * 1.2));
              } else {
                return (graphicHeight - (margin.bottom - sourcePlotYOffset) + (sourceLineHeight * 2.5));
              }
            })

              
            .call(attributeStyle, copyrightStyle);
  		}

  // set chart margin.top

      if(containerClass === 'ft-webgraphic-s') {
        margin.top = (titlePosition.y + (titleLineCount * titleLineHeight) + (subtitleLineCount * subtitleLineHeight) + 24)
      } else if(containerClass === 'ft-webgraphic-m') {
        margin.top = (titlePosition.y + (titleLineCount * titleLineHeight) + (subtitleLineCount * subtitleLineHeight) + 23)
      } else if(containerClass === 'ft-webgraphic-l') {
        margin.top = (titlePosition.y + (titleLineCount * titleLineHeight) + (subtitleLineCount * subtitleLineHeight) + 17)
      } else {
        margin.top = (titlePosition.y + (titleLineCount * titleLineHeight) + (subtitleLineCount * subtitleLineHeight) + (rem/3))
      }

  //watermark

  		p.selectAll('g.chart-watermark')
        .data([0])
        .enter()
        .append('g').attr('class','chart-watermark')
        .html(watermarkMarkup)
  			.attr('transform', 'translate('+(graphicWidth-watermarkSize -watermarkOffset)+','+(graphicHeight-watermarkSize-watermarkOffset)+') scale('+watermarkSize/100+') ');

  		p.selectAll('g.chart-watermark')
        .html(watermarkMarkup)
        .transition()
  			.attr('transform', 'translate('+(graphicWidth-watermarkSize -watermarkOffset)+','+(graphicHeight-watermarkSize-watermarkOffset)+') scale('+watermarkSize/100+') ');

  //plot area (where you put the chart itself)
  		p.selectAll('g.chart-plot')
        .data([0])
        .enter()
        .append('g')
        .attr('class','chart-plot')
        .attr('transform','translate(' + margin.left + ',' + margin.top + ')');

      plot = p.selectAll('g.chart-plot');

      plot.transition(transition)
  			.attr('transform','translate(' + margin.left + ',' + margin.top + ')');
  	}


  //Setters and getters

  	frame.axisAlign = function(x){
  		if(x == undefined) return axisAlign;
  		axisAlign = x;
  		return frame;
  	};

  	frame.backgroundColour = function(x){
  		if(x == undefined) return backgroundColour;
  		backgroundColour = x;
  		return frame;
  	};

  	frame.blackbar = function(x){
  		if(x == undefined) return blackbar;
  		blackbar = x;
  		return frame;
  	}

  	frame.containerClass = function(x){
  		if(x == undefined) return containerClass;
  		containerClass = x;
  		return frame;
  	};

  	frame.copyright = function(x){
  		if(x == undefined) return copyright;
  		copyright = x;
  		return frame;
  	};

  	frame.copyrightStyle = function(x){
  		if(x == undefined) return copyrightStyle;
  		copyrightStyle = x;
  		return frame;
  	};

  	frame.dimension = function(){
  		return {
  			width:graphicWidth-(margin.left+margin.right),
  			height:graphicHeight-(margin.top+margin.bottom)
  		};
  	};

  	frame.fullYear = function(x){
  		if(x == undefined) return fullYear;
  		fullYear = x;
  		return frame;
  	}
  	
  	frame.goalposts = function(x){
  		if(x == undefined) return goalposts;
  		goalposts = x;
  		return frame;
  	}

  	frame.height = function(x){
  		if(x == undefined) return graphicHeight;
  		graphicHeight = convertFrom[units](x);
  		return frame;
  	};

  	frame.margin = function(x){
  		if(x == undefined) return margin;
  		Object.keys(x).forEach(function(k){
  			margin[k] = x[k];
  		});
  		return frame;
  	};

  	frame.plot = function(){
  		return plot;
  	};

  	frame.rem = function(x){
  		if(x == undefined) return rem;
  		rem = x;
  		return frame;
  	};

  	frame.source = function(x){
  		if(x == undefined) return source;
  		source = x;
  		return frame;
  	};

  	frame.sourceLineHeight = function(x){
  		if(x == undefined) return sourceLineHeight;
  		sourceLineHeight = x;
  		return frame;
  	};

  	frame.sourcePlotYOffset = function(x){
      if(x == undefined) return sourcePlotYOffset;
      sourcePlotYOffset = x;
      return frame;
    };

  	frame.sourceStyle = function(x){
  		if(x == undefined) return sourceStyle;
  		sourceStyle = x;
  		return frame;
  	};

  	frame.sourceX = function(x){
  		if(x == undefined) return sourcePosition.x;
  		sourcePosition.x = x;
  		return frame;
  	};

  	frame.sourceY = function(x){
  		if(x == undefined) return sourcePosition.y;
  		sourcePosition.y = x;
  		return frame;
  	};

  	frame.subtitle = function(x){
  		if(x == undefined) return subtitle;
  		subtitle = x;
  		return frame;
  	};

  	frame.subtitleLineHeight = function(x){
  		if(x == undefined) return subtitleLineHeight;
  		subtitleLineHeight = x;
  		return frame;
  	};

  	frame.subtitleStyle = function(x){
  		if(x == undefined) return subtitleStyle;
  		subtitleStyle = x;
  		return frame;
  	};

  	frame.subtitleX = function(x){
  		if(x == undefined) return subtitlePosition.x;
  		subtitlePosition.x = x;
  		return frame;
  	};

  	frame.subtitleY = function(x){
  		if(x == undefined) return subtitlePosition.y;
  		subtitlePosition.y = x;
  		return frame;
  	};

  	frame.title = function(x){
  		if(x == undefined) return title;
  		title = x;
  		return frame;
  	};

  	frame.titleStyle = function(x){
  		if(x == undefined) return titleStyle;
  		titleStyle = x;
  		return frame;
  	};

  	frame.titleLineHeight = function(x){
  		if(x == undefined) return titleLineHeight;
  		titleLineHeight = x;
  		return frame;
  	};

  	frame.titleX = function(x){
  		if(x == undefined) return titlePosition.x;
  		titlePosition.x = x;
  		return frame;
  	};

  	frame.titleY = function(x){
  		if(x == undefined) return titlePosition.y;
  		titlePosition.y = x;
  		return frame;
  	};

  	frame.units = function(x){
  		if(x == undefined) return units
  		units = x;
  		return frame;
  	};

  	frame.watermark = function(x){
  		if(x == undefined) return watermarkMarkup;
  		watermarkLocation = '';
  		watermarkMarkup = x;
  		return frame;
  	};

  	frame.watermarkOffset = function(x){
  		if(x == undefined) return watermarkOffset;
  		watermarkOffset = x;
  		return frame;
  	};

  	frame.watermarkLocation = function(x){
  		if(x == undefined) return watermarkLocation;
  		watermarkMarkup = '';
  		watermarkLocation = x;
  		return frame;
  	};

  	frame.watermarkSize = function(x){
  		if(x == undefined) return watermarkSize;
  		watermarkSize = x;
  		return frame;
  	};

  	frame.width = function(x){
  		if(!x) return graphicWidth;
  		graphicWidth = convertFrom[units](x);
  		return frame;
  	};

    frame.attrs = function(x){
      if(x===undefined)return {
      	axisAlign:axisAlign,
        containerClass:containerClass,
        copyright:copyright,
        copyrightStyle:copyrightStyle,
        blackbar:blackbar,
        goalposts:goalposts,
        graphicHeight:graphicHeight,
        graphicWidth:graphicWidth,
        margin:margin,
        plot:plot,
        rem:rem,
        subtitle:subtitle,
        subtitleLineHeight:subtitleLineHeight,
        subtitlePosition:subtitlePosition,
        subtitleStyle:subtitleStyle,
        source:source,
        sourceLineHeight:sourceLineHeight,
        sourcePosition:sourcePosition,
        sourceStyle:sourceStyle,
        title:title,
        titleLineHeight:titleLineHeight,
        titlePosition:titlePosition,
        titleStyle:titleStyle,
        watermarkLocation:watermarkLocation,
        watermarkMarkup:watermarkMarkup,
        watermarkOffset:watermarkOffset,
        watermarkSize:watermarkSize,
        units:units};

      Object.keys(x).forEach(function(setterName){
        var value = x[setterName];
        if(isFunction(frame[setterName])){
          frame[setterName](value);
        }
      });
      return frame;
    }

    if(configObject !== undefined){
      frame.attrs(configObject);
    }

  	return frame;
  }

  function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  }


  //Some Conventional frames

  function webFrameS(configObject){
     var f = chartFrame()
      .containerClass('ft-webgraphic-s')
      .backgroundColour('#FFF1E0')
      .blackbar('#000')
      .width(300)
      // .watermark(watermarkPathDark)
      // .watermarkSize(80)
      // .watermarkOffset(-28)
      .margin({bottom:90, right:5, left:15})
      .rem(14)
      .titleStyle({
        'font-size':24,
        'font-family': 'MetricWeb,sans-serif',
        'fill':'#33302E',
      })
      .titleLineHeight(24)
      .subtitleLineHeight(16)
      .subtitleStyle({
        'font-size':14,
        'font-family': 'MetricWeb,sans-serif',
        'fill': '#66605C',
      })
      .sourceLineHeight(14)
      .sourcePlotYOffset(34)
      .sourceStyle({
        'font-size': '14px',
        'font-family': 'MetricWeb,sans-serif',
        'fill': '#66605C'
      })
      .copyrightStyle({
        'font-size': '12px',
        'font-style': 'italic',
        'font-family': 'MetricWeb,sans-serif',
        'fill': '#66605C',
      });

      if(configObject !== undefined) f.attrs(configObject);
      return f;
  }

  function webFrameM(configObject){
     var f = chartFrame()
      .containerClass('ft-webgraphic-m')
      .backgroundColour('#FFF1E0')
      .blackbar('#000')
      .width(700)
      .height(500)
      // .watermark(watermarkPathDark)
      // .watermarkSize(80)
      // .watermarkOffset(-28)
      .margin({bottom:95, right:5, left:20})
      .rem(16)
      .titleStyle({
        'font-size':24,
        'font-family': 'MetricWeb,sans-serif',
        'fill':'#33302E',
      })
      .titleLineHeight(24)
      .subtitleLineHeight(18)
      .subtitleStyle({
        'font-size':16,
        'font-family': 'MetricWeb,sans-serif',
        'fill': '#66605C',
      })
      .sourceLineHeight(14)
      .sourcePlotYOffset(37)
      .sourceStyle({
        'font-size': '14px',
        'font-family': 'MetricWeb,sans-serif',
        'fill': '#66605C'
      })
      .copyrightStyle({
        'font-size': '14px',
        'font-style': 'italic',
        'font-family': 'MetricWeb,sans-serif',
        'fill': '#66605C',
      });

      if(configObject !== undefined) f.attrs(configObject);
      return f;
  }

  function webFrameL(configObject){
     var f = chartFrame()
      .containerClass('ft-webgraphic-l')
      .backgroundColour('#FFF1E0')
      .width(1180)
      .height(700)
      .blackbar('#000')
      .fullYear(true)
      // .watermark(watermarkPathDark)
      // .watermarkSize(80)
      // .watermarkOffset(-28)
      .margin({bottom:105, right:5, left:20})
      .rem(18)
      .titleY(38)
      .titleStyle({
        'font-size':28,
        'font-family': 'MetricWeb,sans-serif',
        'fill':'#33302E',
      })
      .titleLineHeight(28)
      .subtitleLineHeight(20)
      .subtitleY(63)
      .subtitleStyle({
        'font-size':18,
        'font-family': 'MetricWeb,sans-serif',
        'fill': '#66605C',
      })
      .sourceStyle({
        'font-size': '16px',
        'font-family': 'MetricWeb,sans-serif',
        'fill': '#66605C'
      })
      .copyrightStyle({
        'font-size': '14px',
        'font-style': 'italic',
        'font-family': 'MetricWeb,sans-serif',
        'fill': '#66605C',
      });

      if(configObject !== undefined) f.attrs(configObject);
      return f;
  }

  function printFrame(configObject){
    var f = chartFrame()
      .containerClass('ft-printgraphic')
      .backgroundColour('#FFF')
      .goalposts('#000')
      .units('mm')
      .width(112.25) //these are after the units are set so they are converted from mm to px
      .height(68)
      .margin({top:40, left:15, bottom:35, right:7})
      .watermark(watermarkPathDark)
      .rem(12)
      .titleStyle({
        'font-size': '12px',
        'fill': '#000000',
        'font-weight': '600',
        'font-family': 'MetricWeb,sans-serif',
      })
      .titleX(7)
      .titleY(15)
      .titleLineHeight(13)
      .subtitleStyle({
        'fill': '#000000',
        'font-size': '9.6px',
        'font-weight': 400,
        'font-family': 'MetricWeb,sans-serif',
      })
      .subtitleLineHeight(10)
      .subtitleX(7)
      .subtitleY(27)
      .sourceStyle({
          'fill': '#000000',
          'font-size': '7.2px',
          'font-weight': 400,
        'font-family': 'MetricWeb,sans-serif',
      })
      .sourceX(7)
      .sourcePlotYOffset(18)
      .sourceLineHeight(8)
      .watermark('');

      if(configObject !== undefined) f.attrs(configObject);
      return f;
    }

  function socialFrame(configObject){
    var f = chartFrame()
      .containerClass('ft-socialgraphic')
      .backgroundColour('#212121')
      .width(560)
      .height(750)
      .watermark(watermarkPathLight)
      .watermarkOffset(25)
      .margin({left:50, right:40, bottom:138, top:140})
      .rem(28)
      .titleX(50)
      .titleY(72)
      .titleLineHeight(38)
      .titleStyle({
        'font-size': '38px',
        'fill': '#ffffff',
        'font-weight': 600,
        'fill-opacity': 0.9,
        'font-family': 'MetricWeb,sans-serif',
      })
      .subtitleX(50)
      .subtitleY(110)
      .subtitleLineHeight(28)
      .subtitleStyle({
        'font-size': '28px',
        'fill': '#ffffff',
        'font-weight': 400,
        'fill-opacity': 0.7,
        'font-family': 'MetricWeb,sans-serif',
      })
      .sourceX(50)
      .sourceLineHeight(25)
      .sourceStyle({
        'font-size': '25px',
        'fill': '#ffffff',
        'font-weight': 400,
        'fill-opacity': 0.5,
        'font-family': 'MetricWeb,sans-serif',
      });

      if(configObject !== undefined) f.attrs(configObject);
      return f;
  }

  function videoFrame(configObject){
    var f = chartFrame()
      .backgroundColour('#212121')
      .containerClass('ft-videographic')
      .width(1920)
      .height(1080)
      .watermark('')
      .margin({left:207, right:207, bottom:210, top:233})
      .rem(48)
      .titleX(207)
      .titleY(130)
      .titleLineHeight(68)
      .titleStyle({
        'font-size': '68px',
        'fill': '#ffffff',
        'font-weight': 600,
        'fill-opacity': 0.9,
        'font-family': 'MetricWeb,sans-serif',
      })
      .subtitleX(207)
      .subtitleY(200)
      .subtitleLineHeight(48)
      .subtitleStyle({
        'font-size': '48px',
        'fill': '#ffffff',
        'font-weight': 400,
        'fill-opacity': 0.7,
        'font-family': 'MetricWeb,sans-serif',
      })
      .sourceX(207)
      .sourcePlotYOffset(60)
      .sourceLineHeight(38)
      .sourceStyle({
        'font-size': '36px',
        'fill': '#ffffff',
        'font-weight': 400,
        'fill-opacity': 0.5,
        'font-family': 'MetricWeb,sans-serif',
      });

      if(configObject !== undefined) f.attrs(configObject);
      return f;
  }

  var version = "0.4.24";

  exports.version = version;
  exports.frame = chartFrame;
  exports.webFrameS = webFrameS;
  exports.webFrameM = webFrameM;
  exports.webFrameL = webFrameL;
  exports.printFrame = printFrame;
  exports.socialFrame = socialFrame;
  exports.videoFrame = videoFrame;

}));