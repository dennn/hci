/* JS Setup code - Moved back to html otherwise it doesn't work!*/
/*window.onload = function() {
     var canvas = document.getElementById("experiment");
     canvas.height = document.documentElement.clientHeight;
     canvas.width  = document.documentElement.clientWidth;
}*/

/* Parse Setup Code */
Parse.initialize("SSooDY5RjkTIeArUgMHRjw5NXExayT3c5jwvvqiy", "iyvaGqgdqmfldFuikgxgW6wVWPCxFD7yopIk2fGn");

/* Paper Code */
var canvasSize = view.size;
var testSubjectNo = 0;
var testNo = -1;
var soundNo = 0;
var timer1;
var timer2;
var position1;
var position2;
var c1id;
var c2id;


// "Constants" that define testing mode and tests:
var totalSoundLevels = 4;
var soundlevels = [0,40,60,100];
var totalTestsPerLevel = 7;
var tests = [[1234,125,631,168],[710,284,1060,345],[429,118,1237,229],[232,60,535,325],[479,135,941,377],[1320,400,483,329],[1398,149,367,297]];

// Ask for the test subjects ID (to be filled in by tester)
while ((testSubjectNo < 1) || (isNaN(testSubjectNo)))
  testSubjectNo = parseInt(prompt("Enter the test subjects ID:","1"));
  
console.log("Test Subject:" + testSubjectNo);

//Generate pre-testing information:
// Shuffle the test order:
var testOrder = [0,1,2,3,4,5,6];
function randOrd(){
  return (Math.round(Math.random())-0.5);
}
testOrder.sort(randOrd);

var circleSize1 = 50;
var circleSize2 = 75;
var minDistance = 100; //the minimum distance two circles can be apart.
var startTime;
var finishTime;
var ready;
var moving;
var done;
var finished = 0;
var missed;
var circle1;
var circle2;

// Generate individual test information:
function generateTest()
{
    // Init variables:
    startTime = 0;
    finishTime = 0;
    ready = 0;
    moving = 0;
    done = 0;
    missed = 0;

    if (testNo < totalTestsPerLevel - 1) //next level
        testNo++;
    else //end of level
    {
       
        if (soundNo < totalSoundLevels - 1)
        {
            testNo = 0;
            soundNo++;
            testOrder.sort(randOrd);
        }
        else //end of session
        {
            finished = 1;
            console.log("End of testing.");
            window.alert("All of your tests have finished.\nThank you for taking part.");
            circle1.remove();
            circle2.remove();
            view.draw();
            return;
        }
    }
    
    console.log("Test No: " + testNo);
    
    position1 = new Point(tests[testOrder[testNo]][0],tests[testOrder[testNo]][1]);
    position2 = new Point(tests[testOrder[testNo]][2],tests[testOrder[testNo]][3]);

    if (circle1)
        circle1.remove();
    if (circle2)
        circle2.remove();
    
    // Create Paper.js Paths to draw a line into it:
    circle1 = new Path.Circle(new Point(position1.x, position1.y), circleSize1);
    circle1.fillColor = 'red';
    circle1.smooth();
    c1id = circle1.id;

    circle2 = new Path.Circle(new Point(position2.x, position2.y), circleSize2);
    circle2.fillColor = 'red';
    circle2.smooth();
    c2id = circle2.id;
    circle2.visible = false;
}

//Run the first test generation:
generateTest();

//Detect when the mouse has hit the shape:
var hitOptions = {
    segments: true,
    stroke: true,
    fill: true,
    tolerance: 0 //to hitting the shape
};

function saveResult() {
    var TestSubject = Parse.Object.extend("TestSubject");
    var testSubject = new TestSubject();
    testSubject.set("TestSubjectNo", testSubjectNo);
    testSubject.set("TestNo", testOrder[testNo]);
    testSubject.set("soundLevel", soundlevels[soundNo]);
    testSubject.set("circleSize1", circleSize1);
    testSubject.set("circleSize2", circleSize2);
    testSubject.set("position1", position1);
    testSubject.set("position2", position2);
    testSubject.set("minDistance", minDistance);
    testSubject.set("circleDistance", position1.getDistance(position2, 0));
    testSubject.set("totalTime", Math.abs(finishTime - startTime));
    testSubject.set("missed", missed);
    
    testSubject.save(null, {
    success: function(testSubject) {
      console.log("Saved successfully!");
    },
    error: function(testSubject, error) {
      window.alert("Save failed!");
    }
  });
}

function onMouseMove(event) {
    if (!finished)
        {
        var hitResult = project.hitTest(event.point, hitOptions);
        
        //When the circle1 item on the screen is hit and it hasn't been turned green:
        if (hitResult && (hitResult.item.id == c1id) && (circle1.fillColor.toString() != "{ red: 0, green: 1, blue: 0, alpha: 1 }"))
        {
            if (ready == 0)
            {
                hitResult.item.fillColor = 'yellow';
            }
            else
            {
                hitResult.item.fillColor = 'green';
                circle2.visible = true;
            }
            if (startTime == 0)
            {
                //Put number of milliseconds since 1 Jan 1970 in startTime:
                //(Note: this is the time that the user entered the circle, not nessersairly too useful for us but indicates
                // that they have entered the circle nonetheless.)
                startTime = new Date().getTime();
                timer1 = setTimeout(function(){ready = 1;circle1.fillColor = 'green';circle2.visible = true;view.draw();},3000);
            }
        }
        //When circle2 is hit and circle1 has turned green (timer1 has started)
        else if (hitResult && (hitResult.item.id == c2id) && moving)
        {
            finishTime = new Date().getTime();
            circle2.fillColor = 'yellow';
            view.draw();
            timer2 = setTimeout(function(){circle2.fillColor = 'green';done = 1;saveResult();console.log("Total Time: " + Math.abs(finishTime - startTime) + "ms");generateTest();view.draw();},1000);
            moving = 0;
            
        }
        //When no items on the screen have been hit and the timer1 hasn't started:
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
              circle2.visible = true;
              startTime = 0;
            }
            clearTimeout(timer1);
            timer1 = null;
        }
        //On first leaving the green and ready to go circle:
        else if (!moving && finishTime == 0)
        {
            startTime = new Date().getTime();
            console.log("Started Moving at: " + startTime);
            moving = 1;
        }
        //Entered circle and left again before 1 second verification:
        else if (done == 0 && finishTime != 0 && !hitResult)
        {
            clearTimeout(timer2);
            timer2 = null;
            finishTime = 0;
            missed = 1;
            moving = 1;
            circle2.fillColor = 'red';
            view.draw();
        }
    }
}

 