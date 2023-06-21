const { ipcRenderer } = require("electron");

// pre-fill initial values
document.getElementById("annotatorEmail").value =
  localStorage.getItem("annotatorEmail") || "";

if (localStorage.getItem("taskChoice") === "SOF") {
  document.getElementById("taskChoiceSOF").checked = true;
} else if (localStorage.getItem("taskChoice") === "COT") {
  document.getElementById("taskChoiceCOT").checked = true;
}

if (localStorage.getItem("languageChoice") === "Java") {
  document.getElementById("languageChoiceJava").checked = true;
} else if (localStorage.getItem("languageChoice") === "Python") {
  document.getElementById("languageChoicePython").checked = true;
} else if (localStorage.getItem("languageChoice") === "JavaScript") {
  document.getElementById("languageChoiceJavascript").checked = true;
}

document.getElementById("podNumber").value =
  localStorage.getItem("podNumber") || "";

setTimeout(() => {
  onConfigChoice(0, 0);
}, 1000);

document.getElementById("open-file-button").addEventListener("click", () => {
  ipcRenderer.send("open-file-dialog");
});

// Get references to the textareas
const desiredAnswerTextArea = document.getElementById("desiredSofAnswer");
const desiredAnswerModalTextArea = document.getElementById(
  "desiredSofAnswerModal"
);

// Add input event listeners to both textareas
desiredAnswerTextArea.addEventListener("input", syncAnswerTextarea);
desiredAnswerModalTextArea.addEventListener("input", syncAnswerTextarea);

// Get references to the textareas
const desiredQuestionTextArea = document.getElementById("desiredSofQuestion");
const desiredQuestionModalTextArea = document.getElementById(
  "desiredSofQuestionModal"
);

// Add input event listeners to both textareas
desiredQuestionTextArea.addEventListener("input", syncQuestionTextarea);
desiredQuestionModalTextArea.addEventListener("input", syncQuestionTextarea);

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
  taskChoice = localStorage.getItem("taskChoice") || "",
  languageChoice = localStorage.getItem("languageChoice") || "",
  sofDesiredQuestion,
  sofDesiredAnswer,
  annotatorEmail = localStorage.getItem("annotatorEmail") || "",
  podNumber = localStorage.getItem("podNumber") || "",
  totalWarnings = 0;

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

  localStorage.setItem("annotatorEmail", annotatorEmail);
  localStorage.setItem("podNumber", podNumber);

  let tempLang = localStorage.getItem("languageChoice")?.toLowerCase();
  tempLang !== "javascript" ? (tempLang += "-programming") : tempLang;
  document.getElementById("compilerLink").addEventListener("click", () => {
    window.open(
      `https://www.programiz.com/${tempLang}/online-compiler/`,
      "_blank"
    );
  });

  // sync the textboxes if they already have any value
  desiredAnswerModalTextArea.value = desiredAnswerTextArea.value;
  desiredQuestionModalTextArea.value = desiredQuestionTextArea.value;

  console.log(desiredQuestionModalTextArea.value);
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

  showSuccessAlert("Desired Question updated !");
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

  showSuccessAlert("Desired Answer updated !");
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
  questions = revisedQuestions;

  ipcRenderer.send("set-section", {
    newText: revisedQuestions,
    startDelimiter:
      "====================Additional Info Start====================================",
    endDelimiter:
      "====================Additional Info End====================================",
  });

  showSuccessAlert("Additional info updated !");
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

function onConfigChoice(choice, option) {
  if (choice === "task") {
    taskChoice = option;
    localStorage.setItem("taskChoice", taskChoice);
  } else if (choice === "language") {
    languageChoice = option;
    localStorage.setItem("languageChoice", languageChoice);
  } else if (choice === "annotatorEmail") {
    annotatorEmail = document.getElementById("annotatorEmail").value;
  } else if (choice === "podNumber") {
    podNumber = document.getElementById("podNumber").value;
  }

  if (
    taskChoice != "" &&
    languageChoice != "" &&
    annotatorEmail != "" &&
    annotatorEmail.includes("@deloitte.com") &&
    podNumber !== ""
  ) {
    document.getElementById("filePicker").removeAttribute("style");
  }
}

