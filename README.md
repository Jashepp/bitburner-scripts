# bitburner-scripts
Scripts for game: https://danielyxie.github.io/bitburner/

Bitburner is a free, [open source](https://github.com/danielyxie/bitburner) incremental game with support for JavaScript for automation and scripts.

I see this game as a fun exercise to create some handy scripts and automation using JavaScript. Below are some scripts that I created and refined overtime. Feel free to use & edit them.

Although, I do highly recommend trying to make scripts and automation on your own for your first playthrough.

---

### Scripts (ns2)

#### Utility Scripts

- [buy-server.js](./scripts/buy-server.js) - Buy a server, or check what's available.
	* `run buy-server.js check` - Check what server size you can afford.
	* `run buy-server.js [ram] [name]` - Buy a server with [ram] GB of ram.

- [cp-server.js](./scripts/cp-server.js) - Copy a file to a server.
	* `run cp-server.js [server] [file]` - Copy [file] to [server].

- [delete-server.js](./scripts/delete-server.js) - Remove a purchased server.
	* `run delete-server.js [server]` - Delete [server].

- [root-server.js](./scripts/root-server.js) - Attempt to open ports & nuke/root a server.
	* `run root-server.js [server]` - Root [server].
	* [task scripts](#task-scripts) are also copied to server.

#### Run Scripts

- [run-all.js](./scripts/run-all.js) - Scan network and run a script on all found rooted servers (not purchased).
	* `run run-all.js` - Runs task-smart on all rooted servers.
	* `run run-all.js [script] [...args]` - Run [script] (with arguments) on all rooted servers.
	* If a server is not rooted, it will try to root it.
	* A task script alias can be used in place of [script].
	* [task scripts](#task-scripts) are also copied to server.
	* The script is ran with as many threads as possible.

- [run-servers.js](./scripts/run-servers.js) - Run a script on all purchased servers.
	* `run run-servers.js [script] [...args]` - Run [script] (with arguments) on all rooted servers.
	* A task script alias can be used in place of [script].
	* [task scripts](#task-scripts) are also copied to server.
	* The script is ran with as many threads as possible.

- [run-custom.js](./scripts/run-custom.js) - Run a script on specific server.
	* `run run-custom.js [server] [script] [...args]` - Run [script] (with arguments) on [server] server.
	* If [server] is not home, and not rooted, it will try to root it.
	* A task script alias can be used in place of [script].
	* If [server] is not home, [task scripts](#task-scripts) are also copied to server.
	* The script is ran with as many threads as possible, except if [server] is home, where it will try to leave 8gb left for manual terminal scripts to run.

#### Task Scripts

- [task-hacknet.js](./scripts/task-hacknet.js) - Attempt to constantly buy & upgrade hacknet nodes.
	* `run task-hacknet.js` - Buy & Upgrade every 1 minute, to a max of 1m nodes.
	* `run task-hacknet.js [time] [maxNodes]` - Buy & Upgrade every [time], to a max of [maxNodes].
	* It attempts to buy nodes, ram, cores then levels, in order of most expensive, then repeats until all money is used.

- [task-smart.js](./scripts/task-smart.js) (alias: `smart`) - Attempt to constantly **weaken**, **grow** and **hack** server.
	* `run task-smart.js [server]` - Target [server].
	* If server has no max money, it will run hack, to only gain XP.
	* If security reaches 3x the minimum security, it will **weaken**.
	* If money is less than 90% of max, it will **grow**.
	* If money is 90% or more of max, it will **hack** up to 25% of available money.

- [task-onlygrow.js](./scripts/task-onlygrow.js) (alias: `grow`) - Constantly **grow** server forever.
	* `run task-onlygrow.js [server]` - Run **grow** on [server] forever.

- [task-onlyweaken.js](./scripts/task-onlyweaken.js) (alias: `weaken`) - Constantly **weaken** server forever.
	* `run task-onlyweaken.js [server]` - Run **weaken** on [server] forever.

- [task-onlyhack.js](./scripts/task-onlyhack.js) (alias: `hack`) - Constantly **hack** server forever.
	* `run task-onlyhack.js [server]` - Run **hack** on [server] forever.

---

### Example Use Cases

As your access to the network grows, and as you gain more tools to open ports to root servers, just run in terminal: `run run-all.js smart` to take advantage of the servers on the network.

`run-all` will print (use --tail) at the end of the script, the server with the highest max-money, so you can then use `run run-servers.js smart [server]` to have your purchased servers take advantage of that server.

To sit back and earn income from hacknet, just run in terminal: `run task-hacknet.js --tail`

---

### Handy aliases

```
alias homerun="run run-custom.js --tail home"
alias all="run run-all.js --tail"
alias servers="run run-servers.js --tail"
alias buyserver="run buy-server.js --tail"
alias deleteserver="run delete-server.js --tail"
```
