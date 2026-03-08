import { App, Notice, SuggestModal } from "obsidian";
import type { NoteSearchResult } from "../services/apiClient";

export class SearchModal extends SuggestModal<NoteSearchResult> {
	private results: NoteSearchResult[] = [];
	private onSearch: (query: string) => Promise<NoteSearchResult[]>;

	constructor(
		app: App,
		onSearch: (query: string) => Promise<NoteSearchResult[]>
	) {
		super(app);
		this.onSearch = onSearch;
		this.setPlaceholder("Search vault notes...");
	}

	getSuggestions(query: string): NoteSearchResult[] | Promise<NoteSearchResult[]> {
		if (!query.trim()) {
			return [];
		}

		return this.onSearch(query.trim())
			.then((results) => {
				this.results = results;
				return results;
			})
			.catch((error) => {
				console.error(error);
				new Notice("VaultForge search failed.");
				return [];
			});
	}

	renderSuggestion(result: NoteSearchResult, el: HTMLElement): void {
		el.createEl("div", { text: result.title, cls: "vaultforge-result-title" });
		el.createEl("small", { text: result.path, cls: "vaultforge-result-path" });
	}

	async onChooseSuggestion(result: NoteSearchResult): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(result.path);

		if (!file) {
			new Notice(`Could not find note: ${result.path}`);
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		await this.app.workspace.getLeaf().openFile(file as any);
	}
}