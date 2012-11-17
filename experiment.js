/* JS Setup code */
window.onload = function() {
     var canvas = document.getElementById("experiment");
     canvas.height = document.documentElement.clientHeight;
     canvas.width  = document.documentElement.clientWidth;
}

/* Parse Setup Code */
Parse.initialize("SSooDY5RjkTIeArUgMHRjw5NXExayT3c5jwvvqiy", "iyvaGqgdqmfldFuikgxgW6wVWPCxFD7yopIk2fGn");
 
/*var TestObject = Parse.Object.extend("TestObject");
var testObject = new TestObject();
testObject.save({foo: "bar"}, {
  success: function(object) {
    alert("yay! it worked");
  }
});*/

/* Paper Code */
var size = view.size;

var position = Point.random() * size;
// Create a Paper.js Path to draw a line into it:
var circle = new Path.Circle(new Point(position.x, position.y), 50);
// Give the stroke a color
circle.fillColor = 'red';
circle.smooth();


 