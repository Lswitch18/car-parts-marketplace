#!/bin/bash
# Deploy Logistix Edge Function to Supabase

echo "Deploying Logistix Admin Edge Function..."

# Check if logged in
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "Error: SUPABASE_ACCESS_TOKEN not set"
    echo ""
    echo "To get your access token:"
    echo "1. Go to https://supabase.com/dashboard/account/tokens"
    echo "2. Create a new token"
    echo "3. Export it: export SUPABASE_ACCESS_TOKEN=your_token_here"
    echo "4. Run this script again"
    exit 1
fi

# Deploy the function
npx supabase functions deploy admin --project-ref clqubcryhbrjlupkgeva

echo ""
echo "Done! Function deployed."