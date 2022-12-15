/** @param {NS} ns */
export async function main(ns) {
	// run cp-server.js server script.js
	await ns.scp(ns.args[1], ns.args[0]);
}
