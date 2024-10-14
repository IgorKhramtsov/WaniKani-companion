CREATE TABLE `assignments` (
	`id` integer PRIMARY KEY NOT NULL,
	`updated_at` integer NOT NULL,
	`available_at` integer,
	`burned_at` integer,
	`created_at` integer NOT NULL,
	`hidden` integer NOT NULL,
	`passed_at` integer,
	`resurrected_at` integer,
	`srs_stage` integer NOT NULL,
	`started_at` integer,
	`subject_id` integer NOT NULL,
	`subject_type` text NOT NULL,
	`unlocked_at` integer
);
--> statement-breakpoint
CREATE TABLE `level_progressions` (
	`id` integer PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`level` integer NOT NULL,
	`unlocked_at` integer,
	`started_at` integer,
	`passed_at` integer,
	`completed_at` integer,
	`abandoned_at` integer
);
--> statement-breakpoint
CREATE TABLE `review_statistics` (
	`id` integer PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`hidden` integer NOT NULL,
	`meaning_correct` integer NOT NULL,
	`meaning_current_streak` integer NOT NULL,
	`meaning_incorrect` integer NOT NULL,
	`meaning_max_streak` integer NOT NULL,
	`percentage_correct` integer NOT NULL,
	`reading_correct` integer NOT NULL,
	`reading_current_streak` integer NOT NULL,
	`reading_incorrect` integer NOT NULL,
	`reading_max_streak` integer NOT NULL,
	`subject_id` integer NOT NULL,
	`subject_type` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY NOT NULL,
	`assignment_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	`ending_srs_stage` integer NOT NULL,
	`incorrect_meaning_answers` integer NOT NULL,
	`incorrect_reading_answers` integer NOT NULL,
	`spaced_repetition_system_id` integer NOT NULL,
	`starting_srs_stage` integer NOT NULL,
	`subject_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` integer PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`auxiliary_meanings` text NOT NULL,
	`characters` text,
	`created_at` integer NOT NULL,
	`hidden_at` integer,
	`lesson_position` integer NOT NULL,
	`level` integer NOT NULL,
	`meaning_mnemonic` text NOT NULL,
	`meanings` text DEFAULT '[]',
	`slug` text NOT NULL,
	`spaced_repetition_system_id` integer NOT NULL,
	`amalgamation_subject_ids` text DEFAULT '[]',
	`component_subject_ids` text DEFAULT '[]',
	`reading_mnemonic` text,
	`readings` text DEFAULT '[]',
	`character_images` text DEFAULT '[]',
	`meaning_hint` text,
	`reading_hint` text,
	`visually_similar_subject_ids` text DEFAULT '[]',
	`context_sentences` text DEFAULT '[]',
	`parts_of_speech` text DEFAULT '[]',
	`pronunciation_audios` text DEFAULT '[]'
);
