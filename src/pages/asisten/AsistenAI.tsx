import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, RefreshCw } from 'lucide-react';
import './asistenAI.css';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'SOP jika koloni hijau TCBS > 10% dari TVC',
  'Standar Stress Test Formalin & Salinitas',
  'Rumus perhitungan amonia bebas (NH3)',
  'Jadwal dan baku mutu alkalinitas air',
  'Tindakan darurat DO bak drop < 4 ppm'
];

const KNOWLEDGE_RESPONSES: Record<string, string> = {
  'tcbs': `🔬 **SOP Penanganan Koloni Hijau TCBS Tinggi (>10% TVC):**
1. **Identifikasi:** Koloni hijau menandakan dominasi bakteri Vibrio patogen (seperti V. parahaemolyticus / V. harveyi).
2. **Tindakan Lapangan:**
   • Hentikan penambahan pakan berlebih (hindari akumulasi bahan organik dasar).
   • Berikan inokulasi probiotik bakteri menguntungkan (Bacillus sp.) dosis 3 - 5 ppm.
   • Lakukan pergantian air bertahap 20% - 30% dengan air steril pasca-ozonisasi.
   • Uji ulang plating TCBS setelah 24 jam.`,

  'stress': `🛡️ **Standar Baku Mutu Stress Test PL (QC Pra-Kirim §09):**
• **Formalin Stress Test:** Rendam 100 ekor PL dalam larutan Formalin 100 ppm selama 30 menit. Syarat kelulusan: **Survival Rate ≥ 95%**.
• **Salinity Stress Test:** Pindahkan sampel PL ke air tawar (0 ppt) selama 30 menit, lalu kembalikan ke salinitas normal. Syarat kelulusan: **Survival Rate ≥ 95%**.
• **Keseragaman Ukuran (CV):** Harus **≤ 10%** dengan Rasio Otot:Usus (MGR) minimal **3:1**.`,

  'nh3': `🧪 **Kalkulasi & Batas Amonia Bebas (NH3 §04):**
• **Rumus:** NH3 dihitung otomatis dari Total Amonia Nitrogen (TAN), pH, dan Suhu air bak.
• Semakin tinggi suhu dan pH air, semakin besar proporsi amonia yang berubah menjadi bentuk gas NH3 beracun.
• **Ambang Bahaya:** NH3 > 0.05 mg/L dapat mengiritasi insang larva dan memicu kematian molting.`,

  'alkalinitas': `💧 **Standar Alkalinitas Air Hatchery (§04):**
• **Frekuensi Pengukuran:** Diukur **3x per minggu** (bukan harian).
• **Ambang Batas Aman:** **100 – 150 mg/L (sebagai CaCO3)**.
• **Fungsi:** Menjaga kapasitas buffer kestabilan pH air agar fluktuasi harian tetap ≤ 0.4.`,

  'do': `🚨 **Tindakan Darurat DO Rendah (< 4.0 ppm):**
1. Segera periksa suplai blower dan bersihkan batu aerasi yang tersumbat biofilm.
2. Tambahkan batu aerasi cadangan ke sudut-sudut bak yang mengalami stagnasi aliran.
3. Berikan aerasi murni atau hidrogen peroksida encer bila dalam kondisi kritis.
4. Lakukan penyiponan kotoran dasar bak untuk mengurangi beban biological oxygen demand (BOD).`
};

export function AsistenAI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Halo! Saya Asisten AI Operasional Prima Larvae. Silakan ajukan pertanyaan terkait diagnosa kualitas air, baku mutu SOP laboratorium, atau kalkulasi pakan hatchery.',
      timestamp: new Date().toLocaleTimeString().slice(0, 5)
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString().slice(0, 5)
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = 'Pertanyaan Anda tercatat. Berdasarkan buku acuan teknis Prima Larvae, seluruh parameter pengukuran harus selalu diselaraskan dengan baku mutu resmi PDF. Untuk penanganan di lapangan, koordinasikan dengan Kepala Divisi atau Analis Lab.';
      const lower = text.toLowerCase();

      if (lower.includes('tcbs') || lower.includes('hijau') || lower.includes('vibrio')) {
        reply = KNOWLEDGE_RESPONSES['tcbs'];
      } else if (lower.includes('stress') || lower.includes('formalin') || lower.includes('salinitas')) {
        reply = KNOWLEDGE_RESPONSES['stress'];
      } else if (lower.includes('nh3') || lower.includes('amonia') || lower.includes('tan')) {
        reply = KNOWLEDGE_RESPONSES['nh3'];
      } else if (lower.includes('alkalinitas') || lower.includes('buffer')) {
        reply = KNOWLEDGE_RESPONSES['alkalinitas'];
      } else if (lower.includes('do') || lower.includes('oksigen') || lower.includes('drop')) {
        reply = KNOWLEDGE_RESPONSES['do'];
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString().slice(0, 5)
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 400);
  };

  const handleReset = () => {
    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: 'Halo! Saya Asisten AI Operasional Prima Larvae. Silakan ajukan pertanyaan terkait diagnosa kualitas air, baku mutu SOP laboratorium, atau kalkulasi pakan hatchery.',
        timestamp: new Date().toLocaleTimeString().slice(0, 5)
      }
    ]);
  };

  return (
    <div className="asisten-workspace">
      {/* Messages Stream — Natural borderless conversation */}
      <div className="asisten-stream">
        <div className="asisten-stream-inner">
          {messages.map(msg => (
            <div key={msg.id} className={`asisten-turn asisten-turn--${msg.sender}`}>
              <div className="asisten-turn-avatar">
                {msg.sender === 'ai' ? <Bot size={16} /> : <User size={15} />}
              </div>
              <div className="asisten-turn-content">
                <div className="asisten-turn-header">
                  <span className="asisten-turn-name">
                    {msg.sender === 'ai' ? 'Asisten Prima' : 'Anda'}
                  </span>
                  <span className="asisten-turn-time">{msg.timestamp}</span>
                </div>
                <div className="asisten-turn-body" style={{ whiteSpace: 'pre-line' }}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="asisten-turn asisten-turn--ai">
              <div className="asisten-turn-avatar"><Bot size={16} /></div>
              <div className="asisten-turn-content">
                <div className="asisten-typing-dots">
                  <span className="dot" /><span className="dot" /><span className="dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Docked Floating Footer Input Area */}
      <div className="asisten-footer-dock">
        <div className="asisten-footer-inner">
          {/* Quick Action Prompt Chips */}
          <div className="asisten-prompt-chips">
            <span className="asisten-chips-lbl"><Sparkles size={12} /> Topik SOP:</span>
            {QUICK_PROMPTS.map((prompt, i) => (
              <button 
                key={i} 
                className="asisten-chip-btn"
                onClick={() => handleSend(prompt)}
              >
                {prompt}
              </button>
            ))}
            <button className="asisten-chip-reset" onClick={handleReset} title="Percakapan Baru">
              <RefreshCw size={12} /> Reset
            </button>
          </div>

          {/* Input Box */}
          <div className="asisten-input-wrap">
            <input
              type="text"
              className="asisten-text-input"
              placeholder="Ketik pertanyaan SOP, diagnosa vibrio, kualitas air..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button 
              className="asisten-send-btn"
              onClick={() => handleSend()}
              disabled={!input.trim()}
              title="Kirim pesan"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
