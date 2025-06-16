var myGamePiece;
var platforms = [];
var myScore;
var startButton;
var guideButton;
var restartButton;
var gameStarted = false;
var gameAreaOffset = 0;
var lastPlatformY = 0;
var currentLevel = 0;
var maxLives = 10;
var playerLives = maxLives;
var lifeSquares = [];
var isEnd = false;
var fixedWidth = 120;
var fixedVerticalGap = 180;
var range = 0.4;
var amount = 2;
var Rate = 0.1; 
var stickyRate = 0.1;
var stickyJumpRate = 0.85;
var jumpHeight = 12;

// 初始化遊戲環境
function initGame() {
    isEnd = false;
    myGameArea.start();
    // 創建開始遊戲按鈕&指導按鈕
    startButton = new Button(150, 50, "blue", 
                            myGameArea.canvas.width/2 - 75, 
                            myGameArea.canvas.height/2 - 25);
    guideButton = new Button(150, 50, "green",
                            myGameArea.canvas.width/2 - 75, 
                            myGameArea.canvas.height/2 + 35);
    renderStartScreen();
}

// 渲染開始畫面
function renderStartScreen(){
    myGameArea.clear();
    startButton.update();
    guideButton.update();

    //標題
    var ctx = myGameArea.context;
    ctx.font = "40px Consolas"; 
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("無限跳躍",
                myGameArea.canvas.width/2,
                myGameArea.canvas.height/2 - 100);

    // 開始按鈕
    var ctx = myGameArea.context;
    ctx.font = "20px Consolas";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("點擊開始遊戲", 
                myGameArea.canvas.width/2,  
                myGameArea.canvas.height/2 + 7);    

    // 指導按鈕
    var ctx = myGameArea.context;
    ctx.font = "20px Consolas";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("遊戲說明", 
                myGameArea.canvas.width/2, 
                myGameArea.canvas.height/2 + 67);
}

