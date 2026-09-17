const canvas = document.getElementById('assinatura');
const ctx = canvas.getContext('2d');
let desenhando = false;

function getPos(event) {
  if (event.touches) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top };
  } else {
    return { x: event.offsetX, y: event.offsetY };
  }
}
function iniciarDesenho(e) {
  desenhando = true;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}
function desenhar(e) {
  if (!desenhando) return;
  e.preventDefault();
  const pos = getPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
}
function pararDesenho() { desenhando = false; }

canvas.addEventListener('mousedown', iniciarDesenho);
canvas.addEventListener('mousemove', desenhar);
canvas.addEventListener('mouseup', pararDesenho);
canvas.addEventListener('mouseleave', pararDesenho);
canvas.addEventListener('touchstart', iniciarDesenho);
canvas.addEventListener('touchmove', desenhar);
canvas.addEventListener('touchend', pararDesenho);

function limparAssinatura() { ctx.clearRect(0, 0, canvas.width, canvas.height); }

function prepararAssinatura(clone) {
  const canvasOriginal = document.getElementById('assinatura');
  const assinaturaClone = clone.querySelector('#assinatura');
  if (canvasOriginal && assinaturaClone) {
    const imgData = canvasOriginal.toDataURL();
    const img = document.createElement('img');
    img.src = imgData;
    img.style.border = '1px solid #000';
    img.width = canvasOriginal.width;
    img.height = canvasOriginal.height;
    assinaturaClone.parentNode.replaceChild(img, assinaturaClone);
  }
}
// =============================
// 📌 RELATÓRIO EM ANDAMENTO
// =============================

function salvarRelatorioEmAndamento(numero, ano) {
  localStorage.setItem('relatorio_em_andamento', numero);
  localStorage.setItem('ano_relatorio_em_andamento', ano);
}

function limparRelatorioEmAndamento() {
  localStorage.removeItem('relatorio_em_andamento');
  localStorage.removeItem('ano_relatorio_em_andamento');
}

function recuperarRelatorioSalvo() {
  return {
    numero: localStorage.getItem('relatorio_em_andamento'),
    ano: localStorage.getItem('ano_relatorio_em_andamento')
  };
}

function getNumeroRelatorio() {
  const numero = document.querySelector('input[name="numero"]').value.trim();
  const agora = new Date();
  const data = agora.toLocaleDateString('pt-BR').split('/').reverse().join('-');
  const hora = agora.toTimeString().split(' ')[0].replace(/:/g, '-');
  if (numero) {
  return `relatorio_${numero}_${data}_${hora}.pdf`;
  } else {
  return `relatorio_${data}_${hora}.pdf`; // nome padrão caso esteja vazio
  }
}

function validarNumeroRelatorio() {
  const campoNumero = document.querySelector('input[name="numero"]');

  if (!campoNumero || campoNumero.value.trim() === '') {
    alert('⚠️ Clique no botão Finalizar Relatório antes de gerar o PDF.');
    campoNumero.focus();
    return false;
  }
  return true;
}

function gerarPDF() {
  if (!validarNumeroRelatorio()) return;

  const original = document.getElementById('pdf-content');
  const clone = original.cloneNode(true);
  const textareas = clone.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    const div = document.createElement('div');
    div.style.whiteSpace = 'pre-wrap';
    div.style.border = '1px solid #ccc';
    div.style.padding = '5px';
    div.style.minHeight = '45px';
    div.style.fontWeight = 'bold';
    div.style.fontSize = '14px';
    div.style.backgroundColor = 'white';
    div.style.color = 'blue';
    div.textContent = textarea.value;
    textarea.parentNode.replaceChild(div, textarea);
  });
  prepararAssinatura(clone);
  const container = document.createElement('div');

container.style.position = 'fixed';
container.style.left = '0';
container.style.top = '0';
container.style.width = '210mm';
container.style.backgroundColor = '#ffffff';
container.style.zIndex = '-9999';

clone.style.width = '190mm';
clone.style.margin = '0 auto';
clone.style.backgroundColor = '#D6FFFF';

