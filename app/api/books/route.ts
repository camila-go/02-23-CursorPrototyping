import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID;

export async function GET() {
  try {
    if (!databaseId) {
      throw new Error('Notion database ID not found');
    }

    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: 'Name',
          direction: 'ascending',
        },
      ],
    });

    const books = response.results.map((page: any) => {
      const properties = page.properties;
      const coverProperty = properties.Cover;
      
      // Handle different types of cover images
      let coverImage = '';
      if (coverProperty) {
        if (coverProperty.type === 'files' && coverProperty.files.length > 0) {
          const file = coverProperty.files[0];
          // Handle both Notion-hosted and external URLs
          coverImage = file.type === 'external' ? file.external.url : file.file.url;
        } else if (coverProperty.type === 'url') {
          coverImage = coverProperty.url;
        }
      }
      
      // Fallback to page cover if no Cover property is set
      if (!coverImage && page.cover) {
        coverImage = page.cover.type === 'external' 
          ? page.cover.external.url 
          : page.cover.file.url;
      }

      return {
        id: page.id,
        title: properties.Name?.title[0]?.plain_text || 'Untitled',
        author: properties.Author?.rich_text[0]?.plain_text || 'Unknown Author',
        genre: properties.Genre?.select?.name || 'Uncategorized',
        coverImage,
        rating: properties.Rating?.number || 0,
        review: properties.Review?.rich_text[0]?.plain_text || '',
        status: properties.Status?.select?.name || 'No Status',
        dateStarted: properties['Date Started']?.date?.start || null,
        dateFinished: properties['Date Finished']?.date?.start || null,
      };
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books from Notion' },
      { status: 500 }
    );
  }
} 