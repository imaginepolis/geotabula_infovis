/**
 * geotabula_infovis.src.js
 * Main file for OD Matrices InfoVis 
 * @author: Juan Camilo Ibarra
 * @Creation_Date: September 2015
 * @version: 0.1.0
 * @Update_Author : Juan Camilo Ibarra
 * @Date: January 2016
 */

/**
 *  
 */
var GeoTabulaInfoVis = {
	ODMatrix : ODMatrix, 
	ODMatrixBar : ODMatrixBar,
};
//************************************************************************
// ODMatrix chord diagram
// Version: V0.1.0
// Update_Author : Juan Camilo Ibarra
// Date: January 2016
//************************************************************************
function ODMatrix(params){
	this.matrix = params.matrix;
	this.matrixKeys = params.matrixKeys;
	this.divOrig = params.divOrig;
	this.divDest = params.divDest;
	this.origWidth = params.origWidth ? params.origWidth : 500;
	this.origHeight = params.origHeight ? params.origHeight : 500;
	this.destWidth = params.destWidth ? params.destWidth : 500;
	this.destHeight = params.destHeight ? params.destHeight : 500;
	
	this.origSVG = null;
	this.destSVG = null;
	this.origChord = null;
	this.destChord = null;
	
	this.onmouseover = params.onmouseover;
	this.onmouseout = params.onmouseout;
	
	this.origColor = params.origcolor ? params.origcolor : '#ef8a62';
	this.destColor = params.destcolor ? params.destcolor : '#67a9cf';
	
	this.freeze = false;
	
	this.divToolTip = d3.select("body")
		.append("div")
	        .attr("class", "tooltip")
	        .attr("opacity", 0)
	        
    this.currentChordX = 0;
    this.currentChordY = 0;
    
    this.innerRadius = 0;
    this.outerRadius = 0;
    
    this.centerChord = [];
    this.posOrig = [0,0]
    this.posDest = [0,0]
}

/**
 * 
 */
ODMatrix.prototype.createODMatrix = function()
{
	if(this.divOrig && this.divDest)
	{
		this.createOdMatrixVisualization();
		this.createOdMatrixVisualizationDest();
	}
}

/**
 * 
 */
ODMatrix.prototype.mouseOver = function(i){
	if (!this.freeze) {
		this.updateTextODOrig(true, i);
		this.updateTextODDest(true, i);
		if (this.onmouseover) {
			this.onmouseover(this.matrixKeys[i], i);
		}
	}
	
	// this.divToolTip.transition()
		// .duration(200)
		// .style("opacity", 0.9)
	// this.divToolTip.html("hola hola")
		// .style("left", (d3.event.pageX) + "px")
		// .style("top", (d3.event.pageY - 28) + "px")
// 		
// 
	// var angle = this.origChord.groups()[i].endAngle - this.origChord.groups()[i].startAngle 
	
	
	
}
/**
 * 
 */
ODMatrix.prototype.mouseOut = function(i){
	if (!this.freeze) {
		this.updateTextODOrig(false, i);
		this.updateTextODDest(false, i);
		if (this.onmouseout) {
			this.onmouseout(this.matrixKeys[i], i);
		}
	}
	// this.divToolTip.transition()        
		// .duration(500)      
		// .style("opacity", 0);  
}

/**
 * 
 */
ODMatrix.prototype.mouseClicked = function(i)
{
	this.freeze = ! this.freeze;
	if(!this.freeze)
	{
		for(i in this.matrix)
		{
			this.mouseOut(i);
		}
	}
}


/**
 * 
 */
ODMatrix.prototype.updateTextODOrig = function(highlight, i)
	{
		d3.select("#matrix_key_" + i)
			.attr("font-size", highlight ? "15px" : "10px")
			.attr("fill", highlight ? this.origColor : "#000")
		this.origSVG.selectAll(".chord path")
        	.filter(function(d) { return d.source.index != i && d.target.index != i; })
        	.transition()
        	.style("opacity", highlight ? 0 : 1);
		d3.selectAll(".matrix_key")
			.text(function (d) {
				if(highlight)
				{
					var value = d3.select(this).attr("perc").split(",");
					var formatter = d3.format(".2%");
					return d + " -> " + formatter(value[i]);
				}
				else
				{
					return d;
				}
			})
	}

/**
 * 
 */	
ODMatrix.prototype.updateTextODDest = function(highlight, i)
	{
		d3.select("#matrix_key_dest" + i)
			.attr("font-size", highlight ? "15px" : "10px")
			.attr("fill", highlight ? this.destColor : "#000")
		this.destSVG.selectAll(".chord path")
        	.filter(function(d) { return d.source.index != i && d.target.index != i; })
        	.transition()
        	.style("opacity", highlight ? 0 : 1);
		d3.selectAll(".matrix_key_dest")
			.text(function (d) {
				if(highlight)
				{
					var value = d3.select(this).attr("perc").split(",");
					var formatter = d3.format(".2%");
					return d + " -> " + formatter(value[i]);
				}
				else
				{
					return d;
				}
			})
	}

/**
 * 
 */
