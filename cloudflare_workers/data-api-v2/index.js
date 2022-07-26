/**
 * Example someHost is set up to take in a JSON request
 * Replace url with the host you wish to send requests to
 * @param {string} someHost the host to send the request to
 * @param {string} url the URL to send the request to
 */
 const apiEndpoint = 'https://dapi.couchbase.live:29292/v1';
 let apiUrl = apiEndpoint;
 //const url = apiEndpoint + '/scopes/sample/collections/airline/docs';
 
 /**
  * gatherResponse awaits and returns a response body as a string.
  * Use await gatherResponse(..) in an async function to get the response body
  * @param {Response} response
  */
 async function gatherResponse(response) {
   const { headers } = response;
   const contentType = headers.get('content-type') || '';
   if (contentType.includes('application/json')) {
      //return JSON.stringify(await response.json());
      text = await response.text();
      //console.log(text);
      let documents = JSON.parse(text);
      documents = documents['docs'];
      //console.log(documents);
      let results = '<table border="true"><tr><th>#</th>';
        
      if (documents.length > 0) {
        let keys = Object.keys(documents[0]);
        for (let i = 0; i < keys.length; i++) {
            results += '<th>'+ keys[i] +'</th>';
        }
        results += '</tr>';
        for (d = 1; d <= documents.length; d++) {
          results += '<tr><td>'+ d +'</td>';
          for (let i = 0; i < keys.length; i++) {
            val = documents[d-1][keys[i]];
            if (val == null || val == undefined) {
              val = '';
            } else {
              val = JSON.stringify(val);
            }
            results += '<td>'+val+'</td>';
          }
          results += '</tr>';
        }
      } else {
        results += '<td>No documents found</td><td>Check '+
              ', scope=, collection= query parameters</td></tr>';
      }
      results += '</table>';
      return results;
      
   } else if (contentType.includes('application/text')) {
     return response.text();
   } else if (contentType.includes('text/html')) {
     return response.text();
   } else {
     console.log('Unknown content-type: ' + contentType);
     return response.text();
     
   }
 }
 
 async function handleRequest(request) {
   const { searchParams } = new URL(request.url);
  
   apiUrl = searchParams.get('apiurl') || apiEndpoint;
   scope = searchParams.get('scope') || searchParams.get('tenant') || 'inventory';
   collection = searchParams.get('collection') || searchParams.get('table') || 'airline';
   access_key = searchParams.get('access') || searchParams.get('public') || 'username1';
   secret_key = searchParams.get('secret') || searchParams.get('private') || 'Password1!';

   url = apiUrl +'/scopes/'+scope+'/collections/'+collection+'/docs';
    queryParams = '?';
 
    for (let p of searchParams.keys()) {
      queryParams += p +'=' + searchParams.get(p)+'&';
    }
    let url2 = url + queryParams;
    
    query = searchParams.get('query');
    if (query != null && query != '') {
      querydata = {"query": query};
    }

    
    console.log("final url="+url2);
    console.log("access="+access_key);
    const init = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic '+btoa(access_key+':'+secret_key),
      },
      //body: JSON.stringify(querydata),
    };
    
   const response = await fetch(url2, init);
   const results = await gatherResponse(response);
   //return new Response(results, init);

   let html_content = '';
    let html_style = 'body{padding:1em; font-family: sans-serif;} h1{color:#f6821f;}';

    html_content += '<p> '+ results+'</p>';

    let html = `<!DOCTYPE html>
  <head>
    <title> Couchbase: ${scope}.${collection} </title>
    <style> ${html_style} </style>
  </head>
  <body>
    <h1>Couchbase live data</h1>
    <h2>Connection:</h2>
    <li>Couchbase Data API endpoint: <i><a href="${apiUrl}/spec">${apiUrl}</a></i>
    <li>Access: <i>${access_key}</i>
    <li>Group/scope: <i>${scope}</i>
    <li>Table/collection: <i>${collection}</i>
    <h2>Change the scope/collection with below URL parameters</h2>
    <li>scope=<i>scope</i> or <i>Ex:sample</i>
    <li>collection=<i>collection</i> or <i>Ex:airline</i>
    <li>access=<i>access_key</i> or <i>username</i>
    <li>secret=<i>secret_key</i> or <i>password</i>

    ${html_content}
  </body>`;

    return new Response(html, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      },
    });

 }
 
 addEventListener('fetch', event => {
   return event.respondWith(handleRequest(event.request));
 });