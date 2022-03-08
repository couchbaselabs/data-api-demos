/**
 * Example someHost is set up to take in a JSON request
 * Replace url with the host you wish to send requests to
 * @param {string} someHost the host to send the request to
 * @param {string} url the URL to send the request to
 */
 const someHost = 'https://api.couchbase.live/v0.1-alpha/api';
 const url = someHost + '/buckets/travel-sample/scopes/_default/collections/_default/docs';
 
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
      //console.log(documents);
      let keys = Object.keys(documents[0]);
      let results = '<table border="true"><tr><th>#</th>';
      for (let i = 0; i < keys.length; i++) {
          results += '<th>'+ keys[i] +'</th>';
      }
      results += '</tr>';
      for (d = 1; d <= documents.length; d++) {
        results += '<tr><td>'+ d +'</td>';
        for (let i = 0; i < keys.length; i++) {
          results += '<td>'+documents[d-1][keys[i]]+'</td>';
        }
        results += '</tr>';
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
    queryParams = '?';
    let token = searchParams.get('token');
    if (token != null && token != '') {
      token = token.replaceAll(' ', '+');
    } else {
      token = 'CTEH1_a39ec8fd216d75ee40c05989c6b1d946149414398517ef1206c8046bc7a4a715_B6eyhenCiAd0cKCKfLsXifiiPbifviVCyS+CHdTm2tYfuhE6DDVtwsFj2wgR9AowKHcRmJYN7ghQcPyRuvPBPA13Q4Moz/zWqfYDcW4HI0DClL4Ddk73iCvXuWG9TSaG4sCoFc88XEPZ6uXgKRc8RBLx0ObTtuAy98OcxJnH9IgzGFvXIT3KkbLmk+z9RXK8fcBgT5Nwjwj2UcGV03U2whThFKhhkEERrZJz4pDVeCqD8MEfMQLqAlIxqBnsbK/DS95U2pKKu2ghgic=';
    }
    for (let p of searchParams.keys()) {
      queryParams += p +'=' + searchParams.get(p)+'&';
    }
    let url2 = url + queryParams;
    console.log("final url="+url2);
    query = searchParams.get('query');
    if (query != null && query != '') {
      querydata = {"query": query};
    }

    bucket = searchParams.get('bucket') || searchParams.get('database') ||  searchParams.get('data');
    if (bucket != null && bucket != '') {
      url2 = url2.replaceAll('travel-sample', bucket);
    }
    const init = {
      headers: {
        'Content-Type': 'application/json',
        'X-CB-Cluster-Token': token,
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
    <title> Couchbase: travel-sample </title>
    <style> ${html_style} </style>
  </head>
  <body>
    <h1>Couchbase: travel data</h1>
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