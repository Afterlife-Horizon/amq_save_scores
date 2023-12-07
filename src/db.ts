import mariadb from "mariadb";
import { pool } from ".";

type ReturnValues<T> =
	| {
			type: "error";
			error: any;
	  }
	| {
			type: "success";
			values: T;
	  };

type Song = {
	songInfo: {
		annId: number;
		animeNames: {
			english: string;
			romaji: string;
		};
		animeGenre: string;
	};
	videoUrl: string;
	correctGuess: number;
};

export async function createSongRow(conn: mariadb.PoolConnection, song: Song) {
	const id = song.songInfo.annId;
	const anime_name_english = song.songInfo.animeNames.english;
	const anime_name_romaji = song.songInfo.animeNames.romaji;
	const song_url = song.videoUrl;
	const anime_genre = JSON.stringify(song.songInfo.animeGenre);
	conn
		.query("INSERT INTO anime_songs (id, song_name_english, song_name_romaji, song_url, anime_genre) VALUES (?, ?, ?, ?, ?)", [id, anime_name_english, anime_name_romaji, song_url, anime_genre])
		.catch((err: any) => {
			console.log(err);
			process.exit(1);
		});
}

export async function createGuessRow(conn: mariadb.PoolConnection, song: Song) {
	const id = song.songInfo.annId;
	const correct_guess_count = song.correctGuess ? 1 : 0;
	conn.query("INSERT INTO guess_counts (song_id, correct_guess_count) VALUES (?, ?)", [id, correct_guess_count]).catch((err: any) => {
		console.log(err);
		process.exit(1);
	});
}

export async function updateGuess(conn: mariadb.PoolConnection, song: Song) {
	const id = song.songInfo.annId;
	conn.query(`UPDATE guess_counts SET guess_count=guess_count + 1${song.correctGuess ? ", correct_guess_count = correct_guess_count + 1" : ""} WHERE song_id=?`, [id]).catch((err: any) => {
		console.log(err);
		process.exit(1);
	});
}

export async function runDBupdate(songs: Song[]) {
	songs.forEach((song: Song) => {
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
				});
			conn.end();
		});
	});
}

export async function getDBInfo(): Promise<ReturnValues<{ guess_count: number; correct_guess_count: number; song_name_english: string; average: number }[]>> {
	return await pool.getConnection().then(async (conn) => {
		try {
			const rows = (await conn.query(
				"SELECT guess_count, correct_guess_count, song_name_english, (correct_guess_count/guess_count * 100) AS average FROM anime_songs, guess_counts WHERE song_id=id ORDER BY average"
			)) as { guess_count: number; correct_guess_count: number; song_name_english: string; average: number }[];
			conn.end();
			const newRows = rows.map((song) => {
				return {
					...song,
					average: Math.floor(Number(song.average)),
				};
			});
			return {
				type: "success",
				values: newRows,
			};
		} catch (err) {
			console.log(err);
			conn.end();
			return {
				type: "error",
				error: err,
			};
		}
	});
}