// working
function i_my_we(desiredBlock, codeBlocksList) {
  // var pattern = /\b(I|My|We)\b/i;

  // var pattern = /(?<!\S)(i|I|me|Me|my|My|mine|Mine|we|We|us|Us|our|Our|ours|Ours|you|You|your|Your|yours|Yours|he|He|him|Him|his|His|she|She|her|Her|hers|Hers)(?![^\W_])/g;

  var pattern =
    /(?<!\S)(i|I|me|Me|my|My|mine|Mine|we|We|us|Us|our|Our|ours|Ours|he|He|him|Him|his|His|she|She|her|Her|hers|Hers)(?![^\W_]|.e)/g;

  // var pattern = /(?<!\S)(I|me|my|mine|we|us|our|ours|you|your|yours|he|him|his|she|her|hers)(?![^\W_])/gi;

  var inBodyCount = 0;

  var inCodeCount = 0;

  var errLines = [];

  var errLinesInCode = [];

  var codeLess = desiredBlock.split("\n");

  for (let i = 0; i < codeBlocksList?.length; i++) {
    for (let j = 0; j < codeBlocksList[i].length; j++) {
      if (codeLess.includes(codeBlocksList[i][j])) {
        const index = codeLess.indexOf(codeBlocksList[i][j]);

        if (index > -1) {
          codeLess.splice(index, 1);
        }
      }
    }
  }

  for (var i = 0; i < codeLess?.length; i++) {
    var match = codeLess[i].match(pattern);

    if (match) {
      errLines.push({ line: codeLess[i], words: match });

      inBodyCount++;
    }
  }

  return { inBodyCount, errLines };
}

// working
function answerInsideAdditionalInformationBlock(additionalInfo) {
  var listAdditionalInfo = additionalInfo.split("\n");
  var answerList = [];

  for (var i = 0; i < listAdditionalInfo?.length; i++) {
    var iteration = listAdditionalInfo[i];

    if (iteration.includes("answer")) {
      if (iteration[iteration.length - 2].match(/\d+/)) {
        answerList.push(iteration[iteration.length - 2]);
      }
    }
  }

  if (answerList.length === 2) {
    if (
      parseInt(answerList[1]) === 1 ||
      parseInt(answerList[1]) === 2 ||
      parseInt(answerList[1]) === 3 ||
      parseInt(answerList[1]) === 4 ||
      parseInt(answerList[1]) === 5
    ) {
      return 0;
    } else {
      return 1;
    }
  } else {
    return 1;
  }
}

// working
function markdownCheck(desiredQuestion) {
  var desiredQuestionArray = desiredQuestion.split("\n");
  var count = 0;
  var foundOpeningBackticks = false;

  for (var i = 0; i < desiredQuestionArray?.length; i++) {
    count++;
    var eachLine = desiredQuestionArray[i];

    if (eachLine.split("`").length - 1 === 3 && eachLine.includes("```")) {
      foundOpeningBackticks = true;

      for (var j = count; j < desiredQuestionArray?.length; j++) {
        if (desiredQuestionArray[j].includes("```")) {
          // Markdown Complete
          return 0;
        } else if (j === desiredQuestionArray?.length - 1) {
          // Markdown Incomplete
          return 1;
        }
      }
    } else if (eachLine.split("`").length - 1 > 3 && eachLine.includes("```")) {
      // "Extra '`' in markdown"
      return 1;
    } else if (
      eachLine === desiredQuestionArray[desiredQuestionArray?.length - 1]
    ) {
      if (foundOpeningBackticks) {
        // Markdown Incomplete
        return 1;
      }
      // no markdown
      return 0;
    }
  }
}

// working
function loc(desiredAnswer) {
  var codeBlocks = desiredAnswer.match(/```[\w\s]*\n([\s\S]*?)```/gm);

  var codeBlocksList = [];

  var codeBlocksCount = [];

  for (var i = 0; i < codeBlocks?.length; i++) {
    var locCount = 0;

    var codeString = "";

    codeBlocks[i] = codeBlocks[i].split("\n");

    codeString = "Snippet " + (i + 1) + "\n";

    locCount -= 1;

    for (var j = 0; j < codeBlocks[i].length; j++) {
      locCount += 1;

      codeString += codeBlocks[i][j] + "\n";
    }

    codeBlocksList.push(codeString);

    codeBlocksCount.push(locCount.toString());
  }

  var codeBlocksListString = codeBlocksList.join("\n");

  var codeBlocksCountString = codeBlocksCount.join("\n");

  return { codeBlocks, codeBlocksCountString, codeBlocksListString };
}

