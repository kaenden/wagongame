let goldCount = 0;
let trainSpeed = 2;
let trainCapacity = 400;
let trainPosition = { x: 100, y: -500 }; // Adjusted starting position to align with the top-left corner of the track
let trainDirection = 'right'; // Initial direction
let animationFrameId;

const train = document.getElementById('train');
const goldCountDisplay = document.getElementById('gold-count');
const wagonsContainer = document.getElementById('wagons-container');
const track = document.getElementById('track');

// Define the track boundaries
const trackPath = {
    top: -500,
    bottom: -200,
    left: 100,
    right: 600,
};

// Initialize the game
function initGame() {
    updateStats();
    moveTrain();
}

// Move the train along the track
function moveTrain() {
    switch (trainDirection) {
        case 'right':
            trainPosition.x += trainSpeed;
            if (trainPosition.x >= trackPath.right) {
                trainPosition.x = trackPath.right;
                trainDirection = 'down';
            }
            break;
        case 'down':
            trainPosition.y += trainSpeed;
            if (trainPosition.y >= trackPath.bottom) {
                trainPosition.y = trackPath.bottom;
                trainDirection = 'left';
            }
            break;
        case 'left':
            trainPosition.x -= trainSpeed;
            if (trainPosition.x <= trackPath.left) {
                trainPosition.x = trackPath.left;
                trainDirection = 'up';
            }
            break;
        case 'up':
            trainPosition.y -= trainSpeed;
            if (trainPosition.y <= trackPath.top) {
                trainPosition.y = trackPath.top;
                trainDirection = 'right';
                // Earn gold when completing a lap
                earnGold();
            }
            break;
    }

    train.style.left = `${trainPosition.x}px`;
    train.style.top = `${trainPosition.y}px`;
    animationFrameId = requestAnimationFrame(moveTrain);
}

// Earn gold when completing a lap
function earnGold() {
    goldCount += 100; // Earn 100 gold per lap
    updateStats();
}

// Update the displayed stats
function updateStats() {
    goldCountDisplay.textContent = `Gold: ${goldCount}`;
}

// Increase the train's speed
function increaseSpeed() {
    if (goldCount >= 500) {
        goldCount -= 500;
        trainSpeed += 1;
        updateStats();
        notifyUpgrade('Speed increased!');
    } else {
        alert('Not enough gold to increase speed.');
    }
}

// Increase the train's capacity
function increaseCapacity() {
    if (goldCount >= 800) {
        goldCount -= 800;
        trainCapacity += 100;
        updateStats();
        notifyUpgrade('Capacity increased!');
    } else {
        alert('Not enough gold to increase capacity.');
    }
}

// Notify player of an upgrade
function notifyUpgrade(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Attach event listeners to the control buttons
document.getElementById('start-game').addEventListener('click', () => {
    if (!animationFrameId) {
        initGame();
    }
});

document.getElementById('stop-game').addEventListener('click', () => {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
});

document
    .getElementById('increase-speed')
    .addEventListener('click', increaseSpeed);
document
    .getElementById('increase-capacity')
    .addEventListener('click', increaseCapacity);