ODMatrix.prototype.createOdMatrixVisualization = function() {
		var matrix = this.matrix;
		// var updateTextODOrig = this.updateTextODOrig;
		// var updateTextODDest = this.updateTextODDest;
		
		var matrixTotal = [];
		for (i in this.matrix) {
			matrixTotal.push(0);
			for (j in this.matrix[i]) {
				matrixTotal[i] += this.matrix[i][j];
			}
		}
		
		var _this = this;

		this.origChord = d3.layout.chord().padding(.025).sortSubgroups(d3.descending).matrix(_this.matrix);

		var width = this.origWidth, height = this.origHeight, innerRadius = Math.min(width, height) * .31, outerRadius = innerRadius * 1.1;
		this.innerRadius = innerRadius;
		this.outerRadius = outerRadius;
		this.centerChord = [ width * 0.65 , height / 2]

		var fill = d3.scale.ordinal().domain(d3.range(4)).range(["#000000", "#AAAAAA"]);

		d3.select("#od_loading").remove();
		this.origSVG = d3.select("#" +this.divOrig).append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(" + width * 0.65 + "," + height / 2 + ")");
			
		this.origSVG.append("g")
			.attr("class", "chord_base")
			.selectAll("path")
			.data(this.origChord.groups)
			.enter()
			.append("path")
			.style("fill", function(d) {
				return fill(d.index);
			})
			.style("stroke", function(d) {
				return fill(d.index);
			})
			.attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
			.on("mouseover", function(d,i){ 
				_this.mouseOver(i);
			})
			.on("mouseout", function(d,i){ 
				_this.mouseOut(i);
			})
			.on("click", function(d,i){
				_this.mouseClicked(i)
			})

		//Text for Keys
		this.origSVG.append('g')
			.attr("id", "matrix_keys")
			.selectAll("text")
			.data(this.matrixKeys)
			.enter()
			.append("text")
			.text( function(d) { return d})
			.attr("id", function(d, i){ return "matrix_key_" + i;})
			.attr("class", "matrix_key")
			.attr("transform", "translate("+ -width * 0.65 + ","+ -height / 2+")")
			.attr("font_family", "sans-serif")
			.attr("font-size", "10px")
			.attr("x", 10)
			.attr("y", function(d,i) { return 20 + (i * 15)})
			.attr("fill", "#000")
			.attr("perc", function(d,i){
				var value = '';
				for(j in matrixTotal)
				{
					var val = matrix[j][i] / matrixTotal[j];
					value += val + (j < matrixTotal.length - 1 ? "," : "");
				}
				return value;
			})
			.on("mouseover", function(d,i){ 
				_this.mouseOver(i);
			})
			.on("mouseout", function(d,i){ 
				_this.mouseOut(i);
			})
			.on("click", function(d,i){
				_this.mouseClicked(i)
			})
			
		this.origSVG.append("g")
			.attr("class", "chord")
			.selectAll("path")
			.data(this.origChord.chords)
			.enter()
			.append("path")
			.attr("d", d3.svg.chord().radius(innerRadius))
			.style("fill", function(d) {
				return fill(d.target.index);
			})
			.style("stroke", function(d) {
				return fill(d.target.index);
			}).style("opacity", 1);

	}
	
	
	/**
	 * 
	 */
ODMatrix.prototype.createOdMatrixVisualizationDest = function() {
		var matrix = []
		for(var i = 0; i < this.matrix.length; i++)
		{
			matrix.push([]);
			for(var j = 0; j < this.matrix.length; j++)
				matrix[i].push(this.matrix[j][i]);

		}
					
		var _this = this;
		
		
		
		var matrixTotal = [];
		for (i in matrix) {
			matrixTotal.push(0);
			for (j in matrix[i]) {
				matrixTotal[i] += matrix[i][j];
			}
		}

		this.destChord = d3.layout.chord().padding(.025).sortSubgroups(d3.descending).matrix(matrix);

		var width = 500, height = 500, innerRadius = Math.min(width, height) * .31, outerRadius = innerRadius * 1.1;

		var fill = d3.scale.ordinal().domain(d3.range(4)).range(["#000000", "#AAAAAA"]);

		d3.select("#od_loading_dest").remove();
		this.destSVG = d3.select("#" + this.divDest).append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(" + width * 0.65 + "," + height / 2 + ")");

		this.destSVG.append("g")
			.attr("class", "chord_base_dest")
			.selectAll("path")
			.data(this.destChord.groups)
			.enter()
			.append("path")
			.style("fill", function(d) {
				return fill(d.index);
			})
			.style("stroke", function(d) {
				return fill(d.index);
			})
			.attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
			.on("mouseover", function(d,i){ 
				_this.mouseOver(i);
			})
			.on("mouseout", function(d,i){ 
				_this.mouseOut(i);
			})
			.on("click", function(d,i){
				_this.mouseClicked(i)
			})

		//Text for Keys
		this.destSVG.append('g')
			.attr("id", "matrix_keys_dest")
			.selectAll("text")
			.data(this.matrixKeys)
			.enter()
			.append("text")
			.text( function(d) { return d})
			.attr("id", function(d, i){ return "matrix_key_dest" + i;})
			.attr("class", "matrix_key_dest")
			.attr("transform", "translate("+ -width * 0.65 + ","+ -height / 2+")")
			.attr("font_family", "sans-serif")
			.attr("font-size", "10px")
			.attr("x", 10)
			.attr("y", function(d,i) { return 20 + (i * 15)})
			.attr("fill", "#000")
			.attr("perc", function(d,i){
				var value = '';
				for(j in matrixTotal)
				{
					var val = matrix[j][i] / matrixTotal[j];
					value += val + (j < matrixTotal.length - 1 ? "," : "");
				}
				return value;
			})
			.on("mouseover", function(d,i){ 
				_this.mouseOver(i);
			})
			.on("mouseout", function(d,i){ 
				_this.mouseOut(i);
			})
			.on("click", function(d,i){
				_this.mouseClicked(i)
			})
			
		
		this.destSVG.append("g")
			.attr("class", "chord")
			.selectAll("path")
			.data(this.destChord.chords)
			.enter()
			.append("path")
			.attr("d", d3.svg.chord().radius(innerRadius))
			.style("fill", function(d) {
				return fill(d.target.index);   
			})
			.style("stroke", function(d) {
				return fill(d.target.index);
			}).style("opacity", 1);

	}


