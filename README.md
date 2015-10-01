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
});
ODMatrix.createODMatrix();
```
