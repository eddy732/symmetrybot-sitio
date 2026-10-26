(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const feed = $('chatFeed');
  const options = $('replyPills');
  const form = $('chatForm');
  const input = $('chatInput');
  if (!feed || !options || !form || !input) return;
  const send = form.querySelector('button[type="submit"]');
  const voiceButton = $('voiceDemoButton');
  const tabs = [...document.querySelectorAll('.demo-tab[data-scenario]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const normalize = value => value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const money = value => `RD$${value.toLocaleString('es-DO')}`;
  const clock = () => new Date().toLocaleTimeString('es-DO', { hour: 'numeric', minute: '2-digit', hour12: true });
  let scenario = 'booking';
  let stage = 'service';
  let data = {};
  let choices = [];
  let timer = null;
  let epoch = 0;
  let busy = false;
  let submittedFromInput = false;
  let voiceProcessing = false;
  let hasVoiceDemo = false;

  function setText(id, text) {
    const element = $(id);
    if (element) element.textContent = text;
  }

  function outcome(title, detail, status, percent, step) {
    setText('outcomeTitle', title);
    setText('outcomeDetail', detail);
    setText('outcomeStatus', status);
    setText('demoStep', step);
    const progress = $('outcomeProgress');
    if (progress) {
      progress.style.width = `${percent}%`;
    }
  }

  function lock(value) {
    busy = value;
    input.disabled = value;
    if (send) send.disabled = value;
    [...options.children].forEach(button => { button.disabled = value; });
    feed.setAttribute('aria-busy', String(value));
    syncVoice();
  }

  function syncVoice() {
    if (!voiceButton) return;
    const finished = stage === 'done' || stage === 'handoff';
    voiceButton.disabled = busy || finished;
    voiceButton.classList.toggle('voice-ready', !hasVoiceDemo && !busy && !finished);
    voiceButton.classList.toggle('voice-processing', voiceProcessing);
    voiceButton.setAttribute('aria-label', stage === 'review'
      ? `Probar una nota de voz que confirma ${scenario === 'booking' ? 'la cita' : 'el pedido'} de ejemplo`
      : 'Probar una nota de voz de ejemplo');
    let hint = 'Prueba una nota de voz de ejemplo.';
    if (voiceProcessing) hint = 'Procesando una nota de voz de ejemplo…';
    else if (busy) hint = 'El asistente está respondiendo…';
    else if (finished) hint = 'Reinicia para probar otra nota de voz.';
    else if (stage === 'review') hint = `Esta nota confirmará ${scenario === 'booking' ? 'la cita' : 'el pedido'} de ejemplo.`;
    setText('voiceHint', hint);
  }

  function scrollFeed() {
    // Scroll only this bounded chat, preserving the visitor's page position.
    feed.scrollTop = feed.scrollHeight;
  }

  function message(text, author = 'assistant', receipt = false) {
    const bubble = document.createElement('div');
    bubble.className = `message ${author}`;
    const body = document.createElement('div');
    body.className = receipt ? 'message-text chat-receipt' : 'message-text';
    body.textContent = text;
    body.style.whiteSpace = 'pre-line';
    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = clock();
    time.setAttribute('aria-hidden', 'true');
    bubble.append(body, time);
    feed.append(bubble);
    // Keep repeated exploration light, without storing conversation data.
    while (feed.children.length > 45) feed.firstElementChild.remove();
    scrollFeed();
  }

  function showOptions(next) {
    choices = next;
    options.replaceChildren();
    next.forEach(choice => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = choice.label;
      button.disabled = busy;
      button.addEventListener('click', () => {
        submittedFromInput = false;
        select(choice);
      });
      options.append(button);
    });
  }

  function say(text, next = [], receipt = false) {
    const restoreFocus = submittedFromInput && document.activeElement === input;
    submittedFromInput = false;
    lock(true);
    showOptions([]);
    const generation = epoch;
    const typing = document.createElement('div');
    typing.className = 'typing';
    typing.setAttribute('aria-label', 'El asistente está escribiendo');
    for (let index = 0; index < 3; index++) typing.append(document.createElement('span'));
    feed.append(typing);
    scrollFeed();
    timer = window.setTimeout(() => {
      if (generation !== epoch) return;
      timer = null;
      typing.remove();
      message(text, 'assistant', receipt);
      lock(false);
      showOptions(next);
      // Keep Enter-based conversations usable without stealing focus after
      // a quick reply, scenario change, or navigation to another control.
      if (restoreFocus && (document.activeElement === document.body || document.activeElement === input)) {
        input.focus({ preventScroll: true });
      }
    }, reduceMotion.matches ? 0 : 420);
  }

  function voiceSample() {
    if (stage === 'name') return { text: 'Me llamo Carlos.', name: 'Carlos' };
    const choice = stage === 'faq' ? faqChoices[0] : choices[0];
    if (!choice || stage === 'done' || stage === 'handoff') return null;
    const samples = {
      service: `Quiero reservar un ${choice.name?.toLocaleLowerCase('es')}, por favor.`,
      slot: choice.date ? `Me viene bien el ${choice.date.toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long' })}, a las ${choice.date.toLocaleTimeString('es-DO', { hour: 'numeric', minute: '2-digit', hour12: true })}.` : '',
      product: `Quiero un ${choice.name?.toLocaleLowerCase('es')}, por favor.`,
      quantity: 'Solo un bowl, por favor.',
      pickup: 'Paso a recogerlo en veinte minutos.',
      review: `Sí, confirmo ${scenario === 'booking' ? 'la cita' : 'el pedido'} de ejemplo.`,
      faq: '¿Cuál es su horario de atención?'
    };
    return { text: samples[stage], choice };
  }

  function voiceMessage(text) {
    const bubble = document.createElement('div');
    bubble.className = 'message user voice-message voice-processing';
    const label = document.createElement('div');
    label.className = 'voice-label';
    label.textContent = 'Nota de voz de ejemplo';
    const row = document.createElement('div');
    row.className = 'voice-row';
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('width', '20');
    icon.setAttribute('height', '20');
    icon.setAttribute('class', 'voice-icon');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor');
    icon.setAttribute('stroke-width', '1.7');
    icon.setAttribute('stroke-linecap', 'round');
    icon.setAttribute('aria-hidden', 'true');
    const mic = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    mic.setAttribute('x', '9');
    mic.setAttribute('y', '3');
    mic.setAttribute('width', '6');
    mic.setAttribute('height', '12');
    mic.setAttribute('rx', '3');
    const stand = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    stand.setAttribute('d', 'M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8');
    icon.append(mic, stand);
    const waveform = document.createElement('div');
    waveform.className = 'voice-wave';
    waveform.setAttribute('aria-hidden', 'true');
    [8, 14, 22, 12, 30, 19, 26, 14, 32, 22, 13, 27, 19, 30, 15, 23, 12, 7].forEach((height, index) => {
      const bar = document.createElement('span');
      bar.style.height = `${height}px`;
      bar.style.animationDelay = `${index * -0.09}s`;
      waveform.append(bar);
    });
    const duration = document.createElement('span');
    duration.className = 'voice-duration';
    duration.textContent = '0:04';
    row.append(icon, waveform, duration);
    const status = document.createElement('div');
    status.className = 'voice-status';
    status.textContent = 'Procesando nota de ejemplo…';
    const transcript = document.createElement('details');
    transcript.className = 'voice-transcript';
    const summary = document.createElement('summary');
    summary.textContent = 'Ver transcripción';
    const words = document.createElement('p');
    words.textContent = text;
    transcript.append(summary, words);
    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = clock();
    time.setAttribute('aria-hidden', 'true');
    bubble.append(label, row, status, transcript, time);
    feed.append(bubble);
    while (feed.children.length > 45) feed.firstElementChild.remove();
    scrollFeed();
    return { bubble, status };
  }

  function demoVoice() {
    if (busy) return;
    const sample = voiceSample();
    if (!sample?.text) return;
    submittedFromInput = false;
    hasVoiceDemo = true;
    voiceProcessing = true;
    form.classList.add('has-voice-demo');
    const generation = epoch;
    const note = voiceMessage(sample.text);
    lock(true);
    // This is a preset demonstration. It never requests microphone access,
    // records sound, plays synthetic audio, or performs speech recognition.
    timer = window.setTimeout(() => {
      if (generation !== epoch) return;
      timer = null;
      voiceProcessing = false;
      note.bubble.classList.remove('voice-processing');
      note.status.textContent = 'Transcripción de ejemplo';
      lock(false);
      if (sample.name) {
        data.name = sample.name;
        review();
      } else {
        select(sample.choice, true);
      }
    }, reduceMotion.matches ? 0 : 900);
  }

  const services = [
    { label: 'Corte · RD$500', value: 'cut', name: 'Corte de cabello', price: 500, match: /^(corte|corte de cabello|cabello|corte sin barba|solo corte|500|corte 500)$/ },
    { label: 'Corte + barba · RD$750', value: 'beard', name: 'Corte + barba', price: 750, match: /^(corte\s*(?:\+|y|con)\s*barba|corte de cabello y barba|barba|750)$/ }
  ];
  const products = [
    { label: 'Bowl mediterráneo · RD$390', value: 'med', name: 'Bowl mediterráneo', price: 390, match: /^(bowl mediterraneo|mediterraneo|vegetal|vegetariano|390)$/ },
    { label: 'Bowl de pollo · RD$450', value: 'chicken', name: 'Bowl de pollo', price: 450, match: /^(bowl (?:de |con )?pollo|pollo|chicken|450)$/ }
  ];
  const faqChoices = [
    { label: 'Ver horarios', value: 'hours', match: /^(horarios?|ver horarios?|a que hora abren|a que hora cierran)$/ },
    { label: 'Servicios y precios', value: 'prices', match: /^(servicios?|precios?|servicios y precios|costos?|cuanto cuesta)$/ },
    { label: 'Hablar con una persona', value: 'human', match: /^(persona|humano|humana|asesor|equipo|hablar con una persona|hablar con el equipo)$/ }
  ];

  function availableSlots() {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(16, 0, 0, 0);
    // This example business closes on Sundays.
    if (nextDay.getDay() === 0) nextDay.setDate(nextDay.getDate() + 1);
    const followingDay = new Date(nextDay);
    followingDay.setDate(followingDay.getDate() + 1);
    followingDay.setHours(11, 0, 0, 0);
    if (followingDay.getDay() === 0) followingDay.setDate(followingDay.getDate() + 1);
    return [nextDay, followingDay].map((date, index) => {
      const dateText = date.toLocaleDateString('es-DO', { weekday: 'short', day: 'numeric', month: 'short' });
      const time = date.toLocaleTimeString('es-DO', { hour: 'numeric', minute: '2-digit', hour12: true });
      return { label: `${dateText} · ${time}`, value: `slot${index}`, date, summary: `${dateText}, ${time}`, match: index === 0 ? /^(1|primero|primer horario|primera opcion|4|4:00|16|16:00)$/ : /^(2|segundo|segundo horario|segunda opcion|11|11:00)$/ };
    });
  }

  function reset(nextScenario = scenario) {
    epoch++;
    submittedFromInput = false;
    voiceProcessing = false;
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
    scenario = ['booking', 'order', 'faq'].includes(nextScenario) ? nextScenario : 'booking';
    stage = scenario === 'booking' ? 'service' : scenario === 'order' ? 'product' : 'faq';
    data = {};
    input.value = '';
    input.placeholder = 'Escribe o elige una opción';
    input.maxLength = 120;
    feed.replaceChildren();
    lock(false);
    tabs.forEach(tab => {
      const selected = tab.dataset.scenario === scenario;
      tab.setAttribute('aria-pressed', String(selected));
      tab.classList.toggle('active', selected);
    });
    setText('chatBusiness', scenario === 'order' ? 'Casa Oliva' : 'Estudio Norte');
    setText('chatBusinessSubtitle', 'Asistente de ejemplo · en línea');
    if (scenario === 'booking') {
      stage = 'service';
      outcome('Una conversación. Una cita.', 'Elige un servicio y mira cómo se organiza la reserva.', 'Esperando tu mensaje', 0, '01 / 04');
      message('Hola, soy el asistente de Estudio Norte. ¿Qué servicio te gustaría reservar? Elige una opción o prueba una nota de voz.');
      showOptions(services);
    } else if (scenario === 'order') {
      stage = 'product';
      outcome('Del chat a la cocina.', 'Arma un pedido de ejemplo para recoger en el local.', 'Esperando tu mensaje', 0, '01 / 05');
      message('Bienvenido a Casa Oliva. ¿Qué te apetece hoy? Elige un bowl para preparar un pedido de ejemplo.');
      showOptions(products);
    } else {
      stage = 'faq';
      outcome('La respuesta, a tiempo.', 'Consulta información o prueba cómo se deriva una conversación.', 'Consulta de ejemplo', 0, '01 / 02');
      message('Hola, estás en Estudio Norte. Puedo ayudarte con nuestros horarios y servicios, o pasar tu consulta al equipo. ¿Qué necesitas?');
      showOptions(faqChoices);
    }
  }

  function handoff() {
    stage = 'handoff';
    input.placeholder = 'Escribe o elige una opción';
    outcome('Tu equipo toma el relevo.', 'La conversación queda lista para que una persona continúe con el contexto.', 'Derivación simulada', 100, '02 / 02');
    say('En un negocio conectado, aquí pasaríamos tu consulta al equipo con el contexto de la conversación. Esta es una simulación: no se ha enviado ningún mensaje a una persona.', [
      { label: 'Probar una reserva', value: 'booking' },
      { label: 'Reiniciar', value: 'restart' }
    ]);
  }

  function askName() {
    stage = 'name';
    input.placeholder = 'Tu nombre para el ejemplo';
    input.maxLength = 45;
    outcome(scenario === 'booking' ? 'El horario está elegido.' : 'El pedido toma forma.', 'Solo falta un nombre para preparar el resumen.', 'Datos del cliente', scenario === 'booking' ? 60 : 65, scenario === 'booking' ? '03 / 04' : '04 / 05');
    say('¿A nombre de quién lo preparo? Puedes usar un nombre de ejemplo.');
  }

  function review() {
    stage = 'review';
    input.placeholder = 'Confirma o edita el resumen';
    input.maxLength = 120;
    const summary = scenario === 'booking'
      ? `${data.name}\n${data.service.name} · ${money(data.service.price)}\n${data.slot.summary}`
      : `${data.name}\n${data.quantity} × ${data.product.name}\nRecogida: ${data.pickup}\nTotal del ejemplo: ${money(data.product.price * data.quantity)}`;
    outcome('Todo listo para revisar.', scenario === 'booking' ? `${data.service.name} · ${data.slot.summary}` : `${data.quantity} × ${data.product.name} · ${money(data.product.price * data.quantity)}`, 'Pendiente de confirmación', 85, scenario === 'booking' ? '04 / 04' : '05 / 05');
    say(`Revisa los detalles antes de confirmar:\n\n${summary}\n\n¿Está todo correcto?`, [
      { label: scenario === 'booking' ? 'Confirmar cita' : 'Confirmar pedido', value: 'confirm', match: /^(si|confirmar|confirmo|correcto|todo correcto|confirmar cita|confirmar pedido)$/ },
      { label: 'Editar detalles', value: 'edit', match: /^(editar|editar detalles|cambiar|cambiar detalles|corregir|modificar|no)$/ }
    ], true);
  }

  function confirm() {
    stage = 'done';
    input.placeholder = 'Prueba otra conversación';
    if (scenario === 'booking') {
      outcome('Una cita bien organizada.', `${data.name} · ${data.service.name}\n${data.slot.summary}`, 'Cita de ejemplo confirmada', 100, '04 / 04');
      say(`Listo, ${data.name}. Así recibiría tu cliente la confirmación:\n\n${data.service.name}\n${data.slot.summary}\n${money(data.service.price)}\n\nDemostración completada. No se ha reservado un horario real.`, [
        { label: 'Probar pedidos', value: 'order' },
        { label: 'Repetir reserva', value: 'restart' }
      ], true);
    } else {
      outcome('Un pedido listo para seguir.', `${data.quantity} × ${data.product.name}\n${data.pickup} · ${money(data.product.price * data.quantity)}`, 'Pedido de ejemplo confirmado', 100, '05 / 05');
      say(`Listo, ${data.name}. Este sería el resumen para tu cliente:\n\n${data.quantity} × ${data.product.name}\nRecogida: ${data.pickup}\nTotal del ejemplo: ${money(data.product.price * data.quantity)}\n\nDemostración completada. No se ha creado un pedido ni realizado un cobro.`, [
        { label: 'Probar reservas', value: 'booking' },
        { label: 'Repetir pedido', value: 'restart' }
      ], true);
    }
  }

  function select(choice, alreadyShown = false) {
    if (busy) return;
    if (choice.value === 'restart') { reset(); return; }
    if (['booking', 'order', 'faq'].includes(choice.value)) { reset(choice.value); return; }
    if (!alreadyShown) message(choice.label, 'user');
    if (choice.value === 'human') { handoff(); return; }
    if (stage === 'service') {
      data.service = choice;
      stage = 'slot';
      outcome('El servicio está claro.', `${choice.name} · ${money(choice.price)}. Ahora el cliente elige un horario.`, 'Buscando el mejor momento', 30, '02 / 04');
      say('Estos son dos horarios de ejemplo. ¿Cuál te viene mejor?', availableSlots());
    } else if (stage === 'slot') {
      data.slot = choice;
      askName();
    } else if (stage === 'product') {
      data.product = choice;
      stage = 'quantity';
      outcome('Una elección hecha.', `${choice.name} · ${money(choice.price)} por unidad.`, 'Armando el pedido', 20, '02 / 05');
      say('Buena elección. ¿Cuántos bowls quieres?', [1, 2, 3].map(number => ({ label: `${number} ${number === 1 ? 'bowl' : 'bowls'}`, value: String(number), quantity: number, match: new RegExp(`^(?:${number}|${['', 'un|uno|una', 'dos', 'tres'][number]})(?: bowls?)?$`) })));
    } else if (stage === 'quantity') {
      data.quantity = choice.quantity;
      stage = 'pickup';
      outcome('La cantidad, resuelta.', `${data.quantity} × ${data.product.name} · ${money(data.quantity * data.product.price)}`, 'Organizando la recogida', 40, '03 / 05');
      say('Este pedido de ejemplo es para recoger en el local. ¿Cuándo pasarías?', [
        { label: 'En 20 minutos', value: 'twenty', pickup: 'En 20 minutos', match: /^(?:en )?(?:20|veinte)(?: minutos)?$/ },
        { label: 'En 40 minutos', value: 'forty', pickup: 'En 40 minutos', match: /^(?:en )?(?:40|cuarenta)(?: minutos)?$/ }
      ]);
    } else if (stage === 'pickup') {
      data.pickup = choice.pickup;
      askName();
    } else if (stage === 'review') {
      if (choice.value === 'confirm') confirm();
      else if (choice.value === 'edit') {
        data = {};
        stage = scenario === 'booking' ? 'service' : 'product';
        outcome('Ajustamos los detalles.', 'Puedes elegir de nuevo antes de confirmar.', 'Editando el ejemplo', 0, scenario === 'booking' ? '01 / 04' : '01 / 05');
        say(scenario === 'booking' ? 'Claro. Empecemos por el servicio que quieres reservar.' : 'Claro. Elige el bowl que prefieres.', scenario === 'booking' ? services : products);
      }
    } else if (stage === 'faq') {
      outcome('Una duda menos.', 'El asistente responde con la información configurada del negocio.', 'Consulta resuelta', 100, '02 / 02');
      if (choice.value === 'hours') say('En este negocio de ejemplo abrimos de lunes a sábado, de 9:00 a. m. a 7:00 p. m. Los domingos descansamos. ¿Quieres probar cómo se reserva una cita?', [{ label: 'Reservar una cita', value: 'booking' }, ...faqChoices.filter(item => item.value !== 'hours')]);
      else if (choice.value === 'prices') say('Nuestros servicios de ejemplo son:\n\nCorte de cabello · RD$500\nCorte + barba · RD$750\n\nPuedo ayudarte a elegir un horario.', [{ label: 'Reservar una cita', value: 'booking' }, ...faqChoices.filter(item => item.value !== 'prices')]);
    }
  }

  function submit(event) {
    event.preventDefault();
    if (busy) return;
    const raw = input.value.trim();
    if (!raw) return;
    submittedFromInput = document.activeElement === input;
    input.value = '';
    const text = normalize(raw);
    if (/^(reiniciar|repetir|empezar de nuevo|volver al inicio)$/.test(text)) { reset(); return; }
    message(raw, 'user');
    if (/^(?:quiero )?(?:hablar con (?:una? )?)?(persona|humano|humana|asesor|agente)$/.test(text)) { handoff(); return; }
    if (stage === 'name') {
      const name = raw.replace(/^(?:me llamo|mi nombre es|soy)\s+/i, '').trim();
      const validName = /^[\p{L}][\p{L}\p{M}\s.'’-]{1,44}$/u.test(name) && !/\b(quiero|horario|precio|reservar|cambiar|pedido|ayuda|hola|gracias|cita)\b/.test(normalize(name));
      if (!validName) {
        say('Escribe solo un nombre, como Ana o Carlos. También puedes usar un nombre ficticio para completar el ejemplo.');
        return;
      }
      data.name = name;
      review();
      return;
    }
    const match = choices.find(choice => normalize(choice.label) === text || normalize(choice.value) === text || (choice.match && choice.match.test(text)));
    if (match) { select(match, true); return; }
    if ((stage === 'done' || stage === 'handoff' || stage === 'faq') && /^(cita|reservas?|reservar|reservar una cita|probar reservas|corte)$/.test(text)) { reset('booking'); return; }
    if ((stage === 'done' || stage === 'handoff') && /^(pedidos?|probar pedidos|hacer un pedido|comida|bowl)$/.test(text)) { reset('order'); return; }
    const currentChoices = [...choices];
    const guidance = {
      service: 'En este ejemplo puedes elegir corte de cabello o corte + barba. Selecciona el servicio que prefieras.',
      slot: 'Para esta simulación, elige uno de los dos horarios disponibles. También puedes escribir 1 o 2.',
      product: 'El menú de ejemplo incluye bowl mediterráneo y bowl de pollo. ¿Cuál te gustaría probar?',
      quantity: 'Puedes pedir 1, 2 o 3 bowls en este ejemplo. ¿Cuántos quieres?',
      pickup: 'En esta demo solo simulamos recogidas en el local. Elige en 20 o en 40 minutos.',
      review: 'Antes de terminar, confirma los detalles o elige Editar para cambiarlos.',
      faq: 'En esta demostración puedo mostrarte horarios, servicios y precios, o cómo pasa una conversación al equipo.',
      done: 'El ejemplo está completado. Puedes repetirlo o probar otra conversación.',
      handoff: 'La derivación es solo un ejemplo. Puedes reiniciar o probar una reserva.'
    };
    say(guidance[stage] || 'Elige una de las opciones para continuar con el ejemplo.', currentChoices);
  }

  form.addEventListener('submit', submit);
  voiceButton?.addEventListener('click', demoVoice);
  tabs.forEach(tab => tab.addEventListener('click', () => reset(tab.dataset.scenario)));
  $('demoReset')?.addEventListener('click', () => reset());
  reset();
})();
