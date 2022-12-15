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
	//ns.enableLog('rm'); ns.enableLog('scp');
	ns.enableLog('exec');
	let arr = await getFullScan();
	let highestMaxMoney = {};
	for(let i=0,l=arr.length; i<l; i++){
		let args = [...ns.args];
		let server = arr[i];
		try{
			//ns.print("> root ["+server+"]");
			await root(server);
			//ns.print("> updateScripts ["+server+"]");
			await updateScripts(server);
			//ns.print("> prep ["+server+"]");
			let script = args.shift() || 'smart';
			if(['nothing','blank','root','update'].includes(script)) continue;
			if(script in scripts) script = scripts[script];
			let serverRam = await ns.getServerMaxRam(server);
			if(serverRam<=0){ ns.print("> Skipping ["+server+"]: No Server RAM"); continue; }
			let scriptRam = await ns.getScriptRam(script);
			let scriptThreads = Math.floor(serverRam/scriptRam);
			let args2 = (args.length>0) ? args : [server,scriptThreads];
			//ns.print("> killall ["+server+"]");
			await ns.killall(server);
			//ns.print("> exec ["+server+"] "+script+' '+args2.join(' '));
			args2 = [server];
			if(scriptThreads>0) await ns.exec(script,server,scriptThreads,...args2);
			let leftoverScript = "task-onlyhack.js";
			if(script==='task-smart.js') leftoverScript = "task-onlyweaken.js";
			let leftoverCount = Math.floor( (serverRam-(await ns.getServerUsedRam(server))) / (await ns.getScriptRam(leftoverScript)) );
			args2.push(leftoverCount);
			if(leftoverCount>0) await ns.exec(leftoverScript,server,leftoverCount,...args2);
			//ns.print("> Finished ["+server+"]");
			let rMaxMoney = await ns.getServerMaxMoney(server);
			if(!highestMaxMoney.money || highestMaxMoney.money<rMaxMoney){
				highestMaxMoney = { money:rMaxMoney, server:server };
			}
		}catch(err){
			ns.print("> Skipping ["+server+"]: "+err);
		}
	}
	ns.print("----------------------");
	ns.print("> Max Money Server: ["+highestMaxMoney.server+"] with "+formatNum(highestMaxMoney.money));
}

function formatNum(str){
	return new Intl.NumberFormat('en-AU').format(str);
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
