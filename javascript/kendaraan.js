document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("vehicleForm");

  // 1. Live Calculate Target DP (Pas user ngetik harga/inflasi)
  const inputsTrigger = ["carPrice", "yearsTime", "inflationRate", "dpPercent"];
  inputsTrigger.forEach((id) => {
    document
      .getElementById(id)
      .addEventListener("input", calculateFutureTarget);
  });

  function calculateFutureTarget() {
    const currentPrice = parseMoney(document.getElementById("carPrice").value);
    const years = parseFloat(document.getElementById("yearsTime").value) || 0;
    const inflation =
      parseFloat(document.getElementById("inflationRate").value) || 0;
    const dpPct = parseFloat(document.getElementById("dpPercent").value) || 0;

    // Hitung Harga Masa Depan (Kena Inflasi)
    // Rumus: P * (1 + r)^n
    const futurePrice = currentPrice * Math.pow(1 + inflation / 100, years);

    // Hitung Nominal DP Masa Depan
    const targetDP = futurePrice * (dpPct / 100);

    // Update Tampilan Info Badge
    document.getElementById("futureCarPrice").innerText =
      formatRupiah(futurePrice);
    document.getElementById("targetFutureDP").innerText =
      formatRupiah(targetDP);

    return targetDP; // Return nilai buat dipake pas submit
  }

  // 2. Main Calculation (Pas tombol diklik)
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const targetDP = calculateFutureTarget(); // Ambil nilai target terbaru
    if (targetDP === 0) {
      alert("Isi data target mobil dulu bos!");
      return;
    }

    const initialMoney = parseMoney(
      document.getElementById("currentSavings").value
    );
    const monthlySave = parseMoney(
      document.getElementById("monthlySavings").value
    );
    const years = parseFloat(document.getElementById("yearsTime").value) || 0;
    const returnRate =
      parseFloat(document.getElementById("investReturn").value) || 0;

    // --- HITUNG HASIL INVESTASI ---
    const r = returnRate / 100 / 12; // Bunga per bulan
    const n = years * 12; // Total bulan

    // A. Bunga dari Modal Awal
    const fvInitial = initialMoney * Math.pow(1 + r, n);

    // B. Bunga dari Nabung Rutin
    let fvMonthly = 0;
    if (r > 0) {
      fvMonthly = monthlySave * ((Math.pow(1 + r, n) - 1) / r);
    } else {
      fvMonthly = monthlySave * n;
    }

    const totalMoney = fvInitial + fvMonthly;

    // --- BANDINGKAN HASIL VS TARGET ---
    const gap = totalMoney - targetDP;
    const percentage = (totalMoney / targetDP) * 100;
    const cappedPercent = percentage > 100 ? 100 : percentage;

    // Update Text HTML
    document.getElementById("resTotalMoney").innerText =
      formatRupiah(totalMoney);
    document.getElementById("resTargetDP").innerText = formatRupiah(targetDP);
    document.getElementById("progressPercent").innerText =
      percentage.toFixed(1) + "%";

    // Update Progress Bar
    const bar = document.getElementById("progressBar");
    bar.style.width = cappedPercent + "%";

    // Update Status Box
    const box = document.getElementById("statusBox");
    const icon = document.getElementById("statusIcon");
    const title = document.getElementById("statusTitle");
    const desc = document.getElementById("statusDesc");
    const gapElem = document.getElementById("resGap");

    // Reset Class
    box.className = "safety-box";

    if (totalMoney >= targetDP) {
      // SUKSES
      box.classList.add("status-safe"); // Hijau
      icon.innerText = "🎉";
      title.innerText = "GAS BELI BOS!";
      desc.innerText = "Strategimu mantap. Uang bakal cukup buat bayar DP.";
      bar.style.backgroundColor = "#4ade80"; // Hijau
      gapElem.innerText = "+" + formatRupiah(gap) + " (Sisa Buat Bensin)";
      gapElem.style.color = "#4ade80";
    } else {
      // GAGAL
      box.classList.add("status-danger"); // Merah
      icon.innerText = "😅";
      title.innerText = "WADUH KURANG...";
      desc.innerText =
        "Coba tambah tabungan bulanan atau cari return investasi lebih gede.";
      bar.style.backgroundColor = "#ff5f56"; // Merah
      gapElem.innerText = "-" + formatRupiah(Math.abs(gap));
      gapElem.style.color = "#ff5f56";
    }

    // Munculin Hasil
    const resultCard = document.getElementById("vehicleResult");
    resultCard.style.display = "block";
    resultCard.scrollIntoView({ behavior: "smooth" });
  });

  // Helpers (Sama kayak sebelumnya)
  function parseMoney(str) {
    return parseInt(str.replace(/\./g, "")) || 0;
  }
  function formatRupiah(num) {
    return "Rp " + Math.round(num).toLocaleString("id-ID");
  }

  // Format Input Live
  document.querySelectorAll(".money-input").forEach((input) => {
    input.addEventListener("input", function () {
      let val = this.value.replace(/[^0-9]/g, "");
      if (val) this.value = parseInt(val).toLocaleString("id-ID");
    });
  });
});
