# Geotabula InfoVis

This is a set of classes to create InfoVis charts. The main class is GeoTabulaInfoVis and the graphs are:
* ODMatrix

**Usage**

***ODMatrix***

Create an instance of the class with parameters, and afterwards call ```createODMatrix()```
```
ODMatrix = new GeoTabulaInfoVis.ODMatrix({
		matrix : matrix, //The OD matrix  
		matrixKeys : matrixKeys, // Array with names for each column of matrix
		divOrig : 'od_matrix_chord', // id of div for origin visualization
		divDest : 'od_matrix_chord_dest', // id of div for destination visualization 
		origWidth : 500, // width of div for origin
		origHeight : 500,  // height of div for origin
		destWidth : 500,  // width of div for destination
		destHeight : 500,  // height of div for destination
		onmouseover : callback, //callback for mouse over events
		onmouseout : callback, //callback for mouse out events
		origcolor : "#000", //Origin color for text
		destcolor : "#000", //Destination color for text
		onmouseover : callback,	//Callback for mouse over event
		onmouseoout : callback,	//Callback for mouse out event
		origcolor : "#000",	//Color for origin text
		destcolor : "#000"	//Color for destination text
});
ODMatrix.createODMatrix();
```

