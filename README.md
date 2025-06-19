# VS Code Cookbook

A collection of useful VS Code extension examples and tools.

## Features

This extension provides several chat participants to help with various tasks:

- **Task Manager**: Process XML input to run multiple agents in parallel
- **Orchestrator**: Generates tasks from a prompt
- **Workflow**: Process XML input to run a workflow in sequence with optional approval gates

## Installation

1. Download the VSIX file from the releases page
2. Install it in VS Code:
   - Open VS Code
   - Go to Extensions view (Ctrl+Shift+X)
   - Click on the "..." menu at the top of the Extensions view
   - Select "Install from VSIX..."
   - Choose the downloaded VSIX file

## Usage

Once installed, you can access the Cookbook chat participant in the VS Code chat interface.

## Requirements

- VS Code 1.101.0 or higher
- GitHub Copilot Chat extension

## Development

1. Clone the repository
2. Run `yarn` to install dependencies
3. Run `yarn package` to build the extension
4. Run `npx @vscode/vsce package --no-yarn` to create the VSIX file

## License

MIT
