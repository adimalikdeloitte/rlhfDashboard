const { ipcRenderer } = require("electron");

document.getElementById("open-file-button").addEventListener("click", () => {
  ipcRenderer.send("open-file-dialog");
});

function getSection(data, startDelimiter, endDelimiter) {
  const startIndex = data.indexOf(startDelimiter) + startDelimiter.length;
  const endIndex = data.indexOf(endDelimiter);

  if (startIndex === -1 || endIndex === -1) {
    console.error("Delimiters not found in file");
    return;
  }

  const extractedText = data.slice(startIndex, endIndex).trim();

  return extractedText;
}

function setSection(newText, startDelimiter, endDelimiter) {
  ipcRenderer.send("set-section", { newText, startDelimiter, endDelimiter });
}

let info,
  code,
  questions,
  revisedPromptInFile,
  revisedCode,
  reasoning,
  explanation,
  originalCodeEditor,
  revisedCodeEditor,
  taskChoice = "",
  languageChoice = "",
  sofDesiredQuestion,
  sofDesiredAnswer;

function workOnCOT(data) {
  document.getElementById("content-COT").style.display = "block";
  document.getElementById("fileSelection").style.display = "none";

  info = getSection(
    data.data,
    "====================Info Start============================",
    "====================Info End===================================="
  );

  code = getSection(
    data.data,
    "====================Code Start====================================",
    "====================Code End===================================="
  );

  questions = getSection(
    data.data,
    "=======================================Questions Start======================================================",
    "=======================================Questions End==================================================="
  );

  revisedPromptInFile = getSection(
    data.data,
    "=======================================Revised Prompt Start===============================================",
    "=======================================Revised Prompt End================================================="
  );

  revisedCode = getSection(
    data.data,
    "=======================================Revised Code Start=================================================",
    "=======================================Revised Code End==================================================="
  );

  reasoning = getSection(
    data.data,
    "=======================================Reasoning Start===============================================",
    "======================================= Reasoning End================================================="
  );

  explanation = getSection(
    data.data,
    "=======================================Explanation Start===============================================",
    "======================================= Explanation End================================================="
  );

  infoJson = JSON.parse(info);
  questionsJson = JSON.parse(questions);

  document.getElementById("fileName").innerText = data.fileName;

  document.getElementById("threadId").innerText = infoJson.id;

  document.getElementById("revisedPromptInFile").innerText =
    revisedPromptInFile;

  document.getElementById("reasoning").value = reasoning;

  document.getElementById("explanation").value = explanation;

  if (questionsJson.questions[0].answer == "1") {
    document.getElementById("promptRadio1").checked = true;
  } else if (questionsJson.questions[0].answer == "2") {
    document.getElementById("promptRadio2").checked = true;
  }

  if (questionsJson.questions[1].answer == "1") {
    document.getElementById("codeRadio1").checked = true;
  } else if (questionsJson.questions[1].answer == "2") {
    document.getElementById("codeRadio2").checked = true;
  }

  if (questionsJson.questions[2].answer == "1") {
    document.getElementById("codeRadio3").checked = true;
  } else if (questionsJson.questions[2].answer == "2") {
    document.getElementById("codeRadio4").checked = true;
  }

  if (questionsJson.questions[3].answer == "1") {
    document.getElementById("codeRadio5").checked = true;
  } else if (questionsJson.questions[3].answer == "2") {
    document.getElementById("codeRadio6").checked = true;
  } else if (questionsJson.questions[3].answer == "3") {
    document.getElementById("codeRadio7").checked = true;
  } else if (questionsJson.questions[3].answer == "4") {
    document.getElementById("codeRadio8").checked = true;
  }

  for (let i = 0; i < infoJson.prompt.length; i++) {
    const p = infoJson.prompt[i];

    document.getElementById(`promptValue${i + 1}`).innerText = p;
  }

  originalCodeEditor = ace.edit("originalCodeEditor");
  originalCodeEditor.setTheme("ace/theme/monokai");
  originalCodeEditor.session.setMode(
    "ace/mode/" + languageChoice.toLowerCase()
  );
  originalCodeEditor.setValue(code);
  originalCodeEditor.setOption("readOnly", true);

  revisedCodeEditor = ace.edit("revisedCodeEditor");
  revisedCodeEditor.setTheme("ace/theme/monokai");
  revisedCodeEditor.session.setMode("ace/mode/" + languageChoice.toLowerCase());
  revisedCodeEditor.setValue(revisedCode);
}

