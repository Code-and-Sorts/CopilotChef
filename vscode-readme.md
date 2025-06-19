<div align="center">
  <img src="images/icon-nobackground.png" alt="Copilot Chef Logo" width="200"/>
  <h1>Copilot Chef</h1>
</div>

Turn GitHub Copilot into your personal sous-chef—whipping 🧑‍🍳 up advanced workflow orchestration, task management, and automation tools. Serve up streamlined AI-assisted development with customizable recipes for your go-to coding dishes.

## Features

Copilot Chef adds a powerful chat participant to your VS Code environment:

- **Task Manager** - Run multiple AI agents in parallel to tackle complex tasks
- **Orchestrator** - Automatically generate and organize tasks from your prompts
- **Workflow** - Execute sequential workflows with optional approval gates

![Copilot Chef in action](images/screenshot.png)

## Quick Start

1. Open VS Code Chat (Ctrl+Shift+I or Cmd+Shift+I on macOS)
2. Type `@copilot-chef` to activate the Copilot Chef chat participant
3. Use one of the following commands:
   - `@copilot-chef /taskManager` - Process JSON input to run multiple agents in parallel
   - `@copilot-chef /orchestrator` - Generate tasks from a prompt
   - `@copilot-chef /workflow` - Process JSON input to run a workflow in sequence

## Examples

### Orchestrator

```
@copilot-chef /orchestrator Create a React component that displays a list of items with pagination
```

### Task Manager

```
@copilot-chef /taskManager {
  "tasks": [
    {
      "name": "Create React component",
      "description": "Create a reusable button component with different states"
    },
    {
      "name": "Write unit tests",
      "description": "Create tests for the new button component"
    }
  ]
}
```

### Workflow

```
@copilot-chef /workflow {
  "workflow": [
    {
      "task": "Create component structure",
      "requireApproval": false
    },
    {
      "task": "Add styling",
      "requireApproval": true
    },
    {
      "task": "Implement functionality",
      "requireApproval": true
    }
  ]
}
```
