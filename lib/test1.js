let api = new NasMailContractApi();

let isExtensionExist;
window.addEventListener("load", function () {
    isExtensionExist = typeof (webExtensionWallet) !== "undefined";
    if (!isExtensionExist) {
        document.querySelector(".noExtension").attributes.removeNamedItem("hidden");
    } else {
        if (window.localStorage) {
            let count = window.localStorage.getItem("inputCount");
            document.querySelector("#loadInput .counter").innerHTML = count;
            count = window.localStorage.getItem("outputCount");
            document.querySelector("#loadOutput .counter").innerHTML = count;
            count = window.localStorage.getItem("removedCount");
            document.querySelector("#loadRemoved .counter").innerHTML = count;
        }

        api.getInputSimulate(function (apiResponse) {
            let count = getCount(apiResponse);
            document.querySelector("#loadInput .counter").innerHTML = count;
            window.localStorage.setItem("inputCount", count);
        });
        api.getOutput(function (apiResponse) {
            let count = getCount(apiResponse);
            document.querySelector("#loadOutput .counter").innerHTML = count;
            window.localStorage.setItem("outputCount", count);
        });
        api.getRemoved(function (apiResponse) {
            let count = getCount(apiResponse);
            document.querySelector("#loadRemoved .counter").innerHTML = count;
            window.localStorage.setItem("removedCount", count);
        });

        let getCount = (resp) => {
            let count = "";
            if (resp && resp.result) {
                let result = JSON.parse(resp.result);
                for (const mail of result) {
                    count++;
                }
            }
            return count;
        }
    }
});

window.postMessage({
    "target": "contentscript",
    "data": {},
    "method": "getAccount",
}, "*");

window.addEventListener('message', function (e) {
    if (e.data.data && !!e.data.data.account) {
        document.getElementById("profile").append(e.data.data.account);
    }
});