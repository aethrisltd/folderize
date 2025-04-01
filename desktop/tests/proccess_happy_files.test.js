const Store = require("electron-store");
const path = require("path");
const fs = require("fs");
require('dotenv').config()

let { moveAllFilesFromFolderToFolder, getTable } = require("./utils");
const { processDocuments } = require("../src/file_processor");
const config = require("../src/config");

let result_documents = [];
const destination_folder_path = path.normalize(__dirname + "/test_files/destination/");
const sources_folder_path = path.normalize(__dirname + "/test_files/sources/");
const test_documents = {
	"COMP1004-CW2-2023.docx": path.join(destination_folder_path, "comp1004"),
	"comp1005-03-c_basics.pdf": path.join(destination_folder_path, "comp1005"),
	"Exam.pdf": path.join(destination_folder_path, "comp1004"),
	"downloaded_document.pdf": path.join(destination_folder_path, "comp1043"),
	"mock_exam.pdf": path.join(destination_folder_path, "comp1001"),
};

const folders = [
	{
		path: path.join(destination_folder_path, "comp1005"),
		description: "COMP1005 module programming and algorithms. Teaches the C programming language.",
	},
	{
		path: path.join(destination_folder_path, "comp1004"),
		description: "COMP1004 module Database and Interface.  Teaches the basics of web development.",
	},
	{
		path: path.join(destination_folder_path, "comp1043"),
		description: "COMP1043 modules MCS2. Teaches linear algebra and similar topics.",
	},
	{
		path: path.join(destination_folder_path, "comp1001"),
		description: "COMP1001 module. Maths for computer scientists. Semester 1. Teaches Logic, Set thoery and similar topics.",
	}
];

beforeAll(async () => {
	let new_store = new Store({
		cwd: __dirname
	});

	config.store = new_store;
	config.store.set("folders", folders);

	// create destination folders if they don't exist
	if (!fs.existsSync(destination_folder_path))
		fs.mkdirSync(destination_folder_path);

	for (let p of Object.values(test_documents))
		if (!fs.existsSync(p))
			fs.mkdirSync(p);

	moveAllFilesFromFolderToFolder(destination_folder_path, __dirname + "/test_files/sources",);


	let test_documents_paths = Object.keys(test_documents).map(key => path.join(sources_folder_path, key));
	const t0 = performance.now();
	result_documents = await processDocuments(test_documents_paths);
	const t1 = performance.now();
	console.log("Call to processDocuments took " + (t1 - t0) + " milliseconds.");
	fs.writeFileSync(__dirname + "/test_files/result.text", getTable(result_documents));
}, 9000);

afterAll(() => {
	config.store.set("folders", []);
	moveAllFilesFromFolderToFolder(destination_folder_path, __dirname + "/test_files/sources",);
});

test("all documents should be processed", () => {
	for (let document of result_documents)
		expect(document["is_error"]).toBe(false);
});

test("all documents should be moved to the correct folder", () => {
	for (let document of result_documents)
		expect(document["destination_folder"]).toBe(test_documents[document["file_name"]]);
});
