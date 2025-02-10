// global variable to hold seconds
let seconds = 0;

const colors = ["red", "purple", "blue", "green", "yellow"];

window.onload = () => {
  // create an element and add to page:
  // step 1: create the element and store in a variable
  // step 2: modify that element as needed (does it need styling, does it need text?)
  // step 3: add that element to the page

  for (let i = 0; i < 50; i++) {
    // step 1:
    const span = document.createElement("span");
    const node = document.createTextNode(" created " + i);

    // step 2:
    span.appendChild(node); // adding text to element
    span.classList.add("text-body");
    // span.style.backgroundColor = "lightblue";
    span.style.backgroundColor = randomColor(colors);

    // step 3:
    document.body.appendChild(span);
  }

  // test
  //   randomColor(colors)

  // 2 parameters
  // 1. function (action) to be executed
  // 2. time that requires to pass before that function is executed (in ms)
  setInterval(time, 1000);
};

function time() {
  // console.log(seconds + ' second has passed')
  // // shorthand for increasing a variable by 1 is ++
  // // same as seconds = seconds + 1
  // seconds++

  const date = new Date();

  //   console.log(date.toLocaleTimeString());
  let allSpans = document.getElementsByClassName("text-body");
  // console.log(allSpans)
  for (let i = 0; i < allSpans.length; i++) {
    allSpans[i].textContent = date.toLocaleTimeString();
  }
}

// helper to do random color generation
function randomColor(arr) {
  // Math.random() -- returns a decimal between 0 and 1
  // console.log(Math.random())
  // convert index to not be a decimal
  // we need a proportion calculation to get 4
  // console.log(Math.random() * arr.length)
  // console.log(Math.floor(Math.random() * arr.length))
  let index = Math.floor(Math.random() * arr.length);
  return arr[index];
}