CREATE TABLE `study_materials` (
	`id` integer PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`hidden` integer,
	`meaning_note` text,
	`meaning_synonyms` text DEFAULT '[]',
	`reading_note` text,
	`subject_id` integer NOT NULL,
	`subject_type` text NOT NULL
);
