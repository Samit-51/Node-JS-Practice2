let preAmts = document.querySelectorAll('.amt');
let amt = document.getElementById('amt');
let profile = document.querySelector('.profile');
const socket = new WebSocket('ws://localhost:3060');
socket.onerror = () => {
    alert('Connection intrupped with the server try again later.');
    location.reload();
};
socket.onclose = () =>{
    alert('Connectioon closed with the server. Please try again later.')
    location.reload();
}
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.newAmount !== undefined) {
        document.getElementById('balance').textContent = data.newAmount;
        amt.value = '';
    } else if (data.error) {
        alert(data.error);
    }else{
        console.log('Invalid amount');
    }
};
preAmts.forEach(preAmt => {
    preAmt.addEventListener('click', () => {
        amt.value = Number(preAmt.innerHTML);
    });
});

function addAmount(){
    amount = parseInt(amt.value);
    const userId = document.querySelector('h2').textContent.match(/\[(.*?)\]/)[1];
    if(!amount || amount <= 0){
        alert('Invalid amount');
    }else{
        let flayer = document.createElement('p');
        flayer.setAttribute('class', 'flayer');
        flayer.textContent = `+ $${amount}`;
        profile.appendChild(flayer);
        const data = JSON.stringify({id:userId, amt:amount});
        socket.send(data);
        flayer.classList.add('animation')
    }
}

function clearValue(){
    amt.value = '';
}