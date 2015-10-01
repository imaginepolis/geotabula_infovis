var GeoTabulaInfoVis = {
	ODMatrix : ODMatrix, 
}

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
}

ODMatrix.prototype.createODMatrix = function()
{
	if(this.divOrig && this.divDest)
	{
		this.createOdMatrixVisualization();
		this.createOdMatrixVisualizationDest();
	}
}


ODMatrix.prototype.mouseOver = function(i){
	if (!this.freeze) {
		this.updateTextODOrig(true, i);
		this.updateTextODDest(true, i);
		if (this.onmouseover) {
			this.onmouseover(this.matrixKeys[i], i);
		}
	}
}

ODMatrix.prototype.mouseOut = function(i){
	if (!this.freeze) {
		this.updateTextODOrig(false, i);
		this.updateTextODDest(false, i);
		if (this.onmouseout) {
			this.onmouseout(this.matrixKeys[i], i);
		}
	}
}

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
	
ODMatrix.prototype.updateTextODDest = function(highlight, i)
	{
		d3.select("#matrix_key_dest" + i)
			.attr("font-size", highlight ? "15px" : "10px")
			.attr("fill", highlight ? this.origColor : "#000")
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
