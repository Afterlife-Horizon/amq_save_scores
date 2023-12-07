import React, { useState } from "react";
import axios from "axios";
import { useQueryClient } from "react-query";

const UpdateValues = () => {
	const [uploading, setUploading] = useState(false);
	const [file, setFile] = useState<File | null>();
	const [error, setError] = useState<{ active: true; error: string } | { active: false }>({ active: false });
	const queryClient = useQueryClient();

	async function uploadFile(e: React.FormEvent<HTMLButtonElement>) {
		e.preventDefault();

		if (!file) return;

		setUploading(true);

		const formData = new FormData();
		formData.append("file", file);

		const res = await axios.post("http://localhost:3000/updateGuesses", formData, {
			headers: {
				Accept: "application/json",
				"Access-Control-Allow-Origin": "*",
				"Content-Type": "multipart/form-data",
			},
		});
		if (res.status !== 200) setError({ active: true, error: res.data.error });
		setUploading(false);
		queryClient.invalidateQueries("values");
	}
	return (
		<div style={{ height: "100%" }}>
			<div>{error.active ? `Error :${error.active} : ${error.error}` : null}</div>
			{uploading ? (
				<div></div>
			) : (
				<form>
					<input type="file" onChange={(e) => setFile(() => (e.target.files ? e.target.files[0] : null))} />
					<button onClick={uploadFile}>Update</button>
				</form>
			)}
		</div>
	);
};

export default UpdateValues;
