let shortSound = new Audio('assets/PigShort.mp3');
let longSound = new Audio('assets/PigLong.mp3');
let clock = document.querySelector('.clock'); 

let hrs = document.getElementById("hrs");
let min = document.getElementById("min");
let toggleBtn = document.getElementById("toggle-btn");
let isMorse = false;
let isPlaying = false;  // 添加一个标志位，确保音效按顺序播放

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

// 播放摩斯电码声音
function playMorseCode(code) {
    let index = 0;

    // 播放下一个符号
    function playNextSymbol() {
        if (index < code.length && !isPlaying) {
            const symbol = code[index];
            let sound = null;

            // 根据符号选择播放短音或长音
            if (symbol === '.') {
                sound = shortSound;
            } else if (symbol === '-') {
                sound = longSound;
            }

            if (sound) {
                isPlaying = true; // 标记播放中
                sound.play();
                
                sound.onended = function() {
                    isPlaying = false; // 播放完后，标记播放完毕
                    index++;
                    playNextSymbol(); // 播放下一个符号
                };
            }
        }
    }

    // 启动播放
    playNextSymbol();
}

// 更新时钟
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

        // 播放摩斯电码的声音
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
    toggleBtn.innerText = isMorse ? "Digital Mode" : "Morse Mode";  // 2 Modes
    updateTime();
});