function workOnSOF(data) {
  document.getElementById("content-SOF").style.display = "block";
  document.getElementById("fileSelection").style.display = "none";

  info = getSection(
    data.data,
    "====================Info Start============================",
    "====================Info End===================================="
  );

  const notes = getSection(
    data.data,
    "====================Notes Start============================",
    "====================Notes End===================================="
  );

  const title = getSection(
    data.data,
    "====================Title Start====================================",
    "====================Title End===================================="
  );

  const sofQuestion = getSection(
    data.data,
    "====================Question Start====================================",
    "====================Question End===================================="
  );

  const sofAnswer = getSection(
    data.data,
    "====================Answer Start====================================",
    "====================Answer End===================================="
  );

  questions = getSection(
    data.data,
    "====================Additional Info Start====================================",
    "====================Additional Info End===================================="
  );

  desiredSofQuestion = getSection(
    data.data,
    "====================Desired Question Start====================================",
    "====================Desired Question End===================================="
  );

  desiredSofAnswer = getSection(
    data.data,
    "====================Desired Answer Start====================================",
    "====================Desired Answer End===================================="
  );

  infoJson = JSON.parse(info);
  questionsJson = JSON.parse(questions);

  document.getElementById("sofFileName").innerText = data.fileName;
  document.getElementById("sofThreadId").innerText = infoJson.id;
  document.getElementById("sofTitle").innerText = title;
  document.getElementById("sofLink").innerText = infoJson.link;

  document.getElementById("sofLink").addEventListener("click", () => {
    window.open(infoJson.link, "_blank");
  });

  document.getElementById("sofQuestion").value = sofQuestion;
  document.getElementById("sofAnswer").value = sofAnswer;
  document.getElementById("desiredSofQuestion").value = desiredSofQuestion;
  document.getElementById("desiredSofAnswer").value = desiredSofAnswer;

  document.getElementById("notes").value = notes;

  if (questionsJson[`Do you want to reject this annotation`].answer == "1") {
    document.getElementById("infoRadio1").checked = true;
  } else if (
    questionsJson[`Do you want to reject this annotation`].answer == "2"
  ) {
    document.getElementById("infoRadio2").checked = true;
  }

  if (questionsJson[`Available Task categories`].answer == "1") {
    document.getElementById("infoRadio3").checked = true;
  } else if (questionsJson[`Available Task categories`].answer == "2") {
    document.getElementById("infoRadio4").checked = true;
  } else if (questionsJson[`Available Task categories`].answer == "3") {
    document.getElementById("infoRadio5").checked = true;
  } else if (questionsJson[`Available Task categories`].answer == "4") {
    document.getElementById("infoRadio6").checked = true;
  } else if (questionsJson[`Available Task categories`].answer == "5") {
    document.getElementById("infoRadio7").checked = true;
  }
}

ipcRenderer.on("file-data", (event, data) => {
  if (taskChoice === "COT") {
    workOnCOT(data);
  } else if (taskChoice === "SOF") {
    workOnSOF(data);
  }
});

function promptSelected(optionSelected) {
  document.getElementById("submitPromptButton").style.display = "inline-block";

  if (optionSelected === "Yes") {
    document.getElementById("dropContainer").style.display = "block";
    document.getElementById("revisedPromptContainer").style.display = "none";
  } else {
    document.getElementById("revisedPromptContainer").style.display = "block";
    document.getElementById("dropContainer").style.display = "none";
  }
}

function submitPrompt() {
  // get the revised prompt
  let revisedPrompt;
  if (document.getElementById("promptRadio1").checked) {
    const dropContainerTextareas = getTextareasInContainer("dropContainer");
    revisedPrompt = dropContainerTextareas[0];
  } else {
    revisedPrompt = document.getElementById("revisedPrompt").value;
  }

  //update current revised prompt section
  document.getElementById("revisedPromptInFile").innerText = revisedPrompt;

  // check prompt question
  if (document.getElementById("promptRadio1").checked) {
    questionsJson.questions[0].answer = "1";
  } else if (document.getElementById("promptRadio2").checked) {
    questionsJson.questions[0].answer = "2";
  }

  let revisedQuestions = JSON.stringify(questionsJson, null, 4);

  // write in the text file
  ipcRenderer.send("set-section", {
    newText: revisedPrompt,
    startDelimiter:
      "=======================================Revised Prompt Start===============================================",
    endDelimiter:
      "=======================================Revised Prompt End=================================================",
  });

  //execute second call after 2 secs (not the best way, should replace with async await)
  setTimeout(() => {
    ipcRenderer.send("set-section", {
      newText: revisedQuestions,
      startDelimiter:
        "=======================================Questions Start======================================================",
      endDelimiter:
        "=======================================Questions End===================================================",
    });
  }, 2000);
}

function submitCode() {
  // get the revised code
  let revisedCode = revisedCodeEditor.getValue();
  console.log(revisedCode);

  // write in the text file
  ipcRenderer.send("set-section", {
    newText: revisedCode,
    startDelimiter:
      "=======================================Revised Code Start=================================================",
    endDelimiter:
      "=======================================Revised Code End===================================================",
  });
}

