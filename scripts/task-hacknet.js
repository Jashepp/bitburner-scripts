/** @type {NS} ns */
let ns = null;

/** @param {NS} nsArg */
export async function main(nsArg) {
	ns = nsArg;
	ns.disableLog('disableLog'); ns.disableLog('getServerMoneyAvailable');
	let args = [...ns.args];
	let sleepTime = timeToMs((args.length>0 ? args.shift() : '1m') || '1m');
	let maxNodes = (args.length>0 ? args.shift() : 0) || 1000000;
	let lastStart = null;
	while(true){
		if(!lastStart){
			lastStart = Date.now();
			ns.print("Balance: "+formatNum(getMoney()));
		}
		while(ns.hacknet.numNodes()<maxNodes){
			let money = getMoney();
			let cost = ns.hacknet.getPurchaseNodeCost();
			if(money<cost) break;
			let r = ns.hacknet.purchaseNode();
			if(r===-1) break;
			ns.print("Purchased new hacknet node");
		}
		let money = getMoney();
		let canUpgrade = [];
		for(let i=0,l=ns.hacknet.numNodes(); i<l; i++){
			//let stats = ns.hacknet.getNodeStats(i); // .level
			let levelCost = ns.hacknet.getLevelUpgradeCost(i,1);
			let ramCost = ns.hacknet.getRamUpgradeCost(i,1);
			let coreCost = ns.hacknet.getCoreUpgradeCost(i,1);
			if(money>=levelCost && levelCost!=Infinity) canUpgrade.push({ cost:levelCost, type:'level', node:i });
			if(money>=ramCost && ramCost!=Infinity) canUpgrade.push({ cost:ramCost, type:'ram', node:i });
			if(money>=coreCost && coreCost!=Infinity) canUpgrade.push({ cost:coreCost, type:'core', node:i });
		}
		if(canUpgrade.length>0){
			canUpgrade.sort(function(a,b){
				if(a.type==='ram' && b.type!=='ram') return -1;
				if(a.type!=='ram' && b.type==='ram') return 1;
				if(a.type==='core' && b.type!=='core') return -1;
				if(a.type!=='core' && b.type==='core') return 1;
				//return a.cost - b.cost; // Ascending
				return b.cost - a.cost; // Descending
			});
			let upgrade = canUpgrade[0];
			while(upgrade && canUpgrade.length>0){
				upgrade = canUpgrade.shift();
				if(upgrade.cost>getMoney()) continue;
				ns.print("Upgrading #"+upgrade.node+" "+upgrade.type+" for "+formatNum(Math.ceil(upgrade.cost)));
				if(upgrade.type==='level') ns.hacknet.upgradeLevel(upgrade.node,1);
				if(upgrade.type==='ram') ns.hacknet.upgradeRam(upgrade.node,1);
				if(upgrade.type==='core') ns.hacknet.upgradeCore(upgrade.node,1);
			}
			continue;
		}
		await ns.sleep(Math.max(1,sleepTime - (Date.now()-lastStart)));
		lastStart = null;
	}
}

function formatNum(str){
	return new Intl.NumberFormat('en-AU').format(str);
}

function getMoney(){
	return ns.getServerMoneyAvailable('home');
}

function timeToMs(str){
	let ms = 0;
	if(str.substr(-1)==='s') ms += str.substr(0,str.length-1)*1000;
	if(str.substr(-1)==='m') ms += str.substr(0,str.length-1)*1000*60;
	if(str.substr(-1)==='h') ms += str.substr(0,str.length-1)*1000*60*60;
	if(str.substr(-1)==='d') ms += str.substr(0,str.length-1)*1000*60*60*24;
	return ms;
}
