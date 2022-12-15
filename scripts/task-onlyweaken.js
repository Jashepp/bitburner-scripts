/** @param {NS} ns */
export async function main(ns) {
	let args = [...ns.args];
	let server = args.shift() || null;
	if(server){
		while(true){
			await ns.weaken(server);
		}
	}
}
