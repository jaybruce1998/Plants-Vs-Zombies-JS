let suns = [];
const plants = [[], [], [], [], []]; // Stores plants on the grid
const pumpkins = [[], [], [], [], []];
let zombies = [];
let bullets=[];
const grid = document.getElementById('grid');
const plantButtons = document.querySelectorAll('.plant-button');
let sunCount = 50;
let selectedPlant = null;
let plantCost = 0;
let night;
let water;
let roof;

function spawnZombie() {
	const row = Math.floor(Math.random() * plants.length); // Random row
	const newZombie = new Zombie(row);
	zombies.push(newZombie);
}

function updateZombies() {
	zombies.filter(zombie=>!zombie.butter).forEach(zombie => {
		const c=Math.floor(zombie.x/52);
		if (pumpkins[zombie.row][c]||plants[zombie.row][c]&&plants[zombie.row][c].health>0) {
			zombie.attackPlant(c);
		} else {
			zombie.move();
		}
	});
}

// Function to draw zombies on the grid
function drawZombies() {
	grid.querySelectorAll('.zombie').forEach(zombie => zombie.remove());

	zombies.forEach(zombie => zombie.draw());
}

// Function to generate a new sun directly on top of the plant
function generateSunOnPlant(x, y, amount) {
	const sun = {
		x: x + 25,
		y: y + 25,
		amount: amount,
		isHovered: false,
		shouldFall: false
	};
	suns.push(sun);
}

function generateRandomSun() {
	const gridWidth = grid.offsetWidth-50;
	const sunX = Math.floor(Math.random() * gridWidth);

	const sun = {
		x: sunX,
		y: -10,
		amount: 25,
		isHovered: false,
		shouldFall: true
	};

	suns.push(sun);
}

function updateSuns() {
	suns.forEach((sun, index) => {
		if (sun.shouldFall) {
			sun.y += 0.25;

			if (sun.y > 250) {
				suns.splice(index, 1);
			}
		}
	});
}

function drawSuns() {
	grid.querySelectorAll('.sun').forEach(sun => sun.remove());

	suns.forEach(sun => {
		const sunElement = document.createElement('div');
		sunElement.classList.add('sun');
		sunElement.style.left = `${sun.x+15}px`;
		sunElement.style.top = `${sun.y}px`;
		sunElement.addEventListener('mouseover', () => sun.isHovered = true);
		grid.appendChild(sunElement);
	});
}

function placePlant(row, col, gridItem) {
	if(!selectedPlant||row==plants.length)
		return;
	if(selectedPlant=="pumpkin")
	{
		if(sunCount>124&&!pumpkins[row][col])
		{
			sunCount -= 125;
			document.getElementById('sun-count').textContent = `Sun: ${sunCount}`;
			pumpkins[row][col]=72;
			selectedPlant = null;
			plantCost = 0;
			deselectPlantButton();
		}
		return;
	}
	if (!plants[row][col]&&sunCount >= plantCost) {
		gridItem.src = `${selectedPlant}.png`;
		sunCount -= plantCost;
		document.getElementById('sun-count').textContent = `Sun: ${sunCount}`;

		const newPlant = new Plant(row, col, col * 52, row * 52, selectedPlant);
		plants[row][col]=newPlant;

		selectedPlant = null;
		plantCost = 0;
		deselectPlantButton();
	}
}

function selectPlant(plant, cost) {
	selectedPlant = plant;
	plantCost = cost;
	deselectPlantButton();
	document.getElementById(`${plant}-button`).classList.add('selected');
}

function deselectPlantButton() {
	plantButtons.forEach(button => button.classList.remove('selected'));
}

const gridImages=[[], [], [], [], [], []];
function createGrid() {
	for (let row = 0; row < 6; row++) {
		for (let col = 0; col < 9; col++) {
			const gridItem = document.createElement('img');
			gridItem.classList.add('grid-item');
			gridItem.setAttribute('data-row', row);
			gridItem.setAttribute('data-col', col);
			gridItem.addEventListener('click', () => placePlant(row, col, gridItem));
			grid.appendChild(gridItem);
			gridImages[row][col]=gridItem;
		}
	}
}

function getRandomGreenShade() {
	return `rgb(144, ${Math.floor(Math.random() * 56) + 200}, 144)`;
}

function getRandomOrangeShade()
{
	return `rgb(255, ${Math.floor(Math.random()*32)+69}, 0)`;
}

function getZombies()
{
	const r=Math.floor((wave-1)/3)+1;
	return wave==levelWaves[level]||wave%10==0?r*2.5:r;
}

function startZombieSpawning() {
	const spawnInterval=setInterval(() => {
		for(let i=getZombies(); i>0; i--)
			spawnZombie();
		if(++wave>levelWaves[level])
			clearInterval(spawnInterval);
	}, 24000);
}

