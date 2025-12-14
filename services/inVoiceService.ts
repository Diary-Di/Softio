import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { PaperFormat, SaleInvoiceData } from '../types/inVoice'; // <-- utiliser le type défini dans /types

const fmt = (n: number) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ---------- HTML dynamique ---------- */
export const buildInvoiceHtml = (
  data: SaleInvoiceData,
  format: PaperFormat = 'A4'
): string => {
  const isTicket = format === 'T80' || format === 'T58';
  const isBL     = format.startsWith('BL');
  const css = `
    body{font-family:Helvetica;font-size:${isTicket ? '11px' : '13px'};margin:0;padding:8px}
    h1{font-size:${isTicket ? '14px' : '18px'};margin:0 0 6px}
    .right{text-align:right}
    table{width:100%;border-collapse:collapse;margin-top:6px}
    th,td{padding:${isTicket ? '2px' : '4px'};vertical-align:top}
    th{border-bottom:1px solid #000}
    .total{font-weight:700;font-size:${isTicket ? '12px' : '14px'};margin-top:6px}
    .flex{display:flex;justify-content:space-between}
    .mt{margin-top:12px}
  `;

  const rows = data.items
    .map(
      i => `
      <tr>
        <td>${i.qty}</td>
        <td>${i.designation}</td>
        <td class="right">${fmt(i.unitPrice)} ar</td>
        <td class="right">${fmt(i.total)} ar</td>
      </tr>`
    )
    .join('');

  const company = data.company ?? { name: 'Vente directe', address: '' };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${isBL ? 'Bon de livraison' : 'Facture'} ${data.saleId}</title>
        <style>${css}</style>
      </head>
      <body>
        <div class="flex">
          <div>
            <div class="bold">${company.name}</div>
            <div>${company.address}</div>
            ${company.phone ? `<div>Tél : ${company.phone}</div>` : ''}
            ${company.email ? `<div>Email : ${company.email}</div>` : ''}
            ${company.siret ? `<div>SIRET : ${company.siret}</div>` : ''}
          </div>
          <div class="right">
            <div class="bold">${isBL ? 'Bon n°' : 'Facture n°'}${data.saleId}</div>
            <div>Date : ${data.date}</div>
          </div>
        </div>

        <div class="mt">
          <div class="bold">Client</div>
          <div>${data.customer.name}</div>
          ${data.customer.address ? `<div>${data.customer.address}</div>` : ''}
          ${data.customer.phone ? `<div>Tél : ${data.customer.phone}</div>` : ''}
          ${data.customer.email ? `<div>Email : ${data.customer.email}</div>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Qté</th><th>Article</th>
              <th class="right">PU HT</th><th class="right">Total HT</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="right mt">
          <div class="flex" style="max-width:260px;margin-left:auto">
            <span>Sous-total :</span><span>${fmt(data.subtotal)} ar</span>
          </div>
          <div class="flex" style="max-width:260px;margin-left:auto">
            <span>Remise :</span><span>-${fmt(data.discountAmount)} ar</span>
          </div>
          <div class="flex total" style="max-width:260px;margin-left:auto">
            <span>Net à payer :</span><span>${fmt(data.netAmount)} ar</span>
          </div>
          <div class="flex" style="max-width:260px;margin-left:auto">
            <span>Payé :</span><span>${fmt(data.paidAmount)} ar</span>
          </div>
          ${
            data.changeAmount > 0
              ? `<div class="flex" style="max-width:260px;margin-left:auto">
                   <span>Monnaie rendue :</span><span>${fmt(data.changeAmount)} ar</span>
                 </div>`
              : ''
          }
          ${
            data.remainingAmount > 0
              ? `<div class="flex" style="max-width:260px;margin-left:auto;color:#d32f2f">
                   <span>Reste dû :</span><span>${fmt(data.remainingAmount)} ar</span>
                 </div>`
              : ''
          }
        </div>

        <div class="mt">
          <div><span class="bold">Mode de paiement :</span> ${data.paymentMethod}</div>
          <div><span class="bold">Condition :</span> ${data.condition}</div>
        </div>
      </body>
    </html>
  `;
};

/* ---------- PDF base64 ---------- */
export const generateInvoicePdf = async (
  data: SaleInvoiceData,
  format: PaperFormat = 'A4'
): Promise<string> => {
  const html = buildInvoiceHtml(data, format);
  const file = await Print.printToFileAsync({ html, base64: true });

  if (!file.base64) throw new Error('Impossible de générer le base64 du PDF');
  return file.base64; // string assuré
};

/* ---------- PDF URI + partage ---------- */
export const generateAndShareInvoice = async (
  data: SaleInvoiceData,
  format: PaperFormat = 'A4'
): Promise<void> => {
  const html   = buildInvoiceHtml(data, format);
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: '.pdf' });
};