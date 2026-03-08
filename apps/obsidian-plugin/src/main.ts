import { Notice, Plugin } from "obsidian";
import { fetchBackendHealth } from "./services/apiClient";
import {
	DEFAULT_SETTINGS,
	type VaultForgeSettings,
	VaultForgeSettingTab,
} from "./settings";
import { openSearchVaultModal } from "./commands/searchVault";
import { generateTemplateCommand } from "./commands/generateTemplateFromVault";

export default class VaultForgePlugin extends Plugin {
	settings!: VaultForgeSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new VaultForgeSettingTab(this.app, this));

		this.addCommand({
			id: "vaultforge-check",
			name: "Say Hello",
			callback: () => {
				new Notice("VaultForge plugin is running.");
			},
		});

		this.addCommand({
			id: "vaultforge-backend-health",
			name: "Check Backend Health",
			callback: async () => {
				try {
					const result = await fetchBackendHealth(this.settings);
					new Notice(`Backend status: ${result.status}`);
				} catch (error) {
					console.error(error);
					new Notice("VaultForge backend is not reachable.");
				}
			},
		});

		this.addCommand({
			id: "vaultforge-search-vault",
			name: "Search Vault",
			callback: () => {
				openSearchVaultModal(this);
			},
		});

		this.addCommand({
			id: "vaultforge-generate-template-from-vault",
			name: "Generate Template from Vault Notes",
			callback: async () => {
				await generateTemplateCommand(this);
			},
		});
	}

	onunload() {
		console.log("VaultForge plugin unloaded");
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}