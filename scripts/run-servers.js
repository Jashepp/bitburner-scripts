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
		try{
			//ns.print("> updateScripts ["+server+"]");
			await updateScripts(server);
			//ns.print("> prep ["+server+"]");
			let script = args.shift() || 'nothing';
			if(['nothing','blank','root','update'].includes(script)) continue;
			if(script in scripts) script = scripts[script];
			let serverRam = await ns.getServerMaxRam(server);
			if(serverRam<=0){ ns.print("> Skipping ["+server+"]: No Server RAM"); continue; }
			let scriptRam = await ns.getScriptRam(script);
			let scriptThreads = Math.floor(serverRam/scriptRam);
			let args2 = (args.length>0) ? args : [];
			//ns.print("> killall ["+server+"]");
			await ns.killall(server);
			//ns.print("> exec ["+server+"] "+script+' '+args2.join(' '));
			if(scriptThreads>0) await ns.exec(script,server,scriptThreads,...args2);
			let leftoverScript = "task-onlyhack.js";
			if(script==='task-smart.js') leftoverScript = "task-onlyweaken.js";
			let leftoverCount = Math.floor( (serverRam-(await ns.getServerUsedRam(server))) / (await ns.getScriptRam(leftoverScript)) );
			if(leftoverCount>0) await ns.exec(leftoverScript,server,leftoverCount,...args2);
			//ns.print("> Finished ["+server+"]");
		}catch(err){
			ns.print("> Skipping "+server+": Error: "+err);
		}
	}
}

async function getFullScan(){
	return [...ns.getPurchasedServers()];
}

async function updateScripts(server){
	if(server==='home') return;
	for(let k in scripts){
		let src = scripts[k];
		try{ await ns.rm(src,server); }catch(err){}
		try{ await ns.scp(src,server); }catch(err){}
	}
}
