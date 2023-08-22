const rendertabs = (data) => {
  let tabList = [...document.querySelectorAll(".tab-list")];
  for (let id in data) {
    let tab = document.querySelector(`#${id} .tab-list`);
    tab.innerHTML = "";
    data[id].forEach((item, index) => {
      tab.innerHTML += `<div class="list-item" draggable="true" id="${item.id}"> <div class="list-item-text">${item.title}</div>
      
      <div class="taskButtons">
      ${id !== "deleted" ? ` <button class="taskDel">−
      </button>
      <button class="taskEdit">🖊</button>
  </div>`:`
  <button class="taskDel">−
      </button>
      <button class="taskRestore">🗘</button>`}
     
      </div>
      `;
    });
  }
};

const addingTask = (event, data, Id) => {
  event.preventDefault();
  let tabAdd = document.querySelector(`#${Id} .tab-add-btn`);
  if (event.target.closest(".tab-add-btn")) {
    event.target.closest(".tab-add-btn").style.display = "none";
    let tabForm = document.querySelector(`#${Id} .tab-form`);
    tabForm.style.display = "block";
  }
  let textArea = document.querySelector(`#${Id} .tab-form-textarea`);
  let tabFormAdd = document.querySelector(`#${Id} .tab-form-add-card`);
  textArea.addEventListener("input", () => {
    if (textArea.value.length > 0) {
      tabFormAdd.style.display = "flex";
    } else {
      tabFormAdd.style.display = "none";
    }
  });
  if (event.target.closest(".tab-form-add-card")) {
    if (!textArea.value.trim()) {
      textArea.value = "здесь пока пусто";
    }
    data[Id].push({
      id: Date.now(),
      title: textArea.value,
    });
    textArea.value = "";
    event.target.closest(".tab-form-add-card").style.display = "none";
    console.log(data);
  }

  if (event.target.closest(".tab-form-cancel-card")) {
    textArea.value = "";
    event.target.closest(".tab-form").style.display = "none";
    tabAdd.style.display = "flex";
  }
  localStorage.setItem("data", JSON.stringify(data));
  rendertabs(data);

};

const editingTask = (event, data) => {
  if (
    event.target.closest(".taskEdit") &&
    !event.target.closest(".tab").classList.contains("editing")
  ) {
    let tab = event.target.closest(".tab");
    let tabId = event.target.closest(".tab").id;
    tab.classList.add("editing");
    let listItem = event.target.closest(".list-item");
    let rect = listItem.getBoundingClientRect();
    let listItemLeft = rect.left;
    let listItemTop = rect.top;
    let listItemWidth = rect.width;
    let listItemHeight = rect.height;
    let editForm = document.querySelector(`#${tabId} .tab-form-edit`);
    editForm.style.cssText = `
      position: absolute;
      left: ${listItemLeft}px;
      top: ${listItemTop}px;
      width: ${listItemWidth}px;
      height: ${listItemHeight}px;
    `;
    editForm.style.display = "block";
    let textArea = document.querySelector(`#${tabId} .tab-form-edit-textarea`);
    textArea.value = listItem.firstElementChild.textContent.trim();
    textArea.select();

    let saveButton = document.querySelector(`#${tabId} .tab-form-edit-save`);
    let saveButtonClick = () => {
      if (!textArea.value.trim()) {
        textArea.value = "здесь пока пусто";
      }
      let editIndex = data[tabId].findIndex((item) => item.id === +listItem.id);
      data[tabId].splice(editIndex, 1, {
        id: +listItem.id,
        title: textArea.value,
      });
      rendertabs(data);
      localStorage.setItem("data", JSON.stringify(data));
      editForm.style.display = "none";
      tab.classList.remove("editing");
      saveButton.removeEventListener("click", saveButtonClick);
    };
    saveButton.addEventListener("click", saveButtonClick);

    let cancelButton = document.querySelector(
      `#${tabId} .tab-form-edit-cancel`
    );
    let cancelButtonClick = () => {
      editForm.style.display = "none";
      textArea = null;
      tab.classList.remove("editing");
      cancelButton.removeEventListener("click", cancelButtonClick);
    };
    cancelButton.addEventListener("click", cancelButtonClick);
  }
};

deleteAndRestoreHandler = (event, data, wrapperId, restore = false) => {
  const listId = restore ? "deleted" : wrapperId;
  const listPushId = restore ? "toDo" : "deleted";
  const id = event.target.closest(".list-item").id;
  
  const item = data[listId].find((item) => item.id === +id);
  
  data[listId] = data[listId].filter( (item) => item.id !== +id);
  data[listPushId].push(item);
  
  rendertabs(data);
  localStorage.setItem("data", JSON.stringify(data));
  }  

const init = () => {
  let data = JSON.parse(localStorage.getItem("data")) || {
    toDo: [],
    inProgress: [],
    done: [],
    deleted: [],
  };
  rendertabs(data);
  const toDo = document.querySelector("#toDo");
  const inProgress = document.querySelector("#inProgress");
  const done = document.querySelector("#done");
  const deleted = document.querySelector("#deleted");
  const tabs = document.querySelector(".tabs");
  const tabLists = [...document.querySelectorAll(".tab-list")];

  toDo.addEventListener("click", (event) => {
    editingTask(event, data);
    if(event.target.closest(".taskDel")){
    deleteAndRestoreHandler(event, data, 'toDo');}
    addingTask(event, data, "toDo");
  });

  inProgress.addEventListener("click", (event) => {
    editingTask(event, data);
    if(event.target.closest(".taskDel")){
      deleteAndRestoreHandler(event, data, 'inProgress');}
    addingTask(event, data, "inProgress");
  });

  done.addEventListener("click", (event) => {
    editingTask(event, data);
    if(event.target.closest(".taskDel")){
      deleteAndRestoreHandler(event, data, 'done');}
    addingTask(event, data, "done");
  });

  deleted.addEventListener("click", (event) => {
    editingTask(event, data);
    if(event.target.closest(".taskRestore")){
      deleteAndRestoreHandler(event, data, 'deleted', true);}
      if(event.target.closest(".taskDel")){
  const id = event.target.closest(".list-item").id;
  data["deleted"] = data["deleted"].filter( (item) => item.id !== +id);  
  rendertabs(data);
  localStorage.setItem("data", JSON.stringify(data));
        }
    addingTask(event, data, "deleted");
  });
  
  let draggedItem = null;

  tabs.addEventListener("dragstart", (event) => {
    draggedItem = event.target.closest(".list-item");
    setTimeout(() => {
      draggedItem.style.display = "none";
    }, 0);
  });

  tabs.addEventListener("dragend", (event) => {
    setTimeout(() => {
      draggedItem.style.display = "block";
      draggedItem = null;
    }, 0);
  });

  tabLists.forEach(tabList => {
    tabList.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    tabList.addEventListener("drop", (event) => {
      const targetTab = event.target.closest(".tab-list");
      const currentTab = draggedItem.closest(".tab-list");
      const targetId = targetTab.parentElement.id;
      const currentId = currentTab.parentElement.id;
      if (targetId !== currentId) {
        const itemId = draggedItem.id;
        const itemIndex = data[currentId].findIndex((item) => item.id === +itemId);
        const item = data[currentId][itemIndex];
        data[currentId].splice(itemIndex, 1);
        data[targetId].push(item);
        rendertabs(data);
        localStorage.setItem("data", JSON.stringify(data));
      }})})
};
init();
