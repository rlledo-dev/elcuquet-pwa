import json,urllib.request,urllib.parse,pathlib,concurrent.futures,datetime,shutil
BASE='https://pruebas-app.elcuquet.net'
OUT=pathlib.Path('dist');OUT.mkdir(exist_ok=True)
def get(path):
 u=BASE+path
 with urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'ElCuquet-PWA/0.1.0'}),timeout=60) as r:return json.load(r)
def pages(path):
 data=[]
 for page in range(1,101):
  rows=get(path+('&' if '?' in path else '?')+f'per_page=100&page={page}')
  data+=rows
  if len(rows)<100:return data
 raise RuntimeError('Pagination limit')
products=pages('/wp-json/wc/store/v1/products')
categories=pages('/wp-json/wc/store/v1/products/categories')
def variants(p):
 if p['type']=='variable':
  p['variantDetails']=[v for v in pages('/wp-json/wc/store/v1/products?type=variation&parent='+str(p['id'])) if v.get('parent')==p['id']]
  attr_map={v['id']:v.get('attributes',[]) for v in p.get('variations',[])}
  for v in p['variantDetails']:
   v['attributes']=attr_map.get(v['id'],v.get('attributes',[]))
 return p
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool: products=list(pool.map(variants,products))
# Only public Store API data; never customers, orders or administrative APIs.
for p in products:
 for q in [p]+p.get('variantDetails',[]):
  for im in q.get('images',[]):
   if urllib.parse.urlparse(im['src']).hostname!='pruebas-app.elcuquet.net':im['src']=''
(OUT/'catalog.json').write_text(json.dumps({'source':BASE,'updatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'products':products,'categories':categories},ensure_ascii=False))
logo=BASE+'/wp-content/uploads/2025/01/Imagen_de_WhatsApp_2025-01-22_a_las_12.26.56_5384ac7f-transformed.jpeg'
with urllib.request.urlopen(logo,timeout=60) as r:(OUT/'logo.jpeg').write_bytes(r.read())
from PIL import Image
im=Image.open(OUT/'logo.jpeg').convert('RGB')
for size in [180,192,512]:
 canvas=Image.new('RGB',(size,size),'white');copy=im.copy();copy.thumbnail((int(size*.88),int(size*.88)));canvas.paste(copy,((size-copy.width)//2,(size-copy.height)//2));canvas.save(OUT/f'icon-{size}.png')
print(f'Catalog: {len(products)} products, {len(categories)} categories, '+str(sum(len(p.get('variantDetails',[])) for p in products))+' variations')
