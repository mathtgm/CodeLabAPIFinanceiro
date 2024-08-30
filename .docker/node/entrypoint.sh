#!/bin/bash
echo "Container em execução"
# tail -f /dev/null
#rm -rf node_modules
mkdir -p tmp/export
npm install --legacy-peer-deps
npm run start:dev