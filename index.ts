interface IEvent {
  target: EventTarget | null;
  preventDefault: () => void;
}

interface ITodoItem{
    id: number|string;
    title: string;
    isDelete: boolean;
};
interface IData{
    toDo: ITodoItem[];
    inProgress:  ITodoItem[];
    done:  ITodoItem[];
    deleted:  ITodoItem[];
}

const rendertabs = (data: IData):void => {
    let id:keyof IData;
    for (id in data) {
      let tab = document.querySelector(`#${id} .tab-list`) as HTMLElement;
      tab.innerHTML = "";
      data[id].forEach((item:ITodoItem) => {
        tab.innerHTML += `<div class="list-item" draggable="true" id="${item.id}"> <div class="list-item-text">${item.title}</div>
        
        <div class="taskButtons">
        ${!item.isDelete ? ` <button class="taskDel">−
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

  
  const addingTask = (event: IEvent, data: IData, Id: keyof IData): void => {
    event.preventDefault();
    const element = event.target as HTMLElement;
  
    let tabAdd = document.querySelector(`#${Id} .tab-add-btn`) as HTMLElement;
    if (element.closest(".tab-add-btn")) {
      const tabAddBtn = element.closest(".tab-add-btn") as HTMLElement;
      tabAddBtn.style.display = "none";
      let tabForm = document.querySelector(`#${Id} .tab-form`) as HTMLElement;
      tabForm.style.display = "block";
    }
  
    let textArea = document.querySelector(`#${Id} .tab-form-textarea`) as HTMLInputElement;
    let tabFormAdd = document.querySelector(`#${Id} .tab-form-add-card`) as HTMLElement;
  
    textArea.addEventListener("input", () => {
      if (textArea.value.length > 0) {
        tabFormAdd.style.display = "flex";
      } else {
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
      const tabFormAddCard = element.closest(".tab-form-add-card") as HTMLElement;
      tabFormAddCard.style.display = "none";
  
      console.log(data);
    }
  
    if (element.closest(".tab-form-cancel-card")) {
      textArea.value = "";
      const tabForm = element.closest(".tab-form") as HTMLElement;
      tabForm.style.display = "none";
      tabAdd.style.display = "flex";
    }
  
    localStorage.setItem("data", JSON.stringify(data));
    rendertabs(data);
  };
  
  const editingTask = (event:any, data:IData):void => {
    if (
      event.target.closest(".taskEdit") &&
      !event.target.closest(".tab").classList.contains("editing")
    ) {
      let tab = event.target.closest(".tab");
      let tabId:keyof IData = event.target.closest(".tab").id;
      tab.classList.add("editing");
      let listItem = event.target.closest(".list-item");
      let rect = listItem.getBoundingClientRect();
      let listItemLeft = rect.left;
      let listItemTop = rect.top;
      let listItemWidth = rect.width;
      let listItemHeight = rect.height;
      let editForm = document.querySelector(`#${tabId} .tab-form-edit`) as HTMLElement;
      editForm.style.cssText = `
        position: absolute;
        left: ${listItemLeft}px;
        top: ${listItemTop}px;
        width: ${listItemWidth}px;
        height: ${listItemHeight}px;
      `;
      editForm.style.display = "block";
      let textArea = document.querySelector(`#${tabId} .tab-form-edit-textarea`) as HTMLInputElement;
      textArea.value = listItem.firstElementChild.textContent.trim();
      textArea.select();
  
      let saveButton = document.querySelector(`#${tabId} .tab-form-edit-save`) as HTMLElement;
      let saveButtonClick = () => {
        if (!textArea.value.trim()) {
          textArea.value = "здесь пока пусто";
        }
        let editIndex = data[tabId].findIndex((item) => item.id === +listItem.id);
        data[tabId].splice(editIndex, 1, {
          id: +listItem.id,
          title: textArea.value,
          isDelete:false,
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
      ) as HTMLElement;
      let cancelButtonClick = () => {
        editForm.style.display = "none";
        // textArea = null;
        tab.classList.remove("editing");
        cancelButton.removeEventListener("click", cancelButtonClick);
      };
      cancelButton.addEventListener("click", cancelButtonClick);
    }
  };
  const deleteAndRestoreHandler = (event:IEvent, data:IData, wrapperId:keyof IData, restore:boolean = false):void => {
    const element = event.target as HTMLElement;
    const listId:keyof IData = restore ? "deleted" : wrapperId;
    const listPushId: "toDo" | "deleted" = restore ? "toDo" : "deleted";
    const id:string|undefined = element.closest(".list-item")?.id;
    if(!id){return}
    const item:ITodoItem|undefined = data[listId].find((item:ITodoItem) => item.id === +id);
    data[listId] = data[listId].filter( (item:ITodoItem) => item.id !== +id);
    if(item){
    data[listPushId].push(item);
    item.isDelete = !item.isDelete; 
    console.log(!item.isDelete);}
    rendertabs(data);
    localStorage.setItem("data", JSON.stringify(data));
    }  
  
  const init = (): void => {
    const storedData = localStorage.getItem("data");
    let data: IData = storedData
      ? JSON.parse(storedData)
      : {
          toDo: [],
          inProgress: [],
          done: [],
          deleted: [],
        };
    rendertabs(data);
    const toDo: Element | null = document.querySelector("#toDo");
    const inProgress: Element | null = document.querySelector("#inProgress");
    const done: Element | null = document.querySelector("#done");
    const deleted: Element | null = document.querySelector("#deleted");
    const tabs: Element | null = document.querySelector(".tabs");
    const tabLists: Element[] = [...document.querySelectorAll(".tab-list")];

    toDo?.addEventListener("click", (event:IEvent) => {
      const element = event.target as HTMLElement;
      editingTask(event, data);
      if (element.closest(".taskDel")) {
        deleteAndRestoreHandler(event, data, "toDo");
      }
      addingTask(event, data, "toDo");
    });

    inProgress?.addEventListener("click", (event:IEvent) => {
      const element = event.target as HTMLElement;
      editingTask(event, data);
      if (element.closest(".taskDel")) {
        deleteAndRestoreHandler(event, data, "inProgress");
      }
      addingTask(event, data, "inProgress");
    });

    done?.addEventListener("click", (event:IEvent) => {
      const element = event.target as HTMLElement;
      editingTask(event, data);
      if (element.closest(".taskDel")) {
        deleteAndRestoreHandler(event, data, "done");
      }
      addingTask(event, data, "done");
    });

    deleted?.addEventListener("click", (event:IEvent) => {
      const element = event.target as HTMLElement;
      editingTask(event, data);
      if (element.closest(".taskRestore")) {
        deleteAndRestoreHandler(event, data, "deleted", true);
      }
      if (element.closest(".taskDel")) {
        const id = element.closest(".list-item")?.id;
        if (id) {
          data["deleted"] = data["deleted"].filter((item) => item.id !== +id);
          rendertabs(data);
        }
        localStorage.setItem("data", JSON.stringify(data));
      }
      addingTask(event, data, "deleted");
    });

    let draggedItem: any = null;

    tabs?.addEventListener("dragstart", (event:IEvent) => {
      const element = event.target as HTMLElement;
      draggedItem = element.closest(".list-item");
      setTimeout(() => {
        draggedItem.style.display = "none";
      }, 0);
    });

    tabs?.addEventListener("dragend", (event:IEvent) => {
      setTimeout(() => {
        draggedItem.style.display = "block";
        draggedItem = null;
      }, 0);
    });

    tabLists.forEach((tabList) => {
      tabList.addEventListener("dragover", (event:IEvent) => {
        event.preventDefault();
      });

      tabList.addEventListener("drop", (event:IEvent) => {
        const element = event.target as HTMLElement;
        const targetTab = element.closest(".tab-list") as HTMLElement;
        const currentTab = draggedItem.closest(".tab-list");
        const targetId = targetTab.parentElement?.id as keyof IData;
        const currentId: keyof IData = currentTab.parentElement.id;
        if (targetId !== currentId) {
          const itemId = draggedItem.id;
          const itemIndex = data[currentId].findIndex(
            (item) => item.id === +itemId
          );
          const item = data[currentId][itemIndex];
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