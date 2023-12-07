SET FOREIGN_KEY_CHECKS=0;
CREATE TABLE IF NOT EXISTS `anime_songs` (
  `id` varchar(100) NOT NULL,
  `song_name_english` mediumtext DEFAULT NULL,
  `song_url` mediumtext,
  `song_name_romaji` mediumtext DEFAULT NULL,
  `anime_genre` longtext DEFAULT '{}',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `guess_counts` (
  `song_id` varchar(100) DEFAULT NULL,
  `guess_count` int(11) DEFAULT 1,
  `correct_guess_count` int(11) DEFAULT NULL,
  KEY `guess_counts_FK` (`song_id`),
  CONSTRAINT `guess_counts_FK` FOREIGN KEY (`song_id`) REFERENCES `anime_songs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET FOREIGN_KEY_CHECKS=1;