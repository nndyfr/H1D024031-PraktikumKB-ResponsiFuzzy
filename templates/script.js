let gejalaPicked = 0;
function toggleGejala(el) {
    el.classList.toggle('active');
    gejalaPicked = document.querySelectorAll('.gejala-item.active').length;
    document.getElementById('gejala-count').textContent = gejalaPicked + ' / 10';
}

// FUZZY ENGINE
function trapmf(x,a,b,c,d){
    if(x<=a||x>=d) return 0;
    if(x>=b&&x<=c) return 1;
    if(x<b) return (x-a)/(b-a);
    return (d-x)/(d-c);
}

function trimf(x,a,b,c){
    if(x<=a||x>=c) return 0;
    if(x===b) return 1;
    if(x<b) return (x-a)/(b-a);
    return (c-x)/(c-b);
}

function mf_hb(x){
    return {
        berat:  trapmf(x,0,0,6,9),
        sedang: trimf(x,7,9,11),
        ringan: trimf(x,9,11,13),
        normal: trapmf(x,11,13,15,15)
    };
}

function mf_gejala(x){
    return {
        jarang:        trapmf(x,0,0,2,4),
        kadang:        trimf(x,2,4,6),
        sering:        trimf(x,4,6,8),
        sangat_sering: trapmf(x,6,8,10,10)
    };
}

function mf_durasi(x){
    return {
        baru:   trapmf(x,1,1,2,3),
        sedang: trimf(x,2,3,5),
        lama:   trapmf(x,4,5,6,6)
    };
}

const mf_out = {
    rendah:        x => trapmf(x,0,0,15,28),
    sedang:        x => trimf(x,20,38,56),
    tinggi:        x => trimf(x,48,64,80),
    sangat_tinggi: x => trapmf(x,72,84,100,100)
};

function getRules(hb_v,g_v,d_v){
    const H=mf_hb(hb_v), G=mf_gejala(g_v), D=mf_durasi(d_v);
    const m3=(a,b,c)=>Math.min(a,b,c);
    const m2=(a,b)=>Math.min(a,b);
    return [
        {w:m3(H.berat,G.sangat_sering,D.lama),   out:'sangat_tinggi'},
        {w:m3(H.berat,G.sering,D.lama),           out:'sangat_tinggi'},
        {w:m3(H.berat,G.sangat_sering,D.sedang),  out:'sangat_tinggi'},
        {w:m3(H.berat,G.kadang,D.sedang),          out:'tinggi'},
        {w:m3(H.berat,G.jarang,D.baru),            out:'tinggi'},
        {w:m3(H.sedang,G.sangat_sering,D.lama),   out:'tinggi'},
        {w:m3(H.sedang,G.sering,D.sedang),         out:'tinggi'},
        {w:m3(H.sedang,G.sering,D.lama),           out:'tinggi'},
        {w:m3(H.sedang,G.kadang,D.baru),           out:'sedang'},
        {w:m3(H.sedang,G.jarang,D.baru),           out:'sedang'},
        {w:m3(H.ringan,G.sangat_sering,D.sedang),  out:'sedang'},
        {w:m3(H.ringan,G.sering,D.baru),           out:'sedang'},
        {w:m3(H.ringan,G.kadang,D.baru),           out:'sedang'},
        {w:m2(H.normal,G.jarang),                  out:'rendah'},
        {w:m3(H.normal,G.kadang,D.baru),           out:'rendah'},
        {w:m3(H.ringan,G.jarang,D.baru),           out:'rendah'},
    ];
}

function defuzzify(rules){
    let num=0, den=0;
    for(let i=0;i<=400;i++){
        const x=i/4;
        let agg=0;
        for(const r of rules){
            if(r.w>0) agg=Math.max(agg,Math.min(r.w,mf_out[r.out](x)));
        }
        num+=x*agg; den+=agg;
    }
    return den===0?0:num/den;
}

function analisis(){
    const hb_v=parseFloat(document.getElementById('hb').value);
    const dur_v=parseFloat(document.getElementById('durasi').value);
    const g_v=Math.max(1,gejalaPicked);

    const rules=getRules(hb_v,g_v,dur_v);
    const hasil=defuzzify(rules);

    let kat,css,rec;
    if(hasil<=28){
        kat='Rendah'; css='rendah';
        rec='<strong>✅ Risiko Rendah</strong>Berdasarkan data yang dimasukkan, kondisi Anda menunjukkan risiko anemia yang rendah. Pertahankan pola makan bergizi seimbang dengan cukup konsumsi sumber zat besi seperti daging merah, bayam, dan kacang hijau. Lakukan pemeriksaan darah rutin setahun sekali.';
    } else if(hasil<=55){
        kat='Sedang'; css='sedang';
        rec='<strong>⚠️ Risiko Sedang</strong>Terdapat beberapa indikator yang perlu diwaspadai. Tingkatkan asupan zat besi, asam folat, dan vitamin B12. Hindari konsumsi teh atau kopi bersamaan waktu makan. Disarankan memeriksakan kadar hemoglobin ke puskesmas atau klinik dalam waktu dekat.';
    } else if(hasil<=78){
        kat='Tinggi'; css='tinggi';
        rec='<strong>🔴 Risiko Tinggi</strong>Indikator menunjukkan risiko anemia yang cukup serius. Segera periksakan diri ke dokter untuk pemeriksaan darah lengkap (CBC). Hindari aktivitas fisik berat untuk sementara waktu dan pastikan asupan nutrisi terpenuhi.';
    } else {
        kat='Sangat Tinggi'; css='sangat-tinggi';
        rec='<strong>🚨 Risiko Sangat Tinggi</strong>Data menunjukkan risiko anemia yang sangat serius. Segera cari pertolongan medis — kunjungi dokter, puskesmas, atau unit gawat darurat sesegera mungkin. Kondisi ini memerlukan penanganan segera.';
    }

    const top=document.getElementById('result-top');
    const body=document.getElementById('result-body');
    const fill=document.getElementById('prog-fill');
    top.className='result-top '+css;
    body.className='result-body '+css;
    fill.className='prog-fill '+css;

    document.getElementById('res-kat').textContent=kat;
    document.getElementById('res-score').textContent=hasil.toFixed(2);
    document.getElementById('s-hb').textContent=hb_v.toFixed(1);
    document.getElementById('s-gejala').textContent=g_v+'/10';
    document.getElementById('s-durasi').textContent=dur_v;
    document.getElementById('rec-box').innerHTML=rec;

    setTimeout(()=>{ fill.style.width=Math.min(hasil,100)+'%'; },120);

    const rw=document.getElementById('result-wrap');
    rw.classList.add('show');
    rw.scrollIntoView({behavior:'smooth',block:'start'});
}

function resetForm(){
    document.querySelectorAll('.gejala-item.active').forEach(el=>el.classList.remove('active'));
    gejalaPicked=0;
    document.getElementById('gejala-count').textContent='0 / 10';
    document.getElementById('hb').value=8;
    document.getElementById('hb-val').textContent='8.0';
    document.getElementById('durasi').value=3;
    document.getElementById('durasi-val').textContent='3';
    document.getElementById('result-wrap').classList.remove('show');
    document.getElementById('prog-fill').style.width='0%';
}

function scrollToForm(){
    resetForm();
    document.getElementById('form-section').scrollIntoView({behavior:'smooth'});
}

