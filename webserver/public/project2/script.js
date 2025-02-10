let clock = document.querySelector('.clock'); 

let hrs = document.getElementById("hrs");
let min = document.getElementById("min");
let toggleBtn = document.getElementById("toggle-btn");
let isMorse = false;

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
    toggleBtn.innerText = isMorse ? "Digital Mode" : "Morse Mode";  // 2 Modes
    updateTime();
});


console.log("Minutes:", minutes);
console.log("Morse Minutes:", morseMap[minutes.charAt(0)], morseMap[minutes.charAt(1)]);