//************************************************************************
// ODMatrix Bar Diagram
// Version: V0.1.0
// Update_Author : Juan Camilo Ibarra
// Date: January 2016
//************************************************************************
/**
 * Constructor 
 * 
 * @param {Object} params
 */
function ODMatrixBar(params){
	this.width = params.width;
	this.height = params.height;	
	this.matrix = params.matrix;
	this.matrixKeys = params.matrixKeys;
	this.div = params.div;
	this.chartwidth = 0;
	this.chartheight = 0; 
	this.origColor = params.origcolor ? params.origcolor : '#ef8a62';
	this.destColor = params.destcolor ? params.destcolor : '#67a9cf';
	this.lineColor = params.linecolor ? params.linecolor : '#555';
	this.scaleY = null;
	this.onmouseover = params.onmouseover;
	this.onmouseout = params.onmouseout;
	this.onmouseclick = params.onmouseclick;
	
	this.formatter = d3.format(",.2f");
	this.dataMapForLines = {};
	this.colorScaleForLines = null;
	
	this.selected = {
		i : -1,
		id : 'none',
		type : 'none',
	};
	
	this.hover = {
		i : -1,
		id: 'none',
		type : 'none'
	};
	
	this.margin = {
		top : 40,
		right : 40,
		bottom : 40,
		left : 20
	};
	
	this.tooltipDiv = d3.select("body").append("div")	
    	.attr("class", "tooltip")				
    	.style("opacity", 0);
    	
	this.odPixelPositionsForLines = {};
	
	this.bezierLine = d3.svg.line()
		.x(function(d) {
			return d[0];
		})
		.y(function(d) {
			return d[1];
		})
		.interpolate("basis"); 
		
	this.colorMap = [];
}

/**
 * Creates the visualization 
 */
