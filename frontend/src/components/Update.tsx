import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useQueryClient } from "react-query";
import { useDropzone } from "react-dropzone";

const UpdateValues = () => {
	const [fileName, setFileName] = useState("No file choosen");
	const [uploading, setUploading] = useState(false);
	const [file, setFile] = useState<File | null>();
	const [error, setError] = useState<{ active: true; error: string } | { active: false }>({ active: false });
	const queryClient = useQueryClient();
	const onDrop = useCallback((acceptedFiles) => {
		if (acceptedFiles?.length === 0) return;
		setFile(() => (acceptedFiles ? acceptedFiles[0] : null));
	}, []);
	const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

	useEffect(() => {
		setFileName(file?.name || "");
	}, [file]);

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
		<div style={{ height: "100%", width: "60%" }}>
			{error.active ? (
				<div>
					`Error :${error.active} : ${error.error}`
				</div>
			) : null}
			{uploading ? (
				<div></div>
			) : (
				<form style={{ height: "85vh", display: "flex", placeContent: "center", flexDirection: "column", width: "100%", gap: "1rem" }}>
					<div {...getRootProps()} className="drop-div">
						<label htmlFor="file" className="drop-container" id="dropcontainer" style={isDragActive ? { borderColor: "#646cff" } : {}}>
							{!file ? <span className="drop-title">Click or Drop file here</span> : <span className="drop-current-file drop-title">{fileName}</span>}
							<input {...getInputProps()} id="file" accept="application/JSON" />
						</label>
					</div>
					<button onClick={uploadFile}>Update</button>
				</form>
			)}
		</div>
	);
};

export default UpdateValues;
