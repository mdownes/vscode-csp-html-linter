/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import * as assert from 'assert';
import { getDocUri, activate } from './helper';
import { beforeEach } from 'mocha';

suite('Should get diagnostics', () => {
	beforeEach(() => {
		const testFramework = vscode.workspace.getConfiguration('cspHtmlLinter');
		testFramework.update('allowInlineStyles', false, vscode.ConfigurationTarget.Global);
		testFramework.update('allowInlineJs', false, vscode.ConfigurationTarget.Global);
		testFramework.update('allowStyleTagWithoutNonce', false, vscode.ConfigurationTarget.Global);
		testFramework.update('allowScriptTagWithoutNonce', false, vscode.ConfigurationTarget.Global);
		testFramework.update('exclude', '', vscode.ConfigurationTarget.Global);
	})
	const docUri = getDocUri('diagnostics.html');

	test('Diagnoses Style tag without nonce', async () => {
		const source ='CSP HTML Linter';
		await testDiagnostics(docUri, [
			{ message: 'You must not use the inline Javascript event: onclick', range: toRange(4, 1, 4, 35), severity: vscode.DiagnosticSeverity.Error, source: source },
			{ message: 'You must add a nonce to a script tag', range: toRange(3, 12, 3, 29), severity: vscode.DiagnosticSeverity.Error, source: source },
			{ message: 'You must not use inline styles', range: toRange(1, 1, 1, 31), severity: vscode.DiagnosticSeverity.Error, source: source },
			{ message: 'You must add a nonce to a style tag', range: toRange(0, 1, 0, 16), severity: vscode.DiagnosticSeverity.Error, source: source },
		]);
	});
});

suite('Should change diagnostics when settings are changed', () => {
	const testFramework = vscode.workspace.getConfiguration('cspHtmlLinter');
	beforeEach(() => {

		testFramework.update('allowInlineStyles', false, vscode.ConfigurationTarget.Global);
		testFramework.update('allowInlineJs', false, vscode.ConfigurationTarget.Global);
		testFramework.update('allowStyleTagWithoutNonce', false, vscode.ConfigurationTarget.Global);
		testFramework.update('allowScriptTagWithoutNonce', false, vscode.ConfigurationTarget.Global);
		testFramework.update('exclude', '', vscode.ConfigurationTarget.Global);
	})

	const docUri = getDocUri('diagnostics.html');

	test('Does not return any diagnotics when file is excluded', async () => {

		// Update configuration
		testFramework.update('exclude', '**/diag*', vscode.ConfigurationTarget.Global);

		await activate(docUri);
		const actualDiagnostics = vscode.languages.getDiagnostics(docUri);
		assert.equal(actualDiagnostics.length, 0);

	});

	test('returns one less diagnostic as inlinestyles allowed', async () => {
		const testFramework = vscode.workspace.getConfiguration('cspHtmlLinter');
		// Update configuration
		testFramework.update('allowInlineStyles', true, vscode.ConfigurationTarget.Global);
		console.dir(testFramework)
		await activate(docUri);
		const actualDiagnostics = vscode.languages.getDiagnostics(docUri);

		assert.equal(actualDiagnostics.length, 3);
	});

	test('returns no diagnostics when all options are turned off', async () => {

		// Update configuration
		testFramework.update('allowInlineStyles', true, vscode.ConfigurationTarget.Global);
		testFramework.update('allowInlineJs', true, vscode.ConfigurationTarget.Global);
		testFramework.update('allowStyleTagWithoutNonce', true, vscode.ConfigurationTarget.Global);
		testFramework.update('allowScriptTagWithoutNonce', true, vscode.ConfigurationTarget.Global);

		await activate(docUri);
		const actualDiagnostics = vscode.languages.getDiagnostics(docUri);

		assert.equal(actualDiagnostics.length, 0);
	});
});

function toRange(sLine: number, sChar: number, eLine: number, eChar: number) {
	const start = new vscode.Position(sLine, sChar);
	const end = new vscode.Position(eLine, eChar);
	return new vscode.Range(start, end);
}

async function testDiagnostics(docUri: vscode.Uri, expectedDiagnostics: vscode.Diagnostic[]) {
	await activate(docUri);

	const actualDiagnostics = vscode.languages.getDiagnostics(docUri);

	assert.equal(actualDiagnostics.length, expectedDiagnostics.length);

	expectedDiagnostics.forEach((expectedDiagnostic, i) => {
		//const actualDiagnostic = actualDiagnostics[i];
		//cant trust the order of the actualDiagnostics 
		const actualDiagnostic = actualDiagnostics.filter((act) => act.message === expectedDiagnostic.message)[0];
		assert.equal(actualDiagnostic.message, expectedDiagnostic.message);
		assert.deepEqual(actualDiagnostic.range, expectedDiagnostic.range);
		assert.equal(actualDiagnostic.severity, expectedDiagnostic.severity);

	});
}