document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("kprForm");

  // Format Rupiah Input
  document.querySelectorAll(".money-input").forEach((input) => {
    input.addEventListener("input", function (e) {
      let val = this.value.replace(/[^0-9]/g, "");
      if (val) this.value = parseInt(val).toLocaleString("id-ID");

      // Kalo input Harga Properti berubah, update hitungan DP otomatis
      if (this.id === "propertyPrice") calculateLiveDP();
    });
  });

  // Event Listener buat Persen DP biar live update
  document
    .getElementById("dpPercent")
    .addEventListener("input", calculateLiveDP);

  function calculateLiveDP() {
    const price = parseMoney(document.getElementById("propertyPrice").value);
    const dpPct = parseFloat(document.getElementById("dpPercent").value) || 0;

    // Hitung Nominal DP
    const dpAmount = price * (dpPct / 100);
    const loanPrincipal = price - dpAmount; // Plafond Pinjaman

    // Update Tampilan
    document.getElementById("dpAmount").value =
      dpAmount.toLocaleString("id-ID");
    document.getElementById("loanPrincipal").innerText =
      formatRupiah(loanPrincipal);
  }

  // --- LOGIC UTAMA HITUNG CICILAN ---
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const price = parseMoney(document.getElementById("propertyPrice").value);
    const dpPct = parseFloat(document.getElementById("dpPercent").value) || 0;
    const income = parseMoney(document.getElementById("monthlyIncome").value);
    const rateYearly =
      parseFloat(document.getElementById("interestRate").value) || 0;
    const years = parseFloat(document.getElementById("loanTenure").value) || 0;

    if (years === 0 || price === 0) {
      alert("Data properti belum lengkap bos!");
      return;
    }

    // 1. Hitung Pokok Pinjaman
    const loanAmount = price - price * (dpPct / 100);

    // 2. Rumus PMT (Annuity)
    // Rate per bulan
    const i = rateYearly / 100 / 12;
    // Total bulan
    const n = years * 12;

    let monthlyPayment = 0;

    if (i > 0) {
      // Rumus: P * ( i * (1+i)^n ) / ( (1+i)^n - 1 )
      monthlyPayment =
        (loanAmount * (i * Math.pow(1 + i, n))) / (Math.pow(1 + i, n) - 1);
    } else {
      monthlyPayment = loanAmount / n;
    }

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - loanAmount;

    // 3. Analisa Rasio (Debt to Income Ratio)
    // Rumus: Cicilan / Gaji * 100
    let ratio = 0;
    if (income > 0) ratio = (monthlyPayment / income) * 100;

    // Update Text HTML
    document.getElementById("monthlyInstallment").innerText =
      formatRupiah(monthlyPayment);
    document.getElementById("dtiRatio").innerText = ratio.toFixed(1) + "%";
    document.getElementById("resLoan").innerText = formatRupiah(loanAmount);
    document.getElementById("resInterest").innerText =
      formatRupiah(totalInterest);
    document.getElementById("resTotalPayment").innerText =
      formatRupiah(totalPayment);

    // 4. Logic Safety Check (Warna Merah/Hijau)
    const badge = document.getElementById("safetyBadge");
    const icon = badge.querySelector(".icon-status");
    const title = badge.querySelector("h5");
    const desc = badge.querySelector("p");

    // Reset Class
    badge.className = "safety-box";

    if (ratio > 40) {
      // BAHAYA (Merah)
      badge.classList.add("status-danger");
      icon.innerText = "💀";
      title.innerText = "BAHAYA BOS!";
      desc.innerText =
        "Cicilan ini nyekek leher (Diatas 40% Gaji). Awas gagal bayar!";
    } else if (ratio > 30) {
      // WARNING (Kuning)
      badge.classList.add("status-warning");
      icon.innerText = "⚠️";
      title.innerText = "Hati-hati Bos";
      desc.innerText = "Udah lampu kuning (30%-40% Gaji). Hemat jajan kopi ya.";
    } else {
      // AMAN (Hijau)
      badge.classList.add("status-safe");
      icon.innerText = "✅";
      title.innerText = "Aman Sentosa";
      desc.innerText = "Gas ambil! Cicilan enteng (Dibawah 30% Gaji).";
    }

    // Munculin Hasil
    const resultCard = document.getElementById("kprResult");
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
});
