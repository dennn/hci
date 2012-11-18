/* Parse setup code */
Parse.initialize("SSooDY5RjkTIeArUgMHRjw5NXExayT3c5jwvvqiy", "iyvaGqgdqmfldFuikgxgW6wVWPCxFD7yopIk2fGn");

/* Buzz sound library code */
var backgroundNoise = new buzz.sound("audio.mp3", {
    preload: true,
    autoplay: false,
    loop: true  
});

//Check to make sure the browser supports the codec and HTML5 audio tag
if (!buzz.isMP3Supported() || !buzz.isSupported()) {
    alert("Your browser doesn't support playing MP3 HTML5 audio. Try Chrome!!");
}

/* Paper code */
var canvasSize = view.size;
var testSubjectNumber;
var testNo = 0;
var soundNo = 0;
var timer1;
var timer2;
var position1;
var position2;
var c1id;
var c2id;
var levelsComplete = 0;
var levelText = new PointText(new Point(20,20));
levelText.fillColor = 'white';

// "Constants" that define testing mode and tests:
var soundLevels = [0,40,60,100];
var tests = [[1234,125,631,168],[710,284,1060,345],[429,118,1237,229],[232,60,535,325],[479,135,941,377],[1220,400,483,329],[1298,149,367,297]];

testSubjectNumber = randomUUID();  
console.log("Test Subject: " + testSubjectNumber);

//Generate pre-testing information:
//Shuffle the test order:
var testOrder = [0,1,2,3,4,5,6];

function randOrd() {
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

    if (testNo < tests.length - 1) //next level
    {
        testNo++;
        levelsComplete++;
    }
    else //end of level
    {
        if (soundNo < soundLevels.length - 1)
        {
            testNo = 0;
            soundNo++;
            levelsComplete++;
            testOrder.sort(randOrd);
        }
        else //end of session
        {
            finished = 1;
            backgroundNoise.stop();
            console.log("End of testing.");
            levelText.content = 'Complete';
            window.alert("All of your tests have finished.\nThank you for taking part.");
            circle1.remove();
            circle2.remove();
            view.draw();
            return;
        }
    }
    
    backgroundNoise.setVolume(soundLevels[soundNo]);    
    levelText.content = 'Test ' + levelsComplete + '/' + (soundLevels.length * tests.length);
    
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

//Start playing the sound
backgroundNoise.play();
backgroundNoise.setVolume(soundLevels[soundNo]);    

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
    var Test = Parse.Object.extend("Tests");
    var test = new Test();
    test.set("SubjectID", testSubjectNumber);
    test.set("TestID", testOrder[testNo]);
    test.set("TestNumber", testNo);
    test.set("SoundLevel", soundLevels[soundNo]);
    test.set("PositionA", position1);
    test.set("PositionB", position2);
    test.set("Distance", position1.getDistance(position2, 0));
    test.set("Time", Math.abs(finishTime - startTime));
    test.set("Missed", missed);
    
    test.save(null, {
    success: function(test) {
      console.log("Saved successfully!");
    },
    error: function(test, error) {
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
                timer1 = setTimeout(function(){
                    ready = 1;
                    circle1.fillColor = 'green';
                    circle2.visible = true;
                    view.draw();
                    },3000);
            }
        }
        //When circle2 is hit and circle1 has turned green (timer1 has started)
        else if (hitResult && (hitResult.item.id == c2id) && moving)
        {
            finishTime = new Date().getTime();
            circle2.fillColor = 'yellow';
            view.draw();
            timer2 = setTimeout(function(){
                circle2.fillColor = 'green';
                done = 1;
                saveResult();
                console.log("Total Time: " + Math.abs(finishTime - startTime) + "ms");
                generateTest();
                view.draw();
                },1000);
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

/* randomUUID.js - Version 1.0
*
* Copyright 2008, Robert Kieffer
*
* This software is made available under the terms of the Open Software License
* v3.0 (available here: http://www.opensource.org/licenses/osl-3.0.php )
*
* The latest version of this file can be found at:
* http://www.broofa.com/Tools/randomUUID.js
*
* For more information, or to comment on this, please go to:
* http://www.broofa.com/blog/?p=151
*/

/**
* Create and return a "version 4" RFC-4122 UUID string.
*/
function randomUUID() {
  var s = [], itoh = '0123456789ABCDEF';

  // Make array of random hex digits. The UUID only has 32 digits in it, but we
  // allocate an extra items to make room for the '-'s we'll be inserting.
  for (var i = 0; i < 32; i++) s[i] = Math.floor(Math.random()*0x10);

  // Conform to RFC-4122, section 4.4
  s[14] = 4;  // Set 4 high bits of time_high field to version
  s[19] = (s[19] & 0x3) | 0x8;  // Specify 2 high bits of clock sequence

  // Convert to hex chars
  for (var i = 0; i < 32; i++) s[i] = itoh[s[i]];

  return s.join('');
} 