ODMatrixBar.prototype.create = function()
{
	_this = this;
	this.svg = d3.select(_this.div).append("svg");
	
	if(this.width == null)
	{
		console.log("Width of div");
		console.log(document.getElementById($(this.div).attr('id')));
		this.width = parseInt(document.getElementById($(this.div).attr('id')).clientWidth);
		if(this.width == 0)
		{
			this.width = 500;
		}
	}
	if(this.height == null)
	{
		this.height = 100;
	}
	
	this.svg
		.attr("width", _this.width)
		.attr("height", _this.height)
		.append('g')
		.attr('id','svg_chart')
		.attr('transform', 'translate(' + _this.margin.left + ',' + _this.margin.top + ')');
		
	this.svg.append("rect")
		.attr("x", this.margin.left)
		.attr("y", 5)
		.attr("width", 15)
		.attr("height", 10)
		.attr("fill", _this.origColor);
	this.svg.append("text")
		.text("Outgoing")
		.attr("x", this.margin.left + 16)
		.attr("y", 15)
		.attr("font-size", 10);
	this.svg.append("rect")
		.attr("x", this.margin.left)
		.attr("y", 17)
		.attr("width", 15)
		.attr("height", 10)
		.attr("fill", _this.destColor);
	this.svg.append("text")
		.text("Incoming")
		.attr("x", this.margin.left + 16)
		.attr("y", 27)
		.attr("font-size", 10);
	
	
	this.chartwidth = parseInt(this.svg.style('width'), 10) - this.margin.left - this.margin.right;
	this.chartheight = (parseInt(this.svg.style('height'), 10) - this.margin.top - this.margin.bottom) /2;
	this.chartltop = this.chartheight + 10;
// 	
	
	var totalDataOrig = Array.apply(null, Array(this.matrix.length)).map(Number.prototype.valueOf,0);
	var totalDataDest = Array.apply(null, Array(this.matrix.length)).map(Number.prototype.valueOf,0);
	
	for(i in this.matrix)
	{
		var row_i = this.matrix[i];
		for(j in row_i)
		{
			totalDataOrig[i] += this.matrix[i][j];
			totalDataDest[j] += this.matrix[i][j];
		}
	}
	var data = [];
	for(i in totalDataOrig)
	{
		data.push({
			o : totalDataOrig[i],
			d : totalDataDest[i],
			t : totalDataOrig[i] + totalDataDest[i],
			n : this.matrixKeys[i],
			i : i
		});
	}
	
	this.scaleY = d3.scale.linear().domain([0, d3.max(data, function(d){ return d.t;})]).range([_this.chartheight, 0]);
	
	var barWidth = this.chartwidth / data.length;
	
	this.chart = this.svg.select('#svg_chart'); 
	
	var bar = this.chart.selectAll("g")
		.data(data)
		.enter()
		.append("g")
		.attr("transform", function(d, i) {
			return "translate(" + i * barWidth + ",0)";
		});

	bar.append("rect")
		.attr("y", function(d){
			return _this.scaleY(d.o);
		})
		.attr("height", function(d) {
			return _this.chartheight - _this.scaleY(d.o);
		})
		.attr("width", (barWidth/2) - 1)
		.attr("fill", _this.origColor)
		.attr("class","rect_orig")
		.attr("data", function(d,i){
			return "rect_orig_" + i;
		})
		// .on("mouseover", function(d,i){
			// _this.hover.type = "orig";
			// _this.hover.i = i;
			// _this.showTooltip(i);
			// if(_this.selected.id == 'none')
			// {
				// _this.fade("orig", i);
			// }
			// else
				// _this.highlightPath(_this.selected.i, i);
// 			
		// })
		// .on("mouseout", function(d,i){
			// _this.showTooltip();	
			// if(_this.selected.id == 'none')
				// _this.fade();
			// else{
				// _this.showTooltip(_this.selected.i);
				// _this.highlightPath();
			// }
// 			
		// })
		// .on("click", function(d,i){
			// _this.barclick(d,i,"orig");
		// });
		
	bar.append("rect")
		.attr("y", function(d){
			// return _this.scaleY(d.o);
			return 0;
		})
		.attr("height", function(d) {
			return _this.chartheight;
		})
		.attr("width", (barWidth/2) - 1)
		.attr("style", "opacity:0.0")
		.on("mouseover", function(d,i){
			_this.hover.type = "orig";
			_this.hover.i = i;
			_this.showTooltip(i);
			if(_this.selected.id == 'none')
			{
				_this.fade("orig", i);
			}
			else
				_this.highlightPath(_this.selected.i, i);
			
		})
		.on("mouseout", function(d,i){
			_this.showTooltip();	
			if(_this.selected.id == 'none')
				_this.fade();
			else{
				_this.showTooltip(_this.selected.i);
				_this.highlightPath();
			}
			
		})
		.on("click", function(d,i){
			_this.barclick(d,i,"orig");
		});
		
	bar.append("rect")
		.attr("x", (barWidth / 2) - 1)
		.attr("y", function(d){
			return _this.scaleY(d.d);
		})
		.attr("height", function(d) {
			return _this.chartheight - _this.scaleY(d.d);
		})
		.attr("width", (barWidth / 2) - 1)
		.attr("fill", _this.destColor)
		.attr("class","rect_dest")
		.attr("data", function(d,i){
			return "rect_dest_" + i;
		})
		// .on("mouseover", function(d,i){
			// _this.hover.type = "dest";
			// _this.hover.i = i;
			// _this.showTooltip(i);
			// if(_this.selected.id == 'none')
			// {
				// _this.fade("dest", i);
// 				
			// }
			// else
				// _this.highlightPath(_this.selected.i, i);
// 						
		// })
		// .on("mouseout", function(d,i){
			// _this.showTooltip();
			// if(_this.selected.id == 'none')
				// _this.fade();
			// else{
				// _this.showTooltip(_this.selected.i);
				// _this.highlightPath();
			// }
		// })
		// .on("click", function(d,i){
			// _this.barclick(d,i,"dest");
		// });
		
	
	bar.append("rect")
		.attr("x", (barWidth / 2) - 1)
		.attr("y", function(d){
			//return _this.scaleY(d.d);
			0;
		})
		.attr("height", function(d) {
			return _this.chartheight;
		})
		.attr("width", (barWidth / 2) - 1)
		.attr("style", "opacity: 0.0")
		.on("mouseover", function(d,i){
			_this.hover.type = "dest";
			_this.hover.i = i;
			_this.showTooltip(i);
			if(_this.selected.id == 'none')
			{
				_this.fade("dest", i);
				
			}
			else
				_this.highlightPath(_this.selected.i, i);
						
		})
		.on("mouseout", function(d,i){
			_this.showTooltip();
			if(_this.selected.id == 'none')
				_this.fade();
			else{
				_this.showTooltip(_this.selected.i);
				_this.highlightPath();
			}
		})
		.on("click", function(d,i){
			_this.barclick(d,i,"dest");
		});

	bar.append("line")
		.attr("x1",(barWidth / 2) - 1)
		.attr("y1",0)
		.attr("x2",(barWidth / 2) - 1)
		.attr("y2",_this.chartheight)
		.attr("id", function(d,i){
			return "label_line_" + i;
		})
		.attr("class", "bar_label_line")
		.attr("stroke-width", 0.5)
		.attr("stroke", "black")
		.attr("opacity", 0);
	
	//Text for matrix keys
	bar.append("text")
		.attr("x",(barWidth / 2) + 1)
		.attr("y",0)
		.attr("id", function(d,i){
			return "label_text_" + i;
		})
		.attr("class", "bar_label_text")
		.text(function(d,i){
			return d.n;
		})
		.attr("font-size", 10)
		.attr("font-weight", 'bold')
		.attr("opacity", 0);
		
	//Text for values	
	bar.append("text")
		.attr("x",(barWidth / 2) + 1)
		.attr("y",10)
		.attr("id", function(d,i){
			return "label_text_in_" + i;
		})
		.attr("class", "bar_label_text")
		.attr("font-size", 10)
		.attr("opacity", 0);
		
	bar.append("text")
		.attr("x",(barWidth / 2) - 2)
		.attr("y",10)
		.attr("id", function(d,i){
			return "label_text_out_" + i;
		})
		.attr("class", "bar_label_text")
		.attr("font-size", 10)
		.attr("text-anchor", "end")
		.attr("opacity", 0);
	
	function getBB(selection)
	{
		selection.each(function(d){
			console.log(this.getBBox());
			});
	}

	var x_l = barWidth * 0.25;
	var x_r = barWidth * 0.75;
	
	var mins = [];
	var maxs = [];
	for(i in this.matrix)
	{
		mins.push(d3.min(this.matrix[i]));
		maxs.push(d3.max(this.matrix[i]));
	}
	var scaleForLines = d3.scale.linear().domain([d3.min(mins), d3.max(maxs)]).range([_this.chartltop + (_this.chartheight * 0.25), _this.chartheight * 2]);
	
	
	this.chart.append("line")
		.attr("x1",0)
		.attr("y1",_this.chartheight * 2)
		.attr("x2",_this.chartwidth)
		.attr("y2",_this.chartheight * 2)
		.attr("stroke-width", 1)
		.attr("stroke", "black")
		.attr("opacity", 1);
	
	var domain = [
		d3.min(mins),
		d3.min(mins)  + ((d3.min(mins) + d3.max(maxs)) * 0.3),
		d3.min(mins)  + ((d3.min(mins) + d3.max(maxs)) * 0.6),
		d3.max(maxs),
	];
	this.colorMap = [
		colorbrewer.Greys[6][2],
		colorbrewer.Greys[6][3],
		colorbrewer.Greys[6][4],
		colorbrewer.Greys[6][5],
	];
	
	this.colorScaleForLines = d3.scale.linear().domain(domain).range(this.colorMap);
	
	
	
	for(row_i in this.matrix)
	{
		var dataForLines = this.matrix[row_i];
		for(col_j in dataForLines)
		{
			this.dataMapForLines["od_" + row_i + "_" + col_j] = dataForLines[col_j];
		}
	}
		
	var keys = Object.keys(_this.dataMapForLines).sort(function(a,b){
			var x = _this.dataMapForLines[a];
			var y = _this.dataMapForLines[b];
			if(x > y)
				return 1;
			else if( x < y)
				return -1;
			else
				return 0;
		}); 
	
	var odlines = this.chart.append('g').attr('id', 'odlines_');
	odlines.selectAll('g')
		.data(keys)
		.enter()
		.append('path')
		.attr("class", "od_path")
		.attr('id', function(d,i){
			var temp = d.replace("od_", "").split("_");
			var row_i = parseInt(temp[0]);
			var dest_i = parseInt(temp[1]);	
			return 'path_' + row_i + "_" + dest_i;
		})
		.attr('d', function(d,i){
			var temp = d.replace("od_", "").split("_");
			var row_i = parseInt(temp[0]);
			var dest_i = parseInt(temp[1]);	
			var cPoints = [];
			var x_base = (row_i * barWidth);
			var distance = Math.sqrt(Math.pow((x_base + x_l) - ((dest_i * barWidth) + x_r), 2)); 
			var cpy = scaleForLines(_this.dataMapForLines[d]);
			cPoints.push([x_base + x_l, _this.chartltop]);
			if(dest_i >= row_i)
			{
				cPoints.push([x_base + x_l + ( distance * 0.35), cpy]);
				cPoints.push([x_base + x_l + ( distance * 0.65), cpy]);
			}
			else
			{
				cPoints.push([(dest_i * barWidth) + x_r + ( distance * 0.65), cpy]);
				cPoints.push([(dest_i * barWidth) + x_r + ( distance * 0.35), cpy]);
			}	
			
			cPoints.push([(dest_i * barWidth) + x_r, _this.chartltop]);	
			
			_this.odPixelPositionsForLines[d] = {
				orig : {
					x : x_base + x_l, 
					y : _this.chartltop
				},
				dest : {
					x : (dest_i * barWidth) + x_r, 
					y : _this.chartltop
				},
			};
			
			
			return _this.dataMapForLines[d] == 0 ? null : _this.bezierLine(cPoints);
		})
		.attr("stroke", function(d) {
			//console.log(d);
			return _this.colorScaleForLines(_this.dataMapForLines[d]);
			})
	    .attr("stroke-width", 1)
	    .attr("fill", "none")
	    .attr("data", function(d,i){
	    	var temp = d.replace("od_", "").split("_");
			var row_i = parseInt(temp[0]);
			var dest_i = parseInt(temp[1]);	
	    	return "line_" + row_i + "_" + dest_i;
	    })
	    .attr("style", "opacity:1.0")
	    .on('mouseover', function(d){
	    	if(d3.select(this).attr("style") && d3.select(this).attr("style") == 'opacity:1.0')
	    	{
	    		var temp = d.replace("od_", "").split("_");
				var orig = parseInt(temp[0]);
				var dest = parseInt(temp[1]);	
	    		_this.onmouseoverPath(orig, dest);
	    	}
	    })
	    .on('mouseout', function(d){
	    	_this.onmouseoverPath();
	    });	
};
/**
 *  
 * @param {Object} d
 * @param {Object} i
 * @param {Object} type
 */
