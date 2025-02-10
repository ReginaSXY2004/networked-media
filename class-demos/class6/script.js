window.onload = () => {
    let b1 = document.getElementById('myBtn')

    b1.addEventListener('click', ()=>{
        let div = document.getElementById('change')
        let c = div.classList
        if(c.contains("day")){
            c.remove('day')
            c.add('night')
            b1.textContent = "lights on"
        } else {
            c.remove('night')
            c.add('day')
            b1.textContent = "lights off"
        }
    })
    // shorthand for above
    // b1.onclick = () =>{
    // }

    handleTyping()
}

function handleTyping(){
    let typingDiv = document.getElementById("typing")

    document.addEventListener('keydown', (e)=>{
        console.log(e.key)

        let newText = e.key
        let oldText = typingDiv.innerHTML

        typingDiv.innerHTML = oldText + newText
    })
}