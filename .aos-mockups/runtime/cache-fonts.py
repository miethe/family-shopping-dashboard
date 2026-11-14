from pathlib import Path
import re,json,urllib.request
out=Path('.aos-mockups/runtime/fonts');out.mkdir(exist_ok=True)
urls=['https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap']
css=Path('apps/web/app/globals.css').read_text()
urls+=re.findall(r"@import url\('(.*?)'\)",css)
cache={}
for i,url in enumerate(urls):
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
  body=urllib.request.urlopen(req,timeout=20).read().decode()
  if 'Material' in url:
   blocks=re.findall(r'@font-face \{.*?\}',body,re.S)
   body=next(b for b in blocks if 'font-weight: 400;' in b).replace('font-weight: 400;','font-weight: 100 700;')
  for fonturl in dict.fromkeys(re.findall(r'url\((https[^)]+)\)',body)):
   name='font-'+str(len(cache))+'.ttf';(out/name).write_bytes(urllib.request.urlopen(fonturl,timeout=25).read());cache[fonturl]={'path':str(out/name),'contentType':'font/ttf'}
  name='style-'+str(i)+'.css';(out/name).write_text(body);cache[url]={'path':str(out/name),'contentType':'text/css'}
 except Exception as e:print(url,e)
(out/'cache.json').write_text(json.dumps(cache,indent=2));print('Cached',len(cache),'font resources for local fulfillment')
