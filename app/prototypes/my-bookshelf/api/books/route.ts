import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';
import { isNotionClientError } from '@notionhq/client';

interface NotionPage {
  cover?: {
    type: 'external' | 'file';
    external?: { url: string };
    file?: { url: string };
  };
  icon?: {
    type: 'external' | 'file';
    external?: { url: string };
    file?: { url: string };
  };
}

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
      sorts: [
        {
          property: 'Title',
          direction: 'ascending',
        },
      ],
    });

    console.log('API Route - Found', response.results.length, 'books');

    const books = await Promise.all(response.results.map(async (page: any) => {
      const properties = page.properties;
      
      // Log raw property data for debugging
      console.log('Raw properties for book:', properties.Title?.title[0]?.plain_text, {
        availableProperties: Object.keys(properties),
        coverImageProperty: properties['Cover Image'],
        coverImageType: properties['Cover Image']?.type,
        coverImageFiles: properties['Cover Image']?.files,
      });

      // Enhanced cover image handling
      let coverImage = '';

      // Try Cover Image property (files)
      if (properties['Cover Image']?.type === 'files' && Array.isArray(properties['Cover Image'].files)) {
        const files = properties['Cover Image'].files;
        console.log('Files array:', files);
        
        if (files.length > 0) {
          const file = files[0];
          console.log('First file:', file);
          
          if (file.type === 'external') {
            coverImage = file.external.url;
          } else if (file.type === 'file') {
            coverImage = file.file.url;
          }
        }
      }

      // Try Cover Image property (URL)
      if (!coverImage && properties['Cover Image']?.type === 'url') {
        coverImage = properties['Cover Image'].url;
      }

      // Get the full page to try page cover
      if (!coverImage) {
        const fullPage = await notion.pages.retrieve({ page_id: page.id }) as unknown as NotionPage;
        console.log('Full page data for cover:', {
          hasPageCover: !!fullPage.cover,
          coverType: fullPage.cover?.type,
          pageIcon: fullPage.icon,
        });

        if (fullPage.cover) {
          coverImage = fullPage.cover.type === 'external' && fullPage.cover.external
            ? fullPage.cover.external.url 
            : fullPage.cover.file?.url || '';
        }
      }

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

      console.log('Processed book:', {
        title: book.title,
        hasCover: !!coverImage,
        coverUrl: coverImage,
      });

      return book;
    }));

    console.log('API Route - Processed books:', {
      count: books.length,
      booksWithCovers: books.filter(b => b.coverImage).length,
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error('API Route - Error:', error);
    
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