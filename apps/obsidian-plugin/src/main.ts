import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import {
	fetchBackendHealth,
	generateTemplate,
	searchNotes,
	setBaseUrl,
} from "./services/apiClient";

interface VaultForgeSettings {
	backendUrl: string;
}

const DEFAULT_SETTINGS: VaultForgeSettings = {
	backendUrl: "http://localhost:8000",
};

class VaultForgeSettingTab extends PluginSettingTab {
	plugin: VaultForgePlugin;

	constructor(app: App, plugin: VaultForgePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Backend URL")
			.setDesc("URL of the VaultForge backend (default: http://localhost:8000).")
			.addText((text) =>
				text
					.setPlaceholder("http://localhost:8000")
					.setValue(this.plugin.settings.backendUrl)
					.onChange(async (value) => {
						this.plugin.settings.backendUrl = value;
						setBaseUrl(value);
						await this.plugin.saveSettings();
					})
			);
	}
}

export default class VaultForgePlugin extends Plugin {
	settings: VaultForgeSettings = DEFAULT_SETTINGS;

	async onload() {
		console.log("VaultForge plugin loaded");

		await this.loadSettings();
		setBaseUrl(this.settings.backendUrl);

		this.addSettingTab(new VaultForgeSettingTab(this.app, this));

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

		this.addCommand({
			id: "vaultforge-generate-template",
			name: "VaultForge: Generate Note Template",
			callback: async () => {
				try {
					const activeFile = this.app.workspace.getActiveFile();
					const title = activeFile?.basename ?? "Untitled";

					const result = await generateTemplate({
						note_type: "general",
						title,
						extra_tags: [],
					});

					let fileName = `${title} (template).md`;
					if (this.app.vault.getAbstractFileByPath(fileName)) {
						fileName = `${title} (template ${Date.now()}).md`;
					}

					const newFile = await this.app.vault.create(fileName, result.content);

					await this.app.workspace.getLeaf().openFile(newFile);
					new Notice(
						`Template created from ${result.source === "vault" ? "vault patterns" : "default"}.`
					);
				} catch (error) {
					console.error(error);
					new Notice("VaultForge template generation failed.");
				}
			},
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	onunload() {
		console.log("VaultForge plugin unloaded");
	}
}