// vibe coded, to temp fix windows

import { type ChildProcess, fork } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { intents, shardsPerCluster, totalClusters } from "./instanceConfig";

if (!process.env.BOT_TOKEN)
	throw new Error("BOT_TOKEN is not set in environment variables");

const currentFileExtension = path.extname(fileURLToPath(import.meta.url));
const botFilePath = path.join(import.meta.dir, `bot${currentFileExtension}`);
const totalShards = shardsPerCluster * totalClusters;
const children = new Map<number, ChildProcess>();
let isShuttingDown = false;

const calculateShardList = (clusterID: number) =>
	Array.from(
		{ length: shardsPerCluster },
		(_, offset) => clusterID * shardsPerCluster + offset,
	);

const prefixOutput = (
	clusterID: number,
	stream: NodeJS.ReadableStream | null | undefined,
	target: NodeJS.WriteStream,
) => {
	stream?.on("data", (chunk: Buffer | string) => {
		const lines = chunk.toString().split(/\r?\n/);
		for (const line of lines) {
			if (line.length > 0) target.write(`[cluster ${clusterID}] ${line}\n`);
		}
	});
};

const startCluster = (clusterID: number) => {
	const child = fork(botFilePath, {
		env: {
			...process.env,
			INSTANCE_ID: "1",
			CLUSTER_ID: clusterID.toString(),
			SHARD_LIST: calculateShardList(clusterID).join(","),
			TOTAL_SHARDS: totalShards.toString(),
			TOKEN: process.env.BOT_TOKEN,
			INTENTS: intents.join(","),
			FORCE_COLOR: "true",
		},
		stdio: ["inherit", "pipe", "pipe", "ipc"],
	});

	prefixOutput(clusterID, child.stdout, process.stdout);
	prefixOutput(clusterID, child.stderr, process.stderr);
	child.on("exit", (code, signal) => {
		children.delete(clusterID);
		console.log(
			`[cluster ${clusterID}] exited (${code ?? "null"} ${signal ?? "null"})`,
		);
	});

	children.set(clusterID, child);
};

const requestSelfDestruct = (child: ChildProcess) =>
	new Promise<void>((resolve) => {
		const id = randomUUID();
		const timeout = setTimeout(resolve, 5_000);

		const onMessage = (message: unknown) => {
			const payload = message as { id?: string; type?: string };
			if (payload?.id !== id) return;
			clearTimeout(timeout);
			child.off("message", onMessage);
			resolve();
		};

		child.on("message", onMessage);
		child.send({
			id,
			type: "request",
			data: {
				type: "SELF_DESTRUCT",
				reason: "Graceful shutdown",
			},
		});
	});

const shutdown = async () => {
	if (isShuttingDown) return;
	isShuttingDown = true;
	console.log("Shutting down clusters...");

	await Promise.all(
		Array.from(children.values()).map(async (child) => {
			await requestSelfDestruct(child);
			if (!child.killed) child.kill();
		}),
	);
	process.exit(0);
};

for (let clusterID = 0; clusterID < totalClusters; clusterID++) {
	startCluster(clusterID);
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());

if (process.platform === "win32") {
	const terminal = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	terminal.on("SIGINT", () => void shutdown());
}
