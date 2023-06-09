const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  nativeTheme,
} = require("electron");
const fs = require("fs");
const log = require("electron-log");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // Enable hardware acceleration
      webgl: true,
      hardwareAcceleration: true,
    },
  });

  mainWindow.loadFile("index.html");
  nativeTheme.themeSource = "dark";

  let currFilePath = "";

  // Event listener for the open-file-dialog
  ipcMain.on("open-file-dialog", (event) => {
    dialog
      .showOpenDialog(mainWindow, {
        properties: ["openFile"],
        filters: [{ name: "Text Files", extensions: ["txt"] }],
      })
      .then((result) => {
        if (!result.canceled && result.filePaths.length > 0) {
          currFilePath = result.filePaths[0];
          fs.readFile(result.filePaths[0], "latin1", (err, data) => {
            if (err) {
              console.error("An error occurred while reading the file:", err);
              return;
            }
            const path = result.filePaths[0];
            const lastIndex = path.lastIndexOf("\\");
            const fileName = path.slice(lastIndex + 1);

            const finalData = { fileName, data };
            event.sender.send("file-data", finalData);
          });
        }
      })
      .catch((err) => {
        console.error("An error occurred while opening the file picker:", err);
      });
  });

  // Event listener for the writing to file
  ipcMain.on("set-section", (event, message) => {
    const { newText, startDelimiter, endDelimiter } = message;

    fs.readFile(currFilePath, "latin1", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }

      const startIndex = data.indexOf(startDelimiter) + startDelimiter.length;
      const endIndex = data.indexOf(endDelimiter);

      if (startIndex === -1 || endIndex === -1) {
        console.error("Delimiters not found in file");
        return;
      }

      const updatedData =
        data.slice(0, startIndex) +
        "\n\n" +
        newText +
        "\n\n" +
        data.slice(endIndex);

      fs.writeFile(currFilePath, updatedData, "latin1", (err) => {
        if (err) {
          console.error("Error writing file:", err);
          return;
        }
        console.log("File updated successfully");
      });
    });
  });

  function objectToCsvRow(obj) {
    const values = Object.values(obj);
    return values.map((value) => `"${value}"`).join(",") + "\n";
  }

  ipcMain.on("writeLogs", (event, data) => {
    console.log(data);
    const today = new Date();
    const filePath =
      `C:\\Users\\${
        data[0].annotatorEmail.match(/^([^@]*)@/)[1]
      }\\Deloitte (O365D)\\` +
      "RLHF UAT - General\\" +
      `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}-${
        data[0].languageChoice
      }.csv`;

    // const filePath = "data.csv";
    const headers =
      "Timestamp,POD Number,File Name,Annotator Email,Error Percentage,Language\n";

    // Check if the CSV file exists
    const fileExists = fs.existsSync(filePath);

    // Determine the content to be appended
    let csvContent = "";
    if (!fileExists) {
      csvContent += headers;
    }
    data.forEach((obj) => {
      csvContent += objectToCsvRow(obj);
    });

    fs.appendFile(filePath, csvContent, "utf8", (err) => {
      if (err) {
        console.error("Error creating CSV file:", err);
        log.error(err);
      } else {
        console.log("CSV file created successfully.");
        log.info("CSV file created successfully.");
      }
    });
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