container.appendChild(clone);
document.body.appendChild(container);
  
  const opt = {
    margin: [10, 10, 10, 10],
    filename: getNumeroRelatorio(),
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
    scale: 2,
    useCORS: true,
    scrollY: 0,
    backgroundColor: '#ffffff'
},
pagebreak: { mode: ['css', 'legacy'] },    
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(clone).save().then(() => {
  document.body.removeChild(container);

  // 🧹 Finalizou → libera o número
  limparRelatorioEmAndamento();
});
}

function validarNumeroRelatorio() {
  const campoNumero = document.querySelector('input[name="numero"]');

  if (!campoNumero || campoNumero.value.trim() === '') {
    alert('⚠️ Clique no botão Finalizar Relatório antes de gerar o PDF.');
    campoNumero.focus();
    return false;
  }
  return true;
}

async function compartilharPDF() {
  if (!validarNumeroRelatorio()) return;
  const original = document.getElementById('pdf-content');
  const clone = original.cloneNode(true);

  const textareas = clone.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    const div = document.createElement('div');
    div.style.whiteSpace = 'pre-wrap';
    div.style.border = '1px solid #ccc';
    div.style.padding = '5px';
    div.style.minHeight = '45px';
    div.style.fontWeight = 'bold';
    div.style.fontSize = '14px';
    div.style.backgroundColor = 'white';
    div.style.color = 'blue';
    div.textContent = textarea.value;
    textarea.parentNode.replaceChild(div, textarea);
  });

  prepararAssinatura(clone);

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.appendChild(clone);
  document.body.appendChild(container);

  const opt = {
    margin: [10, 10, 10, 10],
    filename: getNumeroRelatorio(),
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
            scale: 2,
            useCORS: true,
            scrollY: 0,
            backgroundColor: '#ffffff'
        },
    pagebreak: { mode: ['css', 'legacy'] },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  const blob = await html2pdf().set(opt).from(clone).outputPdf('blob');

  const file = new File([blob], getNumeroRelatorio(), { type: 'application/pdf' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: 'Relatório de Ocorrência',
        text: 'Confira o relatório preenchido.',
        files: [file]
      });
    } catch (err) {
      alert('Compartilhamento cancelado ou falhou.');
    }
  } else {
    alert('Compartilhamento de arquivos não suportado neste navegador.');
  }

  document.body.removeChild(container);

// 🧹 Finalizou → libera o número
limparRelatorioEmAndamento();
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Service Worker registrado com sucesso'))
    .catch(error => console.log('Erro ao registrar o Service Worker:', error));
}

// 🔹 Preenchimento automático do endereço via GPS (OpenStreetMap)
  self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('nominatim.openstreetmap.org')) {
    event.respondWith(fetch(event.request));
  }
});

function preencherEndereco() {
  if (!('geolocation' in navigator)) {
    alert("Geolocalização não suportada neste dispositivo.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
          {
            headers: {
              'Accept-Language': 'pt-BR',
              'User-Agent': 'RelatorioOcorrencia/1.0'
            }
          }
        );

        if (!response.ok) throw new Error('Erro HTTP');

        const data = await response.json();

        const endereco = [
          data.address.road,
          data.address.house_number,
          data.address.suburb,
          data.address.city || data.address.town
          
        ].filter(Boolean).join(' - ');

        document.getElementById('local').value =
          endereco || 'Localização obtida, edite se necessário';

      } catch (e) {
        document.getElementById('local').value =
          `Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)} (edite manualmente)`;
      }
    },
    (error) => {
      alert("Não foi possível obter a localização. Verifique GPS e permissões.");
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
}
// 🔹 Tenta preencher automaticamente ao abrir o formulário
window.addEventListener('load', () => {
  // pequeno atraso para evitar bloqueio em mobile
  setTimeout(() => {
    preencherEndereco();
  }, 800);
});

