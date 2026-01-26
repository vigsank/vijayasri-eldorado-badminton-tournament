import json
import re

raw_schedule = """Day	Time	Court	Category	Stage	Player 1	Player 2	Format
Saturday	4:00 PM	Court 5	Kids Singles Boy	Gr A (1-2)	Bhaivab Mukherjee	K Anish Reddy	11 Points
Saturday	4:00 PM	Court 6	Kids Singles Boy	Gr B (1-2)	Trijal Shetty	Rana	11 Points
Saturday	4:15 PM	Court 5	Kids Singles Boy	Gr C (1-2)	Dakshith Minod	Parth	11 Points
Saturday	4:15 PM	Court 6	Kids Singles Boy	Gr D (1-2)	Harshith. S	Mudit	11 Points
Saturday	4:30 PM	Court 5	Kids Singles Boy	Gr A (3-4)	Vedansh Tejas	Swayam	11 Points
Saturday	4:30 PM	Court 6	Kids Singles Boy	Gr B (3-4)	Roel C Bino	Neerav	11 Points
Saturday	4:45 PM	Court 5	Kids Singles Boy	Gr C (3-4)	Shaurya Upadhyay	Shreyansh	11 Points
Saturday	4:45 PM	Court 6	Kids Singles Boy	Gr D (2-3)	Mudit	Naksh Purohit	11 Points
Saturday	5:00 PM	Court 5	Kids Singles Boy	Gr A (2-3)	K Anish Reddy	Vedansh Tejas	11 Points
Saturday	5:00 PM	Court 6	Kids Singles Boy	Gr B (2-3)	Rana	Roel C Bino	11 Points
Saturday	5:15 PM	Court 5	Kids Singles Boy	Gr C (2-3)	Parth	Shaurya Upadhyay	11 Points
Saturday	5:15 PM	Court 6	Kids Singles Boy	Gr D (3-1)	Naksh Purohit	Harshith. S	11 Points
Saturday	5:30 PM	Court 5	Kids Singles Boy	Gr A (4-1)	Swayam	Bhaivab Mukherjee	11 Points
Saturday	5:30 PM	Court 6	Kids Singles Boy	Gr B (4-1)	Neerav	Trijal Shetty	11 Points
Saturday	5:45 PM	Court 5	Kids Singles Boy	Gr C (4-1)	Shreyansh	Dakshith Minod	11 Points
Saturday	7:30 PM	Court 5	Kids Singles Boy	Semi 1	Winner Gr A	Winner Gr B	15 Points
Saturday	7:30 PM	Court 6	Kids Singles Boy	Semi 2	Winner Gr C	Winner Gr D	15 Points
Saturday	8:00 PM	Court 5	Kids Singles Boy	Final	Winner SF 1	Winner SF 2	3 Sets (13 Pts)
Saturday	4:00 PM	Court 7	Kids Singles Girl	Gr A (1-2)	Ananya Singh	Aadhya Srivastava	11 Points
Saturday	4:15 PM	Court 7	Kids Singles Girl	Gr B (1-2)	Divyanshi Sahu	Aashi Jha	11 Points
Saturday	4:30 PM	Court 7	Kids Singles Girl	Gr A (3-4)	Harsha Sethia	K Aadhya	11 Points
Saturday	4:45 PM	Court 7	Kids Singles Girl	Gr B (3-4)	Shanvi singh	Khushi S	11 Points
Saturday	5:00 PM	Court 7	Kids Singles Girl	Gr A (5-1)	Tanusha Hegde	Ananya Singh	11 Points
Saturday	5:15 PM	Court 7	Kids Singles Girl	Gr B (5-1)	Aradhya Seal	Divyanshi Sahu	11 Points
Saturday	5:30 PM	Court 7	Kids Singles Girl	Gr A (2-3)	Aadhya Srivastava	Harsha Sethia	11 Points
Saturday	5:45 PM	Court 7	Kids Singles Girl	Gr B (2-3)	Aashi Jha	Shanvi singh	11 Points
Saturday	6:00 PM	Court 7	Kids Singles Girl	Gr A (4-5)	K Aadhya	Tanusha Hegde	11 Points
Saturday	6:15 PM	Court 7	Kids Singles Girl	Gr B (4-5)	Khushi S	Aradhya Seal	11 Points
Saturday	7:30 PM	Court 7	Kids Singles Girl	Semi 1	Rank 1 Gr A	Rank 2 Gr B	15 Points
Saturday	7:45 PM	Court 6	Kids Singles Girl	Semi 2	Rank 1 Gr B	Rank 2 Gr A	15 Points
Saturday	8:00 PM	Court 6	Kids Singles Girl	Final	Winner SF 1	Winner SF 2	3 Sets (13 Pts)
Sunday	10:00 AM	Court 6	Mens Doubles	Pool (1-2)	Hari/Vinod	Subir/Nikhil	21 Points
Sunday	10:20 AM	Court 6	Mens Doubles	Pool (3-4)	Vignesh/Hari S	Prabhu/Anand	21 Points
Sunday	10:40 AM	Court 6	Mens Doubles	Pool (4-1)	Prabhu/Anand	Hari/Vinod	21 Points
Sunday	11:00 AM	Court 6	Mens Doubles	Pool (2-3)	Subir/Nikhil	Vignesh/Hari S	21 Points
Sunday	12:20 PM	Court 7	Mens Doubles	Final	Rank 1 Team	Rank 2 Team	3 Sets (21 Pts)
Saturday	5:45 PM	Court 6	Mens Singles	Gr A (1-2)	Prabhu Prasad	Venkat Gumma	15 Points
Saturday	6:00 PM	Court 5	Mens Singles	Gr B (1-2)	Hariharaputhran	Anand	15 Points
Saturday	6:00 PM	Court 6	Mens Singles	Gr A (3-4)	Vignesh	Hari Sulgekar	15 Points
Saturday	6:15 PM	Court 5	Mens Singles	Gr B (3-4)	Subir	Vinod Krishnan	15 Points
Saturday	6:15 PM	Court 6	Mens Singles	Gr A (4-1)	Hari Sulgekar	Prabhu Prasad	15 Points
Saturday	6:30 PM	Court 5	Mens Singles	Gr B (5-1)	Nikhil GS	Hariharaputhran	15 Points
Saturday	6:30 PM	Court 6	Mens Singles	Gr A (2-3)	Venkat Gumma	Vignesh	15 Points
Saturday	6:45 PM	Court 5	Mens Singles	Gr B (2-3)	Anand	Subir	15 Points
Saturday	7:00 PM	Court 5	Mens Singles	Gr B (4-5)	Vinod Krishnan	Nikhil GS	15 Points
Saturday	7:45 PM	Court 5	Mens Singles	Semi 1	Rank 1 Gr A	Rank 2 Gr B	15 Points
Saturday	7:45 PM	Court 7	Mens Singles	Semi 2	Rank 1 Gr B	Rank 2 Gr A	15 Points
Sunday	11:40 AM	Court 5	Mens Singles	Final	Winner SF 1	Winner SF 2	3 Sets (15 Pts)
Sunday	11:00 AM	Court 7	Mixed Doubles	Gr A (1-2)	Hari/Ramya	Divya Singh/Vignesh	15 Points
Sunday	11:20 AM	Court 6	Mixed Doubles	Gr B (1-2)	Nikhil/Sinooba	Subir/Divya R	15 Points
Sunday	11:20 AM	Court 7	Mixed Doubles	Gr A (2-3)	Divya Singh/Vignesh	Vinod/Cini	15 Points
Sunday	11:40 AM	Court 6	Mixed Doubles	Gr B (2-3)	Subir/Divya R	Nandita/Anand	15 Points
Sunday	11:40 AM	Court 7	Mixed Doubles	Gr A (3-4)	Vinod/Cini	Prabhu/Sonali	15 Points
Sunday	12:00 PM	Court 6	Mixed Doubles	Gr B (3-1)	Nandita/Anand	Nikhil/Sinooba	15 Points
Sunday	12:00 PM	Court 7	Mixed Doubles	Gr A (4-1)	Prabhu/Sonali	Hari/Ramya	15 Points
Sunday	12:20 PM	Court 6	Mixed Doubles	Final	Rank 1 Team	Rank 2 Team	3 Sets (15 Pts)
Sunday	10:00 AM	Court 7	Womens Doubles	Pool (1-2)	Ramya/Sonali	Divya Singh/Sinooba MK	11 Points
Sunday	10:20 AM	Court 7	Womens Doubles	Pool (2-3)	Divya Singh/Sinooba MK	Divya R/Cini	11 Points
Sunday	10:40 AM	Court 7	Womens Doubles	Pool (3-1)	Divya R/Cini	Ramya/Sonali	11 Points
Sunday	12:20 PM	Court 5	Womens Doubles	Final	Rank 1 Team	Rank 2 Team	3 Sets (15 Pts)
Saturday	6:30 PM	Court 7	Womens Singles	Gr A (1-2)	Divya Singh	Ramya	11 Points
Saturday	6:45 PM	Court 6	Womens Singles	Gr B (1-2)	Nandita	Sonali	11 Points
Saturday	6:45 PM	Court 7	Womens Singles	Gr A (2-3)	Ramya	Sinooba MK	11 Points
Saturday	7:00 PM	Court 6	Womens Singles	Gr B (2-3)	Sonali	Cini Minod	11 Points
Saturday	7:00 PM	Court 7	Womens Singles	Gr A (3-1)	Sinooba MK	Divya Singh	11 Points
Saturday	7:15 PM	Court 7	Womens Singles	Gr B (3-1)	Cini Minod	Nandita	11 Points
Saturday	8:15 PM	Court 5	Womens Singles	Semi 1	Rank 1 Gr A	Rank 2 Gr B	15 Points
Saturday	8:15 PM	Court 6	Womens Singles	Semi 2	Rank 1 Gr B	Rank 2 Gr A	15 Points
Sunday	12:00 PM	Court 5	Womens Singles	Final	Winner SF 1	Winner SF 2	3 Sets (15 Pts)"""

