#!/bin/bash -x
curl https://shiyan.stepzen.net/api/sgw-graphql-couchbase-live/__graphql \
   --header "Authorization: Apikey shiyan::stepzen.io+1000::22694efbab7c09fd93378eff8ef7248e08ba0efbb7efbf25ba34791caa1bf9e7" \
   --header "Content-Type: application/json" \
   --header "Stepzen-Debug-Level: 1" \
   --data '{"query": "{ getTravelDocumentById(id:\"airline_10\") { name type} }"}'