ODMatrixBar.prototype.barclick = function(d, i, type)
{
	if(this.selected.id == 'none')
	{
		this.selected.i = i;
		this.selected.id = this.matrixKeys[i];
		this.selected.type = type;
	}
	else if(this.selected.id == this.matrixKeys[i])
	{
		this.selected.i = -1;
		this.selected.id = 'none';
		this.selected.type = 'none';
	}
		
	if(this.onmouseclick)
		this.onmouseclick(d,i);
};

/**
 * Fades all connection lines except the ones that belongs to the selected node
 * @param {Object} type if its origin or destination
 * @param {Object} i index of selected node
 */
ODMatrixBar.prototype.fade = function(type, i)
{
	_this = this;
	if(!type && !i)
	{
		d3.selectAll(".rect_orig")
			.attr("style", function(d){
				return "fill-opacity:1.0";	
			})
			.attr("height", function(d,index){
				 return _this.chartheight - _this.scaleY(d.o);
			})
			.attr("y", function(d, index){
				return _this.scaleY(d.o);
			});
		d3.selectAll(".rect_dest")
			.attr("style", function(d){
				return "fill-opacity:1.0";	
			})
			.attr("height", function(d,index){
				 return _this.chartheight - _this.scaleY(d.d);
			})
			.attr("y", function(d, index){
				return _this.scaleY(d.d);
			});
		this.highlightPath();
		if (this.onmouseout) {
			this.onmouseout(this.matrixKeys[i], i);
		}
		
		
	}
	else
	{
		if(type == 'orig')
		{
			d3.selectAll(".rect_orig")
				.attr("style", function(d){
					var data = parseInt(d3.select(this).attr("data").replace("rect_orig_",""));
					return data == i ? "fill-opacity:1.0" : "fill-opacity:0.1"; 	
				});
			d3.selectAll(".rect_dest")
				.attr("height", function(d,index){
					 var trips = _this.matrix[i][index];
					 return _this.chartheight - _this.scaleY(trips);
				})
				.attr("y", function(d, index){
					var trips = _this.matrix[i][index];
					return _this.scaleY(trips);
				});
			this.highlightPath(i, null);

		}
		else if(type == 'dest')
		{
			d3.selectAll(".rect_dest")
				.attr("style", function(d){
					var data = parseInt(d3.select(this).attr("data").replace("rect_dest_",""));
					return data == i ? "fill-opacity:1.0" : "fill-opacity:0.1"; 	
				});
			d3.selectAll(".rect_orig")
				.attr("height", function(d,index){
					 var trips = _this.matrix[index][i];
					 return _this.chartheight - _this.scaleY(trips);
				})
				.attr("y", function(d, index){
					var trips = _this.matrix[index][i];
					return _this.scaleY(trips);
				});
			this.highlightPath(null,i);
		}
		if (this.onmouseover) {
			this.onmouseover(this.matrixKeys[i], i);
		}
			
	}
};
/**
 *  
 * @param {Object} i
 */
