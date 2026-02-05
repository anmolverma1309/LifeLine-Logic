const mapRoad = document.getElementById("gameCanvas");
const ctx = mapRoad.getContext("2d");
mapRoad.width = window.innerWidth;
mapRoad.height = window.innerHeight;
let Suitable_for_Ambulance = 100;
let shakingEffect = 0;
let peoplereachedhospital = 0;

const breadth = 80;
const spect = 250;




class lightings{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.state = "green"; 

    }

    draw(){
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.state === "green" ? "#00ff00" : "#ff0000";
        ctx.fillStyle = this.state === "green" ? "#00ff00" :  "#ff0000";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
     }
}


class people{
    
    constructor(x, y, lane, type= "civilian"){
        this.x = x;
        this.y = y;
        this.lane = lane;
        this.type = type;
        let speedMultiplier = 1 + (peoplereachedhospital * 0.02);

        this.speed = (type === "ambulance" ? 3.5 : 2.2) * speedMultiplier;
        this.speed = Math.min (this.speed, 6);
        this.baseColor = type === "ambulance" ? "#ff0000" : "#55aaff";
        this.color = this.baseColor
        this.waitingTime = 0;
    }

    draw(){
        let shakeX = 0;
        let shakeY = 0;
        
        if (this.waitingTime > 200){
            shakeX = Math.random() * 3 - 1.5;
            shakeY = Math.random() * 3 -1.5;
        }
        ctx.fillRect(this.x - 15 + shakeX, this.y - 10 + shakeY, 30, 20);
        ctx.fillStyle = this.color;
        if(this.type === "ambulance"){
            let pulse = Math.sin(Date.now() / 100) > 0 ? "#ff0000" : "#0000ff";
            ctx.shadowBlur = 15;
            ctx.shadowColor = pulse;
            ctx.fillStyle = pulse;
        }
        if(this.lane  === "horizontal"){
         ctx.fillRect(this.x - 15, this.y - 10,30,20);

         if (this.waitingTime > 0){
            ctx.fillStyle = "#ff0000";
            ctx.shadowBlur = 10;
            ctx.shadowColor = "red";
            ctx.fillRect (this.x - 18, this.y - 8, 4, 4);
            ctx.fillRect (this.x - 18, this.y + 4, 4, 4);
         }
        }else {
            ctx.fillRect(this.x - 10, this.y - 15,20,30);
            if (this.waitingTime > 0){
                ctx.fillStyle = "r#ff0000";
                ctx.shadowBlur = 10;
                ctx.shadowColor = "red";
                ctx.fillRect(this.x - 8, this.y - 18,4,4);
                ctx.fillRect(this.x + 4, this.y - 18, 4, 4);
            }
        }
        ctx.shadowBlur = 0;
        
    }

    

    move(){
        let shouldStop = false;
        if (this.type !== "ambulance"){
            lights.forEach(light => {
                if (light.state === "red"){
                    const dist = (this.lane === "horizontal") ? (light.x - this.x) : (light.y - this.y);
                    const onSameRoad = (this.lane === "horizontal") ? (Math.abs(this.y - light.y) < 10 ) : (Math.abs(this.x - light.x) < 10);
                        if (onSameRoad && dist > 0 && dist < 65){
                            shouldStop = true;
                        }
                        
                    }
            });
        }

        peoples.forEach(othertraffic => {
            if (this === othertraffic) return;

            if (this.lane === othertraffic.lane){
                const dist = (this.lane === "horizontal") ? (othertraffic.x - this.x) : (othertraffic.y - this.y);
                const onSameRoad = (this.lane ===  "horizontal") ? (this.y === othertraffic.y) : (this.x === othertraffic.x);
                if (onSameRoad && dist > 0 && dist < 45){
                    shouldStop = true;
                }
            }
        });
                    
            
        
        

        if (!shouldStop){
           this.lane === "horizontal" ? (this.x += this.speed) : (this.y += this.speed);
           this.waitingTime = 0;
           this.color = this.baseColor;

        }else{
            this.waitingTime++;
            if (this.waitingTime > 150 && this.type !== "ambulance"){
                this.color = "#ffff00";
            }
        }
    }

}

let lights = [];
function setupLights(){
    lights = [];
    for (let x = spect/2; x <mapRoad.width; x += spect){
        for (let y = spect/2; y < mapRoad.height; y += spect){
            lights.push (new lightings(x,y));
        }
    }
}
setupLights();

let peoples = [];
function spawnCar(){
   const isAmbulance = Math.random() < 0.2;
   const type = isAmbulance ? "ambulance" : "civilian";
   if (Math.random() > 0.5){
    let randomY = (Math.floor(Math.random() * (mapRoad.height / spect)))* spect + spect/2;
    peoples.push(new people(0, randomY, "horizontal", type));

   }else{
    let randomX = (Math.floor(Math.random() * (mapRoad.width / spect))) * spect + spect/2;
    peoples.push (new people (randomX, 0 , "vertical", type));
   }
}

