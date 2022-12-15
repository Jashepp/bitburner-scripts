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
	let args = [...ns.args];
	let server = args.shift() || 'home';
	let isServerHome = server==="home";
	if(!isServerHome){
		await root(server);
		await updateScripts(server);
		await ns.killall(server);
	}
	let script = args.shift() || '';
	if(['nothing','blank','root','update'].includes(script)) return;
	if(script in scripts) script = scripts[script];
	let maxServerRam = await ns.getServerMaxRam(server);
	let usedServerRam = await ns.getServerUsedRam(server);
	let availableRam = maxServerRam-usedServerRam;
	if(isServerHome) availableRam = Math.max(0,availableRam-8); // Leave 8GB to run home scripts
	let serverRam = isServerHome ? availableRam : await ns.getServerMaxRam(server);
	let scriptRam = await ns.getScriptRam(script);
	if(!scriptRam) throw new Error("Failed to fetch ram for script: "+script);
	let threadCount = Math.floor(serverRam/scriptRam);
	if(threadCount<=0) throw new Error("Not enough ram");
	let args2 = (args.length>0) ? args : [server];
	ns.print("... ["+server+"]: "+script+' '+args2.join(' '));
	await ns.exec(script,server,threadCount,...args2);
	ns.print("> Finished "+server);
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
			if(!ns.hasRootAccess(server)){
				ns.print("... ["+server+"] Gaining Access");
				try{ await ns.brutessh(server); }catch(err){}
				try{ await ns.ftpcrack(server); }catch(err){}
				try{ await ns.relaysmtp(server); }catch(err){}
				try{ await ns.httpworm(server); }catch(err){}
				try{ await ns.sqlinject(server); }catch(err){}
				await ns.nuke(server);
			}
			if(ns.hasRootAccess(server)) return true;
			if(!ns.hasRootAccess(server)) throw new Error("ERROR: No Root Access");
		}
		else throw new Error("ERROR: Insufficient Hacking Level");
	}
	else throw new Error("ERROR: Server Not Found: "+server);
}
