let addPanel_editMode = false;
let lastClickedTask = null;
let chboxClickStatus = false;
const info_tiDate_intl = new Intl.DateTimeFormat('ru');

const info_ControlPanel = document.getElementById("taskControls");
const info_ViewPanelElem = document.getElementById("taskInfo");
const info_IdElem = info_ViewPanelElem.querySelector("#tiId");
const info_tiCreationDate = info_ViewPanelElem.querySelector("#tiCreationDate");
const info_tiUpdateDate = info_ViewPanelElem.querySelector("#tiUpdateDate");
const info_tiPerformDate = info_ViewPanelElem.querySelector("#tiPerformDate");
const info_TitleAreaElem = info_ViewPanelElem.querySelector("#tiTitle-area");
const info_DescAreaElem = info_ViewPanelElem.querySelector("#tiDesc-area");

const contentBox = document.querySelector("#content-box");
const className_taskBox = "content-container-task-box";

const addPanel = document.getElementById('addPanel');
const addPanel_headTitle = addPanel.querySelector("#form-addTask-headTask");
const addPanel_date = addPanel.querySelector("#perform");
const addPanel_title = addPanel.querySelector("#title");
const addPanel_desc = addPanel.querySelector("#description");

document.addEventListener("DOMContentLoaded", drawTasks);
document.getElementById("del_task_control").addEventListener("click", delTaskControlClick);
document.getElementById("edit_task_control").addEventListener("click", editTaskControlClick);
document.getElementById("add_task_control").addEventListener("click",addTaskControlClick);
document.getElementById("addTask__addBtn").addEventListener("click", addTask__addButtonClick);
document.getElementById("addTask__closeBtn").addEventListener("click", addTask__showhide);
addPanel_title.addEventListener("change", t_change => {addPanel_dataChanges.title = true; });
addPanel_desc.addEventListener("change", t_change => {addPanel_dataChanges.desc = true; });
addPanel_date.addEventListener("change", t_change => {addPanel_dataChanges.date = true; });

async function drawTasks(){
   tasks = getTasks();
    let taskBoxes = document.querySelectorAll(".content-container-task-box");
    for(i=0;i<taskBoxes.length;i++){
        tasks[i].click = "taskBoxClick(this)";
    };
}
//document.addEventListener("load", drawTasks);
async function getTask(id){
    const url = `/tasks/${id}`;
    const getHeadObj = { method: "GET",  headers: {'Content-Type': 'application/json'} }
        const response = await fetch(url ,getHeadObj)
       .then(res => {
          if(res.ok){
             return res.json()
          }
       });
       try{
          showTaskInfo(await response);
       }catch(err){
       }
    }

////////////////// ADDFORM Funcs////////////////////////////////////
let addPanel_dataChanges = { title: false, date: false, desc: false };
function addTask__initPanelData(head, title, desc,date){      
    addPanel_headTitle.innerHTML = head;
    addPanel_title.value = title;
    addPanel_desc.value = desc;  
    addPanel_date.value = date;      
}

function addTask__showhide(head ="", title = "", desc = "",date ="") {
    addPanel.hidden = !addPanel.hidden;  
    addTask__initPanelData(head, title, desc, date);
}

async function addTask__addButtonClick(event){
    if (addPanel_title.value === ""){   return false;}
    let data = new Object();
    let options = new Object();
    let url = "/tasks/";
    if(addPanel_dataChanges.title){ data.title = addPanel_title.value;}
    if(addPanel_dataChanges.desc){ data.description = addPanel_desc.value;}
    if(addPanel_dataChanges.date){ data.performTime = addPanel_date.value + "T23:59:59";}
    if(addPanel_editMode){
        data.id = lastClickedTask.getAttribute("t_id");
        url = url + data.id;
        options.method = "PUT";
    }else{
        options.method = "POST";
    }
    options.headers = {'Content-Type': 'application/json'};
    options.body = JSON.stringify(data) ;
    addTask__showhide();
////////////////////////////////////////////////////isDone:
    const response = fetch(url, options)
        .then(res => {if(res.ok)  return res.json();} );
    try{
         if(addPanel_editMode){
           updateTaskInfo(await response);
           addPanel_editMode = false;
         }else{
            data.id = await response;
            createTaskBox(data);
         }
    }catch(err){
    }
    addPanel_dataChanges.title = false;
    addPanel_dataChanges.date = false;
    addPanel_dataChanges.desc = false;
}

function updateTaskInfo(data){

}
///////////// GET /tasks/ /////////////////////////////////////////////////////////////

async function getTasks(){
    const options = {
                        method: "GET",
                        headers: {'Content-Type': 'application/json'}
                       };
    try{
        const response = fetch("/tasks/", options)
            .then( res => {if (res.ok) return res.json();});
        createTaskBoxes(await response);
    }catch(err){
    }
}

function createTaskBoxes(ts){
    for(i=0 ; i<ts.length;i++){
        createTaskBox(ts[i]);
    }
}

