import { SearchModal } from "../ui/SearchModals";
import { searchNotes } from "../services/apiClient";
import type VaultForgePlugin from "../main";

export function openSearchVaultModal(plugin: VaultForgePlugin): void {
	const modal = new SearchModal(plugin.app, async (query: string) => {
		return searchNotes(plugin.settings, query);
	});

	modal.open();
}