class Plant {
	constructor(row, col, x, y, type) {
		this.row=row;
		this.col=col;
		this.x = x;
		this.y = y;
		this.health=6;
		this.type = type;
		let attackInterval;
		switch(type)
		{
			case "sunflower":
				this.speed=24000;
				this.attacking=true;
				this.damage=25;
				this.startSunGeneration();
				break;
			case "peashooter":
			case "snowpea":
			case "threepeater":
			case "cactus":
			case "starfruit":
				this.speed=1500;
				this.attacking=false;
				break;
			case "cherrybomb":
				this.health=999;
				this.attacking=true;
				attackInterval=setInterval(()=>{
					clearInterval(attackInterval);
					explode(90, row-1, col-1, row+1, col+1);
					plants[row][col]=null;
					gridImages[row][col].src="";
				}, 1000);
				break;
			case "wallnut":
				this.health=72;
				this.attacking=true;
				break;
			case "potatomine":
				this.attacking=true;
				gridImages[row][col].src="";
				attackInterval=setInterval(()=>{
					clearInterval(attackInterval);
					if(this.health>0)
						gridImages[row][col].src="potatomine.png";
					this.health=999;
					this.speed=1000;
					this.attacking=false;
				}, 15000);
				break;
			case "chomper":
				this.attacking=false;
				this.speed=1000;
				break;
			case "repeater":
				this.speed=750;
				this.attacking=false;
				break;
			case "puffshroom":
			case "fumeshroom":
			case "scaredyshroom":
			case "seashroom":
				this.speed=1500;
				this.attacking=!night;
				break;
			case "sunshroom":
				this.speed=24000;
				this.damage=15;
				this.attacking=true;
				if(night)
				{
					attackInterval=setInterval(() => {
						clearInterval(attackInterval);
						this.damage=25;
					}, 120000);
					this.startSunGeneration();
				}
				break;
			case "grave":
			case "water":
			case "tile":
				this.health=0;
				this.attacking=true;
				break;
			case "gravebuster":
				this.attacking=true;
				attackInterval=setInterval(()=>{
					clearInterval(attackInterval);
					if(this.health>0)
					{
						plants[row][col]=null;
						gridImages[row][col].src="";
					}
					else
						gridImages[row][col].src="grave.png";
				}, 4500);
				break;
			case "hypnoshroom":
				this.attacking=true;
				if(night)
					this.health=1;
				break;
			case "iceshroom":
				this.attacking=true;
				if(night)
				{
					this.health=999;
					attackInterval=setInterval(()=>{
						clearInterval(attackInterval);
						zombies.forEach(zombie=>{
							zombie.health--;
							zombie.freeze();
						});
					}, 1000);
				}
				break;
			case "doomshroom":
				this.attacking=true;
				if(night)
				{
					this.health=999;
					attackInterval=setInterval(()=>{
						clearInterval(attackInterval);
						explode(90, row-2, col-3, row+2, col+3);
						plants[row][col]=new Plant(row, col, x, y, "crater");
						gridImages[row][col].src="crater.png";
					}, 1000);
				}
				break;
			case "crater":
				this.health=0;
				this.attacking=true;
				attackInterval=setInterval(()=>{
					clearInterval(attackInterval);
					plants[row][col]=null;
					gridImages[row][col].src="";
				}, 120000);
				break;
			case "lilypad":
			case "torchwood":
			case "plantern":
			case "flowerpot":
			case "umbrellaleaf":
				this.attacking=true;
				break;
			case "squash":
				this.health=999;
				this.speed=1000;
				break;
			case "tanglekelp":
				this.health=999;
				this.speed=100;
				break;
			case "jalapeno":
				this.health=999;
				this.attacking=true;
				attackInterval=setInterval(()=>{
					clearInterval(attackInterval);
					explode(90, row, 0, row, 9);
					plants[row][col]=null;
					gridImages[row][col].src="";
				}, 1000);
				break;
			case "spikeweed":
				this.health=0;
				this.speed=1000;
				break;
			case "tallnut":
				this.health=144;
				this.attacking=true;
				break;
			case "blover":
				this.health=999;
				this.attacking=true;
				attackInterval=setInterval(()=>{
					clearInterval(attackInterval);
					blowZombies();
					plants[row][col]=null;
					gridImages[row][col].src="";
				}, 1000);
				break;
			case "magnetshroom":
				this.speed=500;
				this.attacking=!night;
				break;
			case "cabbagepult":
				this.speed=3000;
				break;
			case "garlic":
				this.health=21;
				this.attacking=true;
				break;
		}
	}

