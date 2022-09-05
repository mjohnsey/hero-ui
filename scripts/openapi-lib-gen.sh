#! /bin/bash

set -euo pipefail

this_dir_location="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
repo_root="$(dirname "$this_dir_location")"

url="http://localhost:8000/openapi.json"
local_file="${repo_root}/src/lib/api/openapi.json"

curl -s $url >$local_file

docker run --rm -it -v "${repo_root}":/code -v $local_file:$local_file -w /code openapitools/openapi-generator-cli generate \
    -i $local_file \
    -g typescript-axios \
    -o /code/src/lib/api

# yarn run prettier ./src/lib/api/ --write
