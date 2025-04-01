const fs = require("fs");
const path = require("path");
const reader = require('any-text');
const OpenAI = require("openai");
const config = require("./config");

const globals = require("./globals");

async function processDocuments(documents_paths){
    let folders = config.getFolders();
    if (folders.length == 0)
        return logAndGetErrorForAllDocuments(documents_paths, "You have not created any folders yet. Please create a folder first.")

    let folders_to_pass = [];
    for(let i = 0; i < folders.length; i++)
        folders_to_pass.push({
            id: i,
            description: folders[i].description,
            path: folders[i].path
        })


    const documents_results = await Promise.all(documents_paths.map(document_path => proccess_document(document_path, folders_to_pass)));
    logDocumentResults(documents_results);

    return documents_results;
}

async function proccess_document(document_path, folders){
    const client = new OpenAI({
        apiKey: config.getOpenAIKey()
    });

    let file_name = path.parse(document_path).base;
    try {
        precheckDocument(document_path);

        let content = await reader.getText(document_path);
        let destination_folder = await findRightFolder(content, folders, file_name, client);

        if (!destination_folder)
            throw Error("Could not find a suitable folder for this document");
        
        // check that the folder exists
        if(!fs.existsSync(destination_folder.path))
            throw Error("Destination folder does not exist" + destination_folder.path);

        // check if the destination folder is the same as the document source folder
        if(path.parse(document_path).dir == destination_folder.path)
            throw Error("Destination folder is the same as the document source folder");
        
        // check that can write to the folder
        try {
            fs.accessSync(destination_folder.path, fs.constants.W_OK);
        }
        catch (e){
            throw Error("You dont have access to the destination folder");
        }

        // Copy the file
        fs.copyFileSync(document_path, path.join(destination_folder.path, file_name));

        // Check that the fil has been copied
        if(!fs.existsSync(path.join(destination_folder.path, file_name)))
            throw Error("Error while copying the file to the destination folder");

        // Delete the original file
        try {
            fs.unlinkSync(document_path);
        }
        catch (e){
            throw Error("File has been copied to the destination folder. However, the original file could not be deleted.");
        }

        return {
            "is_error": false,
            "file_name": file_name,
            "source_path": document_path,
            "message": "File has been copied to the destination folder.",
            "destination_folder": destination_folder.path
        }
    }
    catch (e){
        return {
            "is_error": true,
            "file_name": file_name,
            "message": e.message,
            "source_path": document_path
        }
    }
}

function precheckDocument(document_path){
    if(!fs.existsSync(document_path))
        throw Error("File does not exist");

        try {
            fs.accessSync(document_path);
        }
        catch (e){
            throw Error("You have dropped a document that you dont have access to.")
        }
        
    return true;
}

async function findRightFolder(document_content, folders, file_name, client){
 
    const folders_prep = folders.map((f) => `${f['id']}. Description: ${f['description']}`).join("\n")

    // returns folder id
    const response = await client.responses.create({
        model: "o3-mini",
        input: [
            { 
                "role": "system", 
                "content": `You are an intelligent document sorter. Your task is to categorize a given document based on its name, content, and a provided list of folders with their descriptions.
Here's what you need to do:
1. Consider the document name and content carefully.
2. Compare the document name and content with the descriptions of the folders.
3. Find the folder that is the most appropriate match for the document based on its name and content.
4. Do not make assumptions or guesses. You must be specific and accurate.
5. If the document content does not precisely match folder description, do not assign it to folder.
6. If the document does not match any folders then return error. 
7. Avoid linking the document to an unrelated folder based on loose associations. The document must fit the folder description exactly.
8. Sometimes the list of folders contains similer descriptions. In this case, you must assign the document to the folder that is the most specific match. Example: If the document is about a dog, it should not be assigned to the folder about animals; it must go to the folder specifically about dogs. Unless the only available folder is about animals.
9. Respond with the ID of the correct folder in JSON format. For example: {"id": X}.
10. Only respond with "error" if you are uncertain about the correct folder assignment.
**Task:**
Determine the ID of the folder that best matches the document based on its name and content.`
            },
            {
            "role": "user", 
            "content": `Document Content:
"${document_content.slice(0, 1000)}"
Document Name: ${file_name}
Folders List:
${folders_prep}`
            }
        ]
    });

    if(response.output_text == "error")
        return undefined;
    
    const response_data = JSON.parse(response.output_text);
    return folders.filter(f => f.id == response_data.id)[0];
}


function logAndGetErrorForAllDocuments(document_paths, error_message){
    let documents_results = [];
    for (document_path of document_paths){
        documents_results.push({
            "is_error": true,
            "file_name": path.parse(document_path).base,
            "message": error_message,
            "source_path": document_path
        })
    }

    logDocumentResults(documents_results);

    return documents_results;
}

function logDocumentResults(documents_results){
    for (const document_result of documents_results){
        document_result["timestamp"] = Date.now();
        config.addDocumentLog(document_result);
    }
    if(globals.log_window)
        globals.log_window.webContents.send("log_refresh", {});
}

module.exports = {
    processDocuments
}