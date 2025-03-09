import { NextResponse } from 'next/server';

// Access the same in-memory storage used in other routes
// In a production app, this would be a database
const games = new Map();

export async function GET(request, { params }) {
  // Correctly await params in Next.js app router
  const id = params?.id;
  
  if (!id) {
    return NextResponse.json(
      { error: 'Game ID is required' },
      { status: 400 }
    );
  }
  
  const game = games.get(id);
  
  if (!game) {
    return NextResponse.json(
      { error: 'Game not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(game);
}