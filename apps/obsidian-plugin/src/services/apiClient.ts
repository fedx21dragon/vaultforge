const DEFAULT_BASE_URL = "http://localhost:8000";

function getBaseUrl(): string {
	return (window as any).__vaultforgeBaseUrl ?? DEFAULT_BASE_URL;
}

export function setBaseUrl(url: string): void {
	(window as any).__vaultforgeBaseUrl = url.replace(/\/$/, "");
}

export async function fetchBackendHealth(): Promise<{ status: string }> {
	const response = await fetch(`${getBaseUrl()}/health`);

	if (!response.ok) {
		throw new Error(`Backend health check failed: ${response.status}`);
	}

	return response.json();
}

export type NoteSearchResult = {
	id: number;
	path: string;
	title: string;
};

export async function searchNotes(query: string): Promise<NoteSearchResult[]> {
	const response = await fetch(
		`${getBaseUrl()}/search/notes?q=${encodeURIComponent(query)}`
	);

	if (!response.ok) {
		throw new Error(`Search failed: ${response.status}`);
	}

	return response.json();
}

export type TemplateRequest = {
	note_type: string;
	title: string;
	extra_tags: string[];
};

export type TemplateResponse = {
	note_type: string;
	title: string;
	content: string;
	source: string;
};

export async function generateTemplate(
	request: TemplateRequest
): Promise<TemplateResponse> {
	const response = await fetch(`${getBaseUrl()}/templates/generate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(request),
	});

	if (!response.ok) {
		throw new Error(`Template generation failed: ${response.status}`);
	}

	return response.json();
}