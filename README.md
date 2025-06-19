<div align="center">
  <img src="images/icon-nobackground.png" alt="Copilot Chef Logo" width="200"/>
  <h1>Copilot Chef</h1>
</div>

A VS Code extension that turns GitHub Copilot into your personal sous-chef 👨‍🍳—whipping up advanced workflow orchestration, task management, and automation tools. Serve up streamlined AI-assisted development with customizable recipes for your go-to coding dishes.

## ✨ Features

This extension provides a chat participant to help with various tasks:

- **Task Manager**: Process JSON input to run multiple agents in parallel
- **Orchestrator**: Generates tasks from a prompt
- **Workflow**: Process JSON input to run a workflow in sequence with optional approval gates


## 🎬 See it in Action

### Running tasks in parallel with task manager

Below an example of running the task manager (12 tasks) that get run in parallel. All these tasks are being run in parallel, so that run pretty quickly.

![Task Manager Example](images/taskmanager-example.gif)

### Creating an orchestration to separate a prompt into tasks and run them in parallel with the orchestrator

The example below illustrates how you can use the orchestrator to take a single prompt, have it get broken down into subtasks and then have it run the task manager.

![Orchestrator Example](images/orchestrator-example.gif)

### Creating approval with workflow

The example below highlights how to create approval workflows that can have optional approval gates in them.

![Approval Workflow Example](images/workflow-example.gif)

## 📦 Installation

1. Download the VSIX file from the releases page
2. Install it in VS Code:
   - Open VS Code
   - Go to Extensions view (Ctrl+Shift+X)
   - Click on the "..." menu at the top of the Extensions view
   - Select "Install from VSIX..."
   - Choose the downloaded VSIX file

## 🚀 Usage

Once installed, you can access the Copilot Chef chat participant in the VS Code chat interface.

### 📋 Task Manager

Use the Task Manager to run multiple agents in parallel:

```
@copilot-chef /taskManager {
  "tasks": [
    {
      "name": "Create React component",
      "prompt": "Create a React reusable button component with different states"
    },
    {
      "name": "Write unit tests",
      "prompt": "Create tests for the new button component"
    }
  ]
}
```

### 🎮 Orchestrator

Use the Orchestrator to generate tasks from a prompt:

```
@copilot-chef /orchestrator {
  "prompt": "Generate a complete login page with form validation",
  "modelType": "gpt-4o"
}
```

### ⚙️ Workflow

Use the Workflow to run a workflow in sequence with optional approval gates:

```
@copilot-chef /workflow {
  "tasks": [
    {
      "name": "Setup project structure",
      "prompt": "Create a directory structure for a new React project",
      "approvalGate": {
        "isEnabled": true,
        "message": "Would you like to continue to create the components?"
      }
    },
    {
      "name": "Create components",
      "prompt": "Create React components for the project"
    }
  ]
}
```

## 🔍 Requirements

- VS Code 1.87.0 or higher
- GitHub Copilot Chat extension

## 💻 Development

1. Clone the repository
2. Run `yarn` to install dependencies
3. Run `yarn package` to build the extension
4. Run `yarn create-vsix` to create the VSIX file

## 📄 License

MIT
