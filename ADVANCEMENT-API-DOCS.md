# Advancement Information API Documentation

## Endpoint

```
GET /api/matches/:matchId/advancement-info
```

## Description

Retrieves detailed advancement information for a specific match, explaining how each player/team qualified for Semi-Finals or Finals. This endpoint only returns meaningful data for playoff matches.

## Parameters

### Path Parameters
- `matchId` (string, required) - The unique identifier of the match

## Response Format

### Success Response (200 OK)

#### For Playoff Matches with Advanced Players

```json
{
  "hasAdvancement": true,
  "matchStage": "Semi-Final 1",
  "category": "Mens Singles",
  "player1": {
    "name": "Rajesh Kumar",
    "advancementDetails": {
      "type": "group-winner",
      "group": "A",
      "position": 1,
      "standings": [
        {
          "name": "Rajesh Kumar",
          "won": 3,
          "lost": 0,
          "pointsFor": 63,
          "pointsAgainst": 45,
          "pointDiff": 18
        },
        {
          "name": "Amit Sharma",
          "won": 2,
          "lost": 1,
          "pointsFor": 58,
          "pointsAgainst": 52,
          "pointDiff": 6
        }
      ],
      "description": "Winner of Group A (Rank 1 based on matches won, then point difference, then total points scored)"
    }
  },
  "player2": {
    "name": "Sanjay Reddy",
    "advancementDetails": {
      "type": "group-runner",
      "group": "B",
      "position": 2,
      "standings": [...],
      "description": "Runner-up of Group B (Rank 2 based on...)"
    }
  }
}
```

#### For Non-Playoff Matches

```json
{
  "hasAdvancement": false
}
```

### Error Response (404 Not Found)

```json
{
  "error": "Match not found"
}
```

## Advancement Detail Types

### 1. Group Winner (`group-winner`)

Indicates the player won their group.

```json
{
  "type": "group-winner",
  "group": "A",
  "position": 1,
  "standings": [...],
  "description": "Winner of Group A (Rank 1 based on matches won, then point difference, then total points scored)"
}
```

### 2. Group Runner-up (`group-runner`)

Indicates the player was second in their group.

```json
{
  "type": "group-runner",
  "group": "B",
  "position": 2,
  "standings": [...],
  "description": "Runner-up of Group B (Rank 2 based on matches won, then point difference, then total points scored)"
}
```

### 3. Group Rank (`group-rank`)

Indicates a specific rank position within a group.

```json
{
  "type": "group-rank",
  "group": "A",
  "position": 3,
  "standings": [...],
  "description": "Rank 3 of Group A (based on matches won, then point difference, then total points scored)"
}
```

### 4. Overall Rank (`overall-rank`)

Indicates rank across all groups in the category.

```json
{
  "type": "overall-rank",
  "position": 1,
  "standings": [...],
  "description": "Overall Rank 1 across all groups (based on matches won, then head-to-head if applicable, then point difference, then total points scored)"
}
```

### 5. Semi-Final Winner (`semifinal-winner`)

Indicates the player won a semi-final match (used for finals).

```json
{
  "type": "semifinal-winner",
  "semifinalNumber": "1",
  "match": {
    "player1": "Rajesh Kumar",
    "player2": "Amit Sharma",
    "score": {
      "p1": 21,
      "p2": 15
    },
    "winner": "Rajesh Kumar"
  },
  "description": "Winner of Semi-Final 1: Rajesh Kumar defeated Amit Sharma (21 - 15)"
}
```

### 6. Unknown (`unknown`)

When advancement details cannot be determined (placeholder still exists).

```json
{
  "type": "unknown",
  "details": null
}
```

## Standings Object

Each standings entry contains:

```json
{
  "name": "Player Name",
  "won": 3,           // Matches won
  "lost": 0,          // Matches lost
  "pointsFor": 63,    // Total points scored
  "pointsAgainst": 45, // Total points conceded
  "pointDiff": 18     // Net point difference (pointsFor - pointsAgainst)
}
```

## Business Logic

### Tie-Breaking Rules

The endpoint uses the official 3-level tie-breaker system:

1. **Primary**: Match Wins (higher is better)
2. **Level 1**: Head-to-Head result (if applicable for 2-way ties)
3. **Level 2**: Net Point Difference (higher is better)
4. **Level 3**: Total Points Scored (higher is better)

### Placeholder Detection

The endpoint recognizes these placeholder patterns:
- `Winner Group A`, `Winner Grp A`, `Winner Gr A`
- `Runner Group A`, `Runner Grp A`, `Runner Gr A`
- `Rank 1 Gr A`, `Rank 2 Gr B`, etc.
- `Rank 1 Team`, `Rank 2 Team`, etc.
- `Top Team 1`, `Top Team 2`, etc.
- `Winner SF 1`, `Winner SF 2`, etc.

### Match Stage Detection

Semi-Finals are detected by:
- Stage contains "semi" (case-insensitive)
- Stage contains "SF"

Finals are detected by:
- Stage contains "final" (case-insensitive)
- Stage does NOT contain "semi"

## Usage Examples

### JavaScript/TypeScript

```javascript
// Fetch advancement info for a match
const response = await fetch(`/api/matches/${matchId}/advancement-info`);
const data = await response.json();

if (data.hasAdvancement) {
  console.log(`Match: ${data.matchStage} - ${data.category}`);
  console.log(`Player 1: ${data.player1.name}`);
  console.log(`Advancement: ${data.player1.advancementDetails.description}`);
}
```

### cURL

```bash
curl -X GET http://localhost:3001/api/matches/sf-mens-singles-1/advancement-info
```

## Integration Notes

### Frontend Integration

The AdvancementInfoModal component uses this endpoint:

```jsx
const fetchAdvancementInfo = async () => {
  const response = await fetch(`/api/matches/${match.id}/advancement-info`);
  const data = await response.json();
  setAdvancementData(data);
};
```

### Performance Considerations

- Endpoint calculates standings on-demand
- Uses existing `calculateStandings()` function from `standings.js`
- Relatively lightweight for typical tournament sizes
- Consider caching if needed for very large tournaments

### Error Handling

The endpoint handles these scenarios gracefully:
- Match not found → Returns 404
- Non-playoff match → Returns `hasAdvancement: false`
- Placeholder players → Returns advancement details with type "unknown"
- Missing standings data → Returns null or empty arrays

## Dependencies

### Required Modules
- `standings.js` - For `calculateStandings()` and `sortPlayers()`
- `db.js` - For `readData()`

### Database Requirements
- Tournament data with matches
- Match objects with: id, stage, category, player1, player2, status, score, winner

## Security

- **Authentication**: None required (public information)
- **Authorization**: Available to all users (viewers, admins, super admins)
- **Data Privacy**: Only shows tournament standings and results
- **Rate Limiting**: Consider adding if needed

## Future Enhancements

Potential improvements:
1. Add caching layer for frequently accessed matches
2. Include match history for advanced players
3. Add detailed head-to-head statistics
4. Support for export formats (PDF, JSON)
5. Add analytics (most competitive groups, closest matches, etc.)