ODMatrixBar.prototype.showTooltip = function(i)
{
	if(i != null)
	{
		d3.select("#label_line_" + i)
			.attr("opacity", 1);
		d3.select("#label_text_" + i)
			.attr("opacity", 1);
		if(this.selected.id == 'none')
		{
			d3.select("#label_text_out_" + i)
				.attr("opacity", 1)
				.attr("font-weight", _this.hover.type == "orig" ? "bold" : "normal")
				.attr("fill", _this.hover.type == "orig" ? "#000" : "#AAA")
				.text(function(d){
					return _this.hover.type == "orig" ? _this.formatter(d.o) : _this.formatter(_this.matrix[i][i]);
				});
			d3.select("#label_text_in_" + i)
				.attr("opacity", 1)
				.attr("font-weight", _this.hover.type == "orig" ? "normal" : "bold")
				.attr("fill", _this.hover.type == "orig" ? "#AAA" : "#000")
				.text(function(d){
					return _this.hover.type == "orig" ? _this.formatter(_this.matrix[i][i]) : _this.formatter(d.d);
			});
		}
		else
		{
			d3.select("#label_text_out_" + i)
				.attr("opacity", function(d){
					if(parseInt(d.i) == _this.selected.i)
						return 1;
					else
						return _this.selected.type == "orig" ? 0 : 1;
				})
				.attr("font-weight", function(d){
					if(parseInt(d.i) == _this.selected.i)
						return _this.selected.type == "orig" ? "bold" : "normal";
					else
						return _this.selected.type == "orig" ? "normal" : "bold";
				})
				.attr("fill", function(d){
					if(parseInt(d.i) == _this.selected.i)
						return _this.selected.type == "orig" ? "#000" : "#AAA";
					else
						return _this.selected.type == "orig" ? "#AAA" : "#000";
				})
				.text(function(d){
					if(parseInt(d.i) == _this.selected.i)
						return _this.selected.type == "orig" ? _this.formatter(d.o) : _this.formatter(_this.matrix[i][i]);
					else
						return _this.selected.type == "orig" ? _this.formatter(_this.matrix[_this.selected.i][i]) : _this.formatter(_this.matrix[i][_this.selected.i]);
				});
			d3.select("#label_text_in_" + i)
				.attr("opacity", function(d){
					if(parseInt(d.i) == _this.selected.i)
						return 1;
					else
						return _this.selected.type == "orig" ? 1 : 0;
				})
				.attr("font-weight", function(d){
					if(parseInt(d.i) == _this.selected.i)
						return _this.selected.type == "orig" ? "normal" : "bold";
					else
						return _this.selected.type == "orig" ? "bold" : "normal";
				})
				.attr("fill", function(d){
					if(parseInt(d.i) == _this.selected.i)
						return _this.selected.type == "orig" ? "#AAA" : "#000";
					else
						return _this.selected.type == "orig" ? "#000" : "#AAA";
				})
				.text(function(d){
					if(parseInt(d.i) == _this.selected.i)
						return _this.selected.type == "orig" ? _this.formatter(_this.matrix[i][i]) : _this.formatter(d.d);
					else
						return _this.selected.type == "orig" ? _this.formatter(_this.matrix[_this.selected.i][i]) : _this.formatter(_this.matrix[i][_this.selected.i]);
			});
		}
	}
	else
	{
		d3.selectAll(".bar_label_line")
			.attr("opacity", 0);
		d3.selectAll(".bar_label_text")
			.attr("opacity", 0);
	}
};
/**
 * Highlights the path selected
 * @param {Object} orig index of origin of path
 * @param {Object} dest index of destination of path
 */
