const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { app, BrowserWindow } = require('electron');
const http = require('http');
const express = require('express');
const expressApp = express();
const port = 5003;

let win;

function createDebugWindow(message) {
  let debugWin = new BrowserWindow({
    width: 200,
    height: 100,
    webPreferences: {
      nodeIntegration: true
    }
  });
  debugWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`<h1>${message}</h1>`)}`);
}

function createWindow() {
  // Parse the command-line arguments
  const argv = yargs(hideBin(process.argv))
  .option('x', {
    type: 'number',
    default: 0
  })
  .option('y', {
    type: 'number',
    default: 0
  })
  .option('width', {
    type: 'number',
    default: 800
  })
  .option('height', {
    type: 'number',
    default: 600
  })
  .argv;
  const x = argv.x;
  const y = argv.y;
  const width = argv.width;
  const height = argv.height;

  win = new BrowserWindow({
    x: x,
    y: y,
    width: width,
    height: height,
    frame: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    roundedCorners: false,
    webPreferences: {
      nodeIntegration: false
    }
  });

  // Debug window to display x and y
  // createDebugWindow(`x: ${x}, y: ${y}`);

  win.loadURL('http://localhost:5001/');

  win.webContents.on('did-fail-load', () => {
    console.log('Failed to load page, retrying...');
    win.reload();
  });

  win.on('closed', () => {
    console.log('Window closed');
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

http.createServer((req, res) => {
  if (req.url === '/close') {
    win.close();
    res.end('Closed');
  } else {
    res.end('Unknown command');
  }
}).listen(5002);

function sendKeystrokes(text) {
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    win.webContents.sendInputEvent({ type: 'char', keyCode: char });
  }
}

expressApp.get('/textInput', (req, res) => {
  const inputText = req.query.input || ''; // Get the input text from the query parameter
  sendKeystrokes(inputText);
  res.send('Keystrokes emulated');
});

expressApp.get('/selectElement', (req, res) => {
  const className = req.query.class || ''; // Get the class name from the query parameter
  const sanitizedClassName = className.replace(/"/g, '\\"'); // Sanitize the class name to escape quotes
  
  // Execute JavaScript to find the element by class and click it
  win.webContents.executeJavaScript(`
    const element = document.querySelector('.${sanitizedClassName.split(' ').join('.')}');
    if (element) {
      element.click();
    }
  `).then(() => {
    res.send('Element selected and clicked');
  }).catch(err => {
    res.send(`Failed to select and click element: ${err}`);
  });
});

expressApp.get('/executeJS', (req, res) => {
  const jsCode = req.query.code || ''; // Get the JavaScript code from the query parameter
  
  // Execute the provided JavaScript code
  win.webContents.executeJavaScript(jsCode)
    .then(result => {
      res.send(`JavaScript executed. Result: ${result}`);
    })
    .catch(err => {
      res.send(`Failed to execute JavaScript: ${err}`);
    });
});

expressApp.get('/updatePosition', (req, res) => {
  const x = parseInt(req.query.x);
  const y = parseInt(req.query.y);
  const width = parseInt(req.query.width);
  const height = parseInt(req.query.height);
  win.setBounds({ x: x, y: y, width: width, height: height }); // Update the BrowserWindow bounds
  res.send('Updated');
});

expressApp.listen(port, () => {
  console.log(`Position update server running at http://localhost:${port}`);
});