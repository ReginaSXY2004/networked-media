window.onload = () => {
    console.log('script has loaded')
    
    let footer = document.createElement('footer')
    addElements(footer)
    document.body.append(footer)
};

async function addElements(e){
    let data = await fetch('/allpostsinjson')
    let formatData = await data.json()
    console.log(formatData)
}