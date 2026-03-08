import { PluginSettingTab, App, Setting } from "obsidian";
import VaultForgePlugin from "./main";

export interface VaultForgeSettings {
	backendUrl: string;
	requestTimeoutMs: number;
}

export const DEFAULT_SETTINGS: VaultForgeSettings = {
	backendUrl: "http://127.0.0.1:8000",
	requestTimeoutMs: 10000,
};

export class VaultForgeSettingTab extends PluginSettingTab {
	plugin: VaultForgePlugin;

	constructor(app: App, plugin: VaultForgePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "VaultForge Settings" });

		new Setting(containerEl)
			.setName("Backend URL")
			.setDesc("URL of the local VaultForge backend")
			.addText((text) =>
				text
					.setPlaceholder("http://127.0.0.1:8000")
					.setValue(this.plugin.settings.backendUrl)
					.onChange(async (value) => {
						this.plugin.settings.backendUrl = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Request timeout (ms)")
			.setDesc("Timeout for backend requests in milliseconds")
			.addText((text) =>
				text
					.setPlaceholder("10000")
					.setValue(String(this.plugin.settings.requestTimeoutMs))
					.onChange(async (value) => {
						const parsed = Number(value);
						if (!Number.isNaN(parsed) && parsed > 0) {
							this.plugin.settings.requestTimeoutMs = parsed;
							await this.plugin.saveSettings();
						}
					})
			);
	}
}