const main = document.getElementById("container");
let aLotto = [];
for(let i=0; i<6; i++){
    o = document.createElement('div');
    o.setAttribute('id', 'lotto'+(i+1));
    //console.log('lotto'+(i+1));
    o.setAttribute('class', 'lottery');
    o.innerText = i+1;
    aLotto.push(o);
    main.appendChild(o);
}

let aTimer = [5000, 2000, 2000, 2000, 2000, 2000];
let start = document.getElementById("start");
let running = 0;
start.addEventListener('click', function(){
    if(running == 0){
        running = 1;
    }
    else return 0;
    let now = [];
    let count = 0;
    let offset = 0;
    let timer = setInterval(function(){
        count = Math.floor(Math.random()*(6-offset))+offset;
        now[count] = Math.floor(Math.random()*49)+1;
        //console.log(now[count]);
        for(let i=0;i<6;i++){
            if(i!=count) {
                if(now[i]==now[count]) break;
            }
            if(i==5) aLotto[count].innerText = now[count];
        }
        console.log(offset);
    }, 10)

    function lotto(){
        offset++;
        //console.log(offset);
        if(offset<6) setTimeout(lotto, aTimer[offset]);
            else {
                clearTimeout(timer);
                running = 0;
            }
    }
    setTimeout(lotto, aTimer[offset]);
});