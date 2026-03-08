import { Notice, Plugin } from "obsidian";
import { fetchBackendHealth, searchNotes } from "./services/apiClient";

export default class VaultForgePlugin extends Plugin {
	async onload() {
		console.log("VaultForge plugin loaded");

		this.addCommand({
			id: "vaultforge-say-hello",
			name: "VaultForge: Say Hello",
			callback: () => {
				new Notice("VaultForge plugin is running.");
			},
		});

		this.addCommand({
			id: "vaultforge-backend-health",
			name: "VaultForge: Check Backend Health",
			callback: async () => {
				try {
					const result = await fetchBackendHealth();
					new Notice(`Backend status: ${result.status}`);
				} catch (error) {
					console.error(error);
					new Notice("VaultForge backend is not reachable.");
				}
			},
		});

		this.addCommand({
			id: "vaultforge-search-control",
			name: "VaultForge: Search Notes for 'control'",
			callback: async () => {
				try {
					const results = await searchNotes("control");

					if (results.length === 0) {
						new Notice("No notes found.");
						return;
					}

					new Notice(`Found: ${results.map((r) => r.title).join(", ")}`);
				} catch (error) {
					console.error(error);
					new Notice("VaultForge search failed.");
				}
			},
		});
	}

	onunload() {
		console.log("VaultForge plugin unloaded");
	}
}