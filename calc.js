 const PLAYEROK_FEES = [
  { min: 90, max: 499, listing: 25, up: 13 },
  { min: 500, max: 999, listing: 37, up: 19 },
  { min: 1000, max: 2499, listing: 49, up: 25 },
  { min: 2500, max: 4999, listing: 75, up: 37 },
  { min: 5000, max: 9999, listing: 99, up: 49 },
  { min: 10000, max: Infinity, listing: 149, up: 75 },
];
function getPlayerokFees(price) {
  return PLAYEROK_FEES.find(({ min, max }) => price >= min && price <= max) || { listing: 0, up: 0 };
}
function renderPlayerokTable(currentPrice) {
  let table = `<div class='pk-table'><table><thead><tr><th>Цена</th><th>Выставление</th><th>Поднятие</th></tr></thead><tbody>`;
  for (const range of PLAYEROK_FEES) {
    const isActive = currentPrice >= range.min && currentPrice <= range.max;
    const priceStr = range.max === Infinity ? `&gt;= ${range.min}₽` : `${range.min}–${range.max}₽`;
    table += `<tr${isActive ? " class='active'" : ''}><td>${priceStr}</td><td>${range.listing}₽</td><td>${range.up}₽</td></tr>`;
  }
  table += `</tbody></table></div>`;
  return table;
}
const platformEl = document.getElementById('platform');
const sitePriceEl = document.getElementById('sitePrice');
const buyPriceEl = document.getElementById('buyPrice');
const upCountEl = document.getElementById('upCount');
const playerokFields = document.getElementById('playerok-fields');
const feeTip = document.getElementById('fee-tip');
const resultBox = document.getElementById('result-box');
function updatePlayerokFields() {
  if (platformEl.value === 'PLAYEROK') {
    playerokFields.style.display = '';
    const price = parseFloat(sitePriceEl.value);
    if (!isNaN(price) && price) {
      const { listing, up } = getPlayerokFees(price);
      feeTip.innerHTML = `<b>Ваш диапазон: Выставление <span class='highlight'>${listing}₽</span>, Поднятие <span class='highlight'>${up}₽</span></b>` + renderPlayerokTable(price);
    } else {
      feeTip.innerHTML = renderPlayerokTable(0);
    }
  } else {
    playerokFields.style.display = 'none';
    feeTip.textContent = '';
  }
}
function round2(v){return Math.round(v*100)/100;}
function recalc() {
  const platform = platformEl.value;
  const desiredProfit = parseFloat(sitePriceEl.value); // это сумма, которую продавец хочет получить (sitePrice)
  const buyPrice = parseFloat(buyPriceEl.value);
  const upCount = platform === 'PLAYEROK' ? parseInt(upCountEl.value, 10) || 0 : 0;
  if (isNaN(desiredProfit) || desiredProfit < 1) {
    resultBox.style.display = 'none'; return;
  }
  let publishCommission = 0, withdrawCommission = 0, listingFee = 0, liftFee = 0, profit = 0, profitClear = 0;
  let buyerPays = 0;
  let html = '';
  let clearBreakdown = '';
  if (platform === 'FUNPAY') {
    buyerPays = desiredProfit / 0.8;
    publishCommission = buyerPays - desiredProfit;
    // Комиссия вывода: 3%, но не менее 30₽
    withdrawCommission = Math.max(30, desiredProfit * 0.03);
    profit = round2(desiredProfit - withdrawCommission); // после вывода
    clearBreakdown = `
      <div class="breakdown"><b>Расчет чистой прибыли:</b>
        <table class="cb-table"><tbody>
          <tr><td>Желаемая чистая сумма</td><td class="cb">${desiredProfit.toFixed(2)} ₽</td></tr>
          <tr><td>— Комиссия вывода (3%, но не менее 30₽)</td><td class="cb">- ${withdrawCommission.toFixed(2)} ₽</td></tr>
          ${!isNaN(buyPrice) && buyPrice > 0 ? `<tr><td>— Закупка</td><td class="cb">- ${buyPrice.toFixed(2)} ₽</td></tr>` : ''}
          <tr><td class="cbf">Итого чистая прибыль</td><td class="cbf positive">${((desiredProfit - withdrawCommission - (isNaN(buyPrice)||!buyPrice?0:buyPrice))).toFixed(2)} ₽</td></tr>
        </tbody></table>
        <div class="cbsign">Чистая прибыль = на руки после всех комиссий и закупки</div>
      </div>
      `;
    html = `<div>Покупатель платит: <b>${buyerPays.toFixed(2)} ₽</b></div>` +
      `<div>Комиссия площадки (20%): <b>${publishCommission.toFixed(2)} ₽</b></div>` +
      `<div>Комиссия вывода (3%, но не менее 30₽): <b>${withdrawCommission.toFixed(2)} ₽</b></div>` +
      `<div class='highlight'>Продавец получит на руки (до закупки): <span class='positive'>${(desiredProfit-withdrawCommission).toFixed(2)} ₽</span></div>`;
  } else if (platform === 'STARVELL') {
    buyerPays = desiredProfit / 0.9;
    publishCommission = buyerPays - desiredProfit;
    withdrawCommission = Math.max(30, desiredProfit * 0.03);
    profit = round2(desiredProfit - withdrawCommission); // после вывода
    clearBreakdown = `
      <div class="breakdown"><b>Расчет чистой прибыли:</b>
        <table class="cb-table"><tbody>
          <tr><td>Желаемая чистая сумма</td><td class="cb">${desiredProfit.toFixed(2)} ₽</td></tr>
          <tr><td>— Комиссия вывода (3%, но не менее 30₽)</td><td class="cb">- ${withdrawCommission.toFixed(2)} ₽</td></tr>
          ${!isNaN(buyPrice) && buyPrice > 0 ? `<tr><td>— Закупка</td><td class="cb">- ${buyPrice.toFixed(2)} ₽</td></tr>` : ''}
          <tr><td class="cbf">Итого чистая прибыль</td><td class="cbf positive">${((desiredProfit - withdrawCommission - (isNaN(buyPrice)||!buyPrice?0:buyPrice))).toFixed(2)} ₽</td></tr>
        </tbody></table>
        <div class="cbsign">Чистая прибыль = на руки после всех комиссий и закупки</div>
      </div>
      `;
    html = `<div>Покупатель платит: <b>${buyerPays.toFixed(2)} ₽</b></div>` +
      `<div>Комиссия площадки (10%): <b>${publishCommission.toFixed(2)} ₽</b></div>` +
      `<div>Комиссия вывода (3%, но не менее 30₽): <b>${withdrawCommission.toFixed(2)} ₽</b></div>` +
      `<div class='highlight'>Продавец получит на руки (до закупки): <span class='positive'>${(desiredProfit-withdrawCommission).toFixed(2)} ₽</span></div>`;
  } else if (platform === 'PLAYEROK') {
    buyerPays = desiredProfit;
    publishCommission = buyerPays * 0.2;
    withdrawCommission = (buyerPays - publishCommission) * 0.06;
    const { listing, up } = getPlayerokFees(buyerPays);
    listingFee = listing;
    liftFee = upCount * up;
    profit = buyerPays - publishCommission - withdrawCommission - listingFee - liftFee;
    clearBreakdown = `
      <div class="breakdown"><b>Расчет чистой прибыли:</b>
        <table class="cb-table"><tbody>
          <tr><td>Чистая сумма после комиссий площадки</td><td class="cb">${profit.toFixed(2)} ₽</td></tr>
          ${!isNaN(buyPrice) && buyPrice > 0 ? `<tr><td>— Закупка</td><td class="cb">- ${buyPrice.toFixed(2)} ₽</td></tr>` : ''}
          <tr><td class="cbf">Итого чистая прибыль</td><td class="cbf positive">${(profit - (isNaN(buyPrice)||!buyPrice?0:buyPrice)).toFixed(2)} ₽</td></tr>
        </tbody></table>
        <div class="cbsign">Чистая прибыль = на руки после всех комиссий и закупки</div>
      </div>`;
    html = `<div>Покупатель платит: <b>${buyerPays.toFixed(2)} ₽</b></div>` +
      `<div>Комиссия площадки (20%): <b>${publishCommission.toFixed(2)} ₽</b></div>` +
      `<div>Комиссия вывода (6%): <b>${withdrawCommission.toFixed(2)} ₽</b></div>` +
      `<div>Сбор за выставление: <b>${listingFee.toFixed(2)} ₽</b></div>` +
      `<div>Поднятия (${upCount}): <b>${liftFee.toFixed(2)} ₽</b></div>` +
      `<div class='highlight'>Продавец получит на руки (до закупки): <span class='positive'>${profit.toFixed(2)} ₽</span></div>`;
  }

  html += clearBreakdown;
  resultBox.innerHTML = html;
  resultBox.style.display = '';
}
['input','change'].forEach(ev=>{
  platformEl.addEventListener(ev, ()=>{ updatePlayerokFields(); recalc(); });
  sitePriceEl.addEventListener(ev, function() { updatePlayerokFields(); recalc(); });
  buyPriceEl.addEventListener(ev, recalc);
  upCountEl.addEventListener(ev, recalc);
});
updatePlayerokFields();
recalc();
