let goldCount = 0;
let trainSpeed = 2;
let trainCapacity = 1; // Number of wagons (starts with 1)
let trainEfficiency = 100; // Efficiency percentage (starts at 100%)
let trainPosition = { x: 100, y: -500 }; // Adjusted starting position to align with the top-left corner of the track
let trainDirection = 'right'; // Initial direction
let animationFrameId;
let gameStarted = false;
let totalLaps = 0;
let achievements = {
    firstWagon: false,
    speedDemon: false,
    goldRush: false,
    efficient: false,
    millionaire: false
};

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
    updateWagons();
    loadGame(); // Load saved progress
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
    const baseGold = 100 * trainCapacity;
    const goldPerLap = Math.floor(baseGold * (trainEfficiency / 100)); // Efficiency affects gold earning
    goldCount += goldPerLap;
    totalLaps++;
    updateStats();
    checkAchievements();
    showFloatingText(`+${goldPerLap} Gold!`, 'gold');
}

// Update the displayed stats
function updateStats() {
    goldCountDisplay.textContent = `Gold: ${goldCount}`;
    document.getElementById('speed-display').textContent = `Speed: ${trainSpeed}`;
    document.getElementById('wagons-display').textContent = `Wagons: ${trainCapacity}`;
    document.getElementById('efficiency-display').textContent = `Efficiency: ${trainEfficiency}%`;
    
    const baseIncome = 100 * trainCapacity;
    const actualIncome = Math.floor(baseIncome * (trainEfficiency / 100));
    document.getElementById('income-display').textContent = `Income: ${actualIncome}/lap`;
    
    // Update upgrade costs
    const speedCost = 500 * trainSpeed;
    const wagonCost = 800 * trainCapacity;
    const efficiencyCost = 1200 * Math.floor(trainEfficiency / 100);
    
    document.getElementById('speed-cost').textContent = `Speed Cost: ${speedCost}`;
    document.getElementById('wagon-cost').textContent = `Wagon Cost: ${wagonCost}`;
    document.getElementById('efficiency-cost').textContent = `Efficiency Cost: ${efficiencyCost}`;
    
    // Update button states
    const speedButton = document.getElementById('increase-speed');
    const wagonButton = document.getElementById('increase-capacity');
    const efficiencyButton = document.getElementById('increase-efficiency');
    
    speedButton.disabled = goldCount < speedCost;
    wagonButton.disabled = goldCount < wagonCost;
    efficiencyButton.disabled = goldCount < efficiencyCost;
    
    speedButton.textContent = `Increase Speed (${speedCost})`;
    wagonButton.textContent = `Add Wagon (${wagonCost})`;
    efficiencyButton.textContent = `Upgrade Efficiency (${efficiencyCost})`;
    
    // Update achievements display
    const achievedCount = Object.values(achievements).filter(Boolean).length;
    document.getElementById('achievement-display').textContent = `Achievements: ${achievedCount}/5`;
}

// Increase the train's speed
function increaseSpeed() {
    const cost = 500 * trainSpeed; // Cost increases with each upgrade
    if (goldCount >= cost) {
        goldCount -= cost;
        trainSpeed += 1;
        updateStats();
        notifyUpgrade('Speed increased!');
        saveGame(); // Save progress
    } else {
        alert(`Not enough gold! Need ${cost} gold to increase speed.`);
    }
}

// Increase the train's capacity (add wagons)
function increaseCapacity() {
    const cost = 800 * trainCapacity; // Cost increases with each wagon
    if (goldCount >= cost) {
        goldCount -= cost;
        trainCapacity += 1;
        updateStats();
        updateWagons();
        checkAchievements(); // Check for achievements
        showFloatingText('Wagon added! (+100 gold/lap)', 'upgrade');
        saveGame(); // Save progress
    }
}

// Increase the train's efficiency
function increaseEfficiency() {
    const cost = 1200 * Math.floor(trainEfficiency / 100);
    
    if (goldCount >= cost) {
        goldCount -= cost;
        trainEfficiency += 25; // Increase efficiency by 25%
        updateStats();
        checkAchievements(); // Check for achievements
        showFloatingText(`Efficiency boosted! (+25%)`, 'upgrade');
        saveGame();
    }
}

