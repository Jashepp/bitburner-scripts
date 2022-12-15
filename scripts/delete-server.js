/** @param {NS} ns */
export async function main(ns) {
	// run delete-server.js server
	await ns.deleteServer(ns.args[0]);
}
