// window.onload is very similar to p5 setup function
// it is called once when the page has finished loading
window.onload = () => {
    // printing to console of browser
    console.log('page has loaded')

    init()
}

function init(){
    alert('called the init function!')

    // grabbing a specific element using the ID
    document.getElementById('container').style.backgroundColor = 'lightpink'
}