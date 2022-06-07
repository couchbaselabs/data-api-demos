/**
 * Example someHost is set up to take in a JSON request
 * Replace url with the host you wish to send requests to
 * @param {string} someHost the host to send the request to
 * @param {string} url the URL to send the request to
 */
 const apiHost = 'https://dapi.couchbase.live';
 const apiVersion = '/v1';
 //const url = apiHost + apiVersion+ '/scopes/_default/collections/_default/docs';
 
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
        results += '<td>No documents found</td><td>Check bucket='+
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
   bucket = searchParams.get('bucketName') || searchParams.get('bucket') || searchParams.get('database') ||  searchParams.get('data') || 'travel-sample';
   scope = searchParams.get('scope') || searchParams.get('tenant') || '_default';
   collection = searchParams.get('collection') || searchParams.get('table') || '_default';

   connect_string = searchParams.get('connect') || 'couchbase://localhost';
   if (!connect_string.includes('couchbase://') && !connect_string.includes('couchbases://')) {
     connect_string = 'couchbases://' + connect_string;
   }
   access_key = searchParams.get('access') || 'Administrator';
   secret_key = searchParams.get('secret') || 'password';

   url = apiHost + apiVersion +'/scopes/'+scope+'/collections/'+collection+'/docs';
    queryParams = '?';
    let token = searchParams.get('token');
    /*if (token != null && token != '') {
      token = token.replaceAll(' ', '+');
    } else {
      token = 'CTEH1_a39ec8fd216d75ee40c05989c6b1d946149414398517ef1206c8046bc7a4a715_B6eyhenCiAd0cKCKfLsXifiiPbifviVCyS+CHdTm2tYfuhE6DDVtwsFj2wgR9AowKHcRmJYN7ghQcPyRuvPBPA13Q4Moz/zWqfYDcW4HI0DClL4Ddk73iCvXuWG9TSaG4sCoFc88XEPZ6uXgKRc8RBLx0ObTtuAy98OcxJnH9IgzGFvXIT3KkbLmk+z9RXK8fcBgT5Nwjwj2UcGV03U2whThFKhhkEERrZJz4pDVeCqD8MEfMQLqAlIxqBnsbK/DS95U2pKKu2ghgic=';
    }*/
    for (let p of searchParams.keys()) {
      queryParams += p +'=' + searchParams.get(p)+'&';
    }
    let url2 = url + queryParams;
    
    query = searchParams.get('query');
    if (query != null && query != '') {
      querydata = {"query": query};
    }

    
    console.log("final url="+url2);
    
    const init = {
      headers: {
        'Content-Type': 'application/json',
        'X-CB-DAPI-CONNECT-STRING': connect_string,
        'X-CB-DAPI-ACCESS-KEY': access_key,
        'X-CB-DAPI-SECRET-KEY': secret_key,
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
    <title> Couchbase: ${bucket}.${scope}.${collection} </title>
    <style> ${html_style} </style>
  </head>
  <body>
    <h1>Couchbase live data</h1>
    <h2>Connection:</h2>
    <li>Couchbase Data API host: <i><a href="${apiHost}/${apiVersion}/spec">${apiHost}</a></i>
    <li>Couchbase DB Server: <i>${connect_string}</i>
    <li>DB/bucket name: <i>${bucket}</i>
    <li>Group/scope: <i>${scope}</i>
    <li>Table/collection: <i>${collection}</i>
    <h2>Change the server/bucket with below URL parameters</h2>
    <li>bucketName=<i>bucketName</i>
    <li>connect=<i>hostname</i> or <i>couchbases://hostname</i>
    <li>access=<i>access_key</i> or <i>username</i>
    <li>secret=<i>secret_key</i> or <i>password</i>

    <br><br>NOTE: Add cidr: <i>18.144.18.150/32</i> to allow access to the Capella cluster.
    
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