function submitCodeQuestions() {
  // check code questions
  if (document.getElementById("codeRadio1").checked) {
    questionsJson.questions[1].answer = "1";
  } else if (document.getElementById("codeRadio2").checked) {
    questionsJson.questions[1].answer = "2";
  }

  if (document.getElementById("codeRadio3").checked) {
    questionsJson.questions[2].answer = "1";
  } else if (document.getElementById("codeRadio4").checked) {
    questionsJson.questions[2].answer = "2";
  }

  if (document.getElementById("codeRadio5").checked) {
    questionsJson.questions[3].answer = "1";
  } else if (document.getElementById("codeRadio6").checked) {
    questionsJson.questions[3].answer = "2";
  } else if (document.getElementById("codeRadio7").checked) {
    questionsJson.questions[3].answer = "3";
  } else if (document.getElementById("codeRadio8").checked) {
    questionsJson.questions[3].answer = "4";
  }

  let revisedQuestions = JSON.stringify(questionsJson, null, 4);
  console.log(revisedQuestions);

  ipcRenderer.send("set-section", {
    newText: revisedQuestions,
    startDelimiter:
      "=======================================Questions Start======================================================",
    endDelimiter:
      "=======================================Questions End===================================================",
  });
}

function submitReasoning() {
  // get the reasoning
  reasoning = document.getElementById("reasoning").value;

  // write in the text file
  ipcRenderer.send("set-section", {
    newText: reasoning,
    startDelimiter:
      "=======================================Reasoning Start===============================================",
    endDelimiter:
      "======================================= Reasoning End=================================================",
  });
}

function submitExplanation() {
  // get the explanation
  explanation = document.getElementById("explanation").value;

  // write in the text file
  ipcRenderer.send("set-section", {
    newText: explanation,
    startDelimiter:
      "=======================================Explanation Start===============================================",
    endDelimiter:
      "======================================= Explanation End=================================================",
  });
}

function submitDesiredQuestion() {
  // get the question
  desiredSofQuestion = document.getElementById("desiredSofQuestion").value;

  // write in the text file
  ipcRenderer.send("set-section", {
    newText: desiredSofQuestion,
    startDelimiter:
      "====================Desired Question Start====================================",
    endDelimiter:
      "====================Desired Question End====================================",
  });
}

function submitDesiredAnswer() {
  // get the answer
  desiredSofAnswer = document.getElementById("desiredSofAnswer").value;

  // write in the text file
  ipcRenderer.send("set-section", {
    newText: desiredSofAnswer,
    startDelimiter:
      "====================Desired Answer Start====================================",
    endDelimiter:
      "====================Desired Answer End====================================",
  });
}

function submitAdditionalInfo() {
  // check additional info questions
  if (document.getElementById("infoRadio1").checked) {
    questionsJson[`Do you want to reject this annotation`].answer = "1";
  } else if (document.getElementById("infoRadio2").checked) {
    questionsJson[`Do you want to reject this annotation`].answer = "2";
  }

  if (document.getElementById("infoRadio3").checked) {
    questionsJson[`Available Task categories`].answer = "1";
  } else if (document.getElementById("infoRadio4").checked) {
    questionsJson[`Available Task categories`].answer = "2";
  } else if (document.getElementById("infoRadio5").checked) {
    questionsJson[`Available Task categories`].answer = "3";
  } else if (document.getElementById("infoRadio6").checked) {
    questionsJson[`Available Task categories`].answer = "4";
  } else if (document.getElementById("infoRadio7").checked) {
    questionsJson[`Available Task categories`].answer = "5";
  }

  let revisedQuestions = JSON.stringify(questionsJson, null, 4);
  console.log(revisedQuestions);

  ipcRenderer.send("set-section", {
    newText: revisedQuestions,
    startDelimiter:
      "====================Additional Info Start====================================",
    endDelimiter:
      "====================Additional Info End====================================",
  });
}

// code for drag and drop functionality

let draggedTextarea;
let lastTextareaIndropContainer;

function allowDrop(event) {
  event.preventDefault();
}

function dragStart(event) {
  draggedTextarea = event.target.closest(".textarea-wrapper");
  event.dataTransfer.setData("text/plain", "");

  if (
    lastTextareaIndropContainer &&
    draggedTextarea.parentNode.id === "pickContainer"
  ) {
    document
      .getElementById("pickContainer")
      .appendChild(lastTextareaIndropContainer);
  }
}

function drop(event) {
  event.preventDefault();
  const container = event.target.closest(".dragndropcontainer");
  if (container && !container.contains(draggedTextarea)) {
    container.appendChild(draggedTextarea);
    if (container.id === "dropContainer") {
      lastTextareaIndropContainer = draggedTextarea;
    }
  }
}

function getTextareasInContainer(containerId) {
  const container = document.getElementById(containerId);
  const textareas = container.querySelectorAll("textarea");
  return Array.from(textareas).map((textarea) => textarea.value);
}

// Usage example:
// const pickContainerTextareas = getTextareasInContainer("pickContainer");
// console.log("Textareas in Container 1:", pickContainerTextareas);

// const dropContainerTextareas = getTextareasInContainer("dropContainer");
// console.log("Textareas in Container 2:", dropContainerTextareas);

function onTaskChoice(tc) {
  taskChoice = tc;

  if (languageChoice != "") {
    document.getElementById("filePicker").removeAttribute("style");
  }
}

function onLanguageChoice(lc) {
  languageChoice = lc;

  if (taskChoice != "") {
    document.getElementById("filePicker").removeAttribute("style");
  }
}
