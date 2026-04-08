"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => VaultForgePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

// src/services/apiClient.ts
var DEFAULT_BASE_URL = "http://localhost:8000";
function getBaseUrl() {
  return window.__vaultforgeBaseUrl ?? DEFAULT_BASE_URL;
}
function setBaseUrl(url) {
  window.__vaultforgeBaseUrl = url.replace(/\/$/, "");
}
async function fetchBackendHealth() {
  const response = await fetch(`${getBaseUrl()}/health`);
  if (!response.ok) {
    throw new Error(`Backend health check failed: ${response.status}`);
  }
  return response.json();
}
async function searchNotes(query) {
  const response = await fetch(
    `${getBaseUrl()}/search/notes?q=${encodeURIComponent(query)}`
  );
  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }
  return response.json();
}
async function generateTemplate(request) {
  const response = await fetch(`${getBaseUrl()}/templates/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request)
  });
  if (!response.ok) {
    throw new Error(`Template generation failed: ${response.status}`);
  }
  return response.json();
}

// src/main.ts
var DEFAULT_SETTINGS = {
  backendUrl: "http://localhost:8000"
};
var VaultForgeSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Backend URL").setDesc("URL of the VaultForge backend (default: http://localhost:8000).").addText(
      (text) => text.setPlaceholder("http://localhost:8000").setValue(this.plugin.settings.backendUrl).onChange(async (value) => {
        this.plugin.settings.backendUrl = value;
        setBaseUrl(value);
        await this.plugin.saveSettings();
      })
    );
  }
};
var VaultForgePlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
  }
  async onload() {
    console.log("VaultForge plugin loaded");
    await this.loadSettings();
    setBaseUrl(this.settings.backendUrl);
    this.addSettingTab(new VaultForgeSettingTab(this.app, this));
    this.addCommand({
      id: "vaultforge-say-hello",
      name: "VaultForge: Say Hello",
      callback: () => {
        new import_obsidian.Notice("VaultForge plugin is running.");
      }
    });
    this.addCommand({
      id: "vaultforge-backend-health",
      name: "VaultForge: Check Backend Health",
      callback: async () => {
        try {
          const result = await fetchBackendHealth();
          new import_obsidian.Notice(`Backend status: ${result.status}`);
        } catch (error) {
          console.error(error);
          new import_obsidian.Notice("VaultForge backend is not reachable.");
        }
      }
    });
    this.addCommand({
      id: "vaultforge-search-control",
      name: "VaultForge: Search Notes for 'control'",
      callback: async () => {
        try {
          const results = await searchNotes("control");
          if (results.length === 0) {
            new import_obsidian.Notice("No notes found.");
            return;
          }
          new import_obsidian.Notice(`Found: ${results.map((r) => r.title).join(", ")}`);
        } catch (error) {
          console.error(error);
          new import_obsidian.Notice("VaultForge search failed.");
        }
      }
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
            extra_tags: []
          });
          let fileName = `${title} (template).md`;
          if (this.app.vault.getAbstractFileByPath(fileName)) {
            fileName = `${title} (template ${Date.now()}).md`;
          }
          const newFile = await this.app.vault.create(fileName, result.content);
          await this.app.workspace.getLeaf().openFile(newFile);
          new import_obsidian.Notice(
            `Template created from ${result.source === "vault" ? "vault patterns" : "default"}.`
          );
        } catch (error) {
          console.error(error);
          new import_obsidian.Notice("VaultForge template generation failed.");
        }
      }
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
};
