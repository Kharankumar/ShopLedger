const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

const orders = [
  {
    name: '#1001: 5% and 12% items, no coupon',
    coupon: '',
    items: [
      { name: 'Rice', price: 640, qty: 1, hsn: '1006', gstRate: 5 },
      { name: 'Ghee', price: 450, qty: 1, hsn: '0405', gstRate: 12 }
    ],
    expected: { subtotal: 1090, discount: 0, tax: 86, cgst: 43, sgst: 43, total: 1176 },
    lineTaxes: [32, 54]
  },
  {
    name: '#1002: SAVE10 on mixed 5% HSN items',
    coupon: 'SAVE10',
    items: [
      { name: 'Rice', price: 640, qty: 1, hsn: '1006', gstRate: 5 },
      { name: 'Sunflower oil', price: 190, qty: 2, hsn: '1512', gstRate: 5 }
    ],
    expected: { subtotal: 1020, discount: 102, tax: 45.9, cgst: 22.95, sgst: 22.95, total: 963.9 },
    lineTaxes: [28.8, 17.1]
  },
  {
    name: '#1004: SAVE10 capped at ₹150 on ₹2,240',
    coupon: 'SAVE10',
    items: [
      { name: 'Groundnut oil', price: 1120, qty: 2, hsn: '1508', gstRate: 5 }
    ],
    expected: { subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5 },
    lineTaxes: [104.5]
  },
  {
    name: '#1008: all 18% items, no coupon',
    coupon: '',
    items: [
      { name: 'Tea', price: 140, qty: 1, hsn: '0902', gstRate: 18 },
      { name: 'Kokum sherbet', price: 180, qty: 2, hsn: '2106', gstRate: 18 }
    ],
    expected: { subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590 },
    lineTaxes: [25.2, 64.8]
  }
];

for (const order of orders) {
  test(`CURRENT BEHAVIOUR: invoice for ${order.name}`, () => {
    const invoiceFigures = invoice.computeInvoiceFigures({
      items: order.items,
      coupon: order.coupon
    });
    const checkoutTotals = pricing.computeTotals(order.items, order.coupon);

    assert.deepEqual(
      {
        subtotal: invoiceFigures.subtotal,
        discount: invoiceFigures.discount,
        tax: invoiceFigures.tax,
        cgst: invoiceFigures.cgst,
        sgst: invoiceFigures.sgst,
        total: invoiceFigures.total
      },
      order.expected
    );
    assert.deepEqual(invoiceFigures.rows.map(row => row.lineTax), order.lineTaxes);
    assert.deepEqual(
      {
        subtotal: checkoutTotals.subtotal,
        discount: checkoutTotals.discount,
        tax: checkoutTotals.tax,
        cgst: checkoutTotals.cgst,
        sgst: checkoutTotals.sgst,
        total: checkoutTotals.total
      },
      order.expected
    );
  });
}

test('invoice matches checkout for SAVE10 HSN tax and discount cap', () => {
  const cases = [
    {
      coupon: 'SAVE10',
      items: [
        { name: 'Indrayani Basmati Rice 5kg', price: 640, qty: 1, hsn: '1006' },
        { name: 'Cold-Pressed Sunflower Oil 1L', price: 190, qty: 2, hsn: '1512' }
      ],
      expected: { subtotal: 1020, discount: 102, tax: 45.9, total: 963.9 },
      lineTaxes: [28.8, 17.1]
    },
    {
      coupon: 'SAVE10',
      items: [
        { name: 'Cold-Pressed Groundnut Oil 5L', price: 1120, qty: 2, hsn: '1508' }
      ],
      expected: { subtotal: 2240, discount: 150, tax: 104.5, total: 2194.5 },
      lineTaxes: [104.5]
    }
  ];

  for (const order of cases) {
    const invoiceFigures = invoice.computeInvoiceFigures(order);
    const checkoutTotals = pricing.computeTotals(order.items, order.coupon);
    const actual = {
      subtotal: invoiceFigures.subtotal,
      discount: invoiceFigures.discount,
      tax: invoiceFigures.tax,
      total: invoiceFigures.total
    };

    assert.deepEqual(actual, order.expected);
    assert.deepEqual(invoiceFigures.rows.map(row => row.lineTax), order.lineTaxes);
    assert.deepEqual(
      {
        subtotal: checkoutTotals.subtotal,
        discount: checkoutTotals.discount,
        tax: checkoutTotals.tax,
        total: checkoutTotals.total
      },
      order.expected
    );
  }
});
