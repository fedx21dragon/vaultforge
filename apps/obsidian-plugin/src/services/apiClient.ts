const BASE_URL = "http://localhost:8000";

export async function fetchBackendHealth(): Promise<{ status: string }> {
	const response = await fetch(`${BASE_URL}/health`);

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
		`${BASE_URL}/search/notes?q=${encodeURIComponent(query)}`
	);

	if (!response.ok) {
		throw new Error(`Search failed: ${response.status}`);
	}

	return response.json();
}