#!/usr/bin/env python3
"""
Extract chat history from Cursor's SQLite database
"""
import sqlite3
import json
import os
from datetime import datetime
from pathlib import Path

def extract_chat_history():
    # Path to Cursor's database
    db_path = os.path.expanduser("~/Library/Application Support/Cursor/User/globalStorage/state.vscdb")
    backup_db_path = os.path.expanduser("~/Library/Application Support/Cursor/User/globalStorage/state.vscdb.backup")
    
    # Output directory
    output_dir = Path("/Users/benbeau/dev/rollio/chat_history_export")
    output_dir.mkdir(exist_ok=True)
    
    # Try main database first, then backup
    db_to_use = db_path if os.path.exists(db_path) else backup_db_path
    
    if not os.path.exists(db_to_use):
        print(f"Database not found at {db_path} or {backup_db_path}")
        return
    
    print(f"Extracting from: {db_to_use}")
    
    conn = sqlite3.connect(db_to_use)
    cursor = conn.cursor()
    
    # Get all bubble IDs (conversations)
    cursor.execute("SELECT key, value FROM cursorDiskKV WHERE key LIKE 'bubbleId:%' ORDER BY key")
    rows = cursor.fetchall()
    
    print(f"Found {len(rows)} conversations")
    
    # Extract and save each conversation
    all_conversations = []
    
    for key, value_json in rows:
        try:
            bubble_id = key.split(':')[-1]
            data = json.loads(value_json)
            
            # Extract useful information
            conversation = {
                'bubbleId': bubble_id,
                'fullKey': key,
                'type': data.get('type'),
                'isAgentic': data.get('isAgentic', False),
                'requestId': data.get('requestId', ''),
                'metadata': {
                    'codebaseContextChunks': len(data.get('codebaseContextChunks', [])),
                    'attachedCodeChunks': len(data.get('attachedCodeChunks', [])),
                    'relevantFiles': len(data.get('relevantFiles', [])),
                    'toolResults': len(data.get('toolResults', [])),
                    'commits': len(data.get('commits', [])),
                    'pullRequests': len(data.get('pullRequests', [])),
                },
                'rawData': data  # Keep full data for reference
            }
            
            all_conversations.append(conversation)
            
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON for {key}: {e}")
            continue
        except Exception as e:
            print(f"Error processing {key}: {e}")
            continue
    
    # Save as JSON
    json_output = output_dir / "all_conversations.json"
    with open(json_output, 'w', encoding='utf-8') as f:
        json.dump(all_conversations, f, indent=2, ensure_ascii=False)
    print(f"Saved full data to: {json_output}")
    
    # Save as readable markdown
    md_output = output_dir / "conversations_summary.md"
    with open(md_output, 'w', encoding='utf-8') as f:
        f.write("# Cursor Chat History Export\n\n")
        f.write(f"Exported on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write(f"Total conversations: {len(all_conversations)}\n\n")
        f.write("---\n\n")
        
        for i, conv in enumerate(all_conversations, 1):
            f.write(f"## Conversation {i}\n\n")
            f.write(f"**Bubble ID:** `{conv['bubbleId']}`\n\n")
            f.write(f"**Type:** {conv['type']}\n\n")
            f.write(f"**Is Agentic:** {conv['isAgentic']}\n\n")
            if conv['requestId']:
                f.write(f"**Request ID:** {conv['requestId']}\n\n")
            
            f.write("**Metadata:**\n")
            for key, value in conv['metadata'].items():
                f.write(f"- {key}: {value}\n")
            f.write("\n")
            
            # Try to extract messages if they exist in the data
            raw_data = conv['rawData']
            if 'messages' in raw_data:
                f.write("**Messages:**\n\n")
                for msg in raw_data['messages']:
                    role = msg.get('role', 'unknown')
                    content = msg.get('content', '')
                    f.write(f"**{role}:**\n{content}\n\n")
            
            f.write("---\n\n")
    
    print(f"Saved summary to: {md_output}")
    
    # Also check for messageRequestContext entries
    cursor.execute("SELECT key, value FROM cursorDiskKV WHERE key LIKE 'messageRequestContext:%'")
    context_rows = cursor.fetchall()
    
    if context_rows:
        print(f"Found {len(context_rows)} message request contexts")
        contexts_output = output_dir / "message_contexts.json"
        contexts_data = []
        
        for key, value_json in context_rows:
            try:
                data = json.loads(value_json)
                contexts_data.append({
                    'key': key,
                    'data': data
                })
            except:
                pass
        
        with open(contexts_output, 'w', encoding='utf-8') as f:
            json.dump(contexts_data, f, indent=2, ensure_ascii=False)
        print(f"Saved message contexts to: {contexts_output}")
    
    conn.close()
    print(f"\nExtraction complete! Files saved to: {output_dir}")

if __name__ == "__main__":
    extract_chat_history()

