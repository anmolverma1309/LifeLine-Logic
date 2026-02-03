const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let efficiency = 100;
let screenShake = 0;
let livesSaved = 0;

const roadWidth = 80;
const gridSpacing = 250;




class TrafficLight{
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


class Car{
    
    constructor(x, y, lane, type= "civilian"){
        this.x = x;
        this.y = y;
        this.lane = lane;
        this.type = type;
        let speedMultiplier = 1 + (livesSaved * 0.02);

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

        cars.forEach(otherCar => {
            if (this === otherCar) return;

            if (this.lane === otherCar.lane){
                const dist = (this.lane === "horizontal") ? (otherCar.x - this.x) : (otherCar.y - this.y);
                const onSameRoad = (this.lane ===  "horizontal") ? (this.y === otherCar.y) : (this.x === otherCar.x);
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
    for (let x = gridSpacing/2; x <canvas.width; x += gridSpacing){
        for (let y = gridSpacing/2; y < canvas.height; y += gridSpacing){
            lights.push (new TrafficLight(x,y));
        }
    }
}
setupLights();

let cars = [];
function spawnCar(){
   const isAmbulance = Math.random() < 0.2;
   const type = isAmbulance ? "ambulance" : "civilian";
   if (Math.random() > 0.5){
    let randomY = (Math.floor(Math.random() * (canvas.height / gridSpacing)))* gridSpacing + gridSpacing/2;
    cars.push(new Car(0, randomY, "horizontal", type));

   }else{
    let randomX = (Math.floor(Math.random() * (canvas.width / gridSpacing))) * gridSpacing + gridSpacing/2;
    cars.push (new Car (randomX, 0 , "vertical", type));
   }
}

function dynamicSpawner(){
    spawnCar();
    let baseDelay = 2200;
    let reduction = livesSaved * 60;
    let finalDelay = Math.max(800, baseDelay - reduction);

    setTimeout(dynamicSpawner, finalDelay);

}
dynamicSpawner();

function drawCity(){
    let intensity = Math.min(livesSaved * 5, 100);
    ctx.shadowBlur = 10 + (intensity / 5);
    ctx.shadowColor = `hsl (180, 100%, ${50 + (intensity / 4)}%)`;
    ctx.fillStyle = "rgba(18, 18, 18, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00ffcc";

    ctx.fillStyle = "#2a2a2a";

    for (let y = gridSpacing/2; y < canvas.height; y += gridSpacing){
        ctx.fillRect(0, y - roadWidth/2, canvas.width, roadWidth);
    }

    
    for (let x = gridSpacing/2; x < canvas.width; x += gridSpacing){
        ctx.fillRect(x - roadWidth/2, 0, roadWidth, canvas.height);
    }
    ctx.restore();
}


function gameLoop(){
    ctx.save();
    if (screenShake > 0){
        ctx.translate(Math.random() * screenShake - screenShake / 2, Math.random() * screenShake - screenShake / 2);
        screenShake *= 0.9;
        if (screenShake < 0.5) screenShake = 0;
    }
    drawCity();

    const ambulancePresent = cars.some(car => car.type === "ambulance");
    if (ambulancePresent){
        ctx.strokeStyle = "rgba(255, 0, 0, 0.4)";
        ctx.lineWidth = 20;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }

    lights.forEach(l => l.draw());

    let stoppedCount = 0;

    cars.forEach((car) => {
        car.move();
        car.draw();


        cars.forEach((otherCar) =>{
            if (car !== otherCar && car.lane !== otherCar.lane){
                const dist = Math.hypot(car.x - otherCar.x, car.y - otherCar.y);
                if (dist < 30){
                    efficiency -= 0.5;
                    car.color = "#ff8800"; 
                    car.speed = 1;     
                    screenShake = 10;  
                }
            }
        });
        
        if (car.waitingTime > 0 && car.type !== "ambulance"){
            stoppedCount++;
        }
    });

    cars = cars.filter(car => {
        const offScreen = car.x > canvas.width + 50 || car.x < -50 || car.y > canvas.height + 50 || car.y < -50;
        if (offScreen && car.type === "ambulance") livesSaved++;
        return !offScreen;
    });

    if (stoppedCount > 0){
        let patienceLevel = 0.01 + (livesSaved  * 0.001);
        efficiency -= patienceLevel * stoppedCount;
        
    } else {
        efficiency += 0.01;
    }
    
    efficiency = Math.max(0, Math.min(100, efficiency));
    document.getElementById("score").innerText = Math.floor(efficiency) + "%";
    document.getElementById("timer").innerText = livesSaved;

    if (efficiency <= 0){
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let highScore = localStorage.getItem("trafficHighScore")  || 0;
        if (livesSaved > highScore){
            localStorage.setItem("trafficHighScore", livesSaved);
            highScore = livesSaved;
        }
        ctx.fillStyle = "white";
        ctx.font = "48px Orbitron";
        ctx.textAlign = "center";
        ctx.fillText("City Deadlock", canvas.width / 2, canvas.height / 2);
        ctx.font = "24px Arial";

        ctx.fillText("Lives Saved:" + livesSaved, canvas.width / 2, canvas.height / 2 +30);
        ctx.fillStyle = "00ffcc";
        ctx.fillText("Best Record: " + highScore, canvas.width / 2, canvas.height / 2 + 70);

        ctx.fillStyle = "white";
        ctx.fillText("Click to Restart", canvas.width / 2, canvas.height / 2 + 130);
        return;
    }
    ctx.restore();

    requestAnimationFrame(gameLoop);
}
gameLoop();

window.addEventListener("mousedown", (event) =>{

    if (efficiency <= 0){
        efficiency = 100;
        livesSaved = 0;
        cars = [];
        lights.forEach(l => l.state = "green");
        gameLoop();
        return;
    }
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    lights.forEach(light =>{
        const dist= Math.hypot(mouseX - light.x, mouseY - light.y);
        if (dist < 30){
            light.state = light.state === "green" ? "red" : "green";
            
        }
    });
});