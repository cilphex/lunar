// taken from http://www.kevs3d.co.uk/dev/warpfield/
// modified for our uses

// requestAnimFrame shim
window.requestAnimFrame = (function()
{
   return  window.requestAnimationFrame       ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame    ||
           window.oRequestAnimationFrame      ||
           window.msRequestAnimationFrame     ||
           function(callback)
           {
               window.setTimeout(callback);
           };
})();

// remove frame margin and scrollbars when maxing out size of canvas
document.body.style.margin = "0px";
document.body.style.overflow = "hidden";

// get dimensions of window and resize the canvas to fit
var width = window.innerWidth,
    height = window.innerHeight,
    canvas = document.getElementById("c"),
    mousex = width/2,
    mousey = 65; // height/2;
canvas.width = width;
canvas.height = height;

// get 2d graphics context and set global alpha
var G=canvas.getContext("2d");
G.globalAlpha=0.25;

// setup aliases
var Rnd = Math.random,
    Sin = Math.sin,
    Floor = Math.floor;

// constants and storage for objects that represent star positions
var warpZ = 12,
    units = 1500,
    stars = [],
    cycle = 0,
    Z = 0.01; //0.025 + (1/25 * 2);

// mouse events
function addCanvasEventListener(name, fn)
{
  canvas.addEventListener(name, fn, false);
}
// addCanvasEventListener("mousemove", function(e) {
//    mousex = e.clientX;
//    mousey = e.clientY;
// });

function wheel (e) {
   var delta = 0;
   if (e.detail)
   {
      delta = -e.detail / 3;
   }
   else
   {
      delta = e.wheelDelta / 120;
   }
   var doff = (delta/25);
   if (delta > 0 && Z+doff <= 0.5 || delta < 0 && Z+doff >= 0.01)
   {
      Z += (delta/25);
      //console.log(delta +" " +Z);
   }
}
addCanvasEventListener("DOMMouseScroll", wheel);
addCanvasEventListener("mousewheel", wheel);

// function to reset a star object
function resetstar(a)
{
   a.x = (Rnd() * width - (width * 0.5)) * warpZ;
   a.y = (Rnd() * height - (height * 0.5)) * warpZ;
   a.z = warpZ;
   a.px = 0;
   a.py = 0;
}

// initial star setup
for (var i=0, n; i<units; i++)
{
   n = {};
   resetstar(n);
   stars.push(n);
}

// star rendering anim function
var rf = function()
{
   // clear background
   G.fillStyle = "#000";
   G.fillRect(0, 0, width, height);

   // mouse position to head towards
   var cx = (mousex - width / 2) + (width / 2),
       cy = (mousey - height / 2) + (height / 2);

   // update all stars
   // var sat = Floor(Z * 500);       // Z range 0.01 -> 0.5
   // if (sat > 100) sat = 100;

   // Rather than increase the saturation and have a fixed lightness at 80%,
   // fix the saturation at 100%, and reduce lightness from 100% to 50% over time,
   // to change from white to max color
   var lightness = Math.ceil((1 - (Z / 0.5)) * 100);

   for (var i=0; i<units; i++)
   {
      var n = stars[i],            // the star
          xx = n.x / n.z,          // star position
          yy = n.y / n.z,
          e = (1.0 / n.z + 1) * 2;   // size i.e. z

      if (n.px !== 0)
      {
         // hsl colour from a sine wave
         // G.strokeStyle = "hsl(" + ((cycle * i) % 360) + "," + sat + "%,100%)";
         G.strokeStyle = "hsl(" + ((cycle * i) % 360) + ",100%," + lightness + "%)";
         G.lineWidth = e;
         G.beginPath();
         G.moveTo(xx + cx, yy + cy);
         G.lineTo(n.px + cx, n.py + cy);
         G.stroke();
      }

      // update star position values with new settings
      n.px = xx;
      n.py = yy;
      n.z -= Z;

      // reset when star is out of the view field
      if (n.z < Z || n.px > width || n.py > height)
      {
         // reset star
         resetstar(n);
      }
   }

   // colour cycle sinewave rotation
   cycle += 0.01;

   requestAnimFrame(rf);
};
requestAnimFrame(rf);
