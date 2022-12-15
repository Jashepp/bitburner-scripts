/** @type {NS} ns */
let ns = null;

/** @param {NS} nsArg */
export async function main(nsArg) {
	ns = nsArg;
	ns.disableLog('disableLog');
	ns.disableLog('getServerRequiredHackingLevel');
	ns.disableLog('getHackingLevel');
	ns.disableLog('getServerMinSecurityLevel');
	ns.disableLog('getServerMaxMoney');
	ns.disableLog('getServerMoneyAvailable');
	ns.disableLog('getServerSecurityLevel');
	let args = [...ns.args];
	let server = args.shift() || '';
	let threads = ns.ps().filter(p=>p.filename.includes('task-smart.js'))[0].threads;
	//let ourHackingLevel = await ns.getHackingLevel();
	let minSecurity = await ns.getServerMinSecurityLevel(server);
	while(true){
		let rMaxMoney = await ns.getServerMaxMoney(server);
		let rMoney = await ns.getServerMoneyAvailable(server);
		if(rMaxMoney<=0 && rMoney<=0){
			ns.print("> No Server Money");
			await ns.hack(server); // No money, so lets just get XP instead
			continue;
		}
		let rSecurity = await ns.getServerSecurityLevel(server);
		ns.print("> Money "+formatNum(rMoney)+" / "+formatNum(rMaxMoney)+"");
		ns.print("> Security "+rSecurity+" / "+minSecurity+"");
		//if(rSecurity>=minSecurity*3 || rSecurity*0.75>=ourHackingLevel){
		if(rSecurity>=minSecurity*3){
			ns.print("> Weaken");
			let rWeaken = await ns.weaken(server);
			if(rWeaken>0) continue;
		}
		if(rMoney<rMaxMoney*0.9){
			ns.print("> Grow");
			let rGrow = await ns.grow(server);
			if(rGrow>0) continue;
		}
		if(rMoney>=rMaxMoney*0.9){
			ns.print("> Running 1 hack to calculate amount");
			let rHack = await ns.hack(server,{ threads:1 });
			if(rHack>0){
				let count = Math.min(Math.floor((rMoney*0.25)/rHack)-1,threads); // Only drain some, not all
				if(count>0){
					ns.print("> Running "+count+" more hacks");
					let rHacks = await ns.hack(server,{ threads:count });
				}
			}
		}
	}
}

function formatNum(str){
	return new Intl.NumberFormat('en-AU').format(str);
}