def parse_schedule(data):
    lines = data.strip().split('\n')
    header = lines[0].split('\t')
    matches = []
    players = set()
    
    for i, line in enumerate(lines[1:]):
        parts = line.split('\t')
        if len(parts) < 7: continue
        
        day, time, court, category, stage, p1, p2 = parts[0:7]
        
        # Add to players set if it's not a placeholder
        if "Winner" not in p1 and "Rank" not in p1:
            players.add(p1)
        if "Winner" not in p2 and "Rank" not in p2:
            players.add(p2)
            
        matches.append({
            "id": str(i + 1),
            "day": day,
            "date": "2026-01-31" if day == "Saturday" else "2026-02-01",
            "time": time,
            "court": court,
            "category": category,
            "stage": stage,
            "player1": p1,
            "player2": p2,
            "score": {"p1": 0, "p2": 0},
            "status": "SCHEDULED",
            "winner": None
        })
    
    player_list = [{"id": str(i+1), "name": name, "phone": None} for i, name in enumerate(sorted(list(players)))]
    category_list = sorted(list(set(m['category'] for m in matches)))
    court_list = sorted(list(set(m['court'] for m in matches)))
    
    return player_list, matches, category_list, court_list

players, matches, categories, courts = parse_schedule(raw_schedule)

tournament_data = {
    "players": players,
    "matches": matches,
    "categories": categories,
    "courts": courts
}

with open('/Users/i312327/SAPDevelop/vijayasri-badminton-manager/server/data/tournament.json', 'w') as f:
    json.dump(tournament_data, f, indent=2)

print(f"Updated tournament.json with {len(players)} players, {len(matches)} matches, and {len(categories)} categories.")
