async function test() {
   const res = await fetch('https://www.cutad.web.id/api/public/netshort?action=stream&id=1894650204046979076&key=cutad_98e7ba3c88fdfe5526740ed69f59fc71267f4a69');
   const text = await res.text();
   console.log("TEST 1", text);
   
   const res2 = await fetch('https://www.cutad.web.id/api/public/netshort?action=stream&id=1894650198162370561::1894650204046979076&key=cutad_98e7ba3c88fdfe5526740ed69f59fc71267f4a69');
   const text2 = await res2.text();
   console.log("TEST 2", text2);
}
test();
