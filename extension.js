// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const exec = require("child_process").execSync;
const fs = require("fs");
const path = require("path");

const exists = fs.existsSync;

const defaultConsolePath = "./bin/console";
let consolePath = path.resolve(vscode.workspace.rootPath || '', defaultConsolePath);
let sc = null;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "symfony-console" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("extension.runCommand", runCommand);

  context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;

function getAvailableCommands() {
  const output = exec(consolePath).toString();
  const lines = output.split(/\n/).filter(line => line !== '');
  const commandStart = lines.indexOf("Available commands:");
  const commandsList = lines.slice(commandStart + 1);
  const commands = {};
  let current = null;
  commandsList.forEach(commandsLine => {
    if (commandsLine.match(/^\s\w.*/)) {
      current = commandsLine.trim();
      commands[current] = [];
    } else if (current) {
      const command = commandsLine.trim().replace(current + ":", "");
      commands[current].push(command);
    }
  });
  return commands;
}


function runCommand(){
  if(exists(consolePath)){
    const commands = getAvailableCommands();
    const categorys = Object.keys(commands);
    vscode.window.showQuickPick(categorys).then(category => {
      vscode.window.showQuickPick(commands[category]).then(commandLine => {
  
        vscode.window.showInputBox({prompt:'additional parameters'}).then(params => {
          const cmd = commandLine.slice(0, commandLine.indexOf(' '));
          const command = `${category}:${cmd} ${params}`;
          sc = (sc) ? sc : vscode.window.createTerminal('Symfony Console');
          if (vscode.window.terminals.findIndex(termial => termial._id === sc._id) === -1){
            sc = vscode.window.createTerminal('Symfony Console');
          }
          sc.show();
          sc.sendText(`${consolePath} ${command}`)
        })
  
      });
    });
  } else {
    vscode.window.showInputBox({prompt:'specify console path'}).then((tmpPath = '')=>{
      const newPath = (tmpPath !== '') ? tmpPath.replace('~', process.env.HOME) : defaultConsolePath;
      consolePath = path.resolve(vscode.workspace.rootPath || '', newPath);
      (tmpPath !== '') ? runCommand() : null;
    });
  }
}