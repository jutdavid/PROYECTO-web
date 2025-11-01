
const LIBROS_BASE = [
  {
    id: 1,
    titulo: "El nombre del viento",
    autor: "Patrick Rothfuss",
    genero: "fantasia",
    img: "https://m.media-amazon.com/images/I/81t2CVWEsUL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    id: 2,
    titulo: "El temor de un hombre sabio",
    autor: "Patrick Rothfuss",
    genero: "fantasia",
    img: "https://m.media-amazon.com/images/I/91dSMhdIzTL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    id: 3,
    titulo: "Hábitos Atómicos",
    autor: "James Clear",
    genero: "no ficcion",
    img: "https://m.media-amazon.com/images/I/81wgcld4wxL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    id: 4,
    titulo: "1984",
    autor: "George Orwell",
    genero: "ciencia ficcion",
    img: "https://m.media-amazon.com/images/I/71kxa1-0mfL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    id: 5,
    titulo: "Orgullo y prejuicio",
    autor: "Jane Austen",
    genero: "romance",
    img: "https://m.media-amazon.com/images/I/81OthjkJBuL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    id: 6,
    titulo: "Asesinato en el Orient Express",
    autor: "Agatha Christie",
    genero: "misterio",
    img: "https://m.media-amazon.com/images/I/81j8hTKhq9L._AC_UF1000,1000_QL80_.jpg"
  },
  {
    id: 7,
    titulo: "Sapiens: De animales a dioses",
    autor: "Yuval Noah Harari",
    genero: "no ficcion",
    img: "https://m.media-amazon.com/images/I/713jIoMO3UL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    id: 8,
    titulo: "Cien años de soledad",
    autor: "Gabriel García Márquez",
    genero: "realismo magico",
    img: "https://m.media-amazon.com/images/I/81fZAxvljvL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    id: 9,
    titulo: "El código Da Vinci",
    autor: "Dan Brown",
    genero: "misterio",
    img: "https://m.media-amazon.com/images/I/91Q5dCjc2KL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    id: 10,
    titulo: "Los juegos del hambre",
    autor: "Suzanne Collins",
    genero: "ciencia ficcion",
    img: "https://m.media-amazon.com/images/I/61JfGcL2ljL._AC_UF1000,1000_QL80_.jpg"
  }
];




// Persistencia simple
const store = {
  get(k, d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d; } catch{ return d; } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
};
if(!store.get('libros'))   store.set('libros', LIBROS_BASE);
if(!store.get('usuarios')) store.set('usuarios', []);
if(!store.get('resenas'))  store.set('resenas', []);
if(!store.get('sesion'))   store.set('sesion', null);

// Utilidades
const capitalizar = s => s.charAt(0).toUpperCase()+s.slice(1);
const escapeHtml  = str => str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

// ---------- SPA: Navegación y render ----------
const secciones = document.querySelectorAll('.seccion');
document.querySelectorAll('#main-menu a').forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    mostrarSeccion(a.getAttribute('data-section'));
  });
});

function mostrarSeccion(id){
  secciones.forEach(s=>s.classList.remove('activa'));
  document.getElementById(id)?.classList.add('activa');
  if(id==='inicio')          renderDestacados();
  if(id==='catalogo')        renderCatalogo();
  if(id==='recomendaciones') renderRecomendaciones();
}
mostrarSeccion('inicio'); // por defecto Inicio visible:contentReference[oaicite:2]{index=2}

// Sesión UI (bienvenida + logout)
const welcome   = document.getElementById('welcome');
const logoutBtn = document.getElementById('logoutBtn');
function refrescarSesionUI(){
  const s = store.get('sesion', null);
  if(s){
    if(welcome) welcome.textContent = 'Bienvenid@, ' + s.nombre;
    if(logoutBtn) logoutBtn.style.display = 'inline-block';
  }else{
    if(welcome) welcome.textContent = '';
    if(logoutBtn) logoutBtn.style.display = 'none';
  }
}
logoutBtn?.addEventListener('click', ()=>{
  store.set('sesion', null);
  refrescarSesionUI();
  alert('Has cerrado sesión');
});
refrescarSesionUI(); // estado inicial:contentReference[oaicite:3]{index=3}