// working
function languageCheck(desiredQuestionBlock, codeBlocksList) {
  var pattern;

  if (languageChoice === "Python") {
    pattern =
      /\b(Python|Django|Flask|Bottle|Web2py|CherryPy|Dash|Falcon|Growler|UvLoop|Sanic|PyramidCubicWeb|TurboGears|Hug|MorePath)\b/i;
  } else if (languageChoice === "Java") {
    pattern = /\b(Java|JavaFX)\b/i;
  } else if (languageChoice === "JavaScript") {
    pattern =
      /\b(JavaScript|jQuery|Knockout|BackBone|AJAX|AngularJS|Angular.js|Angular JS|Node.js|NodeJS|Node JS|Socket.IO|CoffeeScript|LeafletJS|Leaflet JS|Underscore.js|Underscore JS|UnderscoreJS)\b/i;
  }

  var inBody = [],
    inCode = [];

  var questionBlock = desiredQuestionBlock.split("\n");

  for (var i = 0; i < questionBlock?.length; i++) {
    var eachLine = questionBlock[i];

    var match = eachLine.match(pattern);

    if (match) {
      inBody.push({ line: questionBlock[i], words: match });

      // return 0;
    }
  }

  for (let i = 0; i < codeBlocksList?.length; i++) {
    for (let j = 0; j < codeBlocksList[i].length; j++) {
      var match = codeBlocksList[i][j].match(pattern);

      if (match) {
        let y = inBody.filter((x) => x.line === codeBlocksList[i][j]);

        const index = inBody.indexOf(y[0]);

        if (index > -1) {
          inBody.splice(index, 1);
        }

        // inCode.push(codeBlocksList[i][j]);
      }
    }
  }

  return inBody;
}

//working
function hasNonAsciiCharacters(desiredBlock) {
  var desiredBlockList = desiredBlock.split("\n");

  var chars = [],
    lines = [];

  for (var i = 0; i < desiredBlockList?.length; i++) {
    for (var j = 0; j < desiredBlockList[i].length; j++) {
      var match = desiredBlockList[i].charCodeAt(j) > 127;

      if (match) {
        chars.push(desiredBlockList[i][j]);

        lines.push(desiredBlockList[i]);
      }
    }
  }

  return { chars, lines };
}

function tryCatch(codeBlocks) {
  var status = [];

  if (languageChoice === "Java") {
    // var status = [];

    for (var i = 0; i < codeBlocks?.length; i++) {
      if (
        codeBlocks[i][0].split("```")[1].toLowerCase() !=
        languageChoice.toLowerCase()
      ) {
        status.push(0);

        continue;
      }

      var loc = codeBlocks[i].join("\n");

      var pattern = /try\s*{[\s\S]*?}\s*catch\s*\(.*?\)\s*{[\s\S]*?}/;

      var match = loc.match(pattern);

      if (match) {
        status.push(0);
      } else {
        status.push(1);
      }
    }

    // return status;
  } else if (languageChoice === "JavaScript") {
    // var status = [];

    for (var i = 0; i < codeBlocks?.length; i++) {
      if (
        codeBlocks[i][0].split("```")[1].toLowerCase() !=
        languageChoice.toLowerCase()
      ) {
        status.push(0);

        continue;
      }

      var loc = codeBlocks[i].join("\n");

      var pattern = /try\s*{[\s\S]*?}\s*catch\s*\(.*?\)\s*{[\s\S]*?}/;

      var match = loc.match(pattern);

      if (match) {
        status.push(0);
      } else {
        status.push(1);
      }
    }

    // return status;
  } else if (languageChoice === "Python") {
    // var status = [];

    for (var i = 0; i < codeBlocks?.length; i++) {
      if (
        codeBlocks[i][0].split("```")[1].toLowerCase() !=
        languageChoice.toLowerCase()
      ) {
        status.push(0);

        continue;
      }

      var loc = codeBlocks[i].join("\n");

      // var pattern = /try.*?except.*?:/;

      var pattern = /try\s*:\s*([\s\S]*?)\s*except\s*([\s\S]*?):/g;

      var match = loc.match(pattern);

      if (match) {
        status.push(0);
      } else {
        status.push(1);
      }
    }

    // return status;
  }

  return status;
}

