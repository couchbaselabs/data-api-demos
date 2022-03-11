curl https://shiyan.stepzen.net/api/graphql-couchbase-live/__graphql \
   --header "Authorization: Apikey shiyan::stepzen.net+1000::536307ca7a968a269065e67f65da9850a2b1362071a74daf5aeeff184f621b5c" \
   --header "Content-Type: application/json" \
   --data '{"query": "{ getAllTravelDocuments { name type} }"}'
