document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("investForm");
  const resultCard = document.getElementById("resultCard");

  // 1. Auto Format Rupiah (Setiap ngetik langsung ada titiknya)
  document.querySelectorAll(".money-input").forEach((input) => {
    input.addEventListener("input", function (e) {
      // Hilangkan karakter selain angka
      let val = this.value.replace(/[^0-9]/g, "");
      if (val) {
        // Tambahin format ribuan
        this.value = parseInt(val).toLocaleString("id-ID");
      }
    });
  });

  // 2. Logic Hitung Pas Tombol Diklik
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Biar gak reload

    // Ambil value & bersihin titik biar jadi angka murni
    const target = parseMoney(document.getElementById("targetMoney").value);
    const initial = parseMoney(document.getElementById("initialMoney").value);
    const monthly = parseMoney(document.getElementById("monthlySave").value);
    const duration = parseFloat(document.getElementById("duration").value) || 0;
    const rate = parseFloat(document.getElementById("returnRate").value) || 0;

    if (duration === 0) {
      alert("Isi durasi tahun dulu bos!");
      return;
    }

    // --- RUMUS COMPOUND INTEREST ---
    // r = bunga per bulan (desimal)
    const r = rate / 100 / 12;
    // n = total bulan
    const n = duration * 12;

    let futureValue = 0;

    // A. Hitung Bunga dari Modal Awal
    // FV = P * (1 + r)^n
    const fvInitial = initial * Math.pow(1 + r, n);

    // B. Hitung Bunga dari Tabungan Bulanan
    // FV = PMT * [((1 + r)^n - 1) / r]
    let fvMonthly = 0;
    if (r > 0) {
      fvMonthly = monthly * ((Math.pow(1 + r, n) - 1) / r);
    } else {
      fvMonthly = monthly * n; // Kalau bunga 0%
    }

    futureValue = fvInitial + fvMonthly;

    // --- DATA BREAKDOWN ---
    const totalPrincipal = initial + monthly * n; // Uang yang disetor doang
    const totalInterest = futureValue - totalPrincipal; // Cuan murni

    // Update Tampilan HTML
    document.getElementById("totalResult").innerText =
      formatRupiah(futureValue);
    document.getElementById("totalPrincipal").innerText =
      formatRupiah(totalPrincipal);
    document.getElementById("totalInterest").innerText =
      formatRupiah(totalInterest);

    // Update Progress Bar (Visual Breakdown)
    const percentPrincipal = (totalPrincipal / futureValue) * 100;
    const percentInterest = 100 - percentPrincipal;

    document.getElementById("barPrincipal").style.width =
      percentPrincipal + "%";
    document.getElementById("barInterest").style.width = percentInterest + "%";

    // Cek Target (Kurang atau Lebih?)
    const gap = futureValue - target;
    const gapElem = document.getElementById("targetGap");
    if (gap >= 0) {
      gapElem.innerText = "+" + formatRupiah(gap) + " (Tercapai! 🎉)";
      gapElem.style.color = "#4ade80"; // Hijau
    } else {
      gapElem.innerText =
        "-" + formatRupiah(Math.abs(gap)) + " (Kurang dikit 💪)";
      gapElem.style.color = "#ef4444"; // Merah
    }

    // Munculin Kartu Hasil
    resultCard.style.display = "block";
    resultCard.scrollIntoView({ behavior: "smooth" });
  });

  // Helper: "1.000.000" -> 1000000
  function parseMoney(str) {
    return parseInt(str.replace(/\./g, "")) || 0;
  }

  // Helper: 1000000 -> "Rp 1.000.000"
  function formatRupiah(num) {
    return "Rp " + Math.round(num).toLocaleString("id-ID");
  }
});
