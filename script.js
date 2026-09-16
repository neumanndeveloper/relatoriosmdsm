// ===== CANVAS / ASSINATURA =====
const canvas = document.getElementById('assinatura');
const ctx = canvas.getContext('2d');
let desenhando = false;

function getPos(event) {
  if (event.touches) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.touches[0].clientX - rect.left) * scaleX,
      y: (event.touches[0].clientY - rect.top) * scaleY
    };
  } else {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: event.offsetX * scaleX,
      y: event.offsetY * scaleY
    };
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
canvas.addEventListener('touchstart', iniciarDesenho, { passive: false });
canvas.addEventListener('touchmove', desenhar, { passive: false });
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

// ===== RELATÓRIO EM ANDAMENTO (localStorage) =====
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

// ===== NOME DO ARQUIVO PDF =====
function getNumeroRelatorio() {
  const numero = document.querySelector('input[name="numero"]').value.trim();
  const agora = new Date();
  const data = agora.toLocaleDateString('pt-BR').split('/').reverse().join('-');
  const hora = agora.toTimeString().split(' ')[0].replace(/:/g, '-');
  if (numero) {
    return `relatorio_${numero}_${data}_${hora}.pdf`;
  } else {
    return `relatorio_${data}_${hora}.pdf`;
  }
}

// ===== VALIDAÇÃO =====
function validarNumeroRelatorio() {
  const campoNumero = document.querySelector('input[name="numero"]');
  if (!campoNumero || campoNumero.value.trim() === '') {
    alert('Clique no botão Finalizar Relatório antes de gerar o PDF.');
    campoNumero.focus();
    return false;
  }
  return true;
}

// ===== GERAR PDF =====
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
    div.style.textTransform = 'none';
    div.style.fontSize = '13px';
    div.style.backgroundColor = 'white';
    div.style.color = 'darkblue';
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

    image: {
        type: 'jpeg',
        quality: 0.98
    },

    html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0
    },

    pagebreak: {
        mode: ['css', 'legacy']
    },

    jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
    }
};

  html2pdf().set(opt).from(clone).save().then(() => {
    document.body.removeChild(container);
    limparRelatorioEmAndamento();
  });
}

// ===== COMPARTILHAR PDF =====
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
    div.style.textTransform = 'none';
    div.style.fontSize = '13px';
    div.style.backgroundColor = 'white';
    div.style.color = 'darkblue';
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
    margin: [5, 5, 5, 5],
    filename: getNumeroRelatorio(),
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 3,
      useCORS: true,
      scrollY: 0,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
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
  limparRelatorioEmAndamento();
}

// ===== SERVICE WORKER =====
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Service Worker registrado com sucesso'))
    .catch(error => console.log('Erro ao registrar o Service Worker:', error));
}

// ===== GPS / GEOLOCATION =====
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

// ===== INIT ON LOAD =====
window.addEventListener('load', () => {
  setTimeout(() => { preencherEndereco(); }, 800);
});

document.addEventListener('DOMContentLoaded', () => {
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
  const campoAno = document.querySelector('input[name="ano"]');
  if (campoAno && !campoAno.value) {
    campoAno.value = agora.getFullYear();
  }

  const campoData = document.querySelector('input[name="data"]');
  if (campoData && !campoData.value) {
    const yyyy = agora.getFullYear();
    const mm = String(agora.getMonth() + 1).padStart(2, '0');
    const dd = String(agora.getDate()).padStart(2, '0');
    campoData.value = `${yyyy}-${mm}-${dd}`;
  }

  const campoLocal = document.getElementById('local');
  if (campoLocal && !campoLocal.value) {
    try { preencherEndereco(); } catch (e) {}
  }
});

// ===== OBTER NÚMERO GLOBAL =====
async function obterNumeroGlobal() {
  const btn = event?.target;
  const inputNumero = document.querySelector('input[name="numero"]');
  const inputAno = document.querySelector('input[name="ano"]');
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
      'https://script.google.com/macros/s/AKfycbykx6FemWHxHDE7xI1ZmRJzLRVqiHHdJcJywiXVq8osJofc5WMkLgJmS_e335u9RMhK/exec'
    );
    const data = await response.json();
    inputNumero.value = data.numero;
    inputAno.value = data.ano;
    salvarRelatorioEmAndamento(data.numero, data.ano);
  } catch (err) {
    alert('Sem conexão. Número não sincronizado.');
    console.error(err);
  } finally {
    if (btn) btn.disabled = false;
  }
}

// ===== FOTOS (até 3) =====
const fotoInput = document.getElementById('fotoInput');
const fotosContainer = document.getElementById('fotos-container');

fotoInput.addEventListener('change', (event) => {
  fotosContainer.innerHTML = '<label>Fotos do Local:</label><br>';
  const files = Array.from(event.target.files);
  files.slice(0, 3).forEach((file, index) => {
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

// ===== COMPARTILHAR FOTOS =====
async function compartilharFotos() {
  const input = document.getElementById('fotosOcorrencia');
  const inputNumero = document.querySelector('input[name="numero"]');
  if (!input.files || input.files.length === 0) {
    alert('Nenhuma foto selecionada.');
    return;
  }
  const numeroRelatorio = inputNumero && inputNumero.value ? inputNumero.value : 'sem_numero';
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
        text: `Fotos do relatório de ocorrência ${numeroRelatorio}.`,
        files: arquivosRenomeados
      });
    } catch (err) { }
  } else {
    alert('Este navegador não suporta compartilhamento de arquivos.');
  }
}

/* Disable context menu */
        // Garante a execução após o HTML ser processado pelo navegador
        window.addEventListener('load', () => {
            
            // Bloqueio do menu de contexto com suporte a elementos filhos
            document.addEventListener('contextmenu', e => {
                const tagsPermitidas = ['INPUT', 'TEXTAREA', 'IMG'];
                
                // Busca se o clique foi na tag ou dentro dela
                if (e.target.closest(tagsPermitidas.join(','))) {
                    return; 
                }
                e.preventDefault();
            });

            // Bloqueio das teclas de inspeção (F12, Ctrl+Shift+I, etc.)
            document.addEventListener('keydown', e => {
                if (
                    e.key === 'F12' || 
                    (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) || 
                    (e.ctrlKey && e.key === 'u')
                ) {
                    e.preventDefault();
                }
            });
            
        });
