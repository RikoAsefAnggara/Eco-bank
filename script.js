document.addEventListener('DOMContentLoaded', function () {
    const formLogin = document.getElementById('formLogin');
    const navLinks = document.querySelector('.nav-links');

    // 1. Cek Role Login untuk Menampilkan/Sembunyikan Tombol Panel Admin
    const userRole = localStorage.getItem('userRole');

    if (navLinks) {
        // Hapus link Panel Admin lama jika ada
        const existingAdminLink = document.getElementById('navAdminLink');
        if (existingAdminLink) {
            existingAdminLink.remove();
        }

        // Jika yang login adalah Admin/Petugas, tampilkan tombol Panel Admin
        if (userRole === 'admin') {
            const adminLi = document.createElement('li');
            adminLi.id = 'navAdminLink';
            adminLi.innerHTML = `<a href="admin.html" style="color: #2563eb; font-weight: bold;">⚙ Panel Admin</a>`;
            navLinks.insertBefore(adminLi, navLinks.firstChild);
        }
    }

    // 2. Handling Login Multi Role
    if (formLogin) {
        formLogin.addEventListener('submit', function (e) {
            e.preventDefault();
            const role = document.getElementById('roleSelect').value;
            const user = document.getElementById('username').value.trim();
            const pass = document.getElementById('password').value.trim();

            if (role === 'admin') {
                if (user === 'ADM001' && pass === 'admin123') {
                    localStorage.setItem('userRole', 'admin');
                    alert('Login Admin/Petugas Berhasil!');
                    window.location.href = 'admin.html';
                } else {
                    alert('Username atau Password Admin Salah! (Gunakan ADM001 / admin123)');
                }
            } else {
                if (user === 'NSB001' && pass === 'warga123') {
                    localStorage.setItem('userRole', 'nasabah');
                    alert('Login Nasabah Berhasil!');
                    window.location.href = 'dashboard.html';
                } else {
                    alert('Username atau Password Nasabah Salah! (Gunakan NSB001 / warga123)');
                }
            }
        });
    }

    // 3. Handling Logout (Hapus Status Role)
    const logoutLinks = document.querySelectorAll('a[href="index.html"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function () {
            localStorage.removeItem('userRole');
        });
    });

    // 4. Kalkulasi Poin & Form Setoran
    const jenisSelect = document.getElementById('jenisSampah');
    const beratInput = document.getElementById('beratSampah');
    const estimasiInput = document.getElementById('estimasiPoin');
    const formSetoran = document.getElementById('formSetoran');
    const riwayatTbody = document.getElementById('riwayatTbody');

    function hitungPoin() {
        if (!jenisSelect || !beratInput || !estimasiInput) return;
        const selectedOption = jenisSelect.options[jenisSelect.selectedIndex];
        const poinPerKg = parseFloat(selectedOption.getAttribute('data-poin')) || 0;
        const berat = parseFloat(beratInput.value) || 0;
        const totalPoin = Math.floor(poinPerKg * berat);
        estimasiInput.value = totalPoin + " Poin";
    }

    if (jenisSelect && beratInput) {
        jenisSelect.addEventListener('change', hitungPoin);
        beratInput.addEventListener('input', hitungPoin);
        beratInput.addEventListener('keyup', hitungPoin);
    }

    if (formSetoran) {
        formSetoran.addEventListener('submit', function (e) {
            e.preventDefault();
            const selectedOption = jenisSelect.options[jenisSelect.selectedIndex];
            const namaJenis = selectedOption.text.split('(')[0].trim();
            const poinPerKg = parseFloat(selectedOption.getAttribute('data-poin')) || 0;
            const berat = parseFloat(beratInput.value) || 0;
            const totalPoin = Math.floor(poinPerKg * berat);

            const hariIni = new Date();
            const opsiTanggal = { day: 'numeric', month: 'short', year: 'numeric' };
            const tanggalStr = hariIni.toLocaleDateString('id-ID', opsiTanggal);

            const dataSetoranBaru = {
                tanggal: tanggalStr,
                jenis: namaJenis,
                berat: berat.toFixed(1) + " kg",
                poin: "+" + totalPoin + " Poin"
            };

            let daftarRiwayat = JSON.parse(localStorage.getItem('riwayatSetoran')) || [];
            daftarRiwayat.unshift(dataSetoranBaru);
            localStorage.setItem('riwayatSetoran', JSON.stringify(daftarRiwayat));

            alert('Setoran sampah berhasil dicatat dan masuk ke riwayat!');
            formSetoran.reset();
            estimasiInput.value = "0 Poin";
        });
    }

    // 5. Tampilkan Riwayat Setoran
    if (riwayatTbody) {
        let daftarRiwayat = JSON.parse(localStorage.getItem('riwayatSetoran'));
        if (!daftarRiwayat || daftarRiwayat.length === 0) {
            daftarRiwayat = [
                { tanggal: '28 Sep 2026', jenis: 'Botol Plastik PET', berat: '3.5 kg', poin: '+350 Poin' },
                { tanggal: '15 Sep 2026', jenis: 'Kardus Bekas', berat: '8.0 kg', poin: '+400 Poin' },
                { tanggal: '02 Sep 2026', jenis: 'Kaleng Aluminium', berat: '1.2 kg', poin: '+240 Poin' }
            ];
            localStorage.setItem('riwayatSetoran', JSON.stringify(daftarRiwayat));
        }

        riwayatTbody.innerHTML = '';
        daftarRiwayat.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.tanggal}</td>
                <td>${item.jenis}</td>
                <td>${item.berat}</td>
                <td style="color: var(--primary-color); font-weight: bold;">${item.poin}</td>
            `;
            riwayatTbody.appendChild(tr);
        });
    }
});

function tukarPoin(namaItem, poinDibutuhkan) {
    const saldoPoinAktif = 1250;
    if (saldoPoinAktif < poinDibutuhkan) {
        alert(`Maaf, poin Anda tidak cukup untuk menukar ${namaItem}. (Poin Anda: ${saldoPoinAktif})`);
    } else {
        const konfirmasi = confirm(`Apakah Anda yakin ingin menukar ${poinDibutuhkan} poin untuk ${namaItem}?`);
        if (konfirmasi) {
            alert(`Berhasil! Penukaran ${namaItem} sedang diproses.`);
        }
    }
}