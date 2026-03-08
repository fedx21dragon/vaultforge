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
var BASE_URL = "http://127.0.0.1:8000";
async function fetchBackendHealth() {
  const response = await fetch(`${BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Backend health check failed: ${response.status}`);
  }
  return response.json();
}
async function searchNotes(query) {
  const response = await fetch(
    `${BASE_URL}/search/notes?q=${encodeURIComponent(query)}`
  );
  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }
  return response.json();
}

// src/main.ts
var VaultForgePlugin = class extends import_obsidian.Plugin {
  async onload() {
    console.log("VaultForge plugin loaded");
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
  }
  onunload() {
    console.log("VaultForge plugin unloaded");
  }
};
