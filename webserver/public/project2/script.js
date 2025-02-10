let shortSound = new Audio('assets/PigShort.mp3');
let longSound = new Audio('assets/PigLong.mp3');
let clock = document.querySelector('.clock'); 

let hrs = document.getElementById("hrs");
let min = document.getElementById("min");
let toggleBtn = document.getElementById("toggle-btn");
let isMorse = false;
let isPlaying = false; 

const morseMap = {
    "0": "-----",
    "1": ".----",
    "2": "..---",
    "3": "...--",
    "4": "....-",
    "5": ".....",
    "6": "-....",
    "7": "--...",
    "8": "---..",
    "9": "----."
};

// Play pig sound
function playMorseCode(code) {
    let index = 0;

    function playNextSymbol() {
        // only pig sound if in morse mode
        if (index < code.length && !isPlaying && toggleBtn.innerText === "Digital Mode") {
            const symbol = code[index];
            let sound = null;

            if (symbol === '.') {
                sound = shortSound;
            } else if (symbol === '-') {
                sound = longSound;
            }

            if (sound) {
                isPlaying = true; 
                sound.play();
                
                sound.onended = function() {
                    isPlaying = false;
                    index++;
                    playNextSymbol();
                };
            }
        }
    }

    playNextSymbol();
}

function updateTime() {
    let currentTime = new Date();
    let hours = String(currentTime.getHours()).padStart(2, "0");
    let minutes = String(currentTime.getMinutes()).padStart(2, "0");

    if (isMorse) {
        hrs.innerHTML = morseMap[hours.charAt(0)] + " | " + morseMap[hours.charAt(1)];
        min.innerHTML = morseMap[minutes.charAt(0)] + " | " + morseMap[minutes.charAt(1)];
        hrs.classList.add("morse");
        min.classList.add("morse");
        clock.classList.add("morse");

        let morseCode = morseMap[hours.charAt(0)] + morseMap[hours.charAt(1)] + morseMap[minutes.charAt(0)] + morseMap[minutes.charAt(1)];
        playMorseCode(morseCode);
    } else {
        hrs.innerHTML = hours;
        min.innerHTML = minutes;
        hrs.classList.remove("morse");
        min.classList.remove("morse");
        clock.classList.remove("morse");
    }
}

setInterval(updateTime, 1000);

// button to switch mode
toggleBtn.addEventListener("click", function () {
    isMorse = !isMorse;  
    toggleBtn.innerText = isMorse ? "Digital Mode" : "Morse Mode";  // switch mode
    updateTime();
});
