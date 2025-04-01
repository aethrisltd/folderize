import $ from "../lib/jquery.min.js";
import AWN from "awesome-notifications";
import "../style/index.scss";
import "../style/log.scss";

let notifier = new AWN({
    durations: {
        global: 2000,
    }
});


$(document).ready(async function(){
    loadLog();

    $("#clear-log-button").click(async function(){
        notifier.confirm("Are you sure you want to clear the log?", async () => {
            await window.myAPI.resetDocumentLogs();
            loadLog();
        });
    });

    myAPI.handle('log_refresh', async function( event, data ) {
        loadLog();
    });
});


async function loadLog(){
    const documents_logs = await window.myAPI.getDocumentLogs();
    // Sort by timestamp
    documents_logs.sort((a, b) => {
        return new Date(b["timestamp"]) - new Date(a["timestamp"]);
    });

    const documents_log_template = $($("#log-template").html());
    $("#documents-log-list").html("");

    if (documents_logs.length == 0){
        $("#documents-log-list").append("<p class='has-text-centered p-5 has-background-dark rounded'>No logs yet</p>");
        return;
    }

    for(let i = 0; i < documents_logs.length; i++){
        documents_log_template.find("#file-name").text(documents_logs[i]["file_name"]);
        if(documents_logs[i]["is_error"]){
            documents_log_template.find("#error-icon").removeClass("is-hidden");
            documents_log_template.find("#message").text(documents_logs[i]["message"]);
        }
        else {
            documents_log_template.find("#success-icon").removeClass("is-hidden");
            documents_log_template.find("#message").text("The file was moved to " + documents_logs[i]["destination_folder"]);
            documents_log_template.find("#datetime").text(new Date(documents_logs[i]["timestamp"]).toLocaleString());
        }

        $("#documents-log-list").append(documents_log_template.clone());
        documents_log_template.find(".icon").addClass("is-hidden");
        documents_log_template.find("#message").text("");
    }
}
