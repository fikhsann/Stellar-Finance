// --- LOGIC TOGGLE DP ---
function toggleDP(show) {
  const dpSection = document.getElementById("dpSection");
  const targetLabel = document.getElementById("targetLabel");

  if (show) {
    dpSection.style.display = "block";
    targetLabel.innerText = "Uang Muka (DP) yg Harus Dikumpulin:";
  } else {
    dpSection.style.display = "none";
    targetLabel.innerText = "Harga Full Barang Nanti:";
  }
  // Recalculate live
  calculateShopTarget();
}

// --- MAIN LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("shopForm");

  // Live Calculation Target
  const shopInputs = [
    "itemPrice",
    "targetMonths",
    "inflationItem",
    "dpPercentItem",
  ];
  shopInputs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", calculateShopTarget);
  });

  // Make function accessible globally for toggle
  window.calculateShopTarget = function () {
    const price = parseMoney(document.getElementById("itemPrice").value);
    const months =
      parseFloat(document.getElementById("targetMonths").value) || 0;
    const inflation =
      parseFloat(document.getElementById("inflationItem").value) || 0;

    // Cek Metode Bayar
    const isCredit = document.getElementById("payCredit").checked;
    const dpPct =
      parseFloat(document.getElementById("dpPercentItem").value) || 0;

    // Rumus Inflasi: P * (1 + inf)^years
    // Karena input bulan, years = months / 12
    const years = months / 12;
    const futurePrice = price * Math.pow(1 + inflation / 100, years);

    let targetMoney = futurePrice;
    if (isCredit) {
      targetMoney = futurePrice * (dpPct / 100);
    }

    // Update Info Badge
    document.getElementById("finalTargetMoney").innerText =
      formatRupiah(targetMoney);
    return targetMoney;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const targetAmount = calculateShopTarget(); // Ambil target terbaru
    if (targetAmount === 0) {
      alert("Isi harga barang dulu bos!");
      return;
    }

    const curSave = parseMoney(
      document.getElementById("currentShopSave").value
    );
    const monthly = parseMoney(
      document.getElementById("monthlyShopInvest").value
    );
    const months =
      parseFloat(document.getElementById("targetMonths").value) || 0;
    const rateYearly =
      parseFloat(document.getElementById("shopReturn").value) || 0;
    const itemName =
      document.getElementById("itemName").value || "Barang Impian";

    // Hitung Hasil Investasi
    const r = rateYearly / 100 / 12; // rate bulan

    // FV Modal Awal
    const fvInitial = curSave * Math.pow(1 + r, months);

    // FV Investasi Bulanan
    let fvMonthly = 0;
    if (r > 0) {
      fvMonthly = monthly * ((Math.pow(1 + r, months) - 1) / r);
    } else {
      fvMonthly = monthly * months;
    }

    const totalWealth = fvInitial + fvMonthly;
    const gap = totalWealth - targetAmount;

    // Update UI
    document.getElementById("shopTargetAmount").innerText =
      formatRupiah(targetAmount);
    document.getElementById("shopWealth").innerText = formatRupiah(totalWealth);
    document.getElementById("shopGap").innerText =
      (gap >= 0 ? "+" : "-") + formatRupiah(Math.abs(gap));

    // Progress Bar
    const pct = (totalWealth / targetAmount) * 100;
    const cappedPct = pct > 100 ? 100 : pct;
    document.getElementById("shopProgressBar").style.width = cappedPct + "%";
    document.getElementById("shopProgressTxt").innerText = pct.toFixed(1) + "%";

    // Status Box
    const box = document.getElementById("shopStatusBox");
    const icon = document.getElementById("shopIcon");
    const title = document.getElementById("shopTitle");
    const desc = document.getElementById("shopDesc");
    const gapElem = document.getElementById("shopGap");

    box.className = "safety-box";

    if (gap >= 0) {
      box.classList.add("status-safe");
      icon.innerText = "🛍️";
      title.innerText = "SIAP CHECKOUT!";
      desc.innerText = `Gas beli ${itemName} sekarang!`;
      gapElem.style.color = "#4ade80";
    } else {
      box.classList.add("status-danger");
      icon.innerText = "🔒";
      title.innerText = "DITAHAN DULU";
      desc.innerText = "Uang belum cukup. Sabar ya.";
      gapElem.style.color = "#ff5f56";
    }

    // Show
    const resultCard = document.getElementById("shopResult");
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