// Tarjeta de libro
function cardLibro(l) {
  // Si la URL no es válida o la imagen no carga, mostramos un fallback
  const imgSrc = l.img && l.img.trim() ? l.img.trim() : "";
  const portada = imgSrc
    ? `<img src="${imgSrc}" alt="Portada de ${l.titulo}" loading="lazy" onerror="this.onerror=null;this.src='https://via.placeholder.com/200x300?text=Sin+imagen';">`
    : `<div class="portada-fallback">Portada</div>`;

  return `<article class="libro" data-id="${l.id}">
    <div class="portada">${portada}</div>
    <div class="info">
      <strong>${l.titulo}</strong>
      <div>${l.autor}</div>
      <span class="badge">${capitalizar(l.genero)}</span>
      <button class="btn btn-detalle" data-id="${l.id}">Detalle</button>
    </div>
  </article>`;
}


function conectarBotonesLibro(){
  document.querySelectorAll('.btn-detalle').forEach(b=>{
    b.onclick = ()=> mostrarDetalle(+b.dataset.id);
  });
}

// INICIO
function renderDestacados(){
  const cont = document.getElementById('destacados');
  const libros = store.get('libros', []);
  if(cont){
    cont.innerHTML = libros.slice(0, 6).map(cardLibro).join('');
    conectarBotonesLibro();
  }
}

// CATÁLOGO
const filtroGenero = document.getElementById('filtroGenero');
function cargarGeneros(){
  const generos = [...new Set(store.get('libros', []).map(l=>l.genero))];
  if(filtroGenero){
    filtroGenero.innerHTML = '<option value="todos">Todos</option>' +
      generos.map(g=>`<option value="${g}">${capitalizar(g)}</option>`).join('');
  }
}
cargarGeneros();
filtroGenero?.addEventListener('change', renderCatalogo);

function renderCatalogo(){
  const genero = filtroGenero ? filtroGenero.value : 'todos';
  const libros = store.get('libros', []).filter(l => genero==='todos' ? true : l.genero===genero);
  const cont = document.getElementById('catalogoLista');
  if(cont){
    cont.innerHTML = libros.map(cardLibro).join('');
    conectarBotonesLibro();
  }
}

// DETALLE + RESEÑAS
function mostrarDetalle(id){
  const l = store.get('libros', []).find(x=>x.id===id);
  const detalle = document.getElementById('detalleContenido');
  const sesion  = store.get('sesion', null);
  if(!l || !detalle) return;

  detalle.innerHTML = `
    <h3>${l.titulo}</h3>
    <p><strong>Autor:</strong> ${l.autor}</p>
    <p><strong>Género:</strong> ${capitalizar(l.genero)}</p>
    <p>Descripción breve del libro (ejemplo).</p>
  `;

  const resArea = document.getElementById('resenasArea');
  resArea.style.display = 'block';
  document.getElementById('resenaLibroId').value = String(id);
  renderResenas(id);

  // Solo usuarios logueados pueden enviar reseñas
  document.querySelector('#formResena button').disabled = !sesion;
}

function renderResenas(id){
  const ul = document.getElementById('listaResenas');
  if(!ul) return;
  const res = store.get('resenas', []).filter(r => r.libroId===id);
  if(res.length===0){ ul.innerHTML = '<li>No hay reseñas aún.</li>'; return; }
  ul.innerHTML = res.map(r=>`
    <li>
      <div><strong>${r.email}</strong> — ${'★'.repeat(r.puntaje)}${'☆'.repeat(5-r.puntaje)}</div>
      <div>${escapeHtml(r.texto)}</div>
      <small>${new Date(r.fecha).toLocaleString()}</small>
    </li>
  `).join('');
}

document.getElementById('formResena')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const sesion = store.get('sesion', null);
  if(!sesion){ alert('Inicia sesión para reseñar'); return; }

  const libroId = +document.getElementById('resenaLibroId').value;
  const texto   = document.getElementById('resenaTexto').value.trim();
  const puntaje = +document.getElementById('resenaPuntaje').value;

  if(!texto || puntaje<1 || puntaje>5){ alert('Reseña inválida'); return; }

  const arr = store.get('resenas', []);
  arr.push({libroId, email: sesion.email, texto, puntaje, fecha: Date.now()});
  store.set('resenas', arr);

  e.target.reset();
  renderResenas(libroId);
  alert('¡Reseña guardada!');
});

