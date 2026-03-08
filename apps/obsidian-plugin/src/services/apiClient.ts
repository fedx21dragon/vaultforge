import type { VaultForgeSettings } from "../settings";

export type NoteSearchResult = {
	id: number;
	path: string;
	title: string;
};

export type TemplateGenerateRequest = {
	topic: string;
	max_notes?: number;
};

export type TemplateGenerateResponse = {
	title: string;
	content: string;
	source_notes: string[];
};

function buildUrl(baseUrl: string, path: string): string {
	return `${baseUrl.replace(/\/+$/, "")}${path}`;
}

async function fetchWithTimeout(
	url: string,
	options: RequestInit,
	timeoutMs: number
): Promise<Response> {
	const controller = new AbortController();
	const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

	try {
		return await fetch(url, {
			...options,
			signal: controller.signal,
		});
	} finally {
		window.clearTimeout(timeout);
	}
}

export async function fetchBackendHealth(
	settings: VaultForgeSettings
): Promise<{ status: string }> {
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

export async function searchNotes(
	settings: VaultForgeSettings,
	query: string
): Promise<NoteSearchResult[]> {
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

export async function generateTemplateFromVault(
	settings: VaultForgeSettings,
	payload: TemplateGenerateRequest
): Promise<TemplateGenerateResponse> {
	const response = await fetchWithTimeout(
		buildUrl(settings.backendUrl, "/template/from-vault"),
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		},
		settings.requestTimeoutMs
	);

	if (!response.ok) {
		throw new Error(`Template generation failed: ${response.status}`);
	}

	return response.json();
}