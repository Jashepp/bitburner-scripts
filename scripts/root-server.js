/** @type {NS} ns */
let ns = null;

const scripts = {
	'hack': 'task-onlyhack.js',
	'grow': 'task-onlygrow.js',
	'weaken': 'task-onlyweaken.js',
	'smart': 'task-smart.js',
};

/** @param {NS} nsArg */
export async function main(nsArg) {
	ns = nsArg;
	ns.disableLog('ALL');
	let arr = await getFullScan();
	for(let i=0,l=arr.length; i<l; i++){
		let args = [...ns.args];
		let server = arr[i];
		ns.print("> ["+server+"]");
		try{ await root(server); }catch(err){}
		await updateScripts(server);
	}
}

async function getFullScan(){
	let list = new Set();
	await combineScan(list,"home");
	list.delete("home");
	let owned = ns.getPurchasedServers();
	for(let i=0,l=owned.length; i<l; i++){
		list.delete(owned[i]);
	}
	return [...list];
}

async function combineScan(setList,server){
	let arr = await ns.scan(server);
	for(let i=0,l=arr.length; i<l; i++){
		let s = arr[i];
		if(setList.has(s)) continue;
		if(s==="home") continue;
		setList.add(s);
		await combineScan(setList,s);
	}
}

async function updateScripts(server){
	if(server==='home') return;
	for(let k in scripts){
		let src = scripts[k];
		try{ await ns.rm(src,server); }catch(err){}
		try{ await ns.scp(src,server); }catch(err){}
	}
}

async function root(server){
	if(ns.serverExists(server)){
		let level = ns.getServerRequiredHackingLevel(server);
		if(ns.getHackingLevel()>=level){
			ns.print("... ["+server+"] Gaining Access");
			try{ await ns.brutessh(server); }catch(err){}
			try{ await ns.ftpcrack(server); }catch(err){}
			try{ await ns.relaysmtp(server); }catch(err){}
			try{ await ns.httpworm(server); }catch(err){}
			try{ await ns.sqlinject(server); }catch(err){}
			try{ await ns.nuke(server); }catch(err){}
			if(ns.hasRootAccess(server)) return true;
			if(!ns.hasRootAccess(server)) throw new Error("ERROR: No Root Access");
		}
		else throw new Error("ERROR: Insufficient Hacking Level");
	}
	else throw new Error("ERROR: Server Not Found: "+server);
}