// RECOMENDACIONES
function renderRecomendaciones(){
  const sesion = store.get('sesion', null);
  const cont = document.getElementById('recomendacionesLista');
  if(!cont) return;
  if(!sesion){
    cont.innerHTML = '<div class="aviso">Inicia sesión para ver tus recomendaciones.</div>';
    return;
  }
  const libros = store.get('libros', []);
  const intereses = sesion.intereses || [];
  const misResenas = store.get('resenas', []).filter(r => r.email===sesion.email && r.puntaje>=4);

  const preferidos = new Set([
    ...intereses,
    ...misResenas.map(r => libros.find(l=>l.id===r.libroId)?.genero).filter(Boolean)
  ]);

  const recos = libros.filter(l => preferidos.size ? preferidos.has(l.genero) : true);
  cont.innerHTML = recos.map(cardLibro).join('');
  conectarBotonesLibro();
}

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Registro ----------
  const formSignup = document.getElementById('formSignup');       
  const regNombre  = document.getElementById('regNombre');       
  const regEmail   = document.getElementById('regEmail');     
  const regPass    = document.getElementById('regPass');         
  const errNombre  = document.getElementById('errRegNombre');  
  const errEmail   = document.getElementById('errRegEmail');     
  const errPass    = document.getElementById('errRegPass');      
  const errInter   = document.getElementById('errIntereses');    

  // Validación en tiempo real (Registro)
  regNombre?.addEventListener('input', validarNombre);
  regEmail?.addEventListener('input', validarEmail);
  regPass?.addEventListener('input', validarPass);

  function validarNombre(){
    const ok = (regNombre.value.trim().length >= 3);
    pintar(regNombre, errNombre, ok ? '' : 'Mínimo 3 caracteres');
    return ok;
  }
  function validarEmail(){
    const re = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;
    const ok = re.test(regEmail.value.trim());
    pintar(regEmail, errEmail, ok ? '' : 'Correo inválido');
    return ok;
  }
  function validarPass(){
    const ok = regPass.value.length >= 6;
    pintar(regPass, errPass, ok ? '' : 'Mínimo 6 caracteres');
    return ok;
  }

  formSignup?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const intereses = Array.from(document.querySelectorAll('input[name="interes"]:checked')).map(i=>i.value); //:contentReference[oaicite:12]{index=12}
    const ok = validarNombre() & validarEmail() & validarPass() & validarIntereses();
    if(!ok) return;

    const usuarios = store.get('usuarios', []);
    const correo = regEmail.value.trim().toLowerCase();
    if(usuarios.some(u=>u.email===correo)){ alert('Ese correo ya está registrado'); return; }

    usuarios.push({ nombre: regNombre.value.trim(), email: correo, pass: regPass.value, intereses });
    store.set('usuarios', usuarios);

    alert('Registro exitoso. Ahora inicia sesión.');
    formSignup.reset();
    limpiarClases([regNombre, regEmail, regPass]);
    mostrarSeccion('login'); // ir a Login tras registro:contentReference[oaicite:13]{index=13}
  });

  function validarIntereses(){
    const sel = document.querySelectorAll('input[name="interes"]:checked').length;
    if(errInter) errInter.textContent = sel ? '' : 'Selecciona al menos un interés';
    return sel > 0;
  }

// ---------- Login (simplificado a credenciales fijas) ----------
const formLogin = document.getElementById('formLogin');
const loginEmail= document.getElementById('loginEmail');
const loginPass = document.getElementById('loginPass');
const errLoginE = document.getElementById('errLoginEmail');
const errLoginP = document.getElementById('errLoginPass');

// 👉 Autorrelleno para que sea inmediato
if (loginEmail) loginEmail.value = 'libreria@gmail.com';   // <-- correo fijo
if (loginPass)  loginPass.value  = 'libreria123';          // <-- contraseña fija

formLogin?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const email = (loginEmail?.value || '').trim().toLowerCase();
  const pass  = (loginPass?.value  || '');

  // 👉 Acepta únicamente estas credenciales
  if(email === 'libreria@gmail.com' && pass === 'libreria123'){
    // Puedes personalizar el nombre que se muestra
    store.set('sesion', { nombre: 'Librería', email, intereses: [] });
    refrescarSesionUI();
    alert('¡Bienvenid@!');
    mostrarSeccion('inicio');
  } else {
    // Mensaje claro si no coinciden
    if(errLoginE) errLoginE.textContent = 'Usa: libreria@gmail.com';
    if(errLoginP) errLoginP.textContent = 'Contraseña: libreria123';
    alert('Credenciales incorrectas');
  }
});


  // ---------- Utilidades de UI para validaciones ----------
  function pintar(input, small, mensaje){
    if(!small) return;
    small.textContent = mensaje || '';
    if(mensaje){
      input.classList.remove('valido');
      input.classList.add('invalido');
    }else{
      input.classList.remove('invalido');
      input.classList.add('valido');
    }
  }
  function limpiarClases(arr){
    arr.forEach(i => i.classList.remove('valido','invalido'));
  }
});
