import "../style/index.scss";
import $ from "../lib/jquery.min.js";
import AWN from "awesome-notifications";

let notifier = new AWN({
    durations: {
        global: 2000,
    }
});

let path_separator = "";

$(document).ready(async function(){
    displayFolders();
    path_separator = await window.myAPI.getPathSeparator();
    
    const is_auto_launch_enabled = await window.myAPI.isAutoLaunchEnabled();

    $("#autoStartSwitch").prop("checked", is_auto_launch_enabled);
    const key = await window.myAPI.getOpenAIKey();
    $("#OpenAIKey").prop("value", key)
    $("#saveOpenAIKey").click(() => {
        window.myAPI.setOpenAIKey($("#OpenAIKey").val());
    });

    $(".tab-link").on('click', function(e){
        e.preventDefault();
        $(".tab-sections").addClass("is-hidden");
        $($(this).prop("target")).removeClass("is-hidden");
        $(this).parent().siblings().removeClass("is-active");
        $(this).parent().addClass("is-active");
    });

    $("#logout-button").on('click', async function(e){
        e.preventDefault();
        if($(this).prop("disabled"))
            return;
        await window.myAPI.logout();
    });

    $(".path-display").on('click', '.path-part', async function(e){
        e.preventDefault();
        let path_parts = $(this).parent().find(".path-part");
        const path = assmblePathFromParts(path_parts, false, $(this).text());
        await window.myAPI.focusFolder(path);
    });

    window.addEventListener('online', () => {
        toggleOnlineOfflineLoginClasses();
    });

    window.addEventListener('offline', () => {
        toggleOnlineOfflineLoginClasses();
    });

    $("#autoStartSwitch").on('change', async function(e){
        await window.myAPI.setAutoLaunch($(this).prop("checked"));
    });

    $("#add-folder-manually-button").on('click', async function(e){
        e.preventDefault();
        $("#add-folder-manually-modal").addClass("is-active");
    });

    $("#scan-folder-button").on('click', async function(e){
        e.preventDefault();
        $("#scan-folder-modal").addClass("is-active");
    });

    // Functions to open and close a modal
    function openModal($el) {
        $el.classList.add('is-active');
    }
    
    function closeModal($el) {
        $el.classList.remove('is-active');
    }
    
    function closeAllModals() {
        (document.querySelectorAll('.modal') || []).forEach(($modal) => {
        closeModal($modal);
        });
    }
    
    // Add a click event on various child elements to close the parent modal
    (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
        const $target = $close.closest('.modal');
    
        $close.addEventListener('click', () => {
        closeModal($target);
        });
    });
    
    // Add a keyboard event to close all modals
    document.addEventListener('keydown', (event) => {
        if(event.key === "Escape") {
            closeAllModals();
        }
    });
});

$(".select-folder").on('click', async function(e){
    let element = $(this);
    let result = await window.myAPI.selectFolder();
    if(result)
        element.find(".folder-path").text(result)	
});

$("#new_folder_form").submit(async (e) => {
    e.preventDefault();
    let folder_path = $("#new_folder_form").find(".folder-path").text();
    let folder_description = $("#new_folder_form").find("#folder_description").val();

    if (folder_path == "") {
        notifier.modal('Please select a folder');
        return;
    }

    if (folder_description == "") {
        notifier.modal("Can't add a folder without a description");
        return;
    }
    
    window.myAPI.addFolder({
        path: folder_path,
        description: folder_description
    });

    $("#new_folder_form").find(".folder-path").text("");
    $("#new_folder_form").find("#folder_description").val("");

    displayFolders();
    $("#add-folder-manually-modal").removeClass("is-active");
    notifier.success('Folder was added successfully');
    
});

$(document).on("click", '.remove-button', async function(e){
    let element = $(this);
    notifier.confirm("Are you sure you want to remove this folder?", async () => {
        let path_parts = $(this).parent().parent().find(".path-part");
        const path = assmblePathFromParts(path_parts, true, $(this).text());
        await window.myAPI.removeFolder(path);
        displayFolders();
        notifier.success('Folder was removed successfully');
    });
});

async function displayFolders(){
    const regex_path_splitor = /[\\/]/;
    let folders = await window.myAPI.getFolders();

    if(folders.length == 0){
        $("#folders_list").html(`
            <div class='notification mb-4'>
                <h3 class='has-text-centered'>No folders added yet</h3>
            </div>
        `);
        return;
    }

    $("#folders_list").html(
        `
            ${
                folders.map( folder => `
                    <div class='folders has-background-secondary rounded py-5 px-5 mb-4'>
                        <div class='columns mb-0'>
                            <div class='column'>
                                <span class='fw-bold has-text-weight-bold'>Location:</span>           
                                <div class='path-display'>
                                    ${ folder.path.split(regex_path_splitor).filter(f=>f != "").map(part => `<span class='path-part'><a>${part}</a></span>`).join("") }
                                </div>
                            </div>
                            <div>
                                <button class='button is-small mr-2 rounded remove-button'>
                                    <img src='assets/square-minus-regular.svg' class='delete-icon' />
                                </button>
                            </div>
                        </div>

                        <div class='mt-0 pt-0'>
                            <span class='fw-bold has-text-weight-bold'>Description:</span>
                            ${folder.description}
                        </div>     
                    </div>
                `
                ).join("")
            }   
        `
    )
}


function assmblePathFromParts(parts, ignore_last_slash=false, last_text=null){
    let path = path_separator == "/" ? "/" : "";

    for(let i = 0; i < parts.length; i++){
        path += $(parts[i]).text();
        
        // if its the last part and we are ignoring the last slash then break
        if(i == parts.length - 1 && ignore_last_slash)
            break;

        path += path_separator;

        if(last_text && $(parts[i]).text() == last_text)
            break;
    }
    return path;
}