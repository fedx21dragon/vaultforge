import { Notice } from "obsidian";
import { generateTemplateFromVault } from "../services/apiClient";
import type VaultForgePlugin from "../main";

export async function generateTemplateCommand(plugin: VaultForgePlugin): Promise<void> {
	const topic = window.prompt("Enter template topic");

	if (!topic || !topic.trim()) {
		new Notice("Template generation cancelled.");
		return;
	}

	try {
		const result = await generateTemplateFromVault(plugin.settings, {
			topic: topic.trim(),
			max_notes: 5,
		});

		const fileName = `${result.title}.md`;
		await plugin.app.vault.create(fileName, result.content);

		new Notice(
			`Template created: ${fileName} (from ${result.source_notes.length} source notes)`
		);
	} catch (error) {
		console.error(error);
		new Notice("VaultForge template generation failed.");
	}
}