function zombieInRange(plant)
{
	return plant.type=="scaredyshroom"&&zombies.some(zombie=>Math.abs(plant.row-zombie.row)<2&&Math.abs(plant.col-Math.floor(zombie.x/52))<2)?null:
			zombies.filter(zombie=>plant.canAttack(zombie.row, Math.floor(zombie.x/52)))[0];
}

function explode(damage, r1, c1, r2, c2)
{
	zombies.forEach(zombie=>{
		const c=Math.floor(zombie.x/52);
		if(zombie.row>=r1&&zombie.row<=r2&&c>=c1&&c<=c2)
			zombie.health-=damage;
	});
}

function resetGrid()
{
	wave=1;
	night=level>9&&level<20||level>29&&level<40;
	water=level>19&&level<40;
	roof=level>39;
	for(let i=0; i<5; i++)
		for(let j=0; j<9; j++)
		{
			gridImages[i][j].style.backgroundColor = water&&(i==2||i==3)?"rgb(0, 255, 0)":roof?getRandomOrangeShade():getRandomGreenShade();
			if(plants[i][j])
			{
				plants[i][j].health=0;
				gridImages[i][j].src="";
				plants[i][j]=null;
			}
			pumpkins[i][j]=0;
		}
	for(let j=0; j<9; j++)
		if(water)
			gridImages[5][j].style.backgroundColor=getRandomGreenShade();
		else
			gridImages[5][j].style.display="none";
	suns=[];
	sunCount=50;
	document.getElementById('sun-count').textContent = `Sun: ${sunCount}`;
	if(!night)
		sunInterval=setInterval(() => {
			generateRandomSun();
		}, 9500);
	startZombieSpawning();
}

function gameLoop() {
	suns.forEach((sun, index) => {
		if (sun.isHovered) {
			sunCount += sun.amount;
			document.getElementById('sun-count').textContent = `Sun: ${sunCount}`;
			suns.splice(index, 1);
		}
	});
	updateSuns();
	drawSuns();

	updateZombies();
	drawZombies();

	for(let i=0; i<plants.length; i++)
		for(let j=0; j<9; j++)
			if(plants[i][j]&&!plants[i][j].attacking&&zombieInRange(plants[i][j]))
				plants[i][j].startAttacking();
			
	bullets.forEach(bullet=>bullet.move());
	bullets=bullets.filter(bullet=>!bullet.hit);
	zombies=zombies.filter(zombie=>zombie.health>0);
	grid.querySelectorAll('.bullet').forEach(bullet => bullet.remove());
	bullets.forEach(bullet => {
		const bulletElement = document.createElement('div');
		bulletElement.classList.add('bullet');
		bulletElement.style.left = `${bullet.x}px`;
		bulletElement.style.top = `${bullet.y}px`;
		grid.appendChild(bulletElement);
	});
	if(wave>levelWaves[level]&&zombies.length==0)
	{
		clearInterval(sunInterval);
		if(level==49)
		{
			localStorage.clear();
			alert("You won!");
			return;
		}
		localStorage.setItem("level", ++level);
		alert("You beat level "+level+"!");
		if(level==20)
			plants.push([]);
		else if(level==40)
			plants.pop();
		resetGrid();
	}
	requestAnimationFrame(gameLoop);
}
const plantNames=['sunflower', 'peashooter', 'cherrybomb', 'wallnut', 'potatomine', 'snowpea', 'chomper', 'repeater',
				'puffshroom', 'sunshroom', 'fumeshroom', 'gravebuster', 'hypnoshroom', 'scaredyshroom', 'iceshroom', 'doomshroom',
				'lilypad', 'squash', 'threepeater', 'tanglekelp', 'jalapeno', 'spikeweed', 'torchwood', 'tallnut',
				'seashroom', 'plantern', 'cactus', 'blover', 'splitpea', 'starfruit', 'pumpkin', 'magnetshroom',
				'cabbagepult', 'flowerpot', 'kernelpult', 'coffeebean', 'garlic', 'umbrellaleaf'];
const prices=[50, 100, 150, 50, 25, 175, 150, 200,
				0, 25, 75, 75, 75, 25, 5, 125,
				25, 50, 325, 25, 125, 100, 175, 125,
				0, 25, 125, 100, 125, 125, 125, 100,
				100, 25, 100, 75, 50, 100];
[...document.getElementsByClassName("plant-button")].forEach((button, i)=>button.addEventListener('click', () => selectPlant(plantNames[i], prices[i])));

const levelWaves = [4,  6,  8,  10, 8,  10, 20, 10, 20, 20,
					10, 20, 10, 20, 10, 10, 20, 10, 20, 20,
					10, 20, 20, 30, 20, 20, 30, 20, 30, 30,
					10, 20, 10, 20, 20, 10, 20, 10, 20, 20,
					10, 20, 20, 30, 20, 20, 30, 20, 30, 30];

let level=localStorage.getItem("level")||0;
if(level>19&&level<40)
	plants.push([]);
createGrid();
resetGrid();
gameLoop();