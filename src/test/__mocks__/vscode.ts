export const window = {
  showInformationMessage: jest.fn(),
  showErrorMessage: jest.fn(),
  showWarningMessage: jest.fn(),
  createOutputChannel: jest.fn().mockReturnValue({
    appendLine: jest.fn(),
    show: jest.fn(),
    clear: jest.fn(),
  }),
};

export const commands = {
  registerCommand: jest.fn(),
  executeCommand: jest.fn(),
};

export const workspace = {
  getConfiguration: jest.fn().mockReturnValue({
    get: jest.fn(),
    update: jest.fn(),
  }),
};

export const Uri = {
  file: jest.fn().mockImplementation((path) => ({ path })),
  parse: jest.fn().mockImplementation((uri) => ({ uri })),
};

export const CancellationToken = {
  None: {},
};

export class ChatRequest {
  prompt: string;
  constructor(prompt: string) {
    this.prompt = prompt;
  }
}

export class ChatResponseStream {
  markdown = jest.fn().mockReturnThis();
  progress = jest.fn().mockReturnThis();
  button = jest.fn().mockReturnThis();
}

export const ExtensionContext = {
  subscriptions: [],
};

export type CancellationToken = typeof CancellationToken.None;
