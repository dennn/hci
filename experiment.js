var size = view.size;

var position = Point.random() * size;
// Create a Paper.js Path to draw a line into it:
var circle = new Path.Circle(new Point(position.x, position.y), 50);
// Give the stroke a color
circle.fillColor = 'red';
circle.smooth();


 