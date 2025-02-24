import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';
import { isNotionClientError } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID;

export async function GET() {
  try {
    // Log environment variables (without revealing full API key)
    const apiKeyExists = !!process.env.NOTION_API_KEY;
    const apiKeyPrefix = process.env.NOTION_API_KEY?.substring(0, 8);
    console.log('API Route - Environment variables:', {
      apiKeyExists,
      apiKeyPrefix,
      databaseId,
      nodeEnv: process.env.NODE_ENV,
    });

    if (!process.env.NOTION_API_KEY) {
      throw new Error('Notion API key not found in environment variables');
    }

    if (!databaseId) {
      throw new Error('Notion database ID not found in environment variables');
    }

    console.log('API Route - Attempting to query Notion database...');
    
    try {
      // First, try to retrieve the database metadata to verify access
      const dbResponse = await notion.databases.retrieve({
        database_id: databaseId,
      });
      
      console.log('API Route - Successfully connected to database:', {
        id: dbResponse.id,
        object: dbResponse.object,
      });
    } catch (dbError) {
      console.error('API Route - Failed to retrieve database metadata:', dbError);
      if (isNotionClientError(dbError)) {
        console.error('API Route - Notion API Error:', {
          code: dbError.code,
          message: dbError.message,
        });
        throw new Error(`Not authorized to access this database. Error: ${dbError.message}`);
      }
      throw dbError;
    }

    // Now query the database contents
    const response = await notion.databases.query({
      database_id: databaseId,
    });

    console.log('API Route - Notion query response:', {
      resultCount: response.results.length,
      hasMore: response.has_more,
      firstPageId: response.results[0]?.id,
    });

    const books = response.results.map((page: any) => {
      const properties = page.properties;
      const coverProperty = properties.Cover;
      
      // Handle different types of cover images
      let coverImage = '';
      if (coverProperty) {
        if (coverProperty.type === 'files' && coverProperty.files.length > 0) {
          const file = coverProperty.files[0];
          coverImage = file.type === 'external' ? file.external.url : file.file.url;
        } else if (coverProperty.type === 'url') {
          coverImage = coverProperty.url;
        }
      }
      
      if (!coverImage && page.cover) {
        coverImage = page.cover.type === 'external' 
          ? page.cover.external.url 
          : page.cover.file.url;
      }

      // Log the raw properties for debugging
      console.log('API Route - Processing page:', {
        id: page.id,
        properties: Object.keys(properties),
        propertyTypes: Object.fromEntries(
          Object.entries(properties).map(([key, value]) => [key, (value as any).type])
        ),
        coverType: coverProperty?.type,
        hasPageCover: !!page.cover,
      });

      const book = {
        id: page.id,
        title: properties.Title?.title[0]?.plain_text || 'Untitled',
        author: properties.Author?.rich_text[0]?.plain_text || 'Unknown Author',
        genre: properties.Genre?.select?.name || 'Uncategorized',
        coverImage,
        rating: properties.Rating?.number || 0,
        review: properties.Review?.rich_text[0]?.plain_text || '',
        status: properties.Status?.select?.name || 'No Status',
        dateStarted: properties['Date Started']?.date?.start || null,
        dateFinished: properties['Date Finished']?.date?.start || null,
      };

      return book;
    });

    console.log('API Route - Processed books:', {
      count: books.length,
      sampleTitles: books.slice(0, 2).map(b => b.title),
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error('API Route - Error:', error);
    
    // Provide more detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorResponse = {
      error: errorMessage,
      details: {
        hasApiKey: !!process.env.NOTION_API_KEY,
        hasDatabaseId: !!databaseId,
        apiKeyPrefix: process.env.NOTION_API_KEY?.substring(0, 8),
        timestamp: new Date().toISOString(),
        errorCode: isNotionClientError(error) ? error.code : undefined,
      }
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
} 