document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("eduForm");

  // 1. Live Update "Waktu Tersisa"
  const ageInputs = ["childAge", "entryAge"];
  ageInputs.forEach((id) => {
    document.getElementById(id).addEventListener("input", updateYearsLeft);
  });

  function updateYearsLeft() {
    const currentAge =
      parseFloat(document.getElementById("childAge").value) || 0;
    const entryAge = parseFloat(document.getElementById("entryAge").value) || 0;
    const diff = entryAge - currentAge;

    const text = diff > 0 ? diff + " Tahun Lagi" : "Sekarang!";
    document.getElementById("yearsLeft").innerText = text;
  }

  // 2. Logic Utama
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Ambil Data Profil
    const name = document.getElementById("childName").value || "Anak";
    const currentAge =
      parseFloat(document.getElementById("childAge").value) || 0;
    const entryAge = parseFloat(document.getElementById("entryAge").value) || 0;
    const yearsToGo = entryAge - currentAge;

    if (yearsToGo < 0) {
      alert("Umur masuk gak boleh lebih kecil dari umur sekarang bos!");
      return;
    }

    // Ambil Data Biaya
    const entryFee = parseMoney(document.getElementById("entryFee").value);
    const monthlyFee = parseMoney(document.getElementById("monthlyFee").value);
    const duration =
      parseFloat(document.getElementById("schoolDuration").value) || 0;
    const inflation =
      parseFloat(document.getElementById("eduInflation").value) || 0;

    // Ambil Data Strategi
    const currentSavings = parseMoney(
      document.getElementById("currentEduSavings").value
    );
    const monthlyInvest = parseMoney(
      document.getElementById("monthlyEduInvest").value
    );
    const returnRate =
      parseFloat(document.getElementById("eduReturn").value) || 0;

    // --- A. HITUNG BIAYA MASA DEPAN (FUTURE COST) ---
    // Total biaya sekolah "harga sekarang" = Uang Pangkal + (SPP x 12 x Lama Sekolah)
    const totalCurrentCost = entryFee + monthlyFee * 12 * duration;

    // Kena Inflasi selama 'yearsToGo' tahun
    // Rumus: Cost * (1 + inflation)^years
    const futureCost =
      totalCurrentCost * Math.pow(1 + inflation / 100, yearsToGo);

    // --- B. HITUNG HASIL INVESTASI (FUTURE WEALTH) ---
    const r = returnRate / 100 / 12; // rate bulanan
    const n = yearsToGo * 12; // bulan

    // 1. Dari modal awal
    const fvInitial = currentSavings * Math.pow(1 + r, n);

    // 2. Dari investasi bulanan
    let fvMonthly = 0;
    if (r > 0) {
      fvMonthly = monthlyInvest * ((Math.pow(1 + r, n) - 1) / r);
    } else {
      fvMonthly = monthlyInvest * n;
    }

    const totalWealth = fvInitial + fvMonthly;

    // --- C. BANDINGKAN ---
    const gap = totalWealth - futureCost;

    // --- UPDATE UI ---
    document.getElementById("totalFutureCost").innerText =
      formatRupiah(futureCost);
    document.getElementById("totalFutureSavings").innerText =
      formatRupiah(totalWealth);
    document.getElementById("eduGap").innerText =
      (gap >= 0 ? "+" : "-") + formatRupiah(Math.abs(gap));

    // Warna Gap
    const gapElem = document.getElementById("eduGap");
    gapElem.style.color = gap >= 0 ? "#4ade80" : "#ff5f56";

    // Status Box Logic
    const box = document.getElementById("eduStatusBox");
    const icon = document.getElementById("eduIcon");
    const title = document.getElementById("eduTitle");
    const desc = document.getElementById("eduDesc");
    const rec = document.getElementById("recommendationText");

    box.className = "safety-box"; // Reset

    if (gap >= 0) {
      // SUKSES
      box.classList.add("status-safe");
      icon.innerText = "🎓";
      title.innerText = "DANA SIAP!";
      desc.innerText = `Mantap! ${name} bisa sekolah dengan tenang.`;
      rec.innerText =
        "Strategimu udah oke banget. Tinggal kawal terus sampai hari H.";
    } else {
      // KURANG
      box.classList.add("status-danger");
      icon.innerText = "💸";
      title.innerText = "MASIH KURANG";
      desc.innerText = `Waduh, dana buat ${name} masih kurang nih.`;

      // Kasih saran otomatis
      const shortfall = Math.abs(gap);
      // Hitung berapa harus nambah nabung per bulan (kasar)
      const extraMonthly = shortfall / n;
      rec.innerText = `Coba tambah investasi bulanan sekitar ${formatRupiah(
        extraMonthly
      )} lagi biar nutup target.`;
    }

    // Show Result
    const resultCard = document.getElementById("eduResult");
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

  // Format Input Live
  document.querySelectorAll(".money-input").forEach((input) => {
    input.addEventListener("input", function () {
      let val = this.value.replace(/[^0-9]/g, "");
      if (val) this.value = parseInt(val).toLocaleString("id-ID");
    });
  });
});
