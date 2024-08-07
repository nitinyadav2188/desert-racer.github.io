const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const header = document.getElementById('info');
const retryContainer = document.getElementById('retry-container');
const retryBtn = document.getElementById('retryBtn');
const introScreen = document.getElementById('intro-screen');
const startGameBtn = document.getElementById('start-game');
const acceptTermsCheckbox = document.getElementById('accept-terms');

// Load audio files
const backgroundMusic = new Audio('music/background.mp3');
const coinSound = new Audio('music/coin.mp3');
const crashSound = new Audio('music/crash.mp3');

backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial call to set the size

const carImage = new Image();
carImage.src = 'car.png'; // Update karo with actual path to the car image

const coinImage = new Image();
coinImage.src = 'coin.jpg'; // Update it with the actual path to the coin image

const plantImage = new Image();
plantImage.src = 'tree.png'; // Update it with the actual path to the plant image

const camelImage = new Image();
camelImage.src = 'cat.png'; // Update it with the actual path to the camel image

let car = { x: 50, y: canvas.height / 2, width: 80, height: 50, speed: 5 };
let coins = [];
let plants = [];
let camels = [];
let keys = {};
let level = 1;
let coinsCollected = 0;
let coinsNeeded = 5;
let gameOver = false;
let message = '';

function initializeLevel() {
    coins = [];
    plants = [];
    camels = [];
    gameOver = false;
    message = '';

    // Generate coins ensuring they are not overlapping
    while (coins.length < coinsNeeded) {
        let coinX = Math.random() * (canvas.width - 20);
        let coinY = Math.random() * (canvas.height - 20);
        let overlap = false;

        // Check for overlap with existing coins
        for (let coin of coins) {
            if (Math.abs(coinX - coin.x) < 20 && Math.abs(coinY - coin.y) < 20) {
                overlap = true;
                break;
            }
        }

        if (!overlap) {
            coins.push({ x: coinX, y: coinY });
        }
    }

    // Generate plants and camels
    for (let i = 0; i < level * 3; i++) {
        let plantX = Math.random() * (canvas.width - 30);
        let plantY = Math.random() * (canvas.height - 30);
        let camelX = Math.random() * (canvas.width - 50);
        let camelY = Math.random() * (canvas.height - 50);
        
        plants.push({ x: plantX, y: plantY });
        camels.push({ x: camelX, y: camelY });
    }

    updateHeader();
}

function updateHeader() {
    header.innerHTML = `Level: ${level} | Coins Collected: ${coinsCollected} | Coins Needed: ${coinsNeeded}`;
}

function update() {
    if (gameOver) return;

    if (keys['ArrowRight']) car.x += car.speed;
    if (keys['ArrowLeft']) car.x -= car.speed;
    if (keys['ArrowUp']) car.y -= car.speed;
    if (keys['ArrowDown']) car.y += car.speed;

    if (car.x < 0 || car.x + car.width > canvas.width || car.y < 0 || car.y + car.height > canvas.height) {
        crashSound.play(); // Play crash sound
        message = 'You hit the wall!'; // Failure message
        gameOver = true;
        return;
    }

    coins = coins.filter(coin => {
        if (car.x < coin.x + 20 &&
            car.x + car.width > coin.x &&
            car.y < coin.y + 20 &&
            car.y + car.height > coin.y) {
            coinsCollected++;
            coinSound.play(); // Play coin sound
            updateHeader(); // Update header immediately after collecting a coin
            return false;
        }
        return true;
    });

    if (plants.some(plant => {
        return car.x < plant.x + 30 &&
               car.x + car.width > plant.x &&
               car.y < plant.y + 30 &&
               car.y + car.height > plant.y;
    }) || camels.some(camel => {
        return car.x < camel.x + 50 &&
               car.x + car.width > camel.x &&
               car.y < camel.y + 50 &&
               car.y + car.height > camel.y;
    })) {
        crashSound.play(); // Play crash sound
        message = "I'm sorry, Babu!!"; // message on failure
        gameOver = true;
        return;
    }

    if (coins.length === 0) {
        level++;
        coinsCollected = 0;//Reset the coins collected for next level
        coinsNeeded *= 2;//double the coins needed for the next level
        if (level > 10) {
            message = 'Congratulations! You completed all levels!';
            gameOver = true;
        } else {
            initializeLevel();
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw walls
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Semi-transparent red for visibility
        ctx.fillRect(0, 0, canvas.width, 20); // Top wall
        ctx.fillRect(0, 0, 20, canvas.height); // Left wall
        ctx.fillRect(canvas.width - 20, 0, 20, canvas.height); // Right wall
        ctx.fillRect(0, canvas.height - 20, canvas.width, 20); // Bottom wall

    ctx.drawImage(carImage, car.x, car.y, car.width, car.height);

    coins.forEach(coin => {
        ctx.drawImage(coinImage, coin.x, coin.y, 20, 20);
    });

    plants.forEach(plant => {
        ctx.drawImage(plantImage, plant.x, plant.y, 30, 30);
    });

    camels.forEach(camel => {
        ctx.drawImage(camelImage, camel.x, camel.y, 50, 50);
    });

    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 50);
        retryContainer.style.display = 'block';
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    car = { x: 50, y: canvas.height / 2, width: 80, height: 50, speed: 5 };
    coinsCollected = 0;
    level = 1;
    coinsNeeded = 5;
    initializeLevel();
    retryContainer.style.display = 'none';
}

function startGame() {
    if (acceptTermsCheckbox.checked) {
        introScreen.style.display = 'none';
        canvas.style.display = 'block';
        backgroundMusic.play(); // Start background music
        gameLoop();
    } else {
        alert('You must accept the terms and conditions to start the game.');
    }
}
//touch screen k liye

function handleTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    // Clear previous keys
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
    keys['ArrowUp'] = false;
    keys['ArrowDown'] = false;

    // Improved touch controls
    if (touchX < canvas.width / 3) {
        keys['ArrowLeft'] = true;
    } else if (touchX > 2 * canvas.width / 3) {
        keys['ArrowRight'] = true;
    } else if (touchY < canvas.height / 3) {
        keys['ArrowUp'] = true; // Highlighted: Improved touch control for 'ArrowUp'
    } else if (touchY > 2 * canvas.height / 3) {
        keys['ArrowDown'] = true;
    }
}

function handleTouchMove(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    // Clear previous keys
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
    keys['ArrowUp'] = false;
    keys['ArrowDown'] = false;

    // Improved touch controls
    if (touchX < canvas.width / 3) {
        keys['ArrowLeft'] = true;
    } else if (touchX > 2 * canvas.width / 3) {
        keys['ArrowRight'] = true;
    } else if (touchY < canvas.height / 3) {
        keys['ArrowUp'] = true; // Highlighted: Improved touch control for 'ArrowUp'
    } else if (touchY > 2 * canvas.height / 3) {
        keys['ArrowDown'] = true;
    }
}

function handleTouchEnd(event) {
    event.preventDefault();
    keys['ArrowUp'] = false;
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
    keys['ArrowDown'] = false;
}

//--------------------------------------->
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);

retryBtn.addEventListener('click', resetGame);
startGameBtn.addEventListener('click', startGame);

initializeLevel();
