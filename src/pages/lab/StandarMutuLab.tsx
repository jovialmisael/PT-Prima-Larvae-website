import { useState } from 'react';
import { BookOpen, ShieldCheck, Droplets, Activity, Layers } from 'lucide-react';
import './standarMutuLab.css';

export function StandarMutuLab() {
  const [activeTab, setActiveTab] = useState<'mikro' | 'pcr' | 'qc' | 'air'>('mikro');

  return (
    <div className="standar-lab-page">
      {/* Header Banner */}
      <div className="standar-lab-header">
        <div className="standar-lab-title-row">
          <div className="standar-lab-icon-wrap">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="standar-lab-title">Standar Mutu & Ambang Batas Laboratorium</h1>
            <p className="standar-lab-sub">
              Buku saku acuan parameter mikrobiologi, PCR patogen, dan pengujian kualitas benur prima (§01 - §10).
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="standar-tab-bar">
        <button 
          className={`standar-tab-btn ${activeTab === 'mikro' ? 'active' : ''}`}
          onClick={() => setActiveTab('mikro')}
        >
          <Droplets size={16} />
          <span>§05 Mikrobiologi TCBS</span>
        </button>
        <button 
          className={`standar-tab-btn ${activeTab === 'pcr' ? 'active' : ''}`}
          onClick={() => setActiveTab('pcr')}
        >
          <ShieldCheck size={16} />
          <span>§01/§09 Skrining PCR (5 Patogen)</span>
        </button>
        <button 
          className={`standar-tab-btn ${activeTab === 'qc' ? 'active' : ''}`}
          onClick={() => setActiveTab('qc')}
        >
          <Activity size={16} />
          <span>§08/§09 QC Ketahanan & Morfologi</span>
        </button>
        <button 
          className={`standar-tab-btn ${activeTab === 'air' ? 'active' : ''}`}
          onClick={() => setActiveTab('air')}
        >
          <Layers size={16} />
          <span>§02/§04 Standar Air & Treatment</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="standar-content-card">
        {activeTab === 'mikro' && (
          <div className="standar-section">
            <h2 className="standar-sec-title">Baku Mutu Mikrobiologi TCBS (Air & Tubuh Larva)</h2>
            <p className="standar-sec-desc">
              Pemisahan koloni TCBS (Hijau, Kuning, Luminescent) wajib dicatat tersendiri. Komposisi koloni menentukan bahaya infeksi patogen.
            </p>

            <div className="standar-grid">
              <div className="standar-item standar-item--danger">
                <div className="standar-item-header">
                  <span className="standar-tag standar-tag--danger">TOLERANSI 0</span>
                  <h3>Koloni Luminescent (Bioluminesensi)</h3>
                </div>
                <div className="standar-item-body">
                  <p><strong>Standar:</strong> 0 CFU / mL (Air & Tubuh)</p>
                  <p><strong>Bahaya:</strong> Menyebabkan nekrosis bercahaya massal dan kematian larva &gt;90% dalam 24 jam.</p>
                  <p><strong>Tindakan Wajib:</strong> Karantina bak, perlakuan probiotik agresif, atau culling segera.</p>
                </div>
              </div>

              <div className="standar-item standar-item--warn">
                <div className="standar-item-header">
                  <span className="standar-tag standar-tag--warn">WASPADA TINGGI</span>
                  <h3>Koloni Hijau (Vibrio Patogen)</h3>
                </div>
                <div className="standar-item-body">
                  <p><strong>Standar Aman:</strong> &lt; 10² CFU / mL (Air), &lt; 10³ CFU / g (Tubuh)</p>
                  <p><strong>Bahaya:</strong> Indikasi keberadaan <em>Vibrio parahaemolyticus</em> atau <em>V. harveyi</em>.</p>
                  <p><strong>Rasio:</strong> Koloni hijau tidak boleh melebihi 10% dari total vibrio (TVC).</p>
                </div>
              </div>

              <div className="standar-item standar-item--safe">
                <div className="standar-item-header">
                  <span className="standar-tag standar-tag--safe">KOMPOSISI AMAN</span>
                  <h3>Koloni Kuning (Non-Sucrose)</h3>
                </div>
                <div className="standar-item-body">
                  <p><strong>Standar:</strong> Dominan (&gt;90% dari TVC)</p>
                  <p><strong>Keterangan:</strong> Vibrio oportunistik non-virulen (mis. <em>V. alginolyticus</em>) yang bersaing dengan patogen hijau.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pcr' && (
          <div className="standar-section">
            <h2 className="standar-sec-title">Panel Skrining 5 Patogen Utama (Induk & PL Pra-Panen)</h2>
            <p className="standar-sec-desc">
              Seluruh batch induk yang masuk dan benur PL sebelum didistribusikan ke tambak wajib dinyatakan 100% <strong>NEGATIF</strong> terhadap 5 patogen karantina.
            </p>

            <div className="standar-pcr-table-wrap">
              <table className="standar-pcr-table">
                <thead>
                  <tr>
                    <th>Patogen</th>
                    <th>Nama Penyakit</th>
                    <th>Target Sampel</th>
                    <th>Standar Mutu</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>WSSV</strong></td>
                    <td>White Spot Syndrome Virus</td>
                    <td>Pleopod Induk, Post Larvae</td>
                    <td><span className="badge-pcr-neg">NEGATIF</span></td>
                  </tr>
                  <tr>
                    <td><strong>IMNV</strong></td>
                    <td>Infectious Myonecrosis Virus (Myo)</td>
                    <td>Otot Ekor Induk, PL</td>
                    <td><span className="badge-pcr-neg">NEGATIF</span></td>
                  </tr>
                  <tr>
                    <td><strong>EHP</strong></td>
                    <td>Enterocytozoon hepatopenaei</td>
                    <td>Hepatopankreas, Feses Induk, PL</td>
                    <td><span className="badge-pcr-neg">NEGATIF</span></td>
                  </tr>
                  <tr>
                    <td><strong>AHPND / EMS</strong></td>
                    <td>Acute Hepatopancreatic Necrosis Disease</td>
                    <td>Hepatopankreas, Lambung Larva</td>
                    <td><span className="badge-pcr-neg">NEGATIF</span></td>
                  </tr>
                  <tr>
                    <td><strong>IHHNV</strong></td>
                    <td>Infectious Hypodermal & Hematopoietic Necrosis</td>
                    <td>Insang / Kaki Renang Induk, PL</td>
                    <td><span className="badge-pcr-neg">NEGATIF</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'qc' && (
          <div className="standar-section">
            <h2 className="standar-sec-title">Kriteria Uji Ketahanan (Stress Test) & Morfologi PL</h2>
            <div className="standar-grid">
              <div className="standar-item">
                <div className="standar-item-header">
                  <span className="standar-tag standar-tag--safe">MIN. 95% KELULUSAN</span>
                  <h3>Formalin Stress Test</h3>
                </div>
                <div className="standar-item-body">
                  <p><strong>Protokol:</strong> Konsentrasi Formalin 100 ppm selama 30 menit pada 100 ekor sampel PL.</p>
                  <p><strong>Syarat Lolos:</strong> Survival rate pasca uji ≥ 95%.</p>
                </div>
              </div>

              <div className="standar-item">
                <div className="standar-item-header">
                  <span className="standar-tag standar-tag--safe">MIN. 95% KELULUSAN</span>
                  <h3>Salinity Stress Test</h3>
                </div>
                <div className="standar-item-body">
                  <p><strong>Protokol:</strong> Penurunan salinitas mendadak dari salinitas bak ke air tawar (0 ppt) selama 30 menit.</p>
                  <p><strong>Syarat Lolos:</strong> Survival rate pasca pemulihan ≥ 95%.</p>
                </div>
              </div>

              <div className="standar-item">
                <div className="standar-item-header">
                  <span className="standar-tag standar-tag--safe">MAKS. 10% CV</span>
                  <h3>Keseragaman Ukuran (CV) & MGR</h3>
                </div>
                <div className="standar-item-body">
                  <p><strong>Koefisien Variasi (CV):</strong> ≤ 10% (Ukuran sangat seragam).</p>
                  <p><strong>Muscle-to-Gut Ratio (MGR):</strong> Rasio ketebalan otot terhadap usus minimal 3:1 pada ruas abdomen ke-6.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'air' && (
          <div className="standar-section">
            <h2 className="standar-sec-title">Standar Parameter Fisika-Kimia Air & Ozonisasi</h2>
            <div className="standar-grid">
              <div className="standar-item">
                <h3>Suhu & DO Rutin</h3>
                <p><strong>Suhu:</strong> 28.5°C – 31.5°C (Fluktuasi harian ≤ 1.5°C)</p>
                <p><strong>Dissolved Oxygen (DO):</strong> ≥ 5.0 ppm (Kritis bila &lt; 4.0 ppm)</p>
              </div>
              <div className="standar-item">
                <h3>pH & Salinitas</h3>
                <p><strong>pH:</strong> 7.8 – 8.3 (Fluktuasi harian ≤ 0.4)</p>
                <p><strong>Salinitas Rearing:</strong> 29 – 32 g/L</p>
              </div>
              <div className="standar-item">
                <h3>Senyawa Nitrogen & Ozon</h3>
                <p><strong>Amonium Bebas (NH3):</strong> ≤ 0.05 mg/L</p>
                <p><strong>Nitrit (NO2):</strong> ≤ 0.05 mg/L</p>
                <p><strong>ORP Treatment Ozon:</strong> 650 - 750 mV (Resirkulasi min. 60 menit)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

