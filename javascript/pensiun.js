document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("pensionForm");

  // 1. Live Update Waktu
  ["currentAge", "pensionAge"].forEach((id) => {
    document.getElementById(id).addEventListener("input", updateYears);
  });

  function updateYears() {
    const cur = parseFloat(document.getElementById("currentAge").value) || 0;
    const target = parseFloat(document.getElementById("pensionAge").value) || 0;
    const diff = target - cur;
    document.getElementById("yearsToPension").innerText =
      diff > 0 ? diff + " Tahun Lagi" : "Sekarang!";
  }

  // 2. Main Logic
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Ambil Data
    const monthlyExp = parseMoney(
      document.getElementById("monthlyExpense").value
    );
    const curAge = parseFloat(document.getElementById("currentAge").value) || 0;
    const penAge = parseFloat(document.getElementById("pensionAge").value) || 0;
    const inflation =
      parseFloat(document.getElementById("inflationPension").value) || 0;

    const curSave = parseMoney(
      document.getElementById("currentPensionSave").value
    );
    const monthlyInv = parseMoney(
      document.getElementById("monthlyPensionInvest").value
    );
    const returnRate =
      parseFloat(document.getElementById("pensionReturn").value) || 0;

    const years = penAge - curAge;
    if (years <= 0) {
      alert("Masa pensiun kok lebih muda dari umur sekarang?");
      return;
    }

    // --- A. HITUNG KEBUTUHAN (THE NEED) ---
    // 1. Biaya Hidup Tahunan SEKARANG
    const annualExpNow = monthlyExp * 12;

    // 2. Biaya Hidup Tahunan SAAT PENSIUN (Kena Inflasi)
    // Rumus: FV = PV * (1 + i)^n
    const futureAnnualExp = annualExpNow * Math.pow(1 + inflation / 100, years);

    // 3. Total Dana yg Dibutuhkan (4% Rule / Kalikan 25)
    // Biar aman, kita harus punya 25x pengeluaran tahunan
    const totalNeeded = futureAnnualExp * 25;

    // --- B. HITUNG KEKAYAAN (THE WEALTH) ---
    const r = returnRate / 100 / 12; // rate bulan
    const n = years * 12; // bulan

    // 1. Dari Saldo Awal
    const fvInitial = curSave * Math.pow(1 + r, n);

    // 2. Dari Investasi Rutin
    let fvMonthly = 0;
    if (r > 0) {
      fvMonthly = monthlyInv * ((Math.pow(1 + r, n) - 1) / r);
    } else {
      fvMonthly = monthlyInv * n;
    }

    const totalWealth = fvInitial + fvMonthly;

    // --- C. BANDINGKAN ---
    const gap = totalWealth - totalNeeded;

    // Update UI
    document.getElementById("futureAnnualExpense").innerText =
      formatRupiah(futureAnnualExp) + " / Tahun";
    document.getElementById("totalNeeded").innerText =
      formatRupiah(totalNeeded);
    document.getElementById("projectedWealth").innerText =
      formatRupiah(totalWealth);
    document.getElementById("pensionGap").innerText =
      (gap >= 0 ? "+" : "-") + formatRupiah(Math.abs(gap));

    // Warna Gap
    const gapElem = document.getElementById("pensionGap");
    gapElem.style.color = gap >= 0 ? "#bef264" : "#ff5f56"; // Lime or Red

    // Status Box
    const box = document.getElementById("pensionStatusBox");
    const icon = document.getElementById("pensionIcon");
    const title = document.getElementById("pensionTitle");
    const desc = document.getElementById("pensionDesc");

    box.className = "safety-box"; // Reset

    if (gap >= 0) {
      // AMAN
      box.classList.add("status-safe");
      icon.innerText = "🏝️";
      title.innerText = "PENSIUN SULTAN";
      desc.innerText = "Dana lebih dari cukup. Bisa keliling dunia nih!";
    } else {
      // KURANG
      box.classList.add("status-danger");
      icon.innerText = "👴";
      title.innerText = "KERJA TERUS?";
      desc.innerText = "Waduh, dana belum cukup buat pensiun gaya ini.";
    }

    // Show
    const resultCard = document.getElementById("pensionResult");
    resultCard.style.display = "block";
    resultCard.scrollIntoView({ behavior: "smooth" });
  });

  // Helpers
  function parseMoney(str) {
    return parseInt(str.replace(/\./g, "")) || 0;
  }
  function formatRupiah(num) {
    return "Rp " + Math.round(num).toLocaleString("id-ID");
  }

  document.querySelectorAll(".money-input").forEach((input) => {
    input.addEventListener("input", function () {
      let val = this.value.replace(/[^0-9]/g, "");
      if (val) this.value = parseInt(val).toLocaleString("id-ID");
    });
  });
});
