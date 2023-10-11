#!/usr/bin/env sh

set -e

npm run build

cd dist

git init
git add -A
git commit -m 'New Deployment'
git push -f git@github.com:Dinie97/rest-countries.git master:gh-pages

cd -