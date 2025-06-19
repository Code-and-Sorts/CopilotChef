import * as vscode from 'vscode';
import { Participant } from '@utils/register.util';

export async function activate(context: vscode.ExtensionContext) {
    const participant = new Participant();
    await participant.register(context);
}

export function deactivate() { }
