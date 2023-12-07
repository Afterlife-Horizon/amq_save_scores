import express from "express";
import { getDBInfo, runDBupdate } from "./db";
import multer from "multer";
import cors from "cors";
import mariadb from "mariadb";
import dotenv from "dotenv";
dotenv.config();

const dbInfo = process.env;

export const pool = mariadb.createPool({
	host: dbInfo.DB_HOST,
	user: dbInfo.DB_USER,
	password: dbInfo.DB_PASS,
	database: dbInfo.DB_NAME,
});

let upload = multer({ storage: multer.memoryStorage() });

const server = express();

server.use(cors());

server.get("/getInfo", async (_, res) => {
	const info = await getDBInfo();
	if (info.type === "error") return res.status(500).send(info.error);
	res.json(info.values);
});

server.post("/updateGuesses", upload.single("file"), async (req, res, next) => {
	const file = req.file;
	const fileContent = JSON.parse(file.buffer.toString());
	await runDBupdate(fileContent.songs);
	const info = await getDBInfo();
	if (info.type === "error") return res.status(500).send(info);
	res.send(info);
});

const PORT = 3000;
server.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});
