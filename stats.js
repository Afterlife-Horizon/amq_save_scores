import mariadb from "mariadb";
import prompt_sync from "prompt-sync";
import fs from "fs";
import path from "node:path";

const prompt = prompt_sync();

const dbInfo = process.env;

console.log(dbInfo.DB_HOST, dbInfo.DB_USER, dbInfo.DB_PASS, dbInfo.DB_NAME);
process.exit(0);

const pool = mariadb.createPool({
	host: dbInfo.DB_HOST,
	user: dbInfo.DB_USER,
	password: dbInfo.DB_PASS,
	database: dbInfo.DB_NAME,
});

async function createSongRow(conn, song) {
	const id = song.songInfo.annId;
	const anime_name_english = song.songInfo.animeNames.english;
	const anime_name_romaji = song.songInfo.animeNames.romaji;
	const song_url = song.videoUrl;
	const anime_genre = JSON.stringify(song.songInfo.animeGenre);
	conn
		.query("INSERT INTO anime_songs (id, song_name_english, song_name_romaji, song_url, anime_genre) VALUES (?, ?, ?, ?, ?)", [id, anime_name_english, anime_name_romaji, song_url, anime_genre])
		.catch((err) => {
			console.log(err);
			process.exit(1);
		});
}

async function createGuessRow(conn, song) {
	const id = song.songInfo.annId;
	const correct_guess_count = song.correctGuess ? 1 : 0;
	conn.query("INSERT INTO guess_counts (song_id, correct_guess_count) VALUES (?, ?)", [id, correct_guess_count]).catch((err) => {
		console.log(err);
		process.exit(1);
	});
}

async function updateGuess(conn, song) {
	const id = song.songInfo.annId;
	if (song.correctGuess)
		conn.query("UPDATE guess_counts SET guess_count=guess_count + 1, correct_guess_count = correct_guess_count + 1 WHERE song_id=?", [id]).catch((err) => {
			console.log(err);
			process.exit(1);
		});
	else
		conn.query("UPDATE guess_counts SET guess_count=guess_count + 1 WHERE song_id=?", [id]).catch((err) => {
			console.log(err);
			process.exit(1);
		});
}

async function runDBupdate(data) {
	data.songs.forEach((song) => {
		pool.getConnection().then((conn) => {
			conn
				.query(`SELECT id, guess_count, correct_guess_count FROM anime_songs, guess_counts WHERE id=? AND song_id=?`, [song.songInfo.annId, song.songInfo.annId])
				.then((rows) => {
					if (rows.length === 0) {
						createSongRow(conn, song);
						createGuessRow(conn, song);
					} else updateGuess(conn, song);
				})
				.catch((err) => {
					console.error(err);
				})
				.finally(() => {
					conn.end();
				});
		});
	});
}

async function getInfo() {
	const rows = await pool.getConnection().then((conn) => {
		return conn
			.query("SELECT guess_count, correct_guess_count, song_name_english, (correct_guess_count/guess_count * 100) AS average FROM anime_songs, guess_counts WHERE song_id=id ORDER BY average")
			.catch((err) => {
				console.log(err);
				process.exit(1);
			});
	});
	return rows;
}

const input = prompt("File Path: ");
const newPath = path.join(process.cwd(), input);

console.log("[1/4] Reading file ", newPath);
try {
	if (!fs.existsSync(newPath)) {
		console.log("File does not exists/unable to read it!");
		process.exit(1);
	}
	const buffer = fs.readFileSync(newPath);
	const data = JSON.parse(buffer);
	console.log(`[2/4] updating DB`);
	runDBupdate(data);
	console.log(`[3/4] Getting info from DB`);
	const rows = await getInfo(data);
	const resultPath = path.join(process.cwd(), "results.json");
	console.log(`[4/4] Printing it to file: ${resultPath}`);
	fs.writeFileSync(resultPath, JSON.stringify(rows));
	process.exit(0);
} catch (err) {
	console.error(err);
	process.exit(1);
}
