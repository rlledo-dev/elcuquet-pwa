'use strict';
const $=s=>document.querySelector(s);let data=null,limit=24,lastFocus=null,activeCategory='';
const categoryById=id=>data?.categories?.find(c=>String(c.id)===String(id));
const text=html=>{const d=new DOMParser().parseFromString(String(html||''),'text/html');return d.body.textContent||''};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>text(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const within=(id,ancestor)=>{const seen=new Set();while(id&&!seen.has(String(id))){if(String(id)===String(ancestor))return true;seen.add(String(id));id=categoryById(id)?.parent}return false};
const categoryProducts=(id,p)=>p.categories?.some(c=>within(c.id,id));
const primaryCategoryOrder=['globos','alquiler de maquinas','decoracion de fiestas','chuches y dulces','regalos personalizados','celebraciones especiales'];
const categorySort=(a,b)=>{const ai=primaryCategoryOrder.indexOf(norm(a.name)),bi=primaryCategoryOrder.indexOf(norm(b.name));if(ai!==bi)return(ai<0?999:ai)-(bi<0?999:bi);return(Number(a.menu_order||0)-Number(b.menu_order||0))||text(a.name).localeCompare(text(b.name),'es')};
const visibleCategories=()=>data.categories.filter(c=>data.products.some(p=>categoryProducts(c.id,p)));
function categoryNav(){
 const available=visibleCategories(),ids=new Set(available.map(c=>String(c.id)));
 const roots=available.filter(c=>!ids.has(String(c.parent))).sort(categorySort);
 const current=activeCategory?categoryById(activeCategory):null;
 const children=(current?available.filter(c=>String(c.parent)===String(current.id)):roots).sort(categorySort);
 const parent=current&&categoryById(current.parent);
 const back=current?(parent&&ids.has(String(parent.id))?String(parent.id):''):null;
 const title=current?text(current.name):'Todo el catálogo';
 $('#heading').textContent=title;
 const select=$('#category');
 select.innerHTML='<option value="">'+esc(current?'Subcategorías de '+title:'Todas las categorías')+'</option>'+children.map(c=>`<option value="${esc(c.id)}">${esc(text(c.name))}</option>`).join('');
 select.hidden=!children.length;
 const chips=$('#chips');
 chips.innerHTML=(current?`<button data-back="${esc(back)}">‹ Volver</button>`:'')+children.map(c=>`<button data-id="${esc(c.id)}">${esc(text(c.name))}</button>`).join('');
 chips.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>chooseCategory(b.dataset.id));
 chips.querySelector('[data-back]')?.addEventListener('click',()=>chooseCategory(back));
}
function chooseCategory(id){activeCategory=String(id||'');limit=24;render();location.hash='catalogo'}
function openHome(id=''){activeCategory=String(id||'');$('#search').value='';limit=24;location.hash='catalogo';render()}
function goToStart(event){
 event.preventDefault();
 closeProduct(false);
 activeCategory='';$('#search').value='';limit=24;
 if(location.hash!=='#inicio')location.hash='inicio';
 route();render();
 window.scrollTo({top:0,left:0,behavior:'instant'});
}
function renderHomeCategories(){
 const host=$('#home-category-grid');if(!host)return;
 const available=visibleCategories(),ids=new Set(available.map(c=>String(c.id)));
 const roots=available.filter(c=>!ids.has(String(c.parent))).sort(categorySort);
 host.innerHTML=roots.map(c=>{const rows=data.products.filter(p=>categoryProducts(c.id,p)),candidate=rows.find(p=>image(p)),forced=norm(c.name)==='globos'?'https://pruebas-app.elcuquet.net/wp-content/uploads/2025/02/image26.jpeg':norm(c.name)==='decoracion de fiestas'?'https://pruebas-app.elcuquet.net/wp-content/uploads/2026/11/categoria-decoracion-fiestas-el-cuquet.jpg':norm(c.name)==='chuches y dulces'?'https://pruebas-app.elcuquet.net/wp-content/uploads/2026/11/categoria-chuches-el-cuquet.jpg':'',src=forced||(c.image?imageSize(c.image,800):'')||(candidate?image(candidate,800):'');return `<button class="home-category-tile" data-home-category="${esc(c.id)}"><span class="home-category-photo">${src?`<img src="${esc(src)}" alt="${esc(norm(c.name)==='globos'?'Arco de globos en una puerta de entrada':text(c.name))}" loading="lazy">`:'<span>Imagen no disponible</span>'}</span><span class="home-category-content"><strong>${esc(text(c.name))}</strong><span class="home-category-description">${rows.length} productos</span></span></button>`}).join('');
 host.querySelectorAll('[data-home-category]').forEach(b=>b.onclick=()=>openHome(b.dataset.homeCategory));
}

