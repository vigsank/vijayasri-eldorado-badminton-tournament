# Advancement Information Feature - Visual Guide

## Feature Location

### Match Card with Info Icon
```
┌─────────────────────────────────────────────────┐
│  Semi-Final 1          [LIVE] [DONE]           │
│  Mens Singles                                   │
│                                                 │
│  Player A                              21      │
│                    VS                           │
│  Player B                              19      │
│                                                 │
│  📍 Court 1                                     │
│  Day 3 • 2:00 PM                       [ℹ️]    │
└─────────────────────────────────────────────────┘
                                          ↑
                                    Info Icon
                             (Bottom Right Corner)
```

## When Info Icon Appears

✅ **Shows when:**
- Match is a Semi-Final or Final
- Players have been automatically advanced (not placeholders)
- Real player names are filled in

❌ **Doesn't show when:**
- Match is in group/league stage
- Players are still placeholders (e.g., "Winner Group A")
- Match hasn't reached playoff stage

## Modal Content

### Header
```
─────────────────────────────────────────────────
   ℹ️  Advancement Information
   Semi-Final 1 - Mens Singles
─────────────────────────────────────────────────
```

### Information Alert Box
```
┌────────────────────────────────────────────────┐
│ ℹ️  How Players Advanced                       │
│                                                │
│ This match features players who automatically  │
│ advanced based on their performance in         │
│ previous rounds. The advancement follows the   │
│ official tournament rules using a 3-level      │
│ tie-breaker system:                            │
│                                                │
│ 1. Match Wins | 2. Head-to-Head (if applicable)│
│ 3. Point Difference | 4. Total Points Scored   │
└────────────────────────────────────────────────┘
```

### Player 1 Advancement Details
```
┌────────────────────────────────────────────────┐
│ Player 1 Advancement                           │
├────────────────────────────────────────────────┤
│                                                │
│ ✓ Rajesh Kumar                                 │
│ Winner of Group A (Rank 1 based on matches    │
│ won, then point difference, then total points  │
│ scored)                                        │
│                                                │
│ Group A Standings                              │
│ ┌────┬──────────────┬───┬───┬────┬────┬──────┐│
│ │Rank│ Player/Team  │ W │ L │ PF │ PA │ Diff ││
│ ├────┼──────────────┼───┼───┼────┼────┼──────┤│
│ │✓ 1 │ Rajesh Kumar │ 3 │ 0 │ 63 │ 45 │ +18  ││
│ │  2 │ Amit Sharma  │ 2 │ 1 │ 58 │ 52 │ +6   ││
│ │  3 │ Vijay Patel  │ 1 │ 2 │ 50 │ 55 │ -5   ││
│ └────┴──────────────┴───┴───┴────┴────┴──────┘│
└────────────────────────────────────────────────┘
```

### Player 2 Advancement Details
```
┌────────────────────────────────────────────────┐
│ Player 2 Advancement                           │
├────────────────────────────────────────────────┤
│                                                │
│ ✓ Sanjay Reddy                                 │
│ Runner-up of Group B (Rank 2 based on matches │
│ won, then point difference, then total points  │
│ scored)                                        │
│                                                │
│ Group B Standings                              │
│ ┌────┬──────────────┬───┬───┬────┬────┬──────┐│
│ │Rank│ Player/Team  │ W │ L │ PF │ PA │ Diff ││
│ ├────┼──────────────┼───┼───┼────┼────┼──────┤│
│ │  1 │ Karthik Iyer │ 3 │ 0 │ 63 │ 42 │ +21  ││
│ │✓ 2 │ Sanjay Reddy │ 2 │ 1 │ 60 │ 50 │ +10  ││
│ │  3 │ Prakash Nair │ 1 │ 2 │ 48 │ 58 │ -10  ││
│ └────┴──────────────┴───┴───┴────┴────┴──────┘│
└────────────────────────────────────────────────┘
```

### For Finals - Semi-Final Result
```
┌────────────────────────────────────────────────┐
│ Semi-Final Result                              │
├────────────────────────────────────────────────┤
│ Rajesh Kumar                              21   │
│                   VS                           │
│ Amit Sharma                               15   │
│                                                │
│ Winner: Rajesh Kumar defeated Amit Sharma      │
│ (21 - 15)                                      │
└────────────────────────────────────────────────┘
```

### Footer Alert
```
┌────────────────────────────────────────────────┐
│ ⚠️  If you have any questions about the        │
│    advancement calculations or standings,      │
│    please contact the tournament committee.    │
└────────────────────────────────────────────────┘
```

## Advancement Types Explained

### 1. Group Winner
- **Pattern**: "Winner Group A"
- **Shows**: Top player in that group's standings
- **Criteria**: Most match wins → Point diff → Points scored

### 2. Group Runner-up
- **Pattern**: "Runner Group A"
- **Shows**: Second player in that group's standings
- **Criteria**: Same as above

### 3. Group Rank
- **Pattern**: "Rank 2 Gr A"
- **Shows**: Specific rank position in a group
- **Criteria**: Same as above

### 4. Overall Rank
- **Pattern**: "Rank 1 Team" or "Top Team 1"
- **Shows**: Rank across ALL groups in category
- **Criteria**: Matches won → H2H → Point diff → Points scored
- **Used for**: Doubles finals, combined pool rankings

### 5. Semi-Final Winner
- **Pattern**: "Winner SF 1"
- **Shows**: The semi-final match result
- **Criteria**: Match winner
- **Used for**: Finals only

## Color Coding

- **Purple**: Primary theme color, advancement boxes
- **Green**: Winners, positive stats, check marks
- **Red**: Losses, negative stats
- **Cyan**: Group headings
- **Pink**: Semi-final labels
- **Orange**: Warning/info messages
- **Blue**: Information alerts

## Responsive Design

### Desktop
- Full standings table visible
- All columns shown
- Large modal size

### Mobile
- Horizontal scroll for tables
- Compact layout
- Touch-friendly buttons
- Smaller font sizes

## Accessibility

- ✅ Tooltip on hover
- ✅ Keyboard navigation
- ✅ Screen reader friendly
- ✅ High contrast colors
- ✅ Clear labels and descriptions