// 遊戲區塊
var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function() {
        this.canvas.width = 1120;
        this.canvas.height = 630;
        this.context = this.canvas.getContext("2d");
        document.getElementById("game").appendChild(this.canvas);
        this.frameNo = 0;
        
        // 監測點擊&按鍵
        this.canvas.addEventListener('click', handleClick);

        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            ArrowUp: false,
            ' ': false,
            'a': false,
            'A': false,
            'd': false,
            'D': false,
            'w': false,
            'W': false
        }; 

        window.addEventListener('keydown', (e) => {
            for(let i = 0; i < platforms.length; i++){
                this.playerOnPlatform = false;
                if (myGamePiece.isOnPlatform(platforms[i])) {
                    this.playerOnPlatform = true;
                    break;
                }
            }
            if (gameStarted && (e.key === ' ' || e.key === 'ArrowUp' ||
                e.key === 'w' || e.key === 'W') && this.playerOnPlatform && myGamePiece.speedY === 0) {
                myGamePiece.jump();
                this.playerOnPlatform = false;
            }
            if (gameStarted && this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = true;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (gameStarted && this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = false;
            }
        });
        
        // 玩家是否站在平台上的狀態
        this.playerOnPlatform = false;
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

// 開始遊戲
function startGame() {
    gameStarted = true;
    isEnd = false;
    gameAreaOffset = 0;
    currentLevel = 0;
    playerLives = maxLives;
    myScore = new Component("30px", "Consolas", "black",
                            myGameArea.canvas.width - 150, 40, "text");
    myGamePiece = new block();
    platforms = [];

    // 大平台
    generatePlatformsAtHeight(myGameArea.canvas.height - 20, true, false);
    
    // 初始平台
    for (let i = 0; i < 10; i++) {
        const y = myGameArea.canvas.height - fixedVerticalGap - (i * fixedVerticalGap);
        generatePlatformsAtHeight(y, false, false);
    }

    // 確保玩家站在地面上
    myGamePiece.y = myGameArea.canvas.height - 20 - myGamePiece.height;
    myGamePiece.gravitySpeed = 0;
    myGameArea.playerOnPlatform = true;

    // 初始生命值
    lifeSquares = [];
    for (let i = 0; i < maxLives; i++) {
        const lifeSquare = new Component(20, 20, "red",
                                        myGameArea.canvas.width - 90 - i * 30, 70);
        lifeSquares.push(lifeSquare);
    }

    myGameArea.interval = setInterval(updateGameArea, 20);
}

// 處理點擊事件
function handleClick(event) {
    var rect = myGameArea.canvas.getBoundingClientRect();
    var mouseX = event.clientX - rect.left;
    var mouseY = event.clientY - rect.top;
    
    // 重新開始
    if (isEnd && restartButton && restartButton.isClicked(mouseX, mouseY)) { 
        console.log("回到初始畫面");
        
        // 停止遊戲
        if (myGameArea.interval) {
            clearInterval(myGameArea.interval);
            myGameArea.interval = null;
        }
        
        // 重置狀態
        myGamePiece = null;
        platforms = [];
        lifeSquares = [];
        myScore = null;
        gameStarted = false;
        gameAreaOffset = 0;
        lastPlatformY = 0;
        currentLevel = 0;
        playerLives = maxLives;
        
        // 重置遊戲
        initGame();
        return;
    }
    
    // 遊戲進行中不處理其他點擊
    if (gameStarted) {
        return;
    }
    
    // 檢查開始畫面的按鈕
    if (startButton && startButton.isClicked(mouseX, mouseY)) {
        console.log("開始新遊戲");
        startGame();
    }
    
    // 檢查說明按鈕
    else if (guideButton && guideButton.isClicked(mouseX, mouseY)) {
        if (!isEnd) {
            alert("遊戲說明：\n\n" +
            "1. 使用左/右鍵或A/D鍵控制玩家移動。\n" +
            "2. 使用空格鍵/上鍵/W鍵跳躍。\n" +
            "3. 目標是努力向上跳，避免掉下去。\n" +
            "4. 每次掉落會減少一條生命，生命值歸零時遊戲結束。\n" +
            "5. 每上升一層計算為一分，下落不扣分，遊戲結束時顯示得分。\n" +
            "6. 不同顏色的平台有不同效果。\n");
        }
    }
}

// 遊戲結束
function gameOver() {
    clearInterval(myGameArea.interval);
    gameStarted = false;
    isEnd = true;
    
    // 顯示遊戲結束畫面
    myGameArea.clear();
    var ctx = myGameArea.context;
    ctx.font = "40px Consolas";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("遊戲結束", 
                myGameArea.canvas.width/2, 
                myGameArea.canvas.height/2 - 50);
    
    ctx.font = "30px Consolas";
    ctx.fillStyle = "black";
    ctx.fillText("得分: " + currentLevel, 
                myGameArea.canvas.width/2, 
                myGameArea.canvas.height/2);
    
    // 重新開始按鈕
    restartButton = new Button(150, 50, "purple",
                            myGameArea.canvas.width/2 - 75, 
                            myGameArea.canvas.height/2 + 35);
    restartButton.update();
    
    ctx.font = "20px Consolas";
    ctx.fillStyle = "white";
    ctx.fillText("回到初始畫面", 
                myGameArea.canvas.width/2, 
                myGameArea.canvas.height/2 + 67);
}

function updateGameArea() {
    myGameArea.clear();
    myGameArea.frameNo += 1;
    
    // 處理按鍵
    myGamePiece.speedX = - myGamePiece.tendleft * 5 + myGamePiece.tendright * 5;
    if (myGameArea.keys.ArrowLeft || myGameArea.keys.a || myGameArea.keys.A) {
        myGamePiece.speedX = -5 - myGamePiece.tendleft * 5 + myGamePiece.tendright * 5;
    }
    if (myGameArea.keys.ArrowRight || myGameArea.keys.d || myGameArea.keys.D) {
        myGamePiece.speedX = 5 - myGamePiece.tendleft * 5 + myGamePiece.tendright * 5;
    }
    
    // 掉出畫面
    if (myGamePiece.y > myGameArea.canvas.height) {
        playerLives--;
        
        // 結束遊戲
        if (playerLives <= 0) {
            gameOver();
            return;
        }
        
        // 找最低平台
        let lowestPlatform = null;
        let lowestY = -1;

        // 確定平台在畫面裡
        for (let i = 0; i < platforms.length; i++) {
            if (platforms[i].y > 0 && 
                platforms[i].y < myGameArea.canvas.height && 
                platforms[i].width < myGameArea.canvas.width) {
                
                if (platforms[i].y > lowestY) {
                    lowestPlatform = platforms[i];
                    lowestY = platforms[i].y;
                }
            }
        }
        
        
        myGamePiece.y = lowestPlatform.y - myGamePiece.height;
        myGamePiece.x = lowestPlatform.x + lowestPlatform.width / 2 - myGamePiece.width / 2;
        myGamePiece.gravitySpeed = 0;
        myGameArea.playerOnPlatform = true;
        myGamePiece.setHighlight(2000);
    }

    

    // 畫面隨玩家上升
    if (myGamePiece.y < myGameArea.canvas.height / 3) {
        const offset = myGameArea.canvas.height / 3 - myGamePiece.y;
        gameAreaOffset += offset;
        myGamePiece.y += offset;
        
        // 把所有平台移上去
        for (let i = 0; i < platforms.length; i++) {
            platforms[i].y += offset;
        }
        
        // 計算層數
        const newLevel = Math.floor(gameAreaOffset / fixedVerticalGap);
        if (newLevel > currentLevel) {
            currentLevel = newLevel;
        }
    }
    
    // 移除平台
    for (let i = platforms.length - 1; i >= 0; i--) {
        if (platforms[i].y > myGameArea.canvas.height + 100) {
            platforms.splice(i, 1);
        }
    }
    
    // 確保足夠平台
    ensurePlatforms();
    
    // 更新平台
    for (let i = 0; i < platforms.length; i++) {
        platforms[i].update();
    }
    
    // 更新玩家位置
    myGamePiece.newPos();
    
    // 檢查玩家是否在平台上
    for (let i = 0; i < platforms.length; i++) {
        // 檢查碰撞
        if (myGamePiece.gravitySpeed > 0) {
            if (myGamePiece.isOnPlatform(platforms[i])) {
                myGamePiece.gravitySpeed = 0;
                myGamePiece.y = platforms[i].y - myGamePiece.height;
                myGameArea.playerOnPlatform = true;
                
                // 檢查是否是藍色平台
                if (platforms[i].color === "blue" && !platforms[i].isBroken) {
                    platforms[i].isBroken = true;
                    platforms[i].color = "darkblue";
                    
                    // 記錄要刪除的平台
                    const platformToRemove = platforms[i];
                    
                    // 等待一段時間後刪除
                    setTimeout(() => {
                        const indexToRemove = platforms.indexOf(platformToRemove);
                        if (indexToRemove !== -1) {
                            platforms.splice(indexToRemove, 1);
                        }
                    }, 800); // 可以調整等待時間
                }

                // 檢查是否是綠色平台
                if (platforms[i].color === "lime") {
                    myGamePiece.jumpHeight = jumpHeight * stickyJumpRate;
                }
                // 非黏性平台，恢復正常跳躍高度
                else {
                
                    myGamePiece.jumpHeight = jumpHeight;
                }

                // 檢查是否是紫色平台
                if (platforms[i].color === "purple") {
                    myGamePiece.isDark = true;
                }
                else{
                    myGamePiece.isDark = false;
                }
                
                // 檢查是否是黑色平台
                if(platforms[i].color === "black") {
                    myGamePiece.tendleft = true;
                    setTimeout(() => {myGamePiece.tendleft = false;},500);
                }
                

                //檢查是否是白色平台
                if(platforms[i].color === "white") {
                    myGamePiece.tendright = true;
                    setTimeout(() => {myGamePiece.tendright = false;},500);
                }
                

                break;
            }
        }
    }     
    
    // 更新玩家
    myGamePiece.update();
    
    // 更新分數 - 考慮 gameAreaOffset 的累積效果
    const playerHeightFromGround = myGameArea.canvas.height - myGamePiece.y - myGamePiece.height + gameAreaOffset;
    const currentPlayerLevel = Math.floor(playerHeightFromGround / fixedVerticalGap);
    
    // 只有上升才更新分數
    if (currentPlayerLevel > currentLevel) {
        currentLevel = currentPlayerLevel;
    }
    
    myScore.text = "層數: " + (currentLevel >= 0 ? currentLevel : 0);
    myScore.update();
    
    // 更新生命值
    updateLifeSquares();
}

// 更新生命值
function updateLifeSquares() {
    lifeSquares.forEach((square, index) => {
        if (index < playerLives) {
            square.visible = true;
            square.update();
        } else {
            square.visible = false;
        }
    });
}

// 確保足夠平台
function ensurePlatforms() {
    // 不夠，生成新平台
    if (platforms.length === 0) {
        // 生成地面平台
        generatePlatformsAtHeight(myGameArea.canvas.height - 20, true, true);
    }
    
    // 移除低於畫面的平台
    for (let i = platforms.length - 1; i >= 0; i--) {
        if (platforms[i].y > myGameArea.canvas.height + 100) {
            platforms.splice(i, 1);
        }
    }
    
    // 檢查最高的平台
    let highestY = myGameArea.canvas.height;
    for (let i = 0; i < platforms.length; i++) {
        if (platforms[i].y < highestY) {
            highestY = platforms[i].y;
        }
    }
    
    // 創更多平台
    while (highestY > 0) {
        // 使用固定的垂直間距
        const newY = highestY - fixedVerticalGap;
        
        // 使用統一的平台生成函數，允許更新層數
        generatePlatformsAtHeight(newY, false, true);
        
        highestY = newY;
        
        // 停止生成
        if (newY < -500) {
            break;
        }
    }
}

// 通用平台生成函數
function generatePlatformsAtHeight(y, isGround = false, updateLevel = true) {
    if (isGround) {
        // 地面平台
        platforms.push(new platform(myGameArea.canvas.width, 20, "gray", 0, y));
    } 
    else {
        // 正常平台生成
        const platformCount = Math.floor(Math.random() * amount) + 1;
        const screenWidth = myGameArea.canvas.width;
        const sectionWidth = screenWidth / platformCount;
        
        for (let j = 0; j < platformCount; j++) {
            // 區域範圍
            const sectionStart = j * sectionWidth;
            const sectionEnd = (j + 1) * sectionWidth;
            const sectionCenter = (sectionStart + sectionEnd) / 2;
            
            // 平台隨機偏移
            const maxOffset = sectionWidth * range;
            const randomOffset = (Math.random() * maxOffset * 2) - maxOffset;
            const x = sectionCenter - (fixedWidth / 2) + randomOffset;
            const randomColor = ["orange", "purple", "lime", "blue", "black", "white"];
            
            // 創建新平台機率
            if(currentLevel === 1000){
                ctx.fillStyle = "gold";
                ctx.font = "30px Consolas";
                ctx.fillText("恭喜你達到1000層!", myGameArea.canvas.width / 2, myGameArea.canvas.height / 2);
            }
            if(currentLevel === 997){
                platforms.push(new platform(myGameArea.canvas.width, 15, "gold", x, y));
            }
            else if (currentLevel > 500) {
                if( Math.random() < 0.2) {
                    platforms.push(new platform(fixedWidth, 15, "blue", x, y));
                }
                else if( Math.random() < 0.4) {
                    platforms.push(new platform(fixedWidth, 15, "lime", x, y));
                }
                else if( Math.random() < 0.6) {
                    platforms.push(new platform(fixedWidth, 15, "purple", x, y));
                }
                else if( Math.random() < 0.8) {
                    platforms.push(new platform(fixedWidth, 15, "white", x, y));
                }
                else if( Math.random() < 1) {
                    platforms.push(new platform(fixedWidth, 15, "black", x, y));
                }
                else {
                    platforms.push(new platform(fixedWidth, 15, "orange", x, y));
                }
            }
            else if( currentLevel > 400 && Math.random() < Rate * ((currentLevel - 400) / 10)) {
                platforms.push(new platform(fixedWidth, 15, "blue", x, y));
            }
            else if( currentLevel > 300 && Math.random() < Rate * ((currentLevel - 300) / 10)) {
                platforms.push(new platform(fixedWidth, 15, "lime", x, y));
            }
            else if( currentLevel > 200 && Math.random() < Rate * ((currentLevel - 200) / 10)) {
                platforms.push(new platform(fixedWidth, 15, "purple", x, y));
            }
            else if( currentLevel > 100 && Math.random() < Rate * ((currentLevel - 100) / 10)) {
                platforms.push(new platform(fixedWidth, 15, "white", x, y));
            }
            else if( currentLevel > 10 && Math.random() < Rate * (currentLevel / 10)) {
                platforms.push(new platform(fixedWidth, 15, "black", x, y));
            }
            else {
                platforms.push(new platform(fixedWidth, 15, "orange", x, y));
            }
            
        }
    }
    
    // 計算與地面的距離並轉換為層數
    const distanceFromGround = myGameArea.canvas.height - y;
    const levelForThisPlatform = Math.floor(distanceFromGround / fixedVerticalGap);
    
    // 更新當前最高層數
    if (updateLevel && levelForThisPlatform > currentLevel) {
        currentLevel = levelForThisPlatform;
    }
    
    return y;
}

// 定義組成
class Component {
    constructor(width, height, color, x, y, type) {
        this.type = type;
        this.score = 0;
        this.width = width;
        this.height = height;
        this.speedX = 0;
        this.speedY = 0;    
        this.x = x;
        this.y = y;
        this.gravity = 0;
        this.gravitySpeed = 0;
        this.color = color;
        this.image = null;
        this.visible = true;
    }
    
    // 更新內容
    update() {
        const ctx = myGameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = this.color;
            ctx.fillText(this.text, this.x, this.y);
        }
        else if (this.type == "image") {
            if (this.image && this.image.complete) {
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            }
            else {
                ctx.fillStyle = this.color || "red";
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    
    // 速度相關
    newPos() {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
    }
}

//玩家方塊
class block extends Component {
    constructor(x, y, imageSrc) {
        const defaultX = x || myGameArea.canvas.width / 2 - 15;
        const defaultY = y || myGameArea.canvas.height - 60;
        super(30, 30, "red", defaultX, defaultY, "image");
        this.gravity = 0.2;
        this.image = null;
        this.jumpHeight = 12;
        this.highlightEffect = 0;
        this.isHighlighted = false;
        this.isDark = false;
        this.tendleft = false;
        this.tendright = false;
        this.speedX = - this.tendleft * 5 + this.tendright * 5;
        this.speedY = 0;
        
        if (imageSrc) {
            this.image = new Image();
            this.image.src = imageSrc;
        }
    }

    // 站在平台上
    isOnPlatform(platform) {
        const myBottom = this.y + this.height;
        const myBottomPrev = myBottom - this.gravitySpeed;
        const myLeft = this.x;
        const myRight = this.x + this.width;
        
        // 檢查穿模
        if (myBottomPrev <= platform.y && myBottom >= platform.y) {
            if (myRight > platform.x && myLeft < platform.x + platform.width) {
                return true;
            }
        }
        
        // 容錯
        if (myBottom >= platform.y && myBottom <= platform.y + 15) {
            if (myRight > platform.x && myLeft < platform.x + platform.width) {
                return true;
            }
        }
              
        return false;
    }

    // 上躍
    jump() {
        this.gravitySpeed = -this.jumpHeight;
    }

    // 下墜
    fall() {
        this.gravitySpeed += this.gravity;
    }
    
    newPos() {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        
        // 穿越左右邊界
        if (this.x < 0) {
            this.x = myGameArea.canvas.width - this.width;
        }
        if (this.x > myGameArea.canvas.width - this.width) {
            this.x = 0;
        }
    }

    // 閃光&致盲
    update() {
        const ctx = myGameArea.context;
        
        //閃光
        if (this.isHighlighted) {
            this.highlightEffect += 0.1;
            if (this.highlightEffect > Math.PI * 2) {
                this.highlightEffect = 0;
            }
            
            // 閃爍顏色
            const intensity = Math.sin(this.highlightEffect) * 0.5 + 0.5;
            const borderColor = `rgb(255, ${Math.floor(165 + intensity * 90)}, 0)`;
            
            // 閃爍邊框
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 4;
            ctx.strokeRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
            
            // 指向箭頭
            const arrowSize = 20;
            ctx.fillStyle = borderColor;
            
            // 箭頭
            if (this.y > myGameArea.canvas.height / 2) {
                ctx.beginPath();
                ctx.moveTo(this.x + this.width/2, this.y - 20);
                ctx.lineTo(this.x + this.width/2 - arrowSize/2, this.y - 20 - arrowSize);
                ctx.lineTo(this.x + this.width/2 + arrowSize/2, this.y - 20 - arrowSize);
                ctx.closePath();
                ctx.fill();
            }

            else {
                ctx.beginPath();
                ctx.moveTo(this.x + this.width/2, this.y + this.height + 20);
                ctx.lineTo(this.x + this.width/2 - arrowSize/2, this.y + this.height + 20 + arrowSize);
                ctx.lineTo(this.x + this.width/2 + arrowSize/2, this.y + this.height + 20 + arrowSize);
                ctx.closePath();
                ctx.fill();
            }
        }

        //致盲
        if(this.isDark) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
            ctx.fillRect(0, 0, myGameArea.canvas.width, myGameArea.canvas.height);
        }

        super.update();
    }
    
    // 高亮
    setHighlight(duration) {
        this.isHighlighted = true;
        
        // 關閉效果
        setTimeout(() => {
            this.isHighlighted = false;
        }, duration);
    }
}

// 按鈕
class Button {
    constructor(width, height, color, x, y) {
        this.width = width;
        this.height = height;
        this.color = color;
        this.x = x;
        this.y = y;
    }

    update() {
        const ctx = myGameArea.context;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    // 檢查點擊位置
    isClicked(mouseX, mouseY) {
        return mouseX >= this.x && mouseX <= this.x + this.width &&
               mouseY >= this.y && mouseY <= this.y + this.height;
    }
}

// 平台
class platform extends Component {
    constructor(width, height, color, x, y) {
        super(width, height, color, x, y);
        this.color = color;
        this.type = "platform";
        this.isBroken = false;
    }

    // 更新平台狀態
    update() {
        const ctx = myGameArea.context;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        super.update();
    }
}