ODMatrixBar.prototype.highlightPath = function(orig, dest)
{
	if(orig != null && dest != null)
	{
		d3.selectAll(".local_od_path")
			.attr("style", "opacity:0.2");
		if(this.selected.type == "orig")
			d3.select("#local_od_" + orig + "_" + dest)
				.attr("style", "opacity:1.0")
				.attr("stroke", "#000");
		else
			d3.select("#local_od_" + dest + "_" + orig)
				.attr("style", "opacity:1.0")
				.attr("stroke", "#000");
			
	}
	else if (orig == null && dest == null)
	{
		if(this.selected.id == 'none')
		{
			d3.selectAll(".od_path")
				.attr("style", "opacity:1.0");
				
			d3.select("#od_local_lines").remove();
		}
		else
		{
			if(this.selected.type == 'orig')
			{
				orig = this.matrixKeys.indexOf(this.selected.id);
				d3.selectAll(".local_od_path")
					.attr("style", function(d,i){
						var id = d.id;
						var od = id.substring(9).split("_");
						if(od[0] == orig)
							return "opacity:1.0";
						else
							return "opacity:0.0";
					})
					.attr("stroke", function(d,i){
						return d.color;
					});
			}
			else
			{
				dest = this.matrixKeys.indexOf(this.selected.id); 
				d3.selectAll(".local_od_path")
					.attr("style", function(d,i){
						var id = d.id;
						var od = id.substring(9).split("_");
						if(od[1] == dest)
							return "opacity:1.0";
						else
							return "opacity:0.0";
					})
					.attr("stroke", function(d,i){
						return d.color;
					});
			}
		}
	}
	else
	{
		var values = [];
		if(orig != null)
		{
			values = this.matrix[orig];
			/* BEFORE
			d3.selectAll(".od_path")
				.attr("style", function(d,i){
					var id = d3.select(this).attr("id");
					var od = id.substring(5).split("_");
					if(od[0] == orig)
						return "opacity:1.0";
					else
						return "opacity:0.0";
				});
			//*/
		}
		else
		{
			for(i in this.matrix)
			{
				values.push(this.matrix[i][dest])
			}
		}
		
			
		d3.selectAll(".od_path")
			.attr("style", "opacity:0.0");
		
		var localPathData = [];
		
		var min = d3.min(values);
		var max = d3.max(values)
		var localScaleForLines = d3.scale.linear().domain([min, max]).range([_this.chartltop + (_this.chartheight * 0.25), _this.chartheight * 2]);
		
		var localDomain = [
			min, 
			min + ((max - min) * 0.3),
			min + ((max - min) * 0.6),
			max
		];
		var localColorScale = d3.scale.linear().domain(localDomain).range(this.colorMap);
		
		for(i in values)
		{
			if(orig != null)
			{
				var points = this.odPixelPositionsForLines["od_" + orig + "_" + i];
				var draw = values[i] == 0 ? false : true;
				var height = localScaleForLines(values[i]);
				localPathData.push(
					{
						orig : orig,
						dest : i,
						id : "local_od_" + orig + "_" + i,
						pos : points,
						height : height,
						draw : draw,
						color : localColorScale(values[i])
					}
				);
			}
			else
			{
				var points = this.odPixelPositionsForLines["od_" + i + "_" + dest];
				var draw = values[i] == 0 ? false : true;
				var height = localScaleForLines(values[i]);
				localPathData.push(
					{
						orig : i,
						dest : dest,
						id : "local_od_" + i + "_" + dest,
						pos : points,
						height : height,
						draw : draw,
						color : localColorScale(values[i])
					}
				);
			}
		}
			
		var odlines = this.chart.append('g').attr('id', 'od_local_lines');
		_this = this;
		odlines.selectAll('g')
			.data(localPathData)
			.enter()
			.append('path')
			.attr("class", "local_od_path")
			.attr('id', function(d,i){
				return d.id;
			})
			.attr('d', function(d,i){
				
				var distance = Math.sqrt(Math.pow((d.pos.orig.x) - (d.pos.dest.x), 2)); 
				var cPoints = [];
				var cpy = d.height;
				cPoints.push([d.pos.orig.x, d.pos.orig.y]);
				if(d.dest >= d.orig)
				{
					cPoints.push([d.pos.orig.x + ( distance * 0.35), cpy]);
					cPoints.push([d.pos.orig.x + ( distance * 0.65), cpy]);
				}
				else
				{
					cPoints.push([d.pos.dest.x + ( distance * 0.65), cpy]);
					cPoints.push([d.pos.dest.x + ( distance * 0.35), cpy]);
				}	
				
				cPoints.push([d.pos.dest.x, d.pos.dest.y]);	
				
				return d.draw ? _this.bezierLine(cPoints) : null;
			})
			.attr("stroke", function(d) {
				return d.color;
				})
		    .attr("stroke-width", 1)
		    .attr("fill", "none")
		    .attr("style", "opacity:1.0")
		    .on('mouseover', function(d){
		    	_this.onmouseoverPath(d.orig, d.dest);
		    })
		    .on('mouseout', function(d){
		    	_this.onmouseoverPath();
		    });	;	
		
		
	}
};

