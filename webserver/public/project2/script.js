// 获取 clock 元素
let clock = document.querySelector('.clock'); 

let hrs = document.getElementById("hrs");
let min = document.getElementById("min");
let toggleBtn = document.getElementById("toggle-btn");
let isMorse = false;  // 是否是摩斯模式

// 数字到摩斯电码映射
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

// 更新时间的函数
function updateTime() {
    let currentTime = new Date();
    let hours = String(currentTime.getHours()).padStart(2, "0");
    let minutes = String(currentTime.getMinutes()).padStart(2, "0");

    if (isMorse) {
        // 显示摩斯电码，确保分布在两侧
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



// 每秒更新时间
setInterval(updateTime, 1000);

// 切换模式的按钮
toggleBtn.addEventListener("click", function () {
    isMorse = !isMorse;  // 反转模式
    toggleBtn.innerText = isMorse ? "Digital Mode" : "Morse Mode";  // 切换按钮文本
    updateTime();  // 立即更新一次
});


console.log("Minutes:", minutes);
console.log("Morse Minutes:", morseMap[minutes.charAt(0)], morseMap[minutes.charAt(1)]);
