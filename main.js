const input = document.getElementById('input');
const recording_toggle = document.getElementById('record'); 
const thickness_slider = document.getElementById('thickness-slider'); 

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
var pianoMode = false; 

function togglePianoMode() {
    pianoMode = !pianoMode; 
    const button = document.getElementById('piano-mode'); 

    if (pianoMode){
        oscillator.type = "triangle"; 
        button.innerHTML = "Piano Mode: ON"; 
    } else {
        oscillator.type = "sine"; 
        button.innerHTML = "Piano Mode: OFF"; 
    }
}


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
    ctx.lineWidth = thickness_slider.value; 

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
noteNames.set("C", 261.63);
noteNames.set("D", 293.66);
noteNames.set("E", 329.63);
noteNames.set("F", 349.23);
// S is F sharp 
noteNames.set("S",369.99);
noteNames.set("G", 392.0);
noteNames.set("A", 440);
noteNames.set("B", 493.88);

//FREQUENCY OF PITCH 
/*
function frequency(pitchValue) {
    pitch = pitchValue
    gainNode.gain.setValueAtTime(vol_slider.value,audioCtx.currentTime); 
    setting = setInterval(() => {gainNode.gain.value=vol_slider.value}, 1); 
    oscillator.frequency.setValueAtTime(pitch,audioCtx.currentTime); 
    
    setTimeout(() => { clearInterval(setting); 
    gainNode.gain.value = 0; }, ((timepernote) -10)); 
    
}
*/

function frequency(pitchValue){
    pitch = pitchValue; 
    const now = audioCtx.currentTime; 
    const noteDuration = (timepernote/1000) - 0.1; 

    if (pianoMode) {
        gainNode.gain.cancelScheduledValues(now); 
        gainNode.gain.setValueAtTime(0, now); 
        gainNode.gain.linearRampToValueAtTime(vol_slider.value, now+0.005);
        gainNode.gain.exponentialRampToValueAtTime(Math.max(vol_slider.value * 0.1, 0.01), now + 0.2);
        gainNode.gain.linearRampToValueAtTime(0.01,now+noteDuration); 

        
    } else {
        gainNode.gain.setValueAtTime(vol_slider.value, now); 
        setting = setInterval(() => {gainNode.gain.value = vol_slider.value}, 1); 
        setTimeout(() => {
            clearInterval(setting); 
            gainNode.gain.value = 0; 

    }, ((timepernote)- 10));  
    
    }
oscillator.frequency.setValueAtTime(pitchValue, now); 
}

/*
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
*/

function handle(){
    reset = true; 
    audioCtx.resume(); 
    gainNode.gain.value = 0; 
    var usernotes = String(input.value); 
    var noteslist = []; 
    length = usernotes.length
    timepernote = (6000 / length); 

    for (i = 0; i < usernotes.length; i++) {
        const char = usernotes.charAt(i); 
        if (char === ' ') {
            noteslist.push(null); 
        } else {
            noteslist.push(noteNames.get(usernotes.charAt(i))); 
        }
    }

    let j = 0; 
    //Advanced challenge: playing the first note immediately  
    if (noteslist.length > 0 && noteslist[0] !== null) {
        frequency(noteslist[j]); 
        drawWave(); 
        j++; 
    } else if (noteslist[0] === null) {
        j++; 
    }

    function checkAndPlay(){
        if (j < noteslist.length) {
            if(noteslist[j] !== null){
                frequency(noteslist[j]); 
                drawWave();
                j++; 
            } else {
                clearInterval(repeat); 
                setTimeout(() => {
                    j++;
                    repeat = setInterval(checkAndPlay, timepernote); 
                }, 0.01); 
            }
            } else {
                clearInterval(repeat);
            }
        }

        repeat = setInterval(checkAndPlay, timepernote); 

    }
    


var blob, recorder = null; 
var chunks = []; 

function startRecording(){
    const canvasStream = canvas.captureStream(20); 
    const audioDestination = audioCtx.createMediaStreamDestination(); 
    gainNode.connect(audioDestination); 
    const combinedStream = new MediaStream(); 
    canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track)); 
    audioDestination.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
    recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm'}); 
    
    recorder.ondataavailable = e => {
    if (e.data.size > 0) {
        chunks.push(e.data);
    }
    };


    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recording.webm';
        a.click();
        URL.revokeObjectURL(url);
    }

    recorder.start();
}

var is_recording = false; 
function toggle(){
    is_recording = !is_recording; 
    if(is_recording){
        recording_toggle.innerHTML = "Stop Recording";
        startRecording(); 
    } else {
        recording_toggle.innerHTML = "Start Recording"; 
        recorder.stop(); 
    }
}

const songLinks = {
    'happy-birthday': 'https://www.youtube.com/watch?v=ayGzVtcAK9Q', 
    'jingle-bells': 'https://www.youtube.com/watch?v=o6wRHQu9BgM', 
    'you-are-my-sunshine': 'https://www.youtube.com/watch?v=FeKRtRvo7Qc', 
    'twinkle-star': 'https://www.youtube.com/watch?v=CtF4n6CMSko'
}; 

document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item'); 
    navItems[0].addEventListener('click', () => {
        window.open(songLinks['happy-birthday'], '_blank'); 
    }); 
    navItems[1].addEventListener('click', () => {
        window.open(songLinks['jingle-bells'], '_blank'); 
    }); 
    navItems[2].addEventListener('click', () => {
        window.open(songLinks['you-are-my-sunshine'], '_blank'); 
    }); 
    navItems[3].addEventListener('click', () => {
        window.open(songLinks['twinkle-star'], '_blank'); 
    }); 
}); 