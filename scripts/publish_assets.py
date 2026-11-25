import json, pathlib, urllib.request, datetime
from PIL import Image, ImageDraw
OUT=pathlib.Path('dist')
PAGES='https://rlledo-dev.github.io/elcuquet-pwa/'
LIVE='https://pruebas-app.elcuquet.net/wp-json/elcuquet-pwa/v1/catalog'
def download(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'ElCuquet-PWA-Publisher'}),timeout=12) as response:
        return response.read()
def valid(raw):
    x=json.loads(raw)
    assert x['source']=='https://pruebas-app.elcuquet.net'
    assert isinstance(x['products'],list) and isinstance(x['categories'],list)
    datetime.datetime.fromisoformat(x['updatedAt'].replace('Z','+00:00'))
    return raw
for url in [LIVE,PAGES+'catalog.json']:
    try:
        raw=valid(download(url))
        (OUT/'catalog.json').write_bytes(raw)
        break
    except Exception as e:
        print('Catalog fallback:',str(e))
else:
    print('No server backup available; app will use live API or local cache.')
for name in ['logo.jpeg','icon-180.png','icon-192.png','icon-512.png']:
    try:
        raw=download(PAGES+name)
        import io
        with Image.open(io.BytesIO(raw)) as im: im.verify()
        (OUT/name).write_bytes(raw)
    except Exception:
        print('Could not retrieve',name)
        size=512 if name=='logo.jpeg' else int(name.split('-')[1].split('.')[0])
        im=Image.new('RGB',(size,size),'white')
        d=ImageDraw.Draw(im)
        d.text((size//2,size//2),'El Cuquet',fill='#e82e87',anchor='mm')
        im.save(OUT/name)
