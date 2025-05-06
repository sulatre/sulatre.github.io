var myGamePiece;
var myObstacles = [];
var myScore;
var startButton; // 新增開始按鈕
var gameStarted = false; // 追蹤遊戲是否已開始

// 初始化遊戲環境，但不立即開始遊戲
function initGame() {
    myGameArea.start();
    // 創建開始遊戲按鈕 (寬,高,顏色,x座標,y座標)
    startButton = new Component(150, 50, "blue", 
                              myGameArea.canvas.width/2 - 75, 
                              myGameArea.canvas.height/2 - 25);
    // 渲染開始畫面
    renderStartScreen();
}

// 渲染開始畫面
function renderStartScreen() {
    myGameArea.clear();
    // 畫開始按鈕
    startButton.update();
    
    // 添加文字「點擊開始遊戲」
    var ctx = myGameArea.context;
    ctx.font = "20px Consolas";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("點擊開始遊戲", 
                myGameArea.canvas.width/2, 
                myGameArea.canvas.height/2 + 5);
}

//開始遊戲
function startGame() {
    gameStarted = true;
    
    //鳥
    myGamePiece = new Bird(10, 120, "bird.png");
    myGamePiece.gravity = 0.05;

    //分數
    myScore = new component("30px", "Consolas", "black", 280, 40, "text");
    // 開始遊戲循環
    myGameArea.interval = setInterval(updateGameArea, 20);
}

// 處理點擊事件
function handleClick(event) {
    // 如果遊戲尚未開始
    if (!gameStarted) {
        // 獲取點擊坐標相對於 canvas 的位置
        var rect = myGameArea.canvas.getBoundingClientRect();
        var mouseX = event.clientX - rect.left;
        var mouseY = event.clientY - rect.top;
        
        // 檢查是否點擊了開始按鈕
        if (mouseX >= startButton.x && 
            mouseX <= startButton.x + startButton.width &&
            mouseY >= startButton.y && 
            mouseY <= startButton.y + startButton.height) {
            startGame();
        }
    }
}