// Check and unlock achievements
function checkAchievements() {
    // First Wagon - Add your first wagon
    if (!achievements.firstWagon && trainCapacity >= 2) {
        achievements.firstWagon = true;
        showFloatingText('🏆 Achievement: First Wagon!', 'achievement');
        goldCount += 500; // Bonus gold
    }
    
    // Speed Demon - Reach speed 5
    if (!achievements.speedDemon && trainSpeed >= 5) {
        achievements.speedDemon = true;
        showFloatingText('🏆 Achievement: Speed Demon!', 'achievement');
        goldCount += 1000;
    }
    
    // Gold Rush - Complete 50 laps
    if (!achievements.goldRush && totalLaps >= 50) {
        achievements.goldRush = true;
        showFloatingText('🏆 Achievement: Gold Rush!', 'achievement');
        goldCount += 2000;
    }
    
    // Efficient - Reach 150% efficiency
    if (!achievements.efficient && trainEfficiency >= 150) {
        achievements.efficient = true;
        showFloatingText('🏆 Achievement: Efficient!', 'achievement');
        goldCount += 1500;
    }
    
    // Millionaire - Accumulate 10,000 gold
    if (!achievements.millionaire && goldCount >= 10000) {
        achievements.millionaire = true;
        showFloatingText('🏆 Achievement: Millionaire!', 'achievement');
        trainEfficiency += 50; // Permanent efficiency boost
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
document
    .getElementById('increase-efficiency')
    .addEventListener('click', increaseEfficiency);
document
    .getElementById('reset-game')
    .addEventListener('click', resetGame);

// Update wagons display
function updateWagons() {
    wagonsContainer.innerHTML = ''; // Clear existing wagons
    for (let i = 0; i < trainCapacity; i++) {
        const wagon = document.createElement('div');
        wagon.className = 'wagon';
        wagonsContainer.appendChild(wagon);
    }
}

// Show floating text for feedback
function showFloatingText(text, type = 'default') {
    const floatingText = document.createElement('div');
    floatingText.className = `floating-text ${type}`;
    floatingText.textContent = text;
    floatingText.style.left = `${trainPosition.x + 25}px`;
    floatingText.style.top = `${trainPosition.y - 20}px`;
    document.getElementById('game-container').appendChild(floatingText);
    
    setTimeout(() => {
        if (floatingText.parentNode) {
            floatingText.parentNode.removeChild(floatingText);
        }
    }, 2000);
}

// Save game progress
function saveGame() {
    const gameData = {
        goldCount,
        trainSpeed,
        trainCapacity,
        trainEfficiency,
        trainPosition,
        trainDirection,
        totalLaps,
        achievements
    };
    localStorage.setItem('trainGameSave', JSON.stringify(gameData));
}

// Load game progress
function loadGame() {
    const savedData = localStorage.getItem('trainGameSave');
    if (savedData) {
        const gameData = JSON.parse(savedData);
        goldCount = gameData.goldCount || 0;
        trainSpeed = gameData.trainSpeed || 2;
        trainCapacity = gameData.trainCapacity || 1;
        trainEfficiency = gameData.trainEfficiency || 100;
        trainPosition = gameData.trainPosition || { x: 100, y: -500 };
        trainDirection = gameData.trainDirection || 'right';
        totalLaps = gameData.totalLaps || 0;
        achievements = gameData.achievements || {
            firstWagon: false,
            speedDemon: false,
            goldRush: false,
            efficient: false,
            millionaire: false
        };
        updateStats();
        updateWagons();
    }
}

// Reset game function
function resetGame() {
    if (confirm('Are you sure you want to reset your progress? This cannot be undone!')) {
        goldCount = 0;
        trainSpeed = 2;
        trainCapacity = 1;
        trainEfficiency = 100;
        trainPosition = { x: 100, y: -500 };
        trainDirection = 'right';
        totalLaps = 0;
        achievements = {
            firstWagon: false,
            speedDemon: false,
            goldRush: false,
            efficient: false,
            millionaire: false
        };
        localStorage.removeItem('trainGameSave');
        updateStats();
        updateWagons();
        showFloatingText('Game reset!', 'upgrade');
    }
}

// Auto-save every 10 seconds
setInterval(saveGame, 10000);
