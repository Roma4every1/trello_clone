var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
;
var rendertabs = function (data) {
    var id;
    var _loop_1 = function () {
        var tab = document.querySelector("#".concat(id, " .tab-list"));
        tab.innerHTML = "";
        data[id].forEach(function (item) {
            tab.innerHTML += "<div class=\"list-item\" draggable=\"true\" id=\"".concat(item.id, "\"> <div class=\"list-item-text\">").concat(item.title, "</div>\n        \n        <div class=\"taskButtons\">\n        ").concat(!item.isDelete ? " <button class=\"taskDel\">\u2212\n        </button>\n        <button class=\"taskEdit\">\uD83D\uDD8A</button>\n    </div>" : "\n    <button class=\"taskDel\">\u2212\n        </button>\n        <button class=\"taskRestore\">\uD83D\uDDD8</button>", "\n       \n        </div>\n        ");
        });
    };
    for (id in data) {
        _loop_1();
    }
};
var addingTask = function (event, data, Id) {
    event.preventDefault();
    var element = event.target;
    var tabAdd = document.querySelector("#".concat(Id, " .tab-add-btn"));
    if (element.closest(".tab-add-btn")) {
        var tabAddBtn = element.closest(".tab-add-btn");
        tabAddBtn.style.display = "none";
        var tabForm = document.querySelector("#".concat(Id, " .tab-form"));
        tabForm.style.display = "block";
    }
    var textArea = document.querySelector("#".concat(Id, " .tab-form-textarea"));
    var tabFormAdd = document.querySelector("#".concat(Id, " .tab-form-add-card"));
    textArea.addEventListener("input", function () {
        if (textArea.value.length > 0) {
            tabFormAdd.style.display = "flex";
        }
        else {
            tabFormAdd.style.display = "none";
        }
    });
    if (element.closest(".tab-form-add-card")) {
        if (!textArea.value.trim()) {
            textArea.value = "здесь пока пусто";
        }
        data[Id].push({
            id: Date.now(),
            title: textArea.value,
            isDelete: false,
        });
        textArea.value = "";
        var tabFormAddCard = element.closest(".tab-form-add-card");
        tabFormAddCard.style.display = "none";
        console.log(data);
    }
    if (element.closest(".tab-form-cancel-card")) {
        textArea.value = "";
        var tabForm = element.closest(".tab-form");
        tabForm.style.display = "none";
        tabAdd.style.display = "flex";
    }
    localStorage.setItem("data", JSON.stringify(data));
    rendertabs(data);
};
var editingTask = function (event, data) {
    if (event.target.closest(".taskEdit") &&
        !event.target.closest(".tab").classList.contains("editing")) {
        var tab_1 = event.target.closest(".tab");
        var tabId_1 = event.target.closest(".tab").id;
        tab_1.classList.add("editing");
        var listItem_1 = event.target.closest(".list-item");
        var rect = listItem_1.getBoundingClientRect();
        var listItemLeft = rect.left;
        var listItemTop = rect.top;
        var listItemWidth = rect.width;
        var listItemHeight = rect.height;
        var editForm_1 = document.querySelector("#".concat(tabId_1, " .tab-form-edit"));
        editForm_1.style.cssText = "\n        position: absolute;\n        left: ".concat(listItemLeft, "px;\n        top: ").concat(listItemTop, "px;\n        width: ").concat(listItemWidth, "px;\n        height: ").concat(listItemHeight, "px;\n      ");
        editForm_1.style.display = "block";
        var textArea_1 = document.querySelector("#".concat(tabId_1, " .tab-form-edit-textarea"));
        textArea_1.value = listItem_1.firstElementChild.textContent.trim();
        textArea_1.select();
        var saveButton_1 = document.querySelector("#".concat(tabId_1, " .tab-form-edit-save"));
        var saveButtonClick_1 = function () {
            if (!textArea_1.value.trim()) {
                textArea_1.value = "здесь пока пусто";
            }
            var editIndex = data[tabId_1].findIndex(function (item) { return item.id === +listItem_1.id; });
            data[tabId_1].splice(editIndex, 1, {
                id: +listItem_1.id,
                title: textArea_1.value,
                isDelete: false,
            });
            rendertabs(data);
            localStorage.setItem("data", JSON.stringify(data));
            editForm_1.style.display = "none";
            tab_1.classList.remove("editing");
            saveButton_1.removeEventListener("click", saveButtonClick_1);
        };
        saveButton_1.addEventListener("click", saveButtonClick_1);
        var cancelButton_1 = document.querySelector("#".concat(tabId_1, " .tab-form-edit-cancel"));
        var cancelButtonClick_1 = function () {
            editForm_1.style.display = "none";
            // textArea = null;
            tab_1.classList.remove("editing");
            cancelButton_1.removeEventListener("click", cancelButtonClick_1);
        };
        cancelButton_1.addEventListener("click", cancelButtonClick_1);
    }
};
var deleteAndRestoreHandler = function (event, data, wrapperId, restore) {
    var _a;
    if (restore === void 0) { restore = false; }
    var element = event.target;
    var listId = restore ? "deleted" : wrapperId;
    var listPushId = restore ? "toDo" : "deleted";
    var id = (_a = element.closest(".list-item")) === null || _a === void 0 ? void 0 : _a.id;
    if (!id) {
        return;
    }
    var item = data[listId].find(function (item) { return item.id === +id; });
    data[listId] = data[listId].filter(function (item) { return item.id !== +id; });
    if (item) {
        data[listPushId].push(item);
        item.isDelete = !item.isDelete;
        console.log(!item.isDelete);
    }
    rendertabs(data);
    localStorage.setItem("data", JSON.stringify(data));
};
var init = function () {
    var storedData = localStorage.getItem("data");
    var data = storedData
        ? JSON.parse(storedData)
        : {
            toDo: [],
            inProgress: [],
            done: [],
            deleted: [],
        };
    rendertabs(data);
    var toDo = document.querySelector("#toDo");
    var inProgress = document.querySelector("#inProgress");
    var done = document.querySelector("#done");
    var deleted = document.querySelector("#deleted");
    var tabs = document.querySelector(".tabs");
    var tabLists = __spreadArray([], document.querySelectorAll(".tab-list"), true);
    toDo === null || toDo === void 0 ? void 0 : toDo.addEventListener("click", function (event) {
        var element = event.target;
        editingTask(event, data);
        if (element.closest(".taskDel")) {
            deleteAndRestoreHandler(event, data, "toDo");
        }
        addingTask(event, data, "toDo");
    });
    inProgress === null || inProgress === void 0 ? void 0 : inProgress.addEventListener("click", function (event) {
        var element = event.target;
        editingTask(event, data);
        if (element.closest(".taskDel")) {
            deleteAndRestoreHandler(event, data, "inProgress");
        }
        addingTask(event, data, "inProgress");
    });
    done === null || done === void 0 ? void 0 : done.addEventListener("click", function (event) {
        var element = event.target;
        editingTask(event, data);
        if (element.closest(".taskDel")) {
            deleteAndRestoreHandler(event, data, "done");
        }
        addingTask(event, data, "done");
    });
    deleted === null || deleted === void 0 ? void 0 : deleted.addEventListener("click", function (event) {
        var _a;
        var element = event.target;
        editingTask(event, data);
        if (element.closest(".taskRestore")) {
            deleteAndRestoreHandler(event, data, "deleted", true);
        }
        if (element.closest(".taskDel")) {
            var id_1 = (_a = element.closest(".list-item")) === null || _a === void 0 ? void 0 : _a.id;
            if (id_1) {
                data["deleted"] = data["deleted"].filter(function (item) { return item.id !== +id_1; });
                rendertabs(data);
            }
            localStorage.setItem("data", JSON.stringify(data));
        }
        addingTask(event, data, "deleted");
    });
    var draggedItem = null;
    tabs === null || tabs === void 0 ? void 0 : tabs.addEventListener("dragstart", function (event) {
        var element = event.target;
        draggedItem = element.closest(".list-item");
        setTimeout(function () {
            draggedItem.style.display = "none";
        }, 0);
    });
    tabs === null || tabs === void 0 ? void 0 : tabs.addEventListener("dragend", function (event) {
        setTimeout(function () {
            draggedItem.style.display = "block";
            draggedItem = null;
        }, 0);
    });
    tabLists.forEach(function (tabList) {
        tabList.addEventListener("dragover", function (event) {
            event.preventDefault();
        });
        tabList.addEventListener("drop", function (event) {
            var _a;
            var element = event.target;
            var targetTab = element.closest(".tab-list");
            var currentTab = draggedItem.closest(".tab-list");
            var targetId = (_a = targetTab.parentElement) === null || _a === void 0 ? void 0 : _a.id;
            var currentId = currentTab.parentElement.id;
            if (targetId !== currentId) {
                var itemId_1 = draggedItem.id;
                var itemIndex = data[currentId].findIndex(function (item) { return item.id === +itemId_1; });
                var item = data[currentId][itemIndex];
                data[currentId].splice(itemIndex, 1);
                if (targetId) {
                    data[targetId].push(item);
                }
                targetId === "deleted"
                    ? (item.isDelete = true)
                    : (item.isDelete = false);
                rendertabs(data);
                localStorage.setItem("data", JSON.stringify(data));
            }
        });
    });
};
init();
