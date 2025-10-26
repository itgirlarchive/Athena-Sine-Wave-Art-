const input = document.getElementById('input');

//INITIALIZING VARIABLES 
var interval = null; 
var pitch = 0; 
var freq = 0; 
var x = 0;  
var y = 0; 
var counter = 0; 
var reset = false; 
var timepernote = 0; 
var length = 0; 

//DEFINE CANVAS VARIABLES 
var canvas = document.getElementById("canvas"); 
var ctx = canvas.getContext("2d"); 
var width = ctx.canvas.width; 
var height = ctx.canvas.height; 

//DRAWS THE SINE WAVES 
function drawWave() {
    clearInterval(interval); 
    counter = 0; 
    if (reset) {
        ctx.clearRect(0, 0, width, height); 
        x = 0; 
        y = (height/2);   
        ctx.moveTo(x, y);
        ctx.beginPath();
    }
    interval = setInterval(line,20); 
    reset = false; 
} 

//ADDS 2 COLORS TO THE WAVES 
const color_picker1 = document.getElementById('color1'); 
const color_picker2 = document.getElementById('color2');
//BREAKS DOWN RGB 
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); 
    return result ? {
        r: parseInt(result[1], 16), 
        g: parseInt(result[2], 16), 
        b: parseInt(result[3], 16)
    } : null; 
}
//ADDS SECOND COLOR MIX (it will flash back and forth)
function interpolateColor(color1, color2, factor) {
    const c1 = hexToRgb(color1); 
    const c2 = hexToRgb(color2); 
    const r = Math.round(c1.r + (c2.r -c1.r) * factor); 
    const g = Math.round(c1.g + (c2.g - c1.g) * factor); 
    const b = Math.round(c1.b + (c2.b - c1. b) * factor); 

    return `rgb(${r}, ${g}, ${b})`; 
}

//DRAWS THE LINE 
function line() {
    //increase counter by 1 to show how long interval has been run 
    counter++; 
    freq = pitch/10000; 
    y = (height/2) + ((vol_slider.value/100)*40) * Math.sin(2 * (Math.PI) * freq * x * (0.5 * length)); 
    
    const progress = counter / (timepernote/20); 
    const currentColor = interpolateColor(color_picker1.value, color_picker2.value, progress); 

    ctx.lineTo(x,y); 
    ctx.strokeStyle = currentColor; 
    ctx.stroke(); 
    x = x + 1; 
    if (counter > (timepernote/20)) {
        clearInterval(interval); 
    }
}

//ADDS VOLUME SLIDER 
const vol_slider = document.getElementById('vol-slider'); 

//CREATE WEB AUDIO API ELEMENTS 
const audioCtx = new AudioContext(); 
const gainNode = audioCtx.createGain(); 

//CREATE OSCILLATOR MODE 
const oscillator = audioCtx.createOscillator(); 
oscillator.connect(gainNode); 
gainNode.connect(audioCtx.destination); 
oscillator.type = "sine"; 
oscillator.start(); 
gainNode.gain.value = 0; 



//DECLARES NEW MAP: SHORTHAND FOR FREQUENCIES 
noteNames = new Map(); 
noteNames.set("C", 261.6);
noteNames.set("D", 293.7);
noteNames.set("E", 329.6);
noteNames.set("F", 349.2);
noteNames.set("G", 392.0);
noteNames.set("A", 440);
noteNames.set("B", 493.9);

//FREQUENCY OF PITCH 
function frequency(pitchValue) {
    pitch = pitchValue
    gainNode.gain.setValueAtTime(vol_slider.value,audioCtx.currentTime); 
    setting = setInterval(() => {gainNode.gain.value=vol_slider.value}, 1); 
    oscillator.frequency.setValueAtTime(pitch,audioCtx.currentTime); 
    
    setTimeout(() => { clearInterval(setting); 
    gainNode.gain.value = 0; }, ((timepernote) -10)); 
    
}

function handle(){
    reset = true; 
    audioCtx.resume(); 
    gainNode.gain.value = 0; 
    var usernotes = String(input.value); 
    var noteslist = []; 
    length = usernotes.length
    timepernote = (6000 / length); 

    for (i = 0; i < usernotes.length; i++) {
        noteslist.push(noteNames.get(usernotes.charAt(i))); 
    }

    let j = 0; 
    //Advanced challenge: playing the first note immediately  
    if (noteslist.length >0) {
        frequency(noteslist[j]); 
        drawWave(); 
        j++; 
    }
    //The rest of the notes follows 
    repeat = setInterval(() => {
        if (j < noteslist.length) {
            frequency(parseInt(noteslist[j])); 
            drawWave(); 
        j++ 
        } else {
            clearInterval(repeat)
        }
    }, timepernote) 
    }



