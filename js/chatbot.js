(function () {
  'use strict';

  const KB = [
    {
      keys: ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening', 'howdy', 'greet'],
      reply: "Namaste! 🙏 Welcome to Wangduk Health and Research. I'm your virtual assistant. How can I help you today?\n\nYou can ask me about our services, doctors, timings, appointments, or anything else!"
    },
    {
      keys: ['service', 'specialit', 'department', 'treatment', 'offer', 'provide', 'facility', 'facilities'],
      reply: "We offer a wide range of medical services:\n\n🫀 <b>Cardiology</b> — Heart care & diagnostics\n🦴 <b>Orthopedics</b> — Bone, joint & spine care\n🧠 <b>MRI Scan</b> — Advanced 3T MRI imaging\n🔬 <b>CT Scan</b> — High-resolution CT imaging\n🩺 <b>Diagnostics</b> — Lab tests & pathology\n🚑 <b>Emergency Care</b> — 24×7 emergency services\n\nAsk me about any specific service for more details!"
    },
    {
      keys: ['cardiology', 'heart', 'cardiac', 'ecg', 'echocardiograph'],
      reply: "❤️ <b>Cardiology Department</b>\n\nOur cardiology unit provides comprehensive heart care including:\n• ECG & Echocardiography\n• Stress testing\n• Holter monitoring\n• Cardiac consultation\n• Preventive heart care\n\nOur cardiologists are available Mon–Sat. Book an appointment at the reception or call <b>9263403905</b>."
    },
    {
      keys: ['orthopedic', 'ortho', 'bone', 'joint', 'knee', 'spine', 'fracture', 'back pain', 'shoulder'],
      reply: "🦴 <b>Orthopedics Department</b>\n\nWe treat all bone, joint, and muscular conditions:\n• Fracture management\n• Joint replacement\n• Spine care & surgery\n• Sports injuries\n• Arthritis treatment\n• Physiotherapy\n\nConsultation available Mon–Sat. Call <b>9263403905</b> to book."
    },
    {
      keys: ['mri', 'magnetic resonance', 'scan mri', 'mri scan'],
      reply: "🧠 <b>MRI Scan Facility</b>\n\nWe have a state-of-the-art MRI scanner providing:\n• Brain & spine MRI\n• Abdominal MRI\n• Musculoskeletal MRI\n• Cardiac MRI\n• Full-body MRI\n\n⏰ Timings: 8:00 AM – 8:00 PM daily\n📞 Booking: <b>9263403905</b>\n\nResults usually available within 24 hours."
    },
    {
      keys: ['ct', 'ct scan', 'computed tomography', 'cat scan'],
      reply: "🔬 <b>CT Scan Facility</b>\n\nOur high-resolution CT scanner supports:\n• Chest & abdominal CT\n• Head & brain CT\n• Angiography\n• Virtual colonoscopy\n• Trauma evaluation\n\n⏰ Available 24×7 for emergencies\n📅 Scheduled: 8 AM – 8 PM\n📞 <b>9263403905</b>"
    },
    {
      keys: ['diagnostic', 'lab', 'pathology', 'blood test', 'urine test', 'report', 'test'],
      reply: "🩺 <b>Diagnostics & Laboratory</b>\n\nOur pathology lab offers:\n• Complete blood count (CBC)\n• Thyroid, sugar & liver panels\n• Urine & stool analysis\n• Culture & sensitivity\n• X-ray & ultrasound\n• All routine & special tests\n\n⏰ Sample collection: 7 AM – 12 PM\n📋 Reports: usually same-day or next-day\n📞 <b>9263403905</b>"
    },
    {
      keys: ['emergency', 'urgent', 'ambulance', 'accident', 'casualty', 'icu', 'critical', '24 hour', '24×7', '24/7'],
      reply: "🚑 <b>Emergency Services — 24×7</b>\n\nOur emergency department is open round the clock!\n\n📞 <b>Emergency Hotline: 9263403905</b>\n\nWe handle:\n• Road accidents & trauma\n• Cardiac emergencies\n• Stroke care\n• Respiratory emergencies\n• Surgical emergencies\n• Pediatric emergencies\n\nAn ambulance can be dispatched immediately. Please call us right away in case of an emergency."
    },
    {
      keys: ['appointment', 'book', 'schedule', 'consult', 'visit', 'opd', 'register', 'walk-in'],
      reply: "📅 <b>Book an Appointment</b>\n\nYou can book an appointment in 3 ways:\n\n1️⃣ <b>Online</b> — Use the <a href='#appointment' style='color:#2563eb'>Book Appointment</a> form on this page\n2️⃣ <b>Phone</b> — Call us at <b>9263403905</b>\n3️⃣ <b>Walk-in</b> — Visit our reception at Bistupur, Jamshedpur\n\n⏰ OPD Hours: Mon–Sat 9 AM – 7 PM\n⏰ Emergency: 24×7"
    },
    {
      keys: ['timing', 'time', 'hour', 'opd', 'open', 'close', 'when', 'schedule'],
      reply: "⏰ <b>Hospital Timings</b>\n\n🏥 <b>OPD (Out-Patient)</b>: Mon–Sat, 9:00 AM – 7:00 PM\n🚑 <b>Emergency</b>: 24 Hours, 7 Days a Week\n🔬 <b>Lab & Diagnostics</b>: 7:00 AM – 8:00 PM\n🧠 <b>MRI / CT Scan</b>: 8:00 AM – 8:00 PM\n💊 <b>Pharmacy</b>: 24×7\n\nFor Sunday appointments, please call us in advance."
    },
    {
      keys: ['location', 'address', 'where', 'direction', 'find', 'reach', 'bistupur', 'jamshedpur', 'jharkhand', 'map'],
      reply: "📍 <b>Our Location</b>\n\n<b>Wangduk Health and Research</b>\nBistupur, Jamshedpur\nJharkhand, India\n\n🗺️ Easily accessible by auto, bus, and cab from all parts of Jamshedpur.\n\nUse the <a href='#reach-us' style='color:#2563eb'>Reach Us</a> section on our website for a live map and directions."
    },
    {
      keys: ['contact', 'phone', 'number', 'call', 'helpline', 'telephone'],
      reply: "📞 <b>Contact Us</b>\n\n<b>Main Helpline:</b> 9263403905\n<b>Emergency:</b> 9263403905 (24×7)\n\n📍 Bistupur, Jamshedpur, Jharkhand\n\nOur staff is available during OPD hours (9 AM – 7 PM) and emergency support is available round the clock."
    },
    {
      keys: ['doctor', 'staff', 'surgeon', 'physician', 'specialist', 'team', 'wangduk', 'director', 'laslong', 'professor', 'prof'],
      reply: "👨‍⚕️ <b>Our Medical Team</b>\n\n<b>Prof. Laslong Wangduk</b>\nFounder & Medical Director\nOver 35 years of clinical experience in internal medicine and hospital management.\n\nOur team includes specialist doctors in Cardiology, Orthopedics, Radiology, Pathology, and General Medicine — all highly qualified and experienced.\n\nVisit the <a href='#team' style='color:#2563eb'>Our Team</a> section for full profiles."
    },
    {
      keys: ['fee', 'charge', 'cost', 'price', 'consultation fee', 'rate', 'how much', 'pay'],
      reply: "💰 <b>Consultation Fees</b>\n\nOur fees are affordable and transparent:\n\n• General OPD: ₹200 – ₹400\n• Specialist Consultation: ₹400 – ₹800\n• Emergency Care: As per treatment\n• Lab tests & scans: Priced per test\n\nWe accept cash and most UPI/online payments. For exact fee details, please call <b>9263403905</b>."
    },
    {
      keys: ['insurance', 'cashless', 'medic', 'claim', 'tpa', 'cover', 'policy'],
      reply: "🏦 <b>Insurance & Cashless Facility</b>\n\nWe accept most major health insurance plans and TPA cashless facilities.\n\nPlease bring your insurance card/policy documents at the time of admission. Our billing team will assist with the cashless claim process.\n\nFor details, call <b>9263403905</b> or visit our billing counter."
    },
    {
      keys: ['admission', 'admit', 'ward', 'bed', 'inpatient', 'ipu', 'room'],
      reply: "🛏️ <b>Admission & Ward Facilities</b>\n\nWe offer:\n• General ward\n• Semi-private rooms\n• Private rooms\n• ICU / Critical care\n\nAdmission is available 24×7 through our emergency or OPD.\n\nFor bed availability, call <b>9263403905</b>."
    },
    {
      keys: ['pharmacy', 'medicine', 'drug', 'chemist'],
      reply: "💊 <b>In-House Pharmacy</b>\n\nOur pharmacy is open <b>24×7</b> and stocks a full range of prescription and OTC medicines.\n\nPrescriptions from our doctors are filled immediately. We also stock surgical supplies and medical equipment."
    },
    {
      keys: ['parking', 'park', 'vehicle', 'car'],
      reply: "🅿️ <b>Parking</b>\n\nAmple parking space is available at our Bistupur campus for cars, two-wheelers, and ambulances.\n\nParking is <b>free of charge</b> for patients and visitors."
    },
    {
      keys: ['covid', 'corona', 'virus', 'vaccination', 'vaccine', 'pcr', 'antigen'],
      reply: "🦠 <b>COVID-19 Services</b>\n\nWe offer:\n• COVID PCR & Rapid Antigen testing\n• COVID-19 vaccination guidance\n• Post-COVID care & follow-up\n\nFor the latest COVID protocols, call <b>9263403905</b>."
    },
    {
      keys: ['child', 'pediatric', 'baby', 'infant', 'kid', 'newborn', 'children'],
      reply: "👶 <b>Pediatric Care</b>\n\nWe provide healthcare for children of all ages, including:\n• Newborn care\n• Growth & development check-ups\n• Vaccinations\n• Pediatric emergencies\n\nOur child-friendly environment ensures a comfortable experience for young patients. Call <b>9263403905</b>."
    },
    {
      keys: ['women', 'gynecology', 'gynaecology', 'obstetric', 'pregnancy', 'maternity', 'lady', 'female'],
      reply: "👩 <b>Women's Health</b>\n\nWe offer comprehensive women's healthcare including:\n• Gynaecology consultations\n• Antenatal & postnatal care\n• High-risk pregnancy management\n• Preventive screenings\n\nOur women's health specialists are available Mon–Sat. Book via <b>9263403905</b>."
    },
    {
      keys: ['blood', 'blood bank', 'donate', 'donation', 'transfusion'],
      reply: "🩸 <b>Blood Bank</b>\n\nOur in-house blood bank maintains a supply of all blood groups.\n\nFor blood requirements, please contact our emergency desk at <b>9263403905</b>. Blood donation camps are organised periodically — watch our updates section!"
    },
    {
      keys: ['physiotherapy', 'physio', 'rehab', 'rehabilitation', 'exercise', 'therapy'],
      reply: "🏃 <b>Physiotherapy & Rehabilitation</b>\n\nOur physiotherapy unit offers:\n• Post-surgical rehabilitation\n• Sports injury recovery\n• Neurological rehabilitation\n• Musculoskeletal therapy\n• Geriatric care\n\nTimings: Mon–Sat, 9 AM – 5 PM. Appointment via <b>9263403905</b>."
    },
    {
      keys: ['about', 'history', 'background', 'established', 'founded', 'since', '1889', 'legacy'],
      reply: "🏥 <b>About Wangduk Health and Research</b>\n\nFounded in <b>1889</b>, Wangduk Health and Research has over 135 years of healing legacy.\n\nWe are a multi-speciality hospital located in Bistupur, Jamshedpur, committed to delivering advanced healthcare with compassion and excellence.\n\nLed by <b>Prof. Laslong Wangduk</b>, our team combines modern technology with personalised patient care."
    },
    {
      keys: ['thank', 'thanks', 'thnx', 'ty', 'great', 'good', 'awesome', 'wonderful', 'helpful', 'bye', 'goodbye', 'see you'],
      reply: "😊 Thank you for reaching out! We're always here to help.\n\nFor any further queries, feel free to call us at <b>9263403905</b> or visit us at Bistupur, Jamshedpur.\n\nWishing you good health! 🌿"
    }
  ];

  const FALLBACK = "I'm sorry, I didn't quite catch that. Could you please rephrase?\n\nYou can ask me about:\n• Services & Departments\n• Appointment booking\n• Timings & Location\n• Doctors & Staff\n• Fees & Insurance\n• Emergency contact\n\nOr call us directly at <b>9263403905</b>.";

  function getReply(text) {
    const lower = text.toLowerCase().trim();
    for (const item of KB) {
      if (item.keys.some(k => lower.includes(k))) return item.reply;
    }
    return FALLBACK;
  }

  function createMsg(html, from) {
    const wrap = document.createElement('div');
    wrap.className = 'chatbot__msg chatbot__msg--' + from;
    const bubble = document.createElement('div');
    bubble.className = 'chatbot__bubble';
    bubble.innerHTML = html.replace(/\n/g, '<br>');
    wrap.appendChild(bubble);
    return wrap;
  }

  function appendMsg(container, html, from) {
    const el = createMsg(html, from);
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
    return el;
  }

  function showTyping(container) {
    const wrap = document.createElement('div');
    wrap.className = 'chatbot__msg chatbot__msg--bot chatbot__msg--typing';
    wrap.innerHTML = '<div class="chatbot__bubble"><span class="chatbot__dot"></span><span class="chatbot__dot"></span><span class="chatbot__dot"></span></div>';
    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;
    return wrap;
  }

  function init() {
    const toggle   = document.getElementById('chatbotToggle');
    const window_  = document.getElementById('chatbotWindow');
    const closeBtn = document.getElementById('chatbotClose');
    const messages = document.getElementById('chatbotMessages');
    const form     = document.getElementById('chatbotForm');
    const input    = document.getElementById('chatbotInput');
    const badge    = document.getElementById('chatbotBadge');
    const chips    = document.getElementById('chatbotChips');
    let opened = false;

    function openChat() {
      window_.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      toggle.querySelector('.chatbot__toggle-icon--open').hidden = true;
      toggle.querySelector('.chatbot__toggle-icon--close').hidden = false;
      badge.hidden = true;
      if (!opened) {
        opened = true;
        setTimeout(() => {
          appendMsg(messages, "Namaste! 🙏 I'm the Wangduk Health virtual assistant. How can I help you today?", 'bot');
        }, 300);
      }
      setTimeout(() => input.focus(), 100);
    }

    function closeChat() {
      window_.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('.chatbot__toggle-icon--open').hidden = false;
      toggle.querySelector('.chatbot__toggle-icon--close').hidden = true;
    }

    toggle.addEventListener('click', () => window_.hidden ? openChat() : closeChat());
    closeBtn.addEventListener('click', closeChat);

    chips.addEventListener('click', e => {
      const chip = e.target.closest('.chatbot__chip');
      if (!chip) return;
      sendMsg(chip.dataset.msg);
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      sendMsg(text);
      input.value = '';
    });

    function sendMsg(text) {
      appendMsg(messages, text, 'user');
      const typing = showTyping(messages);
      const delay = 600 + Math.random() * 600;
      setTimeout(() => {
        typing.remove();
        appendMsg(messages, getReply(text), 'bot');
      }, delay);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
