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
var import_obsidian4 = require("obsidian");

// src/services/apiClient.ts
function buildUrl(baseUrl, path) {
  return `${baseUrl.replace(/\/+$/, "")}${path}`;
}
async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    window.clearTimeout(timeout);
  }
}
async function fetchBackendHealth(settings) {
  const response = await fetchWithTimeout(
    buildUrl(settings.backendUrl, "/health"),
    { method: "GET" },
    settings.requestTimeoutMs
  );
  if (!response.ok) {
    throw new Error(`Backend health check failed: ${response.status}`);
  }
  return response.json();
}
async function searchNotes(settings, query) {
  const response = await fetchWithTimeout(
    buildUrl(
      settings.backendUrl,
      `/search/notes?q=${encodeURIComponent(query)}`
    ),
    { method: "GET" },
    settings.requestTimeoutMs
  );
  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }
  return response.json();
}
async function generateTemplateFromVault(settings, payload) {
  const response = await fetchWithTimeout(
    buildUrl(settings.backendUrl, "/template/from-vault"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    },
    settings.requestTimeoutMs
  );
  if (!response.ok) {
    throw new Error(`Template generation failed: ${response.status}`);
  }
  return response.json();
}

// src/settings.ts
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  backendUrl: "http://127.0.0.1:8000",
  requestTimeoutMs: 1e4
};
var VaultForgeSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "VaultForge Settings" });
    new import_obsidian.Setting(containerEl).setName("Backend URL").setDesc("URL of the local VaultForge backend").addText(
      (text) => text.setPlaceholder("http://127.0.0.1:8000").setValue(this.plugin.settings.backendUrl).onChange(async (value) => {
        this.plugin.settings.backendUrl = value.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Request timeout (ms)").setDesc("Timeout for backend requests in milliseconds").addText(
      (text) => text.setPlaceholder("10000").setValue(String(this.plugin.settings.requestTimeoutMs)).onChange(async (value) => {
        const parsed = Number(value);
        if (!Number.isNaN(parsed) && parsed > 0) {
          this.plugin.settings.requestTimeoutMs = parsed;
          await this.plugin.saveSettings();
        }
      })
    );
  }
};

// src/ui/SearchModals.ts
var import_obsidian2 = require("obsidian");
var SearchModal = class extends import_obsidian2.SuggestModal {
  constructor(app, onSearch) {
    super(app);
    this.results = [];
    this.onSearch = onSearch;
    this.setPlaceholder("Search vault notes...");
  }
  getSuggestions(query) {
    if (!query.trim()) {
      return [];
    }
    return this.onSearch(query.trim()).then((results) => {
      this.results = results;
      return results;
    }).catch((error) => {
      console.error(error);
      new import_obsidian2.Notice("VaultForge search failed.");
      return [];
    });
  }
  renderSuggestion(result, el) {
    el.createEl("div", { text: result.title, cls: "vaultforge-result-title" });
    el.createEl("small", { text: result.path, cls: "vaultforge-result-path" });
  }
  async onChooseSuggestion(result) {
    const file = this.app.vault.getAbstractFileByPath(result.path);
    if (!file) {
      new import_obsidian2.Notice(`Could not find note: ${result.path}`);
      return;
    }
    await this.app.workspace.getLeaf().openFile(file);
  }
};

// src/commands/searchVault.ts
function openSearchVaultModal(plugin) {
  const modal = new SearchModal(plugin.app, async (query) => {
    return searchNotes(plugin.settings, query);
  });
  modal.open();
}

// src/commands/generateTemplateFromVault.ts
var import_obsidian3 = require("obsidian");
async function generateTemplateCommand(plugin) {
  const topic = window.prompt("Enter template topic");
  if (!topic || !topic.trim()) {
    new import_obsidian3.Notice("Template generation cancelled.");
    return;
  }
  try {
    const result = await generateTemplateFromVault(plugin.settings, {
      topic: topic.trim(),
      max_notes: 5
    });
    const fileName = `${result.title}.md`;
    await plugin.app.vault.create(fileName, result.content);
    new import_obsidian3.Notice(
      `Template created: ${fileName} (from ${result.source_notes.length} source notes)`
    );
  } catch (error) {
    console.error(error);
    new import_obsidian3.Notice("VaultForge template generation failed.");
  }
}

// src/main.ts
var VaultForgePlugin = class extends import_obsidian4.Plugin {
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new VaultForgeSettingTab(this.app, this));
    this.addCommand({
      id: "vaultforge-say-hello",
      name: "VaultForge: Say Hello",
      callback: () => {
        new import_obsidian4.Notice("VaultForge plugin is running.");
      }
    });
    this.addCommand({
      id: "vaultforge-backend-health",
      name: "VaultForge: Check Backend Health",
      callback: async () => {
        try {
          const result = await fetchBackendHealth(this.settings);
          new import_obsidian4.Notice(`Backend status: ${result.status}`);
        } catch (error) {
          console.error(error);
          new import_obsidian4.Notice("VaultForge backend is not reachable.");
        }
      }
    });
    this.addCommand({
      id: "vaultforge-search-vault",
      name: "VaultForge: Search Vault",
      callback: () => {
        openSearchVaultModal(this);
      }
    });
    this.addCommand({
      id: "vaultforge-generate-template-from-vault",
      name: "VaultForge: Generate Template from Vault Notes",
      callback: async () => {
        await generateTemplateCommand(this);
      }
    });
  }
  onunload() {
    console.log("VaultForge plugin unloaded");
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
