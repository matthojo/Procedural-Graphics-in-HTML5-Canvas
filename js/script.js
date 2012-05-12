/**
    @author Matthew Harrison-Jones

*/

$(document).ready(function () {

    /**
     *
     * VARIABLES
     *
     */

    /**
     * Canvas Init
     */
    var canvas = $("#myCanvas");
    var context = canvas.get(0).getContext("2d");

    /**
     * Canvas Settings
     **/
    var canvasWidth = $(window).get(0).innerWidth;
    var canvasHeight = $(window).get(0).innerHeight;
    canvas.attr("width", canvasWidth);
    canvas.attr("height", canvasHeight);

    /**
     * Debug Settings
     */
    var terminal, debug;

    /**
     *
     * General Settings
     */
    // The start height
    var startHeight = canvasHeight/2;
    // The amount in which the midpoint is displaced
    var displacement = 200;
    // The smoothness of the peaks [0 to 1]
    var sharp = 0.5;
    // The number of segments
    var numAreas = 100;

    /**
     *
     * OBJECTS
     *
     */

    /**
     * Terrain Object
     * @param segments
     * @constructor
     *
     * Modified code from http://www.marvinlabs.com/2011/04/mid-point-algorithm-javascript/
     */
    var Terrain = function(segments){

        var settings = {
          points: [],
          segments: segments
        };
        var generateUsingMidPoint = function(maxElevation, sharpness) {
            this.midPoint(0, settings.segments, maxElevation, sharpness);
        };

        var midPoint = function(start, end, maxElevation, sharpness) {
            var middle = Math.round((start + end) * 0.5);
            if ((end-start<=1) || middle==start || middle==end) {
                return;
            }

            var newAltitude = 0.5 * (settings.points[end] + settings.points[start]) + maxElevation*(1 - 2*Math.random());
            settings.points[middle] = newAltitude;

            this.midPoint(start, middle, maxElevation*sharpness, sharpness);
            this.midPoint(middle, end, maxElevation*sharpness, sharpness);
        };

        return{
            settings: settings,
            generateUsingMidPoint: generateUsingMidPoint,
            midPoint: midPoint
        }
    };

    /**
     *
     * FUNCTIONS
     *
     */

    /**
     * Initiate a new map
     * @return {*}
     */
    function initTerrain(){
        var map = new Terrain(numAreas);
        for (var i=0; i<=map.settings.segments; i++) {
            map.settings.points[i] = 0;
        }
        map.generateUsingMidPoint(displacement, sharp);

        return map;
    }

    /**
     * Draw the lines
     * @param ctx
     * @param map
     * @param offsetY
     * @param scaleX
     * @param scaleY
     */
    function drawPath(ctx, map, offsetY, scaleX, scaleY){
        var curX = 0;
        var curY = 0;
        ctx.save();
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineTo(0, canvasHeight);
        ctx.lineTo(0, canvasHeight/2);
        for (var i=0; i<=map.settings.segments; ++i){
            curY = offsetY + map.settings.points[i] * scaleY;
            if(i == 0){
                //ctx.moveTo(curX, curY);
            } else{
                ctx.lineTo(curX, curY);
                ctx.stroke();
            }
            curX += scaleX;
            //terminal.addMsg("curX:"+curX+" curY:"+curY);
        }
        ctx.lineTo(canvasWidth, canvasHeight);
        ctx.fillStyle= "rgba(0,0,0,0.4)";
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    /**
     * Render the frames
     * @param ctx The specified canvas
     */
    function render(ctx){
        ctx.clearRect(0,0, canvasWidth, canvasHeight);

        var map = initTerrain();
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.lineTo(0, startHeight);
        ctx.lineTo(canvasWidth, startHeight);
        ctx.stroke();
        ctx.closePath();
        ctx.strokeStyle = "black";
        drawPath(ctx, map, startHeight, canvasWidth/map.settings.segments, -1);
    }

    /**
     *  Setup page
     */

    //Slider Listeners
    var sharpValue = $('#smooth');
    $('#smooth').change(function (){
        sharpValue.html(this.value);
        sharp = this.value/10;
        render(context);
    });
    $('#smooth').change();

    //Generate new map
    $("#genNew").on("click", render(context));

    /**
     * Creates the animation loop.
     */
    render(context);

});



