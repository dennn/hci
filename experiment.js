/* JS Setup code */
window.onload = function() {
     var canvas = document.getElementById("experiment");
     canvas.height = document.documentElement.clientHeight;
     canvas.width  = document.documentElement.clientWidth;
}

/* Parse Setup Code */
Parse.initialize("SSooDY5RjkTIeArUgMHRjw5NXExayT3c5jwvvqiy", "iyvaGqgdqmfldFuikgxgW6wVWPCxFD7yopIk2fGn");

/* Paper Code */
var canvasSize = view.size;
var circleSize1 = 50;
var startTime = 0;
var ready = 0;
var moving = 0;
var timer;

// Generate a bounding point so that part of the circle can not be off-screen:
var bound = new Point(canvasSize.width - 2*circleSize1, canvasSize.height - 2.5*circleSize1)

// Generate the center of the circle:
var position = Point.random() * bound + circleSize1;

// Create a Paper.js Path to draw a line into it:
var circle1 = new Path.Circle(new Point(position.x, position.y), circleSize1);
// Give the stroke a color:
circle1.fillColor = 'red';
circle1.smooth();

//Detect when the mouse has hit the shape:
var hitOptions = {
    segments: true,
    stroke: true,
    fill: true,
    tolerance: 0 //to hitting the shape
};

function onMouseMove(event) {
    var hitResult = project.hitTest(event.point, hitOptions);
    
    //When the circle1 item on the screen is hit and it hasn't been turned green:
    if (hitResult && (hitResult.item.id == 2) && (circle1.fillColor.toString() != "{ red: 0, green: 1, blue: 0, alpha: 1 }"))
    {
        if (ready == 0)
        {
            hitResult.item.fillColor = 'yellow';
        }
        else
        {
            hitResult.item.fillColor = 'green';
        }
        if (startTime == 0)
        {
            //Put number of milliseconds since 1 Jan 1970 in startTime:
            //(Note: this is the time that the user entered the circle, not nessersairly too useful for us but indicates
            // that they have entered the circle nonetheless.)
            startTime = new Date().getTime();
            console.log(startTime);
            timer = setTimeout(function(){ready = 1;circle1.fillColor = 'green';view.draw();},3000);
        }
    }
    //When no items on the screen have been hit:
    else if (ready == 0)
    {
        //If the circle is yellow, they didn't stay there for long enough. Reset to red.
        if (circle1.fillColor.toString() == "{ red: 1, green: 1, blue: 0, alpha: 1 }")
        {
            startTime = 0;
        }
        if (startTime == 0)
          circle1.fillColor = 'red';
        else
        {
          circle1.fillColor = 'green';
          startTime = 0;
        }
        clearTimeout(timer);
        timer = null;
    }
    //On first leaving the green and ready to go circle:
    else if (!moving)
    {
        startTime = new Date().getTime();
        console.log("Started Moving at: " + startTime);
        moving = 1;
    }
}

 