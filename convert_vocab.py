import json
import re

with open('japanese_vocab_vocabulary_only.json.txt', 'r', encoding='utf-8') as f:
    data = json.load(f)

output = {}

# Pattern 1: jp（kanji）〔type〕zh
# Pattern 2: jp〔type〕zh
# Pattern 3: jp zh (conversational phrases)

def parse_entry(text):
    """Parse a single vocabulary entry string into structured format."""
    text = text.strip()
    if not text:
        return None
    
    # Skip separator lines
    if re.match(r'^-{10,}$', text):
        return None
    
    # Try pattern: jp（kanji）〔type〕zh
    m = re.match(r'^(.+?)（(.+?)）\s*〔(.+?)〕\s*(.*)$', text)
    if m:
        return {
            "jp": m.group(1).strip(),
            "kanji": m.group(2).strip(),
            "type": m.group(3).strip(),
            "zh": m.group(4).strip()
        }
    
    # Try pattern: jp〔type〕zh (no kanji)
    m = re.match(r'^(.+?)\s*〔(.+?)〕\s*(.*)$', text)
    if m:
        return {
            "jp": m.group(1).strip(),
            "kanji": "",
            "type": m.group(2).strip(),
            "zh": m.group(3).strip()
        }
    
    # Try pattern: jp（kanji）zh (kanji but no type)
    m = re.match(r'^(.+?)（(.+?)）\s+(.*)$', text)
    if m:
        return {
            "jp": m.group(1).strip(),
            "kanji": m.group(2).strip(),
            "type": "",
            "zh": m.group(3).strip()
        }
    
    # Pattern: just jp zh (conversational phrases, no type marker, no kanji)
    parts = text.split(None, 1)
    if len(parts) == 2:
        return {
            "jp": parts[0].strip(),
            "kanji": "",
            "type": "",
            "zh": parts[1].strip()
        }
    else:
        # Special entries like suffix patterns, just keep as jp
        return {
            "jp": text.strip(),
            "kanji": "",
            "type": "",
            "zh": ""
        }

# Helper to check if a line starts with 〔 - continuation of previous entry
def is_continuation(text):
    return re.match(r'^〔', text.strip())

# Helper to check if a line is just a zh continuation (no markers at all, just text after previous line)
def is_zh_only(text):
    """Check if text looks like just a Chinese translation without any markers."""
    return not re.search(r'[〔（｢｣]', text) and not re.match(r'^-{10,}$', text) and not re.search(r'[ぁ-んァ-ン]', text)

for lesson_key, lesson_val in data.items():
    vocab = lesson_val.get("vocabulary", [])
    result_vocab = []
    
    i = 0
    while i < len(vocab):
        entry = vocab[i].strip()
        
        # Skip separator lines
        if re.match(r'^-{10,}$', entry):
            i += 1
            continue
        
        # Check if this is a continuation of previous entry (starts with 〔)
        if is_continuation(entry):
            # Merge with previous entry
            if result_vocab:
                prev = result_vocab[-1]
                m = re.match(r'^〔(.+?)〕\s*(.*)$', entry)
                if m:
                    prev["type"] = m.group(1).strip()
                    prev["zh"] = m.group(2).strip()
            i += 1
            continue
        
        # Check if next line is a continuation (zh only)
        if i + 1 < len(vocab):
            next_entry = vocab[i + 1].strip()
            next_is_continuation = is_continuation(next_entry)
            next_is_zh = is_zh_only(next_entry)
            
            if next_is_continuation:
                # Parse current as jp（kanji）part, next line has type and zh
                m = re.match(r'^(.+?)（(.+?)）$', entry)
                if m:
                    # Next line has the type and zh
                    cont_match = re.match(r'^〔(.+?)〕\s*(.*)$', next_entry)
                    if cont_match:
                        result_vocab.append({
                            "jp": m.group(1).strip(),
                            "kanji": m.group(2).strip(),
                            "type": cont_match.group(1).strip(),
                            "zh": cont_match.group(2).strip()
                        })
                        i += 2
                        continue
                    result_vocab.append({
                        "jp": m.group(1).strip(),
                        "kanji": m.group(2).strip(),
                        "type": "",
                        "zh": next_entry.strip()
                    })
                    i += 2
                    continue
                
                # If current has no kanji part, try to parse the next line
                i += 1
                continue
            
            if next_is_zh:
                # Current line is jp（kanji）, next line is just zh
                m = re.match(r'^(.+?)（(.+?)）$', entry)
                if m:
                    result_vocab.append({
                        "jp": m.group(1).strip(),
                        "kanji": m.group(2).strip(),
                        "type": "",
                        "zh": next_entry.strip()
                    })
                    i += 2
                    continue
        
        # Try to parse as a normal single-line entry
        parsed = parse_entry(entry)
        if parsed:
            result_vocab.append(parsed)
        else:
            # Keep as-is with empty fields
            result_vocab.append({
                "jp": entry,
                "kanji": "",
                "type": "",
                "zh": ""
            })
        
        i += 1
    
    output[lesson_key] = {"vocabulary": result_vocab}

# Write output
with open('japanese_vocab_structured.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"Done! Processed {len(output)} lessons.")
# Print first few entries of lesson_1 as sample
if "lesson_1" in output:
    print("\nSample from lesson_1:")
    for item in output["lesson_1"]["vocabulary"][:5]:
        print(json.dumps(item, ensure_ascii=False))