//遊戲區塊
var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 480;
        this.canvas.height = 270;
        this.context = this.canvas.getContext("2d");
        // 將 canvas 添加到 game div 中，而不是直接添加到 body
        document.getElementById("game").appendChild(this.canvas);
        this.frameNo = 0;
        
        // 添加點擊事件監聽器到 canvas
        this.canvas.addEventListener('click', handleClick);
                
        // 添加鍵盤事件監聽器
        window.addEventListener('keydown', function(e) {
            // 空白鍵的 keyCode 是 32
            if (e.keyCode === 32 || e.key === ' ') {
                // 防止空白鍵滾動頁面
                e.preventDefault();
                
                // 如果遊戲尚未開始，按空白鍵可以開始遊戲
                if (!gameStarted) {
                    myObstacles = []; // 清空障礙物
                    myGameArea.frameNo = 0; // 重置分數
                    startGame();
                } else if (gameStarted && myGamePiece) {
                    // 遊戲已開始時，空白鍵控制鳥飛行
                    accelerate(-0.2);
                }
            }
            
            // A 鍵的 keyCode 是 65 或 'a'
            if (e.keyCode === 65 || e.key === 'a' || e.key === 'A') {
                // 按下 A 鍵時，鳥向左移動
                if (gameStarted && myGamePiece) {
                    myGamePiece.speedX = -1;
                }
            }

            // D 鍵的 keyCode 是 68 或 'd'
            if (e.keyCode === 68 || e.key === 'd' || e.key === 'D') {
                // 按下 D 鍵時，鳥向右移動
                if (gameStarted && myGamePiece) {
                    myGamePiece.speedX = 1;
                }
            }

            // R 鍵的 keyCode 是 82
            if ((e.keyCode === 82 || e.key === 'r' || e.key === 'R') && !gameStarted) {
                // 重新開始遊戲
                myObstacles = []; // 清空障礙物
                myGameArea.frameNo = 0; // 重置分數
                startGame();
            }
        });
        
        window.addEventListener('keyup', function(e) {
            // 空白鍵釋放時
            if (e.keyCode === 32 || e.key === ' ') {
                if (gameStarted && myGamePiece) {
                    accelerate(0.05);
                }
            }
            
            // A 或 D 鍵釋放時
            if (e.keyCode === 65 || e.key === 'a' || e.key === 'A' || 
                e.keyCode === 68 || e.key === 'd' || e.key === 'D') {
                // 停止鳥的水平移動
                if (gameStarted && myGamePiece) {
                    myGamePiece.speedX = 0;
                }
            }
        });
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// 改用 ES6 class 語法定義 Component 類別 (物件導向示範)
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
        this.image = null; // 新增圖片屬性
    }
    
    update() {
        const ctx = myGameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = this.color;
            ctx.fillText(this.text, this.x, this.y);
        } else if (this.type == "image") {
            // 如果是圖片類型，則繪製圖片
            if (this.image && this.image.complete) {
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            } else {
                // 圖片未載入完成前，先用矩形代替
                ctx.fillStyle = this.color || "red";
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    
    newPos() {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.hitBoundary(); // 改為使用 hitBoundary 方法
    }
    
    hitBoundary() {
        // 檢查上邊界
        if (this.y < 0) {
            this.y = 0;
            this.gravitySpeed = 0;
        }
        
        // 檢查下邊界 (原有的 hitBottom 邏輯)
        const rockbottom = myGameArea.canvas.height - this.height;
        if (this.y > rockbottom) {
            this.y = rockbottom;
            this.gravitySpeed = 0;
        }
    }
    
    crashWith(otherobj) {
        // 使用更簡單、更可靠的碰撞檢測方法
        // 對鳥使用較小的碰撞半徑 (原始寬度的40%)
        const birdRadius = this.width * 0.4;
        
        // 計算鳥的中心點
        const birdX = this.x + (this.width / 2);
        const birdY = this.y + (this.height / 2);
        
        // 對管道使用矩形碰撞檢測 (更符合管道的形狀)
        const obstacleLeft = otherobj.x;
        const obstacleRight = otherobj.x + otherobj.width;
        const obstacleTop = otherobj.y;
        const obstacleBottom = otherobj.y + otherobj.height;
        
        // 計算鳥與管道矩形的最短距離
        let closestX = Math.max(obstacleLeft, Math.min(birdX, obstacleRight));
        let closestY = Math.max(obstacleTop, Math.min(birdY, obstacleBottom));
        
        // 計算鳥中心點到管道最近點的距離
        const dx = birdX - closestX;
        const dy = birdY - closestY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 如果距離小於鳥的半徑，則發生碰撞
        return distance < birdRadius;
    }
}

// 以下是一個繼承 Component 的子類示範
class Bird extends Component {
    constructor(x, y, imageSrc) {
        super(30, 30, "red", x, y, "image"); // 使用 image 類型
        this.gravity = 0.05;
        
        // 如果提供了圖片路徑，載入圖片
        if (imageSrc) {
            this.image = new Image();
            this.image.src = imageSrc;
        }
    }
    
    flap() {
        this.gravitySpeed = -1; // 實作鳥的飛翔邏輯
    }
}

// 保留原來的 component 函數以維持相容性
function component(width, height, color, x, y, type) {
    return new Component(width, height, color, x, y, type);
}

function updateGameArea() {
    var x, height, gap, minHeight, maxHeight, minGap, maxGap;
    for (i = 0; i < myObstacles.length; i += 1) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            // 當發生碰撞時，停止遊戲循環
            clearInterval(myGameArea.interval);
            // 顯示遊戲結束訊息
            var ctx = myGameArea.context;
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // 半透明黑色背景
            ctx.fillRect(0, 0, myGameArea.canvas.width, myGameArea.canvas.height);
            ctx.font = "30px Consolas";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("遊戲結束!", myGameArea.canvas.width / 2, myGameArea.canvas.height / 2);
            ctx.font = "20px Consolas";
            ctx.fillText("分數: " + myGameArea.frameNo, myGameArea.canvas.width / 2, myGameArea.canvas.height / 2 + 30);
            ctx.fillText("按 R 鍵重新開始", myGameArea.canvas.width / 2, myGameArea.canvas.height / 2 + 60);
            gameStarted = false;
            return;
        } 
    }
    myGameArea.clear();
    myGameArea.frameNo += 1;
    if (myGameArea.frameNo == 1 || everyinterval(150)) {
        x = myGameArea.canvas.width;
        minHeight = 20;
        maxHeight = 200;
        height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
        minGap = 50;
        maxGap = 200;
        gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);
        myObstacles.push(new component(10, height, "green", x, 0));
        myObstacles.push(new component(10, x - height - gap, "green", x, height + gap));
    }
    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].x += -1;
        myObstacles[i].update();
    }
    myScore.text="SCORE: " + myGameArea.frameNo;
    myScore.update();
    myGamePiece.newPos();
    myGamePiece.update();
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}

function accelerate(n) {
    // 只有在遊戲已開始時，加速功能才有效
    if (gameStarted && myGamePiece) {
        myGamePiece.gravity = n;
    }
}