function createTaskBox(data){
    const task = document.createElement('div');
    let attrs  = task.attributes;
    task.className = className_taskBox;
    let a = document.createAttribute('t_id');
    a.nodeValue = data.id;
    attrs.setNamedItem(a);
    a = document.createAttribute("onclick");
    a.nodeValue = "taskBoxClick(this)";
    attrs.setNamedItem(a);
    //--------------create Inner Elements ---------------
    //  checkbox create
    //
    let taskInnerElem = document.createElement('input');
    taskInnerElem.type = "checkbox";
    taskInnerElem.className = "task-chbox";
    attrs  = taskInnerElem.attributes;
    taskInnerElem.id = `chekbox-${data.id}`
    a = document.createAttribute("onclick");
    a.nodeValue = "checkBoxClick(this)";
    attrs.setNamedItem(a);
    task.appendChild(taskInnerElem);
    const chkBox =  taskInnerElem;
    // tag 'p' create
    taskInnerElem = document.createElement('p');
    taskInnerElem.innerText = data.title;
    a = document.createAttribute("t_id");
    a.nodeValue = data.id;
    task.appendChild(taskInnerElem);
    task.hidden = true;
    contentBox.appendChild(task);
    chkBox.checked = data.isDone;
    decorateTaskBox(task, data.isDone);
    task.hidden = false;
}

async function checkBoxClick(obj){
    const t_id = /\d+$/.exec(obj.id)[0];
    let checkedElement = document.querySelector(`.${className_taskBox}[t_id="${t_id}"]`);
    if(checkedElement === null){
        checkedElement = document.querySelector(`.${className_taskBox}-cl[t_id="${t_id}"]`);
    }
    chboxClickStatus = true;
    const options = {
                     method: "PUT",
                     headers: {'Content-Type': 'application/json'},
                     body: JSON.stringify({id: t_id, isDone: obj.checked })
                     };
    try{
        const response = fetch(`/tasks/${t_id}`, options)
            .then( res => {
                    if (!res.ok ) obj.checked = !obj.checked;
                    console.log(obj.checked)
                    decorateTaskBox(checkedElement, obj.checked);
            });
        await response;
    }catch(err){
    }
}
function decorateTaskBox(box, status){
    box.childNodes[1].style.textDecoration = status ?  "line-through" : "none";
}

function taskBoxClick(elem){
    if (chboxClickStatus) {
        chboxClickStatus = false;
        return;
    }
    if (lastClickedTask != null){
        lastClickedTask.className = className_taskBox;
    }
    if(lastClickedTask == elem){
        lastClickedTask = null;
        elem.className = className_taskBox;
        clearAndHideTaskInfo();
    }else{
        elem.className = `${className_taskBox}-cl`;
        lastClickedTask = elem;
        getTask(lastClickedTask.getAttribute("t_id"));
    }
}

function showTaskInfo(t){
    info_IdElem.innerText = `Задача [#${t.id}]:`;
    setTimeInfo(t.creationTime, info_tiCreationDate);
    setTimeInfo(t.lastUpdateTime, info_tiUpdateDate);
    setTimeInfo(t.performTime, info_tiPerformDate);
    
    info_TitleAreaElem.innerText = t.title;
    info_DescAreaElem.innerText = t.description;
    info_ViewPanelElem.style.opacity = 1;
    info_ControlPanel.style.opacity = 1;
}

function setTimeInfo (timeStr, timeElement){
    if(timeStr != null){
      timeElement.attributes.getNamedItem("datetime").nodeValue = timeStr;
      timeElement.innerText = info_tiDate_intl.format(new Date(timeStr));
    }else{            
        timeElement.attributes.getNamedItem("datetime").nodeValue = timeStr;
        timeElement.innerText = "none";
    }
}

function clearAndHideTaskInfo(){    
    info_ViewPanelElem.style.opacity = 0;
    info_ControlPanel.style.opacity = 0;
    info_IdElem.innerText = "";
    info_TitleAreaElem.innerText = "";
    info_DescAreaElem.innerText = "";
    info_tiCreationDate.innerText = "";
}

function addTaskControlClick(){
    addTask__showhide("Добавление задачи");
    addPanel_editMode = false;
}
function editTaskControlClick(){
    if(lastClickedTask == null){console.error("///// Edit task by id////////////");
        console.log("\tFailure");
        return;
    }
    addPanel_editMode = true;
    addTask__showhide(
        "Редактирование задачи",
        info_TitleAreaElem.value, 
        info_DescAreaElem.value,
        info_tiPerformDate.innerText
    );
}

function delTaskControlClick(){
    if(lastClickedTask==null){
        console.log("///// Delete task by id////////////");
        console.log("failure");
        return;
    }
     const url = `/tasks/${lastClickedTask.getAttribute("t_id")}`;
     const getHeadObj = { method: "DELETE", // или 'PUT'
                           headers: {'Content-Type': 'application/json'}
                         }
     console.log("url: "+ url);
     const response = fetch(url ,getHeadObj)
         .then(res => {
             if(res.ok){
                 lastClickedTask.remove();
                 clearAndHideTaskInfo();
                 lastClickedTask = null;
             }else{
                 Promise.reject({ status: res.status, statusText: res.statusText });
              }
         })
         .catch(err => console.log('Error, with message:', err.statusText) );
}
