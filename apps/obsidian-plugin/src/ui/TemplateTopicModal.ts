import { App, Modal, Setting } from "obsidian";

export class TemplateTopicModal extends Modal {
	private topic = "";
	private onSubmit: (topic: string) => void;

	constructor(app: App, onSubmit: (topic: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "Generate Template from Vault Notes" });

		new Setting(contentEl)
			.setName("Topic")
			.setDesc("Enter the topic for the template")
			.addText((text) => {
				text.setPlaceholder("e.g. Control Systems");
				text.onChange((value) => {
					this.topic = value;
				});
				text.inputEl.focus();
			});

		new Setting(contentEl).addButton((button) =>
			button
				.setButtonText("Generate")
				.setCta()
				.onClick(() => {
					const trimmed = this.topic.trim();
					if (!trimmed) {
						return;
					}
					this.close();
					this.onSubmit(trimmed);
				})
		);
	}

	onClose(): void {
		this.contentEl.empty();
	}
}