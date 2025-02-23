# My Bookshelf - Notion-powered Reading Tracker

A Next.js application that displays your reading list from a Notion database.

## Setup

1. Create a Notion integration at https://www.notion.so/my-integrations
2. Create a Notion database for your books with the following properties:
   - Title (text)
   - Author (text)
   - Genre (select)
   - Cover (files & media)
   - Rating (number)
   - Review (text)
   - Status (select: "reading", "completed", "want to read")
   - Date Started (date)
   - Date Finished (date)

3. Share your database with the integration
4. Copy the database ID from the URL
5. Create a `.env.local` file with:
   ```
   NOTION_API_KEY=your_api_key_here
   NOTION_DATABASE_ID=your_database_id_here
   ```

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000/prototypes/my-bookshelf](http://localhost:3000/prototypes/my-bookshelf) to view your bookshelf.