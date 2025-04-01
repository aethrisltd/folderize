import "../style/tray.scss"; 

window.onload = async function(){
    let drop_area = document.getElementById("drop-area");

    document.getElementById("close-tray").onclick = function (){
        window.myAPI.closeTray();
    };

    document.addEventListener('dragover', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        drop_area.classList.add("is-dragover");
    });

    ["dragleave", "dragend", "drop"].forEach((event_to_listen) => {
        document.addEventListener(event_to_listen, function(){
            if(!navigator.onLine)
                return;
            drop_area.classList.remove("is-dragover");
        });
    });

    document.addEventListener("drop", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if(!navigator.onLine)
            return;

        let path_arr = [];
        for (const f of event.dataTransfer.files)
            path_arr.push(f.path); 
        
        displayLoader();

        try {
            const documents = await window.myAPI.processDocuments(path_arr);
            let number_of_successes = 0;
            let number_of_errors = 0;
            for(let i = 0; i < documents.length; i++){
                if(documents[i]["is_error"]){
                    number_of_errors++;
                    continue;
                }
                number_of_successes++;
            }
            document.getElementById("counts-feedback").innerText = `${number_of_successes} Success. ${number_of_errors} Errors.`;
            fadeElement(document.getElementById("counts-feedback"));
        }
        catch (e){
            console.error(e);
        }

        hideLoader();
    });


    document.getElementById("quit-button").onclick = function (){
        window.myAPI.quit();
    }

    document.getElementById("settings-button").onclick = function (){
        window.myAPI.openSettings();
    }

    document.getElementById("open-log-button").onclick = function (){
        window.myAPI.openLogWindow();
    }
}

function fadeElement(element){
    element.classList.add("fade-out");
    setTimeout(() => {
        element.classList.remove("fade-out");
    }, 5000);
}


function displayLoader(){
    document.getElementById("loader").classList.remove("is-hidden");
}

function hideLoader(){
    document.getElementById("loader").classList.add("is-hidden");
}