// needs correction
function codeEndsWith(desiredAnswer) {
  desiredAnswer = desiredAnswer.split("\n");

  if (desiredAnswer?.length === 1) {
    if (desiredAnswer[desiredAnswer?.length - 1]?.trim().length == 0) return 1;
  }

  if (desiredAnswer?.length !== 0) {
    if (
      desiredAnswer?.length >= 2 &&
      (desiredAnswer[desiredAnswer?.length - 1]?.includes("```") ||
        desiredAnswer[desiredAnswer?.length - 1]?.includes(">>>") ||
        desiredAnswer[desiredAnswer?.length - 1]?.trim().length == 0)
    ) {
      return 1;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
}

function getErrorPercentage(report) {
  let total = 0,
    correct = 0;
  for (var key in report) {
    if (report.hasOwnProperty(key)) {
      var val = report[key];
      if (val === 0) {
        correct += 1;
      }

      if (val === 0 || val === 1) {
        total++;
      }
    }
  }
  return Math.round(100 - (correct / total) * 100);
}

function keywordsCheck(desiredAnswer) {
  var desiredAnswerLines = desiredAnswer.split("\n");

  var singleQuotesCount = 0;

  var doubleQuotesCount = 0;

  var status = ["", ""];

  for (var i = 0; i < desiredAnswerLines?.length; i++) {
    var eachLine = desiredAnswerLines[i];

    singleQuotesCount += eachLine.split("'").length - 1;

    doubleQuotesCount += eachLine.split('"').length - 1;
  }

  if (singleQuotesCount === 0) {
    status[0] = "No single quoted keywords present";
  } else if (singleQuotesCount % 2 === 0) {
    status[0] = singleQuotesCount / 2 + " single quoted keywords present";
  } else {
    status[0] = "Single quote missing from keyword";
    totalWarnings++;
  }

  if (doubleQuotesCount === 0) {
    status[1] = "No double quoted keywords present";
  } else if (doubleQuotesCount % 2 === 0) {
    status[1] = doubleQuotesCount / 2 + " double quoted keywords present";
  } else {
    status[1] = "Double quote missing from keyword";
    totalWarnings++;
  }

  return status;
}

function outputInsideMarkdown(desiredAnswer, codeBlocksList) {
  var status = 0;

  let outputCount = 0;

  let markdownCount = 0;

  desiredAnswer = desiredAnswer.split("\n");

  for (let i = 0; i < desiredAnswer?.length; i++) {
    if (desiredAnswer[i].includes(">>>")) {
      outputCount++;
    }
  }

  for (let i = 0; i < codeBlocksList?.length; i++) {
    for (let j = 0; j < codeBlocksList[i].length; j++) {
      if (codeBlocksList[i][j].includes(">>>")) {
        markdownCount++;
      }
    }
  }

  if (outputCount !== 0 && markdownCount === outputCount) {
    status = 0;
  } else if (markdownCount !== outputCount) {
    status = 1;
  } else if (outputCount === 0 && markdownCount === 0) {
    status = 0;
  }

  return status;
}

function markdownStatusCheck(desiredAnswer) {
  var desiredAnswerLines = desiredAnswer.split("\n");

  var markdownCount = 0;

  var markdownLinesList = [];

  var markdownStatusList = [];

  for (var i = 0; i < desiredAnswerLines?.length; i++) {
    var eachLine = desiredAnswerLines[i];

    if (eachLine.includes("```") && eachLine.split("`").length - 1 >= 3) {
      markdownLinesList.push(eachLine);

      markdownCount += 1;
    }
  }

  if (markdownCount !== 0 && markdownCount % 2 === 0) {
    for (var i = 0; i < markdownCount; i += 2) {
      if (markdownLinesList[i].split(" ").length > 1) {
        markdownStatusList.push(
          "Markdown is incorrect, check for spaces in snippet " + (i + 2) / 2
        );
        totalWarnings++;
      } else if (
        markdownLinesList[i].length > 3 &&
        markdownLinesList[i].split("`").length - 1 === 3
      ) {
        markdownStatusList.push(
          "Markdown is correct and language name is present for snippet " +
            (i + 2) / 2
        );
      } else if (
        markdownLinesList[i].length > 3 &&
        markdownLinesList[i].split("`").length - 1 >= 3
      ) {
        markdownStatusList.push(
          "Markdown is incorrect, check for extra '`' for snippet " +
            (i + 2) / 2
        );
        totalWarnings++;
      } else if (markdownLinesList[i].length === 3) {
        markdownStatusList.push(
          "Markdown is correct but language name is missing for snippet " +
            (i + 2) / 2
        );
        totalWarnings++;
      }
    }
  } else if (markdownCount === 0) {
    markdownStatusList.push("No code present");
    totalWarnings++;
  } else if (markdownCount !== 0 && markdownCount % 2 !== 0) {
    markdownStatusList.push("Markdown missing");
    totalWarnings++;
  }

  var markdownStatus = markdownStatusList.join("\n");

  return { markdownStatusList, markdownStatus };
}

function markdownLanguageNameCheck(desiredQuestion) {
  var status = [];

  var desiredQuestionLines = desiredQuestion.split("\n");

  for (var i = 0; i < desiredQuestionLines.length; i++) {
    var eachLine = desiredQuestionLines[i];

    if (eachLine.includes("```")) {
      if (eachLine.length === 3) {
        status.push(0);
      } else if (eachLine.length > 3) {
        status.push(1);
      }
    }
  }

  return status;
}

function dotDotDotPresent(codeBlocksAnswer) {
  let flag = 0;
  for (let i = 0; i < codeBlocksAnswer?.length; i++) {
    codeBlocksAnswer[i]?.forEach((v) => {
      if (v.includes("...")) {
        flag = 1;
      }
    });
  }

  return flag;
}

function hasBackTicks(desiredBlock, codeBlocksList) {
  var codeLess = desiredBlock.split("\n");

  for (let i = 0; i < codeBlocksList?.length; i++) {
    for (let j = 0; j < codeBlocksList[i].length; j++) {
      if (codeLess.includes(codeBlocksList[i][j])) {
        const index = codeLess.indexOf(codeBlocksList[i][j]);

        if (index > -1) {
          codeLess.splice(index, 1);
        }
      }
    }
  }

  for (var i = 0; i < codeLess?.length; i++) {
    for (var j = 0; j < codeLess[i].length; j++) {
      if (codeLess[i][j] === "`") {
        return 1;
      }
    }
  }

  return 0;
}

function runChecks() {
  totalWarnings = 0;
  document.getElementById("i_my_we_error").innerHTML = "";
  document.getElementById("i_my_we_error_container").style.display = "none";

  document.getElementById("non_ascii_characters").innerHTML = "";
  document.getElementById("non_ascii_characters_container").style.display =
    "none";

  document.getElementById("no_error_line").style.display = "block";
  if (desiredSofQuestion?.trim() === "" || desiredSofAnswer?.trim() === "") {
    showSuccessAlert("Please fill desired question and answer !");
    return;
  }

  document.getElementById("checksList").innerHTML =
    "<tr><th>Category</th><th>Pass / Fail</th></tr>";

  var { codeBlocks } = loc(desiredSofAnswer);
  let codeBlocksAnswer = codeBlocks;

  var { codeBlocks } = loc(desiredSofQuestion);
  let codeBlocksQuestion = codeBlocks;

  const tryCatchArr = tryCatch(codeBlocksAnswer);
  for (let i = 0; i < tryCatchArr?.length; i++) {
    const element = tryCatchArr[i];
    if (element === 0) {
      tryCatchArr[i] = `Try Catch status correct for code snippet ${i + 1}`;
    } else {
      tryCatchArr[i] = `Try Catch status incorrect for code snippet ${i + 1}`;
    }
  }

  tryCatchStr = tryCatchArr.join("\n");

  const finalChecks = {
    "I, My, We not present in the question":
      i_my_we(desiredSofQuestion, codeBlocksQuestion).inBodyCount === 0 ? 0 : 1,
    "Language present in Markdown in the question": markdownLanguageNameCheck(
      desiredSofQuestion
    ).includes(1)
      ? 1
      : 0,
    "Markdown Correct in the question": markdownCheck(desiredSofQuestion),
    "Backticks present in the question": hasBackTicks(
      desiredSofQuestion,
      codeBlocksQuestion
    ),
    "Language keyword present in Question":
      languageCheck(desiredSofQuestion, codeBlocksQuestion)?.length === 0
        ? 1
        : 0,
    "Double quotes complete around keywords in Question":
      keywordsCheck(desiredSofQuestion).join("\n"),
    "Non ASCII characters not present in the Question":
      hasNonAsciiCharacters(desiredSofQuestion)?.chars?.length === 0 ? 0 : 1,
    "I, My, We not present in the Answer":
      i_my_we(desiredSofAnswer, codeBlocksAnswer).inBodyCount === 0 ? 0 : 1,
    "Language keyword present in Answer":
      languageCheck(desiredSofAnswer, codeBlocksAnswer)?.length === 0 ? 1 : 0,
    "Non ASCII characters not present in the Answer":
      hasNonAsciiCharacters(desiredSofAnswer)?.chars?.length === 0 ? 0 : 1,
    "Answer ends with illegal characters (```, >>>, empty space)":
      codeEndsWith(desiredSofAnswer),
    "Backticks present in the answer": hasBackTicks(
      desiredSofAnswer,
      codeBlocksAnswer
    ),
    "Output inside Markdown in Answer": outputInsideMarkdown(
      desiredSofAnswer,
      codeBlocksAnswer
    ),
    "(...) present inside the code": dotDotDotPresent(codeBlocksAnswer),
    "Double quotes complete around keywords in Answer":
      keywordsCheck(desiredSofAnswer).join("\n"),
    "Markdown status check Answer":
      markdownStatusCheck(desiredSofAnswer).markdownStatus,
    "Try catch Status in Answer": tryCatchStr,
    "Addition Info correct": answerInsideAdditionalInformationBlock(questions),
  };
  let errorPercentage = getErrorPercentage(finalChecks);

  Object.entries(finalChecks).forEach(([key, value]) => {
    const newRow = document.createElement("tr");
    const newColumn1 = document.createElement("td");
    newColumn1.innerText = key;

    newRow.appendChild(newColumn1);

    const newColumn2 = document.createElement("td");
    if (value == 0) {
      newColumn2.innerText = "Pass";
      newColumn2.setAttribute("class", "pass");
    } else if (value == 1) {
      newColumn2.innerText = "Fail";
      newColumn2.setAttribute("class", "fail");
    } else {
      newColumn2.innerText = value;
      newColumn2.setAttribute("class", "warning");
    }

    newRow.appendChild(newColumn2);

    document.getElementById("checksList").appendChild(newRow);
  });

  document.getElementById("errorPercentage").innerText = errorPercentage;
  document.getElementById("warningNumber").innerText = totalWarnings;
  // if (errorPercentage === 0) {
  let someData = {
    timestamp: new Date(),
    podNumber,
    fileName: document.getElementById("sofFileName").innerText,
    annotatorEmail,
    errorPercentage,
    languageChoice,
  };
  ipcRenderer.send("writeLogs", [someData]);
  // }

  showSuccessAlert(`Error percentage is : ${errorPercentage}%`);

  if (errorPercentage !== 0) {
    // i my we in question detection
    const errorLinesQuestion = i_my_we(
      desiredSofQuestion,
      codeBlocksQuestion
    )?.errLines;
    if (errorLinesQuestion?.length !== 0) {
      // insert heading in list for question errors
      const errHeadingQuestion = document.createElement("li");
      const strongText = document.createElement("strong");
      strongText.innerText = "Caught in desired question :";
      errHeadingQuestion.appendChild(strongText);
      document.getElementById("i_my_we_error").appendChild(errHeadingQuestion);
      // list the error lines
      errorLinesQuestion?.forEach((v) => {
        const listItem = document.createElement("li");
        listItem.innerText = `"${v.line}" (Words caught: ${v?.words?.join(
          ", "
        )})`;

        document.getElementById("i_my_we_error").appendChild(listItem);
      });

      document.getElementById("i_my_we_error_container").style.display =
        "block";
      document.getElementById("no_error_line").style.display = "none";
    }

    // i my we in answer detection
    const errorLines = i_my_we(desiredSofAnswer, codeBlocksAnswer)?.errLines;
    if (errorLines?.length !== 0) {
      // insert heading in list for answer errors
      const errHeadingAnswer = document.createElement("li");
      const strongText = document.createElement("strong");
      strongText.innerText = "Caught in desired answer :";
      errHeadingAnswer.appendChild(strongText);
      document.getElementById("i_my_we_error").appendChild(errHeadingAnswer);
      // list the error lines
      errorLines?.forEach((v) => {
        const listItem = document.createElement("li");
        listItem.innerText = `"${v.line}" (Words caught: ${v?.words?.join(
          ", "
        )})`;

        document.getElementById("i_my_we_error").appendChild(listItem);
      });

      document.getElementById("i_my_we_error_container").style.display =
        "block";
      document.getElementById("no_error_line").style.display = "none";
    }

    // non ascii characters detection
    const nonAsciiInfoQuestion = hasNonAsciiCharacters(desiredSofQuestion);
    if (nonAsciiInfoQuestion.chars?.length !== 0) {
      // insert heading in list for question errors
      const errHeadingQuestion = document.createElement("li");
      const strongText = document.createElement("strong");
      strongText.innerText = "Caught in desired question :";
      errHeadingQuestion.appendChild(strongText);
      document
        .getElementById("non_ascii_characters")
        .appendChild(errHeadingQuestion);
      for (let x = 0; x < nonAsciiInfoQuestion?.chars?.length; x++) {
        const character = nonAsciiInfoQuestion?.chars[x];
        const line = nonAsciiInfoQuestion?.lines[x];

        const listItem = document.createElement("li");
        listItem.innerText = `"${line}" (Character caught: ${character})`;

        document.getElementById("non_ascii_characters").appendChild(listItem);
      }
      document.getElementById("non_ascii_characters_container").style.display =
        "block";
      document.getElementById("no_error_line").style.display = "none";
    }

    const nonAsciiInfoAnswer = hasNonAsciiCharacters(desiredSofAnswer);
    if (nonAsciiInfoAnswer.chars?.length !== 0) {
      // insert heading in list for answer errors
      const errHeadingAnswer = document.createElement("li");
      const strongText = document.createElement("strong");
      strongText.innerText = "Caught in desired answer :";
      errHeadingAnswer.appendChild(strongText);
      document
        .getElementById("non_ascii_characters")
        .appendChild(errHeadingAnswer);
      for (let x = 0; x < nonAsciiInfoAnswer?.chars?.length; x++) {
        const character = nonAsciiInfoAnswer?.chars[x];
        const line = nonAsciiInfoAnswer?.lines[x];

        const listItem = document.createElement("li");
        listItem.innerText = `"${line}" (Character caught: ${character})`;

        document.getElementById("non_ascii_characters").appendChild(listItem);
      }
      document.getElementById("non_ascii_characters_container").style.display =
        "block";
      document.getElementById("no_error_line").style.display = "none";
    }
  }
}

function showSuccessAlert(message) {
  const alertHTML = `
    <div id="successAlert" class="alert alert-success alert-dismissible fade show" role="alert">
      ${message}
    </div>
  `;

  const alertContainer = document.getElementById("alertContainer");
  alertContainer.innerHTML = "";
  alertContainer.insertAdjacentHTML("beforeend", alertHTML);

  setTimeout(function () {
    const successAlert = document.getElementById("successAlert");
    if (successAlert) {
      successAlert.classList.remove("show");
      successAlert.classList.add("fade");
    }
  }, 3000);
}

// Function to sync the textareas
function syncAnswerTextarea(event) {
  const targetTextarea = event.target;

  // Check which textarea triggered the event
  if (targetTextarea.id === "desiredSofAnswer") {
    // Copy desiredAnswerTextArea's value to desiredAnswerModalTextArea
    desiredAnswerModalTextArea.value = targetTextarea.value;
  } else if (targetTextarea.id === "desiredSofAnswerModal") {
    // Copy desiredAnswerModalTextArea's value to desiredAnswerTextArea
    desiredAnswerTextArea.value = targetTextarea.value;
  }
}

// Function to sync the textareas
function syncQuestionTextarea(event) {
  const targetTextarea = event.target;

  // Check which textarea triggered the event
  if (targetTextarea.id === "desiredSofQuestion") {
    // Copy desiredQuestionTextArea's value to desiredQuestionModalTextArea
    desiredQuestionModalTextArea.value = targetTextarea.value;
  } else if (targetTextarea.id === "desiredSofQuestionModal") {
    // Copy desiredQuestionModalTextArea's value to desiredQuestionTextArea
    desiredQuestionTextArea.value = targetTextarea.value;
  }
}

function toggleTheme() {
  typeof document.documentElement.attributes[0] === "undefined"
    ? document.documentElement.setAttribute("data-bs-theme", "dark")
    : document.documentElement.removeAttribute("data-bs-theme");
}
