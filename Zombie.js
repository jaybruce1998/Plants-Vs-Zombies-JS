class Zombie {
	constructor(row) {
		this.row = row;
		this.x = 500; // Start on the right side of the grid (9 * 50)
		this.y = row * 52;
		this.speed = 0.2;
		this.health = 10;
		this.attacking=false;
		this.damage=1;
		this.slow=false;
		this.butter=false;
		this.metal=false;
	}

	move() {
		this.x -= this.speed;
		if (this.x < -51) {
			zombies=[];
			alert("The zombies ate your brains!");
			resetGrid();
		}
	}
	
	stopAttacking(interval)
	{
		clearInterval(interval);
		this.attacking=false;
	}
	
	attackPlant(column) {
		if (!this.attacking) {
			this.attacking = true;
			const attackInterval = setInterval(() => {
				const plant=plants[this.row][column];
				if (this.health>0)
				{
					if(pumpkins[this.row][column])
						pumpkins[this.row][column]--;
					else if(plant.health > 0)
					{
						plant.health-=this.damage;
						if (plant.health <= 0) {
							this.stopAttacking(attackInterval);
							plants[this.row][plant.col]=null;
							gridImages[this.row][plant.col].src="";
						}
						if(plant.type=="garlic")
						{
							this.butter=true;
							const butterInterval=setInterval(() => {
								clearInterval(butterInterval);
								this.row=this.row==0?1:this.row==plants.length-1?plants.length-2:this.row+(Math.random()<0.5?-1:1);
								this.y=this.row*52;
								zombie.butter=false;
							}, 1000);
						}
					}
					else
						this.stopAttacking(attackInterval);
				} else
					this.stopAttacking(attackInterval);
			}, 500);
		}
	}

	draw() {
		const gridContainer = document.querySelector('.grid-container');
		const zombieElement = document.createElement('img');
		zombieElement.src="zombie.png";
		zombieElement.classList.add('zombie');
		zombieElement.style.left = `${this.x-15}px`;
		zombieElement.style.top = `${this.y}px`;
		gridContainer.appendChild(zombieElement);
	}
	
	freeze()
	{
		if(this.slow)
			clearInterval(this.slowInterval);
		else
		{
			this.speed/=2;
			this.damage/=2;
			this.slow=true;
		}
		const slowInterval=setInterval(()=>{
			clearInterval(slowInterval);
			this.speed*=2;
			this.damage*=2;
			this.slow=false;
		}, 10000);
	}
}