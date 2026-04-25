import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

# Variabel
hb     = ctrl.Antecedent(np.arange(0, 15.1, 0.5), 'hb')       # Hemoglobin (g/dL)
gejala = ctrl.Antecedent(np.arange(0, 10.1, 1),   'gejala')   # Frekuensi gejala (1-10)
durasi = ctrl.Antecedent(np.arange(1, 6.1,  1),   'durasi')   # Durasi keluhan (minggu)
risiko = ctrl.Consequent(np.arange(0, 100.1, 1),  'risiko')   # Output risiko (0-100)

# Fungsi Keanggotaan (input)
# Hemoglobin (g/dL) 
hb['berat']  = fuzz.trapmf(hb.universe, [0,  0,  6,  9 ])  # < 8  g/dL
hb['sedang'] = fuzz.trimf( hb.universe, [7,  9,  11    ])  # 8–10 g/dL
hb['ringan'] = fuzz.trimf( hb.universe, [9,  11, 13    ])  # 10–12 g/dL
hb['normal'] = fuzz.trapmf(hb.universe, [11, 13, 15, 15])  # ≥12  g/dL

# Frekuensi Gejala (skala 1–10)
gejala['jarang']        = fuzz.trapmf(gejala.universe, [0,  0,  2,  4 ])
gejala['kadang']        = fuzz.trimf( gejala.universe, [2,  4,  6    ])
gejala['sering']        = fuzz.trimf( gejala.universe, [4,  6,  8    ])
gejala['sangat_sering'] = fuzz.trapmf(gejala.universe, [6,  8,  10, 10])

# Durasi Keluhan (minggu)
durasi['baru']   = fuzz.trapmf(durasi.universe, [1, 1, 2, 3])
durasi['sedang'] = fuzz.trimf( durasi.universe, [2, 3, 5   ])
durasi['lama']   = fuzz.trapmf(durasi.universe, [4, 5, 6, 6])

# Fungsi Keanggotaan (output)
risiko['rendah']        = fuzz.trapmf(risiko.universe, [0,  0,  15, 28 ])
risiko['sedang']        = fuzz.trimf( risiko.universe, [20, 38, 56     ])
risiko['tinggi']        = fuzz.trimf( risiko.universe, [48, 64, 80     ])
risiko['sangat_tinggi'] = fuzz.trapmf(risiko.universe, [72, 84, 100,100])

# Rule Base (16 Rules — Mamdani)
rules = [
    # Sangat Tinggi
    ctrl.Rule(hb['berat']  & gejala['sangat_sering'] & durasi['lama'],   risiko['sangat_tinggi']),
    ctrl.Rule(hb['berat']  & gejala['sering']        & durasi['lama'],   risiko['sangat_tinggi']),
    ctrl.Rule(hb['berat']  & gejala['sangat_sering'] & durasi['sedang'], risiko['sangat_tinggi']),

    # Tinggi
    ctrl.Rule(hb['berat']  & gejala['kadang']        & durasi['sedang'], risiko['tinggi']),
    ctrl.Rule(hb['berat']  & gejala['jarang']        & durasi['baru'],   risiko['tinggi']),
    ctrl.Rule(hb['sedang'] & gejala['sangat_sering'] & durasi['lama'],   risiko['tinggi']),
    ctrl.Rule(hb['sedang'] & gejala['sering']        & durasi['sedang'], risiko['tinggi']),
    ctrl.Rule(hb['sedang'] & gejala['sering']        & durasi['lama'],   risiko['tinggi']),

    # Sedang
    ctrl.Rule(hb['sedang'] & gejala['kadang']        & durasi['baru'],   risiko['sedang']),
    ctrl.Rule(hb['sedang'] & gejala['jarang']        & durasi['baru'],   risiko['sedang']),
    ctrl.Rule(hb['ringan'] & gejala['sangat_sering'] & durasi['sedang'], risiko['sedang']),
    ctrl.Rule(hb['ringan'] & gejala['sering']        & durasi['baru'],   risiko['sedang']),
    ctrl.Rule(hb['ringan'] & gejala['kadang']        & durasi['baru'],   risiko['sedang']),

    # Rendah
    ctrl.Rule(hb['normal'] & gejala['jarang'],                           risiko['rendah']),
    ctrl.Rule(hb['normal'] & gejala['kadang']        & durasi['baru'],   risiko['rendah']),
    ctrl.Rule(hb['ringan'] & gejala['jarang']        & durasi['baru'],   risiko['rendah']),
]

# Sistem Kontrol
system    = ctrl.ControlSystem(rules)
simulator = ctrl.ControlSystemSimulation(system)

# Fungsi Inferensi
def hitung_risiko(hb_val: float, gejala_val: float, durasi_val: float) -> dict:
    """
    Hitung tingkat risiko anemia menggunakan fuzzy Mamdani.

    Parameter:
        hb_val     : Kadar hemoglobin (0–15 g/dL)
        gejala_val : Frekuensi gejala (1–10)
        durasi_val : Durasi keluhan dalam minggu (1–6)

    Return:
        dict berisi nilai risiko dan kategorinya
    """
    hb_val     = float(np.clip(hb_val,     0,  15))
    gejala_val = float(np.clip(gejala_val, 0,  10))
    durasi_val = float(np.clip(durasi_val, 1,  6 ))

    simulator.input['hb']     = hb_val
    simulator.input['gejala'] = gejala_val
    simulator.input['durasi'] = durasi_val
    simulator.compute()

    nilai = round(simulator.output['risiko'], 2)

    if nilai <= 28:
        kategori    = "Rendah"
        rekomendasi = "Risiko anemia rendah. Pertahankan pola makan bergizi dan lakukan pemeriksaan rutin."
    elif nilai <= 55:
        kategori    = "Sedang"
        rekomendasi = "Ada indikator risiko. Tingkatkan asupan zat besi dan segera cek hemoglobin ke puskesmas."
    elif nilai <= 78:
        kategori    = "Tinggi"
        rekomendasi = "Risiko cukup serius. Segera periksakan diri ke dokter untuk pemeriksaan darah lengkap."
    else:
        kategori    = "Sangat Tinggi"
        rekomendasi = "Risiko sangat tinggi. Segera ke dokter atau unit gawat darurat, jangan ditunda."

    return {
        "hb"          : hb_val,
        "gejala"      : gejala_val,
        "durasi"      : durasi_val,
        "nilai_risiko": nilai,
        "kategori"    : kategori,
        "rekomendasi" : rekomendasi
    }