const money=(value,prices)=>value!==''&&value!=null?new Intl.NumberFormat('es-ES',{style:'currency',currency:prices.currency_code||'EUR'}).format(Number(value)/10**(prices.currency_minor_unit??2)):'Precio no disponible';
const price=p=>p.prices?.price_range?'Desde '+money(p.prices.price_range.min_amount,p.prices):money(p.prices?.price,p.prices||{});
const validImage=u=>typeof u==='string'&&/^https:\/\/pruebas-app\.elcuquet\.net\//.test(u);
function imageSize(im,width=640){
 if(!im)return '';
 const candidates=String(im.srcset||'').split(',').map(s=>s.trim().match(/^(\S+)\s+(\d+)w$/)).filter(m=>m&&validImage(m[1])).map(m=>({url:m[1],width:Number(m[2])}));
 const exact=candidates.find(c=>c.width===width);
 if(exact)return exact.url;
 if(width===1200&&validImage(im.src))return im.src;
 const smaller=candidates.filter(c=>c.width<=width).sort((a,b)=>b.width-a.width)[0];
 return smaller?.url||(validImage(im.thumbnail)?im.thumbnail:'')||(validImage(im.src)?im.src:'');
}
const image=(p,width=640)=>imageSize((p.images||[]).find(i=>validImage(i.src)),width);
function route(){const hash=location.hash.slice(1)||'inicio';if(!hash.startsWith('producto/'))closeProduct(false);$('#home-categories').hidden=hash!=='inicio';$('#hero').hidden=true;$('.catalog').hidden=hash==='info';$('#about').hidden=hash!=='info';document.querySelectorAll('.bottom a[href^="#"]').forEach(a=>a.setAttribute('aria-current',a.hash==='#'+(hash==='categorias'?'catalogo':hash.startsWith('producto/')?'catalogo':hash)?'page':'false'));if(hash==='categorias')$('#category').focus();if(hash.startsWith('producto/')&&data){const p=data.products.find(p=>String(p.id)===hash.split('/')[1]);if(p)openProduct(p);else{$('#status').textContent='Este producto no está disponible en el catálogo de pruebas.';location.hash='catalogo'}}}
function render(){if(!data)return;categoryNav();const q=norm($('#search').value),cat=activeCategory;const rows=data.products.filter(p=>(!cat||categoryProducts(cat,p))&&(!q||norm(p.name+' '+p.sku+' '+p.description+' '+p.short_description+' '+p.categories.map(c=>c.name).join(' ')).includes(q)));$('#status').textContent=`${rows.length} productos · Catálogo de pruebas${!navigator.onLine?' · Sin conexión; datos guardados':''}`;$('#grid').innerHTML=rows.slice(0,limit).map(p=>`<article class="card"><a href="#producto/${p.id}"><div class="photo">${image(p)?`<img src="${esc(image(p))}" alt="${esc(text(p.name))}" loading="lazy" decoding="async">`:'<span>Imagen no disponible</span>'}${p.type==='variable'?'<span class="badge">Varias opciones</span>':''}</div><div class="category">${esc(text(p.categories?.[0]?.name||'El Cuquet'))}</div><h3>${esc(text(p.name))}</h3><span class="price">${esc(price(p))}</span></a></article>`).join('');$('#empty').hidden=rows.length!==0;$('#more').hidden=rows.length<=limit;document.querySelectorAll('#grid img').forEach(i=>i.onerror=()=>{i.replaceWith(Object.assign(document.createElement('span'),{textContent:'Imagen no disponible'}))});document.querySelectorAll('#chips button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===cat)))}
function closeProduct(back=true){if($('#product').open){$('#product').close();if(back&&location.hash.startsWith('#producto/'))location.hash='catalogo';lastFocus?.focus()}}
function openProduct(p){lastFocus=document.activeElement;const variants=p.variantDetails||[];const attrs=(p.attributes||[]).filter(a=>a.has_variations||a.variation||variants.some(v=>(v.attributes||[]).some(x=>x.name===a.name)));const imgs=[...new Set((p.images||[]).map(i=>imageSize(i,1200)).filter(u=>/^https:\/\/pruebas-app\.elcuquet\.net\//.test(u)))];$('#detail').innerHTML=`<div class="detail-layout"><div><img class="detail-main" src="${esc(imgs[0]||'./logo.jpeg')}" alt="${esc(text(p.name))}"><div class="thumbs">${imgs.map((src,i)=>`<button data-img="${i}" aria-label="Foto ${i+1}"><img src="${esc(imageSize((p.images||[]).find(im=>imageSize(im,1200)===src),640)||src)}" alt="" loading="lazy"></button>`).join('')}</div></div><div><span class="eyebrow">CATÁLOGO DE PRUEBAS</span><h2>${esc(text(p.name))}</h2><p class="price" id="detail-price">${esc(price(p))}</p><p>${esc(text(p.short_description||p.description))}</p>${p.sku?`<p>Referencia: ${esc(p.sku)}</p>`:''}<div id="options">${attrs.map((a,i)=>`<label for="attr-${i}">${esc(text(a.name))}</label><select id="attr-${i}" data-attr="${esc(a.name)}"><option value="">Selecciona una opción</option>${(a.terms||a.options||[]).map(t=>`<option value="${esc(typeof t==='string'?t:t.name)}">${esc(typeof t==='string'?t:t.name)}</option>`).join('')}</select>`).join('')}</div><p id="availability">${p.is_in_stock?'Disponible en pruebas':'Agotado en pruebas'}</p><p class="notice">Solo consulta. No se pueden realizar pedidos, pagos ni reservas de stock.</p><a id="share" class="primary" target="_blank" rel="noopener noreferrer">Compartir por WhatsApp</a></div></div>`;
const selections=()=>[...document.querySelectorAll('#options select')].map(s=>({name:s.dataset.attr,value:s.value}));
function selectedPrice(){const picks=selections();if(!picks.length){if(p.type==='variable')$('#availability').textContent=variants.length?'Selecciona una variación cuando esté disponible.':'Variaciones pendientes de conexión; precio orientativo de la ficha.';return}if(picks.some(x=>!x.value)){$('#detail-price').textContent=price(p);$('#availability').textContent='Selecciona todas las opciones para consultar precio y disponibilidad.';return}const match=variants.find(v=>picks.every(a=>(v.attributes||[]).some(b=>norm(b.name)===norm(a.name)&&(!b.value||norm(b.value)===norm(a.value)))));$('#detail-price').textContent=match?price(match):'Combinación no disponible';$('#availability').textContent=match?(match.is_in_stock?'Disponible en pruebas':'Agotado en pruebas'):'No se ha encontrado esta combinación.';if(match&&image(match,1200))$('.detail-main').src=image(match,1200)}
document.querySelectorAll('#options select').forEach(s=>s.onchange=selectedPrice);document.querySelectorAll('[data-img]').forEach(b=>b.onclick=()=>{$('.detail-main').src=imgs[Number(b.dataset.img)]});$('#share').href='https://wa.me/?text='+encodeURIComponent(text(p.name)+' · El Cuquet (catálogo de pruebas, sin compras)\n'+location.href);if(!$('#product').open)$('#product').showModal();selectedPrice()}
async function load(){try{$('#refresh').disabled=true;const r=await fetch('./catalog.json',{cache:'no-cache'});if(!r.ok)throw Error('Catálogo no disponible');const next=await r.json();if(next.source!=='https://pruebas-app.elcuquet.net'||!Array.isArray(next.products)||!Array.isArray(next.categories))throw Error('Origen de catálogo no válido');data=next;renderHomeCategories();$('#updated').textContent='Datos de pruebas leídos el '+new Date(data.updatedAt).toLocaleString('es-ES')+' · Actualización programada cada hora';render();route()}catch(e){$('#status').textContent='No se pudo cargar el catálogo de pruebas. Comprueba tu conexión y pulsa Actualizar.'}finally{$('#refresh').disabled=false}}
$('#home-all').onclick=()=>openHome('');
document.querySelectorAll('a[href="#inicio"]').forEach(a=>a.addEventListener('click',goToStart));
$('#search').oninput=()=>{limit=24;render()};$('#category').onchange=()=>{if($('#category').value)chooseCategory($('#category').value)};$('#more').onclick=()=>{limit+=24;render()};$('#refresh').onclick=load;document.querySelector('.bottom a[href="#catalogo"]').addEventListener('click',()=>openHome(''));$('#product .close').onclick=()=>closeProduct();$('#product').addEventListener('cancel',()=>{location.hash='catalogo'});$('#install-dialog .close').onclick=()=>$('#install-dialog').close();$('#install').onclick=()=>$('#install-dialog').showModal();$('#dock-install').onclick=()=>$('#install-dialog').showModal();addEventListener('hashchange',route);addEventListener('online',render);addEventListener('offline',render);route();load();const APP_VERSION='0.1.21';
let updateInProgress=false;
const updateMessage=message=>{for(const id of ['#update-status','#update-dialog-status']){const el=$(id);if(el)el.textContent=message}};
async function updateApplication(manual=false){
 if(updateInProgress)return;
 if(!navigator.onLine){if(manual)updateMessage('Sin conexión. Inténtalo cuando tengas internet.');return}
 if(!('serviceWorker' in navigator)){if(manual)updateMessage('Este navegador no admite actualizaciones automáticas.');return}
 updateInProgress=true;
 try{
  if(manual)updateMessage('Buscando una versión nueva…');
  const registration=await navigator.serviceWorker.getRegistration('./');
  if(registration)await registration.update();
  const response=await fetch('./version.json?check='+Date.now(),{cache:'no-store'});
  if(!response.ok)throw Error('No se pudo consultar la versión');
  const info=await response.json();
  if(!info.version||!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(info.version))throw Error('Versión no válida');
  if(info.version!==APP_VERSION){
   if(manual)updateMessage('Versión '+info.version+' disponible. Actualizando…');
   if(registration){
    await registration.update();
    await new Promise(resolve=>setTimeout(resolve,800));
   }
   // El service worker activo sirve siempre el documento desde la red si hay conexión.
   location.replace('./?v='+encodeURIComponent(info.version)+'#'+(location.hash.slice(1)||'inicio'));
   return;
  }
  if(manual){await load();updateMessage('Aplicación actualizada. Versión '+APP_VERSION+'.');}
 }catch(error){if(manual)updateMessage('No se pudo comprobar la actualización. Revisa la conexión e inténtalo de nuevo.')}
 finally{updateInProgress=false}
}
$('#update-app').onclick=()=>updateApplication(true);
$('#update-app-dialog').onclick=()=>updateApplication(true);
addEventListener('pageshow',()=>{updateApplication(false)});
addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')updateApplication(false)});
if('serviceWorker'in navigator){navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(()=>navigator.serviceWorker.ready).then(()=>{$('#pwa-status').textContent='Modo sin conexión preparado para la interfaz y el último catálogo consultado. Las fotos necesitan conexión.'}).catch(()=>{$('#pwa-status').textContent='No se pudo activar el modo sin conexión en este navegador.'})}else{$('#pwa-status').textContent='Este navegador no permite activar el modo sin conexión.'}
