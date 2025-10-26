const input = document.getElementById('input');

//initializing variables 
var amplitude = 40; 
var interval = null; 
var pitch = 0; 
var freq = 0; 
var x = 0;  
var y = 0; 
var counter = 0; 
var reset = false; 
var timepernote = 0; 
var length = 0; 

//define canvas variables 
var canvas = document.getElementById("canvas"); 
var ctx = canvas.getContext("2d"); 
var width = ctx.canvas.width; 
var height = ctx.canvas.height; 


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

function line() {
    //increase counter by 1 to show how long interval has been run 
    counter++; 
    freq = pitch/10000; 
    y = (height/2) + amplitude * Math.sin(2 * (Math.PI) * freq * x * (0.5 * length)); 
    ctx.lineTo(x,y); 
    ctx.stroke(); 
    x = x + 1; 
    if (counter > (timepernote/20)) {
        clearInterval(interval); 
    }
}

//create web audio api elements
const audioCtx = new AudioContext(); 
const gainNode = audioCtx.createGain(); 

//create Oscillator node
const oscillator = audioCtx.createOscillator(); 
oscillator.connect(gainNode); 
gainNode.connect(audioCtx.destination); 
oscillator.type = "sine"; 
oscillator.start(); 
gainNode.gain.value = 0; 

//declaring new map, a shorthand for frequencies 
noteNames = new Map(); 
noteNames.set("C", 261.6);
noteNames.set("D", 293.7);
noteNames.set("E", 329.6);
noteNames.set("F", 349.2);
noteNames.set("G", 392.0);
noteNames.set("A", 440);
noteNames.set("B", 493.9);

function frequency(pitchValue) {
    pitch = pitchValue
    gainNode.gain.setValueAtTime(100,audioCtx.currentTime); 
    oscillator.frequency.setValueAtTime(pitch,audioCtx.currentTime); 
    gainNode.gain.setValueAtTime(0,audioCtx.currentTime + (timepernote/1000)-0.1); 
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
    //continue with rest 
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