	startSunGeneration() {
		const sunInterval=setInterval(() => {
			if(this.health>0)
				generateSunOnPlant(this.x, this.y, this.damage);
			else
				clearInterval(sunInterval);
		}, this.speed);
	}
	
	canAttack(r, c, metal)
	{
		switch(this.type)
		{
			case "peashooter":
			case "snowpea":
			case "repeater":
			case "scaredyshroom":
			case "cactus":
			case "cabbagepult":
			case "kernelpult":
				return this.row==r&&this.col<=c;
			case "potatomine":
			case "tanglekelp":
			case "spikeweed":
				return this.row==r&&this.col==c;
			case "chomper":
				return this.row==r&&c-this.col<2;
			case "puffshroom":
			case "seashroom":
				return this.row==r&&c-this.col<4;
			case "fumeshroom":
				return this.row==r&&c-this.col<5;
			case "squash":
				return this.row==r&&Math.abs(this.col-c)<2;
			case "threepeater":
				return Math.abs(this.row-r)<2&&this.col<=c;
			case "splitpea":
				return this.row==r;
			case "magnetshroom":
				return metal&&Math.abs(this.row-r)<3&&Math.abs(this.col-c)<3;
		}
		return true;
	}
	
	startAttacking()
	{
		this.attacking=true;
		const attackInterval = setInterval(() => {
			const zombie=zombieInRange(this);
			let eatInterval;
			if (this.health>0&&zombie) {
				switch(this.type)
				{
					case "threepeater":
						bullets.push(new Bullet(this.x+15, this.y-37, 1, 0));
						bullets.push(new Bullet(this.x+15, this.y+67, 1, 0));
					case "peashooter":
					case "repeater":
					case "puffshroom":
					case "seashroom":
						bullets.push(new Bullet(this.x+15, this.y+15, 1, 0));
						break;
					case "potatomine":
						clearInterval(attackInterval);
						explode(30, this.row, this.col, this.row, this.col);
						plants[this.row][this.col]=null;
						gridImages[this.row][this.col].src="";
						break;
					case "snowpea":
						bullets.push(new Bullet(this.x+15, this.y+15, 1, 0, true));
						break;
					case "chomper":
						clearInterval(attackInterval);
						zombie.health-=90;
						eatInterval=setInterval(()=>{
							clearInterval(eatInterval);
							this.attacking=false;
						}, 42000);
						break;
					case "fumeshroom":
						bullets.push(new Bullet(this.x+15, this.y+15, 1, 0, false, this.x+223));
						break;
					case "squash":
						clearInterval(attackInterval);
						const c=Math.floor(zombie.x/52);
						explode(90, this.row, c, this.row, c);
						plants[this.row][this.col]=null;
						gridImages[this.row][this.col].src="";
						break;
					case "tanglekelp":
						clearInterval(attackInterval);
						zombie.health-=120;
						plants[this.row][this.col]=null;
						gridImages[this.row][this.col].src="";
						break;
					case "spikeweed":
						explode(1, this.row, this.col, this.row, this.col);
						break;
					case "cactus":
						bullets.push(new Bullet(this.x+15, this.y+15, 1, 0, false, 475, true));
						break;
					case "splitpea":
						bullets.push(new Bullet(this.x+15, this.y+15, -1, 0));
						bullets.push(new Bullet(this.x, this.y+15, -1, 0));
						bullets.push(new Bullet(this.x+15, this.y+15, 1, 0));
						break;
					case "starfruit":
						bullets.push(new Bullet(this.x, this.y+15, -1, 0));
						bullets.push(new Bullet(this.x, this.y+15, 0, 1));
						bullets.push(new Bullet(this.x, this.y-15, 0, -1));
						bullets.push(new Bullet(this.x+15, this.y-15, 1, -1));
						bullets.push(new Bullet(this.x+15, this.y+15, 1, 1));
						break;
					case "magnetshroom":
						zombie.removeMetal();
						clearInterval(attackInterval);
						eatInterval=setInterval(()=>{
							clearInterval(eatInterval);
							this.attacking=false;
						}, 14500);
						break;
					case "cabbagepult":
						bullets.push(new Bullet(this.x+15, this.y+15, 1, 0, 475, false, 2));
						break;
					case "kernelpult":
						bullets.push(new Bullet(this.x+15, this.y+15, 1, 0, 475, false, 1, Math.random()<0.25));
						break;
				}
			} else {
				clearInterval(attackInterval);
				this.attacking = false;
			}
		}, this.speed);
	}
}