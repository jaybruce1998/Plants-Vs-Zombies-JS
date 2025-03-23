class Bullet
{
	constructor(x, y, dx, dy, slow=false, lx=475, needle=false, damage=1, butter=false)
	{
		this.x=x;
		this.y=y;
		this.dx=dx;
		this.dy=dy;
		this.slow=slow;
		this.hit=false;
		this.lx=lx;
		this.keepGoing=lx!=475;
		this.zomHit={};
		this.needle=needle;
		this.butter=butter;
		this.damage=butter?2:damage;
	}
	
	move()
	{
		this.x+=this.dx;
		this.y+=this.dy;
		if(this.x<-50||this.x>this.lx||this.y<0||this.y>250)
		{
			this.hit=true;
			return;
		}
		const r=Math.floor(this.y/52);
		const p=plants[r][Math.floor(this.x/52)];
		if(p&&p.type=="torchwood")
		{
			this.slow=false;
			this.damage=2;
		}
		zombies.forEach((zombie, i)=>{
			if(!this.zomHit[zombie]&&Math.abs(this.x-zombie.x)<8&&r==zombie.row)
			{
				zombie.health-=this.damage;
				if(this.slow)
					zombie.freeze();
				else if(this.butter)
				{
					zombie.butter=true;
					const butterInterval=setInterval(() => {
						clearInterval(butterInterval);
						zombie.butter=false;
					}, 5000);
				}
				if(this.keepGoing)
					this.zomHit[zombie]=true;
				else
				{
					this.hit=true;
					return;
				}
			}
		});
	}
}