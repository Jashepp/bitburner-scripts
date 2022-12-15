/** @type {NS} ns */
let ns = null;

/** @param {NS} nsArg */
export async function main(nsArg) {
	ns = nsArg;
	ns.disableLog('ALL');
	ns.enableLog('purchaseServer');
	ns.enableLog('exec');
	let args = [...ns.args];
	let action = args.length>0 ? args[0] : 'check';
	let money = await ns.getServerMoneyAvailable("home");
	if(action==='check'){
		let maxServerRam = await ns.getPurchasedServerMaxRam();
		let serverCost = 0, ramAmount = 2, affordableCost = 0, affordableRam = 0;
		while(serverCost<money && ramAmount<maxServerRam){
			try{ serverCost = await ns.getPurchasedServerCost(ramAmount); }
			catch(err){ break; }
			if(serverCost>money) break;
			affordableCost = serverCost;
			affordableRam = ramAmount;
			ramAmount = ramAmount*2;
			if(ramAmount>maxServerRam) break;
		}
		ns.print("Max server size: "+formatNum(maxServerRam)+" GB");
		ns.print("Max affordable server: "+formatNum(affordableRam)+" GB for $"+formatNum(affordableCost));
		let nextServerCost = affordableRam>maxServerRam ? null : await ns.getPurchasedServerCost(affordableRam*2);
		if(nextServerCost) ns.print("Next server size: "+formatNum(affordableRam*2)+" GB for $"+formatNum(nextServerCost));
		ns.print("To buy: run buy-server.js "+affordableRam+" server-name");
		return;
	}
	if(args.length>=2 && (''+args[0]).match(/^[0-9]+$/)){
		let ram = args.shift();
		let name = args.shift();
		let r = await ns.purchaseServer(name,ram);
		if(r){
			await ns.exec('run-custom.js','home',1,name,'nothing');
			ns.print("Server ["+name+"] Bought.");
		}
		return;
	}
	throw new Error("Missing [ram] [name] arguments");
}

function formatNum(str){
	return new Intl.NumberFormat('en-AU').format(str);
}