function dynamicSpawner(){
    spawnCar();
    let baseDelay = 2200;
    let reduction = peoplereachedhospital * 60;
    let finalDelay = Math.max(800, baseDelay - reduction);

    setTimeout(dynamicSpawner, finalDelay);

}
dynamicSpawner();

function drawCity(){
    let intensity = Math.min(peoplereachedhospital * 5, 100);
    ctx.shadowBlur = 10 + (intensity / 5);
    ctx.shadowColor = `hsl (180, 100%, ${50 + (intensity / 4)}%)`;
    ctx.fillStyle = "rgba(18, 18, 18, 0.4)";
    ctx.fillRect(0, 0, mapRoad.width, mapRoad.height);

    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00ffcc";

    ctx.fillStyle = "#2a2a2a";

    for (let y = spect/2; y < mapRoad.height; y += spect){
        ctx.fillRect(0, y - breadth/2, mapRoad.width, breadth);
    }

    
    for (let x = spect/2; x < mapRoad.width; x += spect){
        ctx.fillRect(x - breadth/2, 0, breadth, mapRoad.height);
    }
    ctx.restore();
}


function gaminglogic(){
    ctx.save();
    if (shakingEffect > 0){
        ctx.translate(Math.random() * shakingEffect - shakingEffect / 2, Math.random() * shakingEffect - shakingEffect / 2);
        shakingEffect *= 0.9;
        if (shakingEffect < 0.5) shakingEffect = 0;
    }
    drawCity();

    const ambulancePresent = peoples.some(traffic => traffic.type === "ambulance");
    if (ambulancePresent){
        ctx.strokeStyle = "rgba(255, 0, 0, 0.4)";
        ctx.lineWidth = 20;
        ctx.strokeRect(0, 0, mapRoad.width, mapRoad.height);
    }

    lights.forEach(l => l.draw());

    let stoppedCount = 0;

    peoples.forEach((traffic) => {
        traffic.move();
        traffic.draw();


        peoples.forEach((othertraffic) =>{
            if (traffic !== othertraffic && traffic.lane !== othertraffic.lane){
                const dist = Math.hypot(traffic.x - othertraffic.x, traffic.y - othertraffic.y);
                if (dist < 30){
                    Suitable_for_Ambulance -= 0.5;
                    traffic.color = "#ff8800"; 
                    traffic.speed = 1;     
                    shakingEffect = 10;  
                }
            }
        });
        
        if (traffic.waitingTime > 0 && traffic.type !== "ambulance"){
            stoppedCount++;
        }
    });

    peoples = peoples.filter(traffic => {
        const offScreen = traffic.x > mapRoad.width + 50 || traffic.x < -50 || traffic.y > mapRoad.height + 50 || traffic.y < -50;
        if (offScreen && traffic.type === "ambulance") peoplereachedhospital++;
        return !offScreen;
    });

    if (stoppedCount > 0){
        let patienceLevel = 0.01 + (peoplereachedhospital  * 0.001);
        Suitable_for_Ambulance -= patienceLevel * stoppedCount;
        
    } else {
        Suitable_for_Ambulance += 0.01;
    }
    
    Suitable_for_Ambulance = Math.max(0, Math.min(100, Suitable_for_Ambulance));
    document.getElementById("score").innerText = Math.floor(Suitable_for_Ambulance) + "%";
    document.getElementById("timer").innerText = peoplereachedhospital;

    if (Suitable_for_Ambulance <= 0){
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, mapRoad.width, mapRoad.height);

        let highScore = localStorage.getItem("trafficHighScore")  || 0;
        if (peoplereachedhospital > highScore){
            localStorage.setItem("trafficHighScore", peoplereachedhospital);
            highScore = peoplereachedhospital;
        }
        ctx.fillStyle = "white";
        ctx.font = "48px Orbitron";
        ctx.textAlign = "center";
        ctx.fillText("City Deadlock", mapRoad.width / 2, mapRoad.height / 2);
        ctx.font = "24px Arial";

        ctx.fillText("Lives Saved:" + peoplereachedhospital, mapRoad.width / 2, mapRoad.height / 2 +30);
        ctx.fillStyle = "#00ffcc";
        ctx.fillText("Best Record: " + highScore, mapRoad.width / 2, mapRoad.height / 2 + 70);

        ctx.fillStyle = "white";
        ctx.fillText("Click to Restart", mapRoad.width / 2, mapRoad.height / 2 + 130);
        return;
    }
    ctx.restore();

    requestAnimationFrame(gaminglogic);
}
gaminglogic();

window.addEventListener("mousedown", (e) =>{

    if (Suitable_for_Ambulance <= 0){
        Suitable_for_Ambulance = 100;
        peoplereachedhospital = 0;
        peoples = [];
        lights.forEach(l => l.state = "green");
        gaminglogic();
        return;
    }
    const rect = mapRoad.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    lights.forEach(light =>{
        const dist= Math.hypot(mouseX - light.x, mouseY - light.y);
        if (dist < 30){
            light.state = light.state === "green" ? "red" : "green";
            
        }
    });
});