document.addEventListener('DOMContentLoaded', () => {

  // 🔄 Verifica relatório em andamento ao abrir
  const salvo = recuperarRelatorioSalvo();

  if (salvo.numero) {
    setTimeout(() => {
      const continuar = confirm(
        `Existe um relatório em andamento.\n\nDeseja retomar o nº ${salvo.numero}?`
      );

      if (continuar) {
        const campoNumero = document.querySelector('input[name="numero"]');
        const campoAno = document.querySelector('input[name="ano"]');

        if (campoNumero) campoNumero.value = salvo.numero;
        if (campoAno) campoAno.value = salvo.ano;
      } else {
        limparRelatorioEmAndamento();
      }
    }, 500);
  }

  const agora = new Date();

  // ANO
  const campoAno = document.querySelector('input[name="ano"]');
  if (campoAno && !campoAno.value) {
    campoAno.value = agora.getFullYear();
  }
  
  // DATA
  const campoData = document.querySelector('input[name="data"]');
  if (campoData && !campoData.value) {
    const yyyy = agora.getFullYear();
    const mm = String(agora.getMonth() + 1).padStart(2, '0');
    const dd = String(agora.getDate()).padStart(2, '0');
    campoData.value = `${yyyy}-${mm}-${dd}`;
  }

  // ENDEREÇO (GPS)
  const campoLocal = document.getElementById('local');
  if (campoLocal && !campoLocal.value) {
    try { preencherEndereco(); } catch (e) {}
  }
});

async function obterNumeroGlobal() {
  const btn = event?.target;
  const inputNumero = document.querySelector('input[name="numero"]');
  const inputAno = document.querySelector('input[name="ano"]');

  // 🔒 Verifica se já existe relatório salvo
  const salvo = recuperarRelatorioSalvo();

  if (salvo.numero) {
    inputNumero.value = salvo.numero;
    inputAno.value = salvo.ano;
    alert('Número recuperado do relatório em andamento.');
    return;
  }

  if (btn) btn.disabled = true;

  try {
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbzX6YyTI70dNpfQh9XBcXhYpEGfud6uYh29e3vFuhtqqjYae6VseboqHrLCsqS-R_02/exec'
    );

    const data = await response.json();

    inputNumero.value = data.numero;
    inputAno.value = data.ano;

    // 💾 SALVA LOCALMENTE
    salvarRelatorioEmAndamento(data.numero, data.ano);

  } catch (err) {
    alert('Sem conexão. Número não sincronizado.');
    console.error(err);
  } finally {
    if (btn) btn.disabled = false;
  }
}

  /* 🔹 Script para fotos (até 3) */
const fotoInput = document.getElementById('fotoInput');
const fotosContainer = document.getElementById('fotos-container');

fotoInput.addEventListener('change', (event) => {
  fotosContainer.innerHTML = '<label>Fotos do Local:</label><br>'; // limpa antes
  const files = Array.from(event.target.files);

  files.slice(0,3).forEach((file, index) => { // até 3 fotos
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.classList.add('foto-box');
      div.innerHTML = `<p>Foto ${index + 1}</p><img src="${e.target.result}">`;
      fotosContainer.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
});
async function compartilharFotos() {
  const input = document.getElementById('fotosOcorrencia');
  const inputNumero = document.querySelector('input[name="numero"]');

  if (!input.files || input.files.length === 0) {
    alert('Nenhuma foto selecionada.');
    return;
  }

  const numeroRelatorio = inputNumero && inputNumero.value
    ? inputNumero.value
    : 'sem_numero';

  const arquivos = Array.from(input.files);

  const arquivosRenomeados = arquivos.map((file, index) => {
    const ext = file.name.split('.').pop();
    return new File(
      [file],
      `foto_ocorrencia_${numeroRelatorio}_${index + 1}.${ext}`,
      { type: file.type }
    );
  });

  if (navigator.canShare && navigator.canShare({ files: arquivosRenomeados })) {
    try {
      await navigator.share({
        title: 'Fotos da Ocorrência',
        text: `Fotos do relatório de ocorrência${numeroRelatorio}.`,
        files: arquivosRenomeados
      });
    } catch (err) {
      // usuário cancelou
    }
  } else {
    alert('Este navegador não suporta compartilhamento de arquivos.');
  }
}

