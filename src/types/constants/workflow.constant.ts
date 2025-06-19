export const workflowJsonFormat = `\`\`\`json
{
  "tasks": [
    {
      "name": "Task 1",
      "prompt": "Task 1 description",
      "approvalGate": {
        "isEnabled": true,
        "message": "Task 1 message"
      }
    },
    {
      "name": "Task 2",
      "prompt": "Task 2 description",
      "approvalGate": {
        "isEnabled": true,
        "message": "Task 2 message"
      }
    }
  ],
  "system": "Optional system prompt"
}
\`\`\`;
