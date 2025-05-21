// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ShiroLeaderboard {
    struct ScoreEntry {
        address player;
        uint256 score;
        uint256 timestamp;
    }

    mapping(address => ScoreEntry) public scores;
    address[] public players;

    event ScoreSubmitted(address indexed player, uint256 score, uint256 timestamp);

    function submitScore(uint256 _score) external {
        require(_score > 0, "Score must be > 0");

        ScoreEntry storage existing = scores[msg.sender];

        // Only update if new score is higher or player is new
        if (_score > existing.score || existing.timestamp == 0) {
            scores[msg.sender] = ScoreEntry({
                player: msg.sender,
                score: _score,
                timestamp: block.timestamp
            });

            // Add to players list if first time
            if (existing.timestamp == 0) {
                players.push(msg.sender);
            }

            emit ScoreSubmitted(msg.sender, _score, block.timestamp);
        }
    }

    function getLeaderboard(uint256 topN) external view returns (ScoreEntry[] memory) {
        uint256 total = players.length;
        if (topN > total) topN = total;

        // Create memory array of all scores
        ScoreEntry[] memory all = new ScoreEntry[](total);
        for (uint256 i = 0; i < total; i++) {
            all[i] = scores[players[i]];
        }

        // Sort top N (selection sort optimized for small arrays)
        for (uint256 i = 0; i < topN; i++) {
            uint256 maxIdx = i;
            for (uint256 j = i + 1; j < total; j++) {
                if (all[j].score > all[maxIdx].score) {
                    maxIdx = j;
                }
            }
            if (i != maxIdx) {
                ScoreEntry memory temp = all[i];
                all[i] = all[maxIdx];
                all[maxIdx] = temp;
            }
        }

        // Trim to top N
        ScoreEntry[] memory topScores = new ScoreEntry[](topN);
        for (uint256 i = 0; i < topN; i++) {
            topScores[i] = all[i];
        }

        return topScores;
    }

    function getMyScore() external view returns (ScoreEntry memory) {
        return scores[msg.sender];
    }

    function getTotalPlayers() external view returns (uint256) {
        return players.length;
    }
}
