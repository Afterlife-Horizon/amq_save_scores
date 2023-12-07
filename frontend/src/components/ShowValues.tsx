import axios from "axios";
import { useQuery } from "react-query";
import "./ShowValues.css";

type SongInfo = {
	guess_count: number;
	correct_guess_count: number;
	song_name_english: string;
	average: string;
};

const getValues = async () => {
	const res = await axios.get("http://localhost:3000/getInfo");
	if (res.status !== 200) return { type: "error" };
	return res.data;
};

const ShowValues = () => {
	const { data, isLoading, isError } = useQuery("values", getValues, {
		refetchInterval: 5000,
	});

	if (isLoading) return <div>Loading</div>;
	if (isError) return <div>Error</div>;
	return (
		<table className="table" cellSpacing="0" cellPadding="0" border={0} >
			<tbody>
				<tr>
					<td>
						<table cellSpacing="10" cellPadding="1" style={{ width: "100%", height: "auto" }}>
							<colgroup>
								<col span={1} style={{ width: "80%" }} />
								<col span={1} style={{ width: "5%" }} />
								<col span={1} style={{ width: "5%" }} />
								<col span={1} style={{ width: "5%" }} />
							</colgroup>
							<tbody>
								<tr>
									<th>NAME</th>
									<th>AVERAGE (%)</th>
									<th>GUESS COUNT</th>
									<th>CORRECT GUESSES</th>
								</tr>
							</tbody>
						</table>
					</td>
				</tr>
				<tr>
					<td>
						<div style={{ overflowY: "scroll", maxHeight: "80vh" }}>
							<table cellSpacing="10" cellPadding="1" border={0} style={{ width: "100%", height: "auto" }}>
								<colgroup>
									<col span={1} style={{ width: "80%" }} />
									<col span={1} style={{ width: "5%" }} />
									<col span={1} style={{ width: "5%" }} />
									<col span={1} style={{ width: "5%" }} />
								</colgroup>
								<tbody>
									{data.map((song: SongInfo) => (
										<tr>
											<td>{song.song_name_english}</td>
											<td>{song.average}</td>
											<td>{song.guess_count}</td>
											<td>{song.correct_guess_count}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	);
};

export default ShowValues;
