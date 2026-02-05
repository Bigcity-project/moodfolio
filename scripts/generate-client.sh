#!/bin/bash
# Generate TypeScript types from OpenAPI spec

set -e

cd "$(dirname "$0")/.."

echo "Generating TypeScript types from OpenAPI spec..."

npx openapi-typescript contracts/openapi.yaml -o frontend/src/types/api-types.ts

echo "Done! Types generated at frontend/src/types/api-types.ts"
