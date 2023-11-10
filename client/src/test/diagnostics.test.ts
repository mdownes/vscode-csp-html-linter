/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import * as assert from 'assert';
import { getDocUri, activate } from './helper';

suite('Should get diagnostics', () => {
	const docUri = getDocUri('diagnostics.html');

	test('Diagnoses Style tag without nonce', async () => {
		await testDiagnostics(docUri, [
			{ message: 'You must not use the inline Javascript event: onclick', range: toRange(4, 1, 4, 35), severity: vscode.DiagnosticSeverity.Error, source: 'ex' },
			{ message: 'You must add a nonce to a script tag', range: toRange(3, 12, 3, 29), severity: vscode.DiagnosticSeverity.Error, source: 'ex' },
			{ message: 'You must not use inline styles', range: toRange(1, 1, 1, 31), severity: vscode.DiagnosticSeverity.Error, source: 'ex' },
			{ message: 'You must add a nonce to a style tag', range: toRange(0, 1, 0, 16), severity: vscode.DiagnosticSeverity.Error, source: 'ex' },
		]);
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