/**
 * 
 * @param {Object} orig
 * @param {Object} dest
 */
ODMatrixBar.prototype.onmouseoverPath = function(orig, dest)
{
	if(orig != null && dest != null)
	{
		if(this.selected.id == 'none')
		{
			d3.selectAll(".od_path")
				.attr("style", "opacity:0.1");
			d3.select("#path_" + orig + "_" + dest)
				.attr("style", "opacity:1.0")
				.attr("stroke", "#000");
			this.hover.type = "orig"
			this.showTooltip(orig);
			this.hover.type = "dest"
			this.showTooltip(dest);
		}
		else
		{
			d3.selectAll(".local_od_path")
				.attr("style", "opacity:0.2");
			d3.select("#local_od_" + orig + "_" + dest)
				.attr("style", "opacity:1.0")
				.attr("stroke", "#000");
				
			if(this.selected.type == "orig")
				this.showTooltip(dest);
			else
				this.showTooltip(orig);
		}	
	}
	else
	{
		if(this.selected.id == 'none')
		{
			d3.selectAll(".od_path")
				.attr("style", "opacity:1.0")
				.attr("stroke", function(d){
					return _this.colorScaleForLines(_this.dataMapForLines[d]);
				});	
			this.showTooltip();
		}
		else
		{	
			// var target = this.matrixKeys.indexOf(this.selected.id); 
			d3.selectAll(".local_od_path")
				.attr("style", "opacity:1.0")
				.attr("stroke", function(d){
					return d.color;
				});
			this.showTooltip();
			this.showTooltip(this.selected.i);
			
		}
		
	}
	
};

ODMatrixBar.prototype.selectNode = function(params)
{
	if(params)
	{
		var i = this.matrixKeys.indexOf(params.key);
		this.hover.type = params.type;
		this.hover.i = i;
		this.showTooltip(i);
		if(this.selected.id == 'none')
		{
			this.fade(params.type, i);
			
		}
		else
			this.highlightPath(this.selected.i, i);		
	}
	else
	{
		this.showTooltip();
		if(this.selected.id == 'none')
			this.fade();
		else{
			this.showTooltip(this.selected.i);
			this.highlightPath();
		}
	}
};

ODMatrixBar.prototype.clickNode = function(params)
{
	var i = this.matrixKeys.indexOf(params.key);
	this.barclick(params.d, i, params.type);
};
