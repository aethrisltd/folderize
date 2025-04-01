const fs = require('fs');
const path = require("path");
const { Console } = require('console');
const { Transform } = require('stream');

function moveAllFilesFromFolderToFolder(from_folder, to_folder){
	if (!fs.	existsSync(to_folder)) 
		fs.mkdirSync(to_folder);

	let files = fs.readdirSync(from_folder, { withFileTypes: true });

	for (let file of files) {
		if (file.isDirectory()) {
			let sub_files = fs.readdirSync(path.join(from_folder, file.name), { withFileTypes: true });
			
			for (let sub_file of sub_files)
				fs.renameSync(path.join(from_folder, file.name, sub_file.name), path.join(to_folder, sub_file.name));
		} else {
			fs.renameSync(path.join(from_folder, file.name), path.join(to_folder, file.name));
		}
	}
}

const ts = new Transform({ transform(chunk, enc, cb) { cb(null, chunk) } })
const logger = new Console({ stdout: ts })

function getTable (data) {
  logger.table(data)
  return (ts.read() || '').toString()
}

module.exports = {
    moveAllFilesFromFolderToFolder,
	